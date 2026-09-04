const { Router } = require("express");
const { requiereAuth } = require("../middleware/auth");
const { listar, agregar, actualizar, eliminar } = require("../controllers/cartController");

const router = Router();

router.use(requiereAuth);

router.get("/", listar);
router.post("/", agregar);
router.put("/:productoId", actualizar);
router.delete("/:productoId", eliminar);

module.exports = router;
