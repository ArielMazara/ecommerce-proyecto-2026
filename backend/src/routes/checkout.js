const { Router } = require("express");
const { requiereAuth } = require("../middleware/auth");
const { crearPreferencia, webhook, confirmar } = require("../controllers/checkoutController");

const router = Router();

router.post("/crear-preferencia", requiereAuth, crearPreferencia);
router.post("/confirmar", requiereAuth, confirmar);
router.post("/webhook", webhook);

module.exports = router;
