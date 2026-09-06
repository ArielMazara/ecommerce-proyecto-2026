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

const CAMPOS_REQUERIDOS = ["nombre", "bodega", "varietal", "anada", "region", "precio", "stock"];

function validarProducto(datos) {
  for (const campo of CAMPOS_REQUERIDOS) {
    if (datos[campo] === undefined || datos[campo] === null || datos[campo] === "") {
      return `Falta el campo "${campo}"`;
    }
  }
  if (Number.isNaN(Number(datos.anada))) return "La añada debe ser un número";
  if (Number.isNaN(Number(datos.precio))) return "El precio debe ser un número";
  if (Number.isNaN(Number(datos.stock))) return "El stock debe ser un número";
  return null;
}

function datosProducto(body) {
  const { nombre, bodega, varietal, anada, region, precio, stock, descripcion, imagenUrl, notasCata, maridaje } = body;
  return {
    nombre,
    bodega,
    varietal,
    anada: Number(anada),
    region,
    precio: Number(precio),
    stock: Number(stock),
    descripcion: descripcion || null,
    imagenUrl: imagenUrl || null,
    notasCata: notasCata || null,
    maridaje: maridaje || null,
  };
}

async function crear(req, res) {
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  const producto = await prisma.producto.create({ data: datosProducto(req.body) });
  res.status(201).json(producto);
}

async function actualizar(req, res) {
  const id = Number(req.params.id);
  const error = validarProducto(req.body);
  if (error) return res.status(400).json({ error });

  try {
    const producto = await prisma.producto.update({ where: { id }, data: datosProducto(req.body) });
    res.json(producto);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    throw err;
  }
}

async function eliminar(req, res) {
  const id = Number(req.params.id);

  try {
    await prisma.producto.delete({ where: { id } });
    res.sendStatus(204);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ error: "No se puede eliminar: tiene pedidos o carritos asociados" });
    }
    throw err;
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
