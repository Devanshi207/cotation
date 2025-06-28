const router = require('express').Router();
const c = require('../controllers/quotationEditorController');

router.get('/', c.getAll);                          // get all
router.get('/project/:projectId', c.getByProject);  // get by project
router.get('/:id', c.getOne);                       // single quotation
router.post('/', c.create);                         // create new
router.put('/:id', c.update);                       // update
router.delete('/:id', c.remove);                    // delete

module.exports = router;
