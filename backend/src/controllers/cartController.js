const prisma = require("../lib/prisma");
const { calcularCostoEnvio } = require("../lib/envio");

function calcularTotal(items) {
  return items.reduce((acc, item) => acc + item.cantidad * Number(item.producto.precio), 0);
}

async function listar(req, res) {
  const items = await prisma.carritoItem.findMany({
    where: { usuarioId: req.usuario.id },
    include: { producto: true },
    orderBy: { createdAt: "asc" },
  });

  const total = calcularTotal(items);
  const costoEnvio = items.length > 0 ? calcularCostoEnvio(total) : 0;

  res.json({ items, total, costoEnvio, totalConEnvio: total + costoEnvio });
}

async function agregar(req, res) {
  const { productoId, cantidad = 1 } = req.body;

  if (!productoId || cantidad < 1) {
    return res.status(400).json({ error: "Datos inválidos" });
  }

  const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } });
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  const existente = await prisma.carritoItem.findUnique({
    where: { usuarioId_productoId: { usuarioId: req.usuario.id, productoId: producto.id } },
  });

  const cantidadFinal = (existente?.cantidad || 0) + Number(cantidad);
  if (cantidadFinal > producto.stock) {
    return res.status(400).json({ error: "No hay suficiente stock disponible" });
  }

  const item = await prisma.carritoItem.upsert({
    where: { usuarioId_productoId: { usuarioId: req.usuario.id, productoId: producto.id } },
    update: { cantidad: cantidadFinal },
    create: { usuarioId: req.usuario.id, productoId: producto.id, cantidad: cantidadFinal },
    include: { producto: true },
  });

  res.status(201).json(item);
}

async function actualizar(req, res) {
  const productoId = Number(req.params.productoId);
  const { cantidad } = req.body;

  if (!cantidad || cantidad < 1) {
    return res.status(400).json({ error: "La cantidad debe ser al menos 1" });
  }

  const producto = await prisma.producto.findUnique({ where: { id: productoId } });
  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  if (cantidad > producto.stock) {
    return res.status(400).json({ error: "No hay suficiente stock disponible" });
  }

  try {
    const item = await prisma.carritoItem.update({
      where: { usuarioId_productoId: { usuarioId: req.usuario.id, productoId } },
      data: { cantidad },
      include: { producto: true },
    });
    res.json(item);
  } catch {
    res.status(404).json({ error: "El producto no está en el carrito" });
  }
}

async function eliminar(req, res) {
  const productoId = Number(req.params.productoId);

  try {
    await prisma.carritoItem.delete({
      where: { usuarioId_productoId: { usuarioId: req.usuario.id, productoId } },
    });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "El producto no está en el carrito" });
  }
}

module.exports = { listar, agregar, actualizar, eliminar };
