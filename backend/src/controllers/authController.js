const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../lib/prisma");
const { esMayorDeEdad } = require("../utils/edad");
const { resend } = require("../lib/resend");

const RONDAS_HASH = 10;
const RESET_EXPIRA_MINUTOS = 60;

function generarToken(usuario) {
  return jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function datosPublicos(usuario) {
  const { contrasena, resetToken, resetTokenExpira, ...resto } = usuario;
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

async function solicitarRecuperacion(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Falta el email" });
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  // Responde siempre el mismo mensaje, exista o no la cuenta, para no
  // filtrar qué emails están registrados.
  if (usuario) {
    const token = crypto.randomBytes(32).toString("hex");
    const expira = new Date(Date.now() + RESET_EXPIRA_MINUTOS * 60 * 1000);

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { resetToken: token, resetTokenExpira: expira },
    });

    const link = `${process.env.FRONTEND_URL}/recuperar/${token}`;

    if (resend) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Altos del Uco <onboarding@resend.dev>",
        to: usuario.email,
        subject: "Recuperá tu contraseña — Altos del Uco",
        html: `
          <p>Hola ${usuario.nombre},</p>
          <p>Pediste restablecer tu contraseña. Este link es válido por ${RESET_EXPIRA_MINUTOS} minutos:</p>
          <p><a href="${link}">${link}</a></p>
          <p>Si no fuiste vos, ignorá este mensaje.</p>
        `,
      });
    } else {
      // Falta configurar RESEND_API_KEY: no se puede mandar el mail, pero no
      // rompemos el flujo. Se loguea el link para poder probarlo igual en desarrollo.
      console.warn(`RESEND_API_KEY no configurada. Link de recuperación para ${usuario.email}: ${link}`);
    }
  }

  res.json({ mensaje: "Si el email existe, te enviamos un link para recuperar tu contraseña" });
}

async function resetearContrasena(req, res) {
  const { token, contrasena } = req.body;

  if (!token || !contrasena) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  if (contrasena.length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  const usuario = await prisma.usuario.findUnique({ where: { resetToken: token } });

  if (!usuario || !usuario.resetTokenExpira || usuario.resetTokenExpira < new Date()) {
    return res.status(400).json({ error: "El link de recuperación es inválido o expiró" });
  }

  const contrasenaHasheada = await bcrypt.hash(contrasena, RONDAS_HASH);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { contrasena: contrasenaHasheada, resetToken: null, resetTokenExpira: null },
  });

  res.json({ mensaje: "Contraseña actualizada correctamente" });
}

module.exports = { registro, login, solicitarRecuperacion, resetearContrasena };
