const prisma = require("../lib/prisma");
const { preferenceClient, paymentClient } = require("../lib/mercadopago");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

async function crearPreferencia(req, res) {
  const itemsCarrito = await prisma.carritoItem.findMany({
    where: { usuarioId: req.usuario.id },
    include: { producto: true },
  });

  if (itemsCarrito.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  for (const item of itemsCarrito) {
    if (item.cantidad > item.producto.stock) {
      return res.status(400).json({ error: `No hay suficiente stock de "${item.producto.nombre}"` });
    }
  }

  const total = itemsCarrito.reduce(
    (acc, item) => acc + item.cantidad * Number(item.producto.precio),
    0
  );

  // El pedido se crea antes de llamar a Mercado Pago (para tener un id que
  // usar como external_reference), pero el carrito sólo se vacía si la
  // preferencia se creó con éxito: si Mercado Pago falla, deshacemos el
  // pedido en vez de dejar al usuario con un pedido fantasma y el carrito vacío.
  const pedido = await prisma.pedido.create({
    data: {
      usuarioId: req.usuario.id,
      estado: "PENDIENTE",
      total,
      items: {
        create: itemsCarrito.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: item.producto.precio,
        })),
      },
    },
    include: { items: { include: { producto: true } } },
  });

  try {
    const preferencia = await preferenceClient.create({
      body: {
        items: pedido.items.map((item) => ({
          id: String(item.productoId),
          title: item.producto.nombre,
          quantity: item.cantidad,
          unit_price: Number(item.precioUnitario),
          currency_id: "ARS",
        })),
        back_urls: {
          success: `${FRONTEND_URL}/checkout/resultado`,
          failure: `${FRONTEND_URL}/checkout/resultado`,
          pending: `${FRONTEND_URL}/checkout/resultado`,
        },
        auto_return: "approved",
        external_reference: String(pedido.id),
        notification_url: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL}/api/checkout/webhook`
          : undefined,
      },
    });

    await prisma.carritoItem.deleteMany({ where: { usuarioId: req.usuario.id } });

    res.status(201).json({ pedidoId: pedido.id, initPoint: preferencia.init_point });
  } catch (err) {
    await prisma.pedidoItem.deleteMany({ where: { pedidoId: pedido.id } });
    await prisma.pedido.delete({ where: { id: pedido.id } });
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

module.exports = { crearPreferencia, webhook, confirmar };
