const prisma = require("../lib/prisma");

async function listar(req, res) {
  const { varietal, bodega, anada, precioMin, precioMax } = req.query;

  const where = {};
  if (varietal) where.varietal = { equals: varietal, mode: "insensitive" };
  if (bodega) where.bodega = { equals: bodega, mode: "insensitive" };
  if (anada) where.anada = Number(anada);
  if (precioMin || precioMax) {
    where.precio = {};
    if (precioMin) where.precio.gte = Number(precioMin);
    if (precioMax) where.precio.lte = Number(precioMax);
  }

  const productos = await prisma.producto.findMany({
    where,
    orderBy: { nombre: "asc" },
  });

  res.json(productos);
}

async function obtenerPorId(req, res) {
  const id = Number(req.params.id);
  const producto = await prisma.producto.findUnique({ where: { id } });

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(producto);
}

module.exports = { listar, obtenerPorId };
