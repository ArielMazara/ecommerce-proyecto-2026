const prisma = require("../lib/prisma");
const { preferenceClient, paymentClient } = require("../lib/mercadopago");
const { calcularCostoEnvio } = require("../lib/envio");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
// Mercado Pago rechaza auto_return si las back_urls no son un dominio público
// (falla con "back_url.success must be defined" cuando apuntan a localhost).
const ES_URL_PUBLICA = !FRONTEND_URL.includes("localhost");

function validarStock(items) {
  for (const item of items) {
    if (item.cantidad > item.producto.stock) {
      return `No hay suficiente stock de "${item.producto.nombre}"`;
    }
  }
  return null;
}

function validarDireccion(direccion) {
  const campos = ["direccionCalle", "direccionCiudad", "direccionProvincia", "direccionCodigoPostal"];
  for (const campo of campos) {
    if (!direccion[campo]) return `Falta el campo "${campo}"`;
  }
  return null;
}

function crearPedidoConItems(usuarioId, items, direccion) {
  const subtotal = items.reduce((acc, item) => acc + item.cantidad * Number(item.producto.precio), 0);
  const costoEnvio = calcularCostoEnvio(subtotal);

  return prisma.pedido.create({
    data: {
      usuarioId,
      estado: "PENDIENTE",
      total: subtotal + costoEnvio,
      costoEnvio,
      direccionCalle: direccion.direccionCalle,
      direccionCiudad: direccion.direccionCiudad,
      direccionProvincia: direccion.direccionProvincia,
      direccionCodigoPostal: direccion.direccionCodigoPostal,
      items: {
        create: items.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.producto.precio,
        })),
      },
    },
    include: { items: { include: { producto: true } } },
  });
}

function crearPreferenciaParaPedido(pedido) {
  const itemsEnvio =
    Number(pedido.costoEnvio) > 0
      ? [{ id: "envio", title: "Envío", quantity: 1, unit_price: Number(pedido.costoEnvio), currency_id: "ARS" }]
      : [];

  return preferenceClient.create({
    body: {
      items: [
        ...pedido.items.map((item) => ({
          id: String(item.productoId),
          title: item.producto.nombre,
          quantity: item.cantidad,
          unit_price: Number(item.precioUnitario),
          currency_id: "ARS",
        })),
        ...itemsEnvio,
      ],
      back_urls: {
        success: `${FRONTEND_URL}/checkout/resultado`,
        failure: `${FRONTEND_URL}/checkout/resultado`,
        pending: `${FRONTEND_URL}/checkout/resultado`,
      },
      ...(ES_URL_PUBLICA ? { auto_return: "approved" } : {}),
      external_reference: String(pedido.id),
      notification_url: process.env.BACKEND_URL
        ? `${process.env.BACKEND_URL}/api/checkout/webhook`
        : undefined,
    },
  });
}

