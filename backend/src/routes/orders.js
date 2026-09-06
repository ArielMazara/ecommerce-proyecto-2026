const { Router } = require("express");
const { requiereAuth, requiereAdmin } = require("../middleware/auth");
const { listar, obtenerPorId, listarTodos, marcarEnviado } = require("../controllers/orderController");

const router = Router();

router.use(requiereAuth);

router.get("/admin/todos", requiereAdmin, listarTodos);
router.patch("/admin/:id/enviar", requiereAdmin, marcarEnviado);

router.get("/", listar);
router.get("/:id", obtenerPorId);

module.exports = router;
