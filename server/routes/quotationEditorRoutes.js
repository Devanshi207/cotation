const router = require('express').Router();
const c = require('../controllers/quotationEditorController');
const { updateTerms } = require("../controllers/quotationEditorController");

router.get('/', c.getAll);                          // get all
router.get('/project/:projectId', c.getByProject);  // get by project
router.get('/versions/:id', c.getVersions);
router.get('/:id', c.getOne);                       // single quotation
router.post('/', c.create);                         // create new
router.put('/:id', c.update);                       // update
router.delete('/:id', c.remove);                    // delete
router.patch("/:id/terms", updateTerms);

module.exports = router;