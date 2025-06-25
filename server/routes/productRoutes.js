const router = require('express').Router();
const c = require('../controllers/productController');

router.get('/', c.getAll);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.get('/grouped', c.getGrouped); // new route for frontend

module.exports = router;
