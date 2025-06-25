const router = require('express').Router();
const c      = require('../controllers/projectController');
const verify = require('../middleware/verifyToken');

router.get   ('/',c.getAll);      // public
router.post  ('/',c.create);
router.put   ('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;
