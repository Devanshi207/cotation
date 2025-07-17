const router = require("express").Router();
const c = require("../controllers/mtoController");

router.post("/generate/:quotationId", c.generateMTO);
router.get("/:quotationId", c.getByQuotation);

module.exports = router;
