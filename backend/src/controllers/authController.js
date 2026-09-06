const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { esMayorDeEdad } = require("../utils/edad");

const RONDAS_HASH = 10;

function generarToken(usuario) {
  return jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function datosPublicos(usuario) {
  const { contrasena, ...resto } = usuario;
  return resto;
}

async function registro(req, res) {
  const { nombre, email, contrasena, fechaNacimiento } = req.body;

  if (!nombre || !email || !contrasena || !fechaNacimiento) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  if (contrasena.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  if (!esMayorDeEdad(fechaNacimiento)) {
    return res.status(400).json({ error: "Debés ser mayor de 18 años para registrarte" });
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ error: "Ya existe una cuenta con ese email" });
  }

  const contrasenaHasheada = await bcrypt.hash(contrasena, RONDAS_HASH);

  const usuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      contrasena: contrasenaHasheada,
      fechaNacimiento: new Date(fechaNacimiento),
    },
  });

  const token = generarToken(usuario);
  res.status(201).json({ token, usuario: datosPublicos(usuario) });
}

async function login(req, res) {
  const { email, contrasena } = req.body;

  if (!email || !contrasena) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    return res.status(401).json({ error: "Email o contraseña incorrectos" });
  }

  const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
  if (!contrasenaValida) {
    return res.status(401).json({ error: "Email o contraseña incorrectos" });
  }

  const token = generarToken(usuario);
  res.json({ token, usuario: datosPublicos(usuario) });
}

module.exports = { registro, login };
