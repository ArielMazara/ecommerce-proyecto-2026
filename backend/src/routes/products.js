const { Router } = require("express");
const { requiereAuth, requiereAdmin } = require("../middleware/auth");
const { listar, obtenerPorId, crear, actualizar, eliminar } = require("../controllers/productController");

const router = Router();

router.get("/", listar);
router.get("/:id", obtenerPorId);
router.post("/", requiereAuth, requiereAdmin, crear);
router.put("/:id", requiereAuth, requiereAdmin, actualizar);
router.delete("/:id", requiereAuth, requiereAdmin, eliminar);

module.exports = router;
