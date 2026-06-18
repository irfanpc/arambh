const router = require('express').Router();
const ctrl   = require('../controllers/galleryController');
const auth   = require('../middleware/auth');
const { galleryUpload } = require('../middleware/upload');

router.get('/',              ctrl.getAll);
router.get('/:id',           ctrl.getOne);
router.post('/',   auth,     galleryUpload.single('image'), ctrl.create);
router.put('/:id', auth,     ctrl.update);
router.patch('/reorder', auth, ctrl.reorder);
router.delete('/:id', auth,  ctrl.remove);

module.exports = router;
