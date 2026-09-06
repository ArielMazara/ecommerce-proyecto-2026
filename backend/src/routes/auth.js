const { Router } = require("express");
const { registro, login, solicitarRecuperacion, resetearContrasena } = require("../controllers/authController");

const router = Router();

router.post("/registro", registro);
router.post("/login", login);
router.post("/solicitar-recuperacion", solicitarRecuperacion);
router.post("/resetear-contrasena", resetearContrasena);

module.exports = router;
