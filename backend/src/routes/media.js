const router = require('express').Router();
const ctrl   = require('../controllers/mediaController');
const auth   = require('../middleware/auth');
const { mediaUpload } = require('../middleware/upload');

router.get('/',           ctrl.get);
router.post('/',    auth,  mediaUpload.single('media_file'), ctrl.upsert);
router.delete('/', auth,   ctrl.remove);

module.exports = router;
