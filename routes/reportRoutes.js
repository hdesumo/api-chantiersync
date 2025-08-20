// routes/reportRoutes.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ctrl = require('../controllers/reportController');

// Dossier d'upload
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Types autorisés (photos + PDF)
const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
  'application/pdf',
]);

// Fallback extension par MIME si le nom original n'en contient pas
const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/heic-sequence': '.heic',
  'image/heif-sequence': '.heif',
  'application/pdf': '.pdf',
};

// Storage: nom de fichier sûr + extension
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const rand = crypto.randomBytes(16).toString('hex');
    const extFromName = path.extname(file.originalname || '').toLowerCase();
    const ext = extFromName || EXT_BY_MIME[file.mimetype] || '';
    cb(null, `${rand}${ext}`);
  },
});

// Filtre MIME (refuse tout ce qui n'est pas dans ALLOWED)
function fileFilter(_req, file, cb) {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }
  cb(null, true);
}

// Limites (10 Mo)
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

router.use(auth);

// Rapports
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);

// Pièces jointes
router.post('/:id/attachments', upload.single('file'), ctrl.addAttachment);
router.delete('/:id/attachments/:mediaId', ctrl.deleteAttachment);

module.exports = router;

