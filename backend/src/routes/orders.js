const { Router } = require("express");
const { requiereAuth } = require("../middleware/auth");
const { listar, obtenerPorId } = require("../controllers/orderController");

const router = Router();

router.use(requiereAuth);

router.get("/", listar);
router.get("/:id", obtenerPorId);

module.exports = router;
