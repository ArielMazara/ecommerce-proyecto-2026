const { Router } = require("express");
const { listar, obtenerPorId } = require("../controllers/productController");

const router = Router();

router.get("/", listar);
router.get("/:id", obtenerPorId);

module.exports = router;