async function crearPreferencia(req, res) {
  const itemsCarrito = await prisma.carritoItem.findMany({
    where: { usuarioId: req.usuario.id },
    include: { producto: true },
  });

  if (itemsCarrito.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  const errorDireccion = validarDireccion(req.body);
  if (errorDireccion) return res.status(400).json({ error: errorDireccion });

  const errorStock = validarStock(itemsCarrito);
  if (errorStock) return res.status(400).json({ error: errorStock });

  // El pedido se crea antes de llamar a Mercado Pago (para tener un id que
  // usar como external_reference), pero el carrito sólo se vacía si la
  // preferencia se creó con éxito: si Mercado Pago falla, deshacemos el
  // pedido en vez de dejar al usuario con un pedido fantasma y el carrito vacío.
  const pedido = await crearPedidoConItems(req.usuario.id, itemsCarrito, req.body);

  try {
    const preferencia = await crearPreferenciaParaPedido(pedido);
    await prisma.carritoItem.deleteMany({ where: { usuarioId: req.usuario.id } });
    res.status(201).json({ pedidoId: pedido.id, initPoint: preferencia.init_point });
  } catch (err) {
    await prisma.pedidoItem.deleteMany({ where: { pedidoId: pedido.id } });
    await prisma.pedido.delete({ where: { id: pedido.id } });
    throw err;
  }
}

// Genera una preferencia nueva a partir de un pedido que quedó sin pagar
// (PENDIENTE o CANCELADO), por ejemplo cuando el usuario cerró la pestaña de
// Mercado Pago sin completar el pago. No reutiliza el pedido viejo (Mercado
// Pago no deja reabrir una preferencia ya creada): crea uno nuevo con los
// mismos productos y precios actuales, y cancela el anterior para no dejar
// dos pedidos pendientes por la misma compra.
async function reintentarPedido(req, res) {
  const pedidoId = Number(req.params.id);

  const pedidoOriginal = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { items: { include: { producto: true } } },
  });

  if (!pedidoOriginal || pedidoOriginal.usuarioId !== req.usuario.id) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  if (pedidoOriginal.estado === "PAGADO" || pedidoOriginal.estado === "ENVIADO") {
    return res.status(400).json({ error: "Este pedido ya fue pagado" });
  }

  const itemsFuente = pedidoOriginal.items.map((item) => ({
    productoId: item.productoId,
    cantidad: item.cantidad,
    producto: item.producto,
  }));

  const errorStock = validarStock(itemsFuente);
  if (errorStock) return res.status(400).json({ error: errorStock });

  const pedidoNuevo = await crearPedidoConItems(req.usuario.id, itemsFuente, {
    direccionCalle: pedidoOriginal.direccionCalle,
    direccionCiudad: pedidoOriginal.direccionCiudad,
    direccionProvincia: pedidoOriginal.direccionProvincia,
    direccionCodigoPostal: pedidoOriginal.direccionCodigoPostal,
  });

  try {
    const preferencia = await crearPreferenciaParaPedido(pedidoNuevo);
    await prisma.pedido.update({ where: { id: pedidoOriginal.id }, data: { estado: "CANCELADO" } });
    res.status(201).json({ pedidoId: pedidoNuevo.id, initPoint: preferencia.init_point });
  } catch (err) {
    await prisma.pedidoItem.deleteMany({ where: { pedidoId: pedidoNuevo.id } });
    await prisma.pedido.delete({ where: { id: pedidoNuevo.id } });
    throw err;
  }
}

async function confirmarPago(paymentId) {
  const pago = await paymentClient.get({ id: paymentId });
  const pedidoId = Number(pago.external_reference);
  if (!pedidoId) return null;

  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId }, include: { items: true } });
  if (!pedido || pedido.estado !== "PENDIENTE") return pedido;

  if (pago.status === "approved") {
    await prisma.$transaction([
      prisma.pedido.update({ where: { id: pedidoId }, data: { estado: "PAGADO" } }),
      ...pedido.items.map((item) =>
        prisma.producto.update({
          where: { id: item.productoId },
          data: { stock: { decrement: item.cantidad } },
        })
      ),
    ]);
  } else if (pago.status === "rejected") {
    await prisma.pedido.update({ where: { id: pedidoId }, data: { estado: "CANCELADO" } });
  }

  return prisma.pedido.findUnique({ where: { id: pedidoId } });
}

async function webhook(req, res) {
  const tipo = req.body?.type || req.query.topic;
  const paymentId = req.body?.data?.id || req.query.id;

  if (tipo === "payment" && paymentId) {
    await confirmarPago(paymentId);
  }

  res.sendStatus(200);
}

async function confirmar(req, res) {
  const { paymentId } = req.body;
  if (!paymentId) {
    return res.status(400).json({ error: "Falta paymentId" });
  }

  const pedido = await confirmarPago(paymentId);
  if (!pedido || pedido.usuarioId !== req.usuario.id) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  res.json({ pedidoId: pedido.id, estado: pedido.estado });
}

module.exports = { crearPreferencia, reintentarPedido, webhook, confirmar };
