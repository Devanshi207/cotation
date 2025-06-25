// routes/hsnRoutes.js
const router = require('express').Router();
const c      = require('../controllers/hsnController');
const verify = require('../middleware/verifyToken');   // protect write ops

router.get   ('/',c.getAll);       // public read
router.post  ('/',c.create);
router.put   ('/:id',c.update);
router.delete('/:id',c.remove);

module.exports = router;
