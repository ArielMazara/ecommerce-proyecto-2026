const jwt = require("jsonwebtoken");

function requiereAuth(req, res, next) {
  const encabezado = req.headers.authorization;
  const token = encabezado && encabezado.startsWith("Bearer ") ? encabezado.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No autenticado" });
  }

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}

function requiereAdmin(req, res, next) {
  if (req.usuario?.rol !== "ADMIN") {
    return res.status(403).json({ error: "No tenés permisos de administrador" });
  }
  next();
}

module.exports = { requiereAuth, requiereAdmin };
