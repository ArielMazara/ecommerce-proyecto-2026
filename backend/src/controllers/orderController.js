const prisma = require("../lib/prisma");

async function listar(req, res) {
  const pedidos = await prisma.pedido.findMany({
    where: { usuarioId: req.usuario.id },
    include: { items: { include: { producto: true } } },
    orderBy: { fecha: "desc" },
  });

  res.json(pedidos);
}

async function obtenerPorId(req, res) {
  const id = Number(req.params.id);
  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: { items: { include: { producto: true } } },
  });

  if (!pedido || pedido.usuarioId !== req.usuario.id) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }

  res.json(pedido);
}

const ESTADOS_VALIDOS = ["PENDIENTE", "PAGADO", "ENVIADO", "CANCELADO"];

async function listarTodos(req, res) {
  const { estado } = req.query;

  if (estado && !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  const pedidos = await prisma.pedido.findMany({
    where: estado ? { estado } : undefined,
    include: {
      usuario: { select: { nombre: true, email: true } },
      items: { include: { producto: true } },
    },
    orderBy: { fecha: "desc" },
  });

  res.json(pedidos);
}

async function marcarEnviado(req, res) {
  const id = Number(req.params.id);
  const { transportista, numeroSeguimiento } = req.body;

  if (!transportista || !numeroSeguimiento) {
    return res.status(400).json({ error: "Faltan transportista o número de seguimiento" });
  }

  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" });
  }
  if (pedido.estado !== "PAGADO" && pedido.estado !== "ENVIADO") {
    return res.status(400).json({ error: "Sólo se pueden marcar como enviados los pedidos ya pagados" });
  }

  const actualizado = await prisma.pedido.update({
    where: { id },
    data: { estado: "ENVIADO", transportista, numeroSeguimiento },
  });

  res.json(actualizado);
}

module.exports = { listar, obtenerPorId, listarTodos, marcarEnviado };
