// routes/reportRoutes.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ctrl = require('../controllers/reportController');

const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

router.use(auth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.post('/:id/attachments', upload.single('file'), ctrl.addAttachment);

module.exports = router;

