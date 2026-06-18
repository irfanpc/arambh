const router = require('express').Router();
const ctrl   = require('../controllers/announcementController');
const auth   = require('../middleware/auth');
const { announcementUpload } = require('../middleware/upload');

router.get('/',          ctrl.getAll);
router.get('/:id',       ctrl.getOne);
router.post('/',   auth, announcementUpload.single('image'), ctrl.create);
router.put('/:id', auth, announcementUpload.single('image'), ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;
