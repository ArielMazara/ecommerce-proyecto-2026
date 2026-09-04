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

module.exports = { requiereAuth };
