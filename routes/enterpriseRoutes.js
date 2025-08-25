// routes/enterpriseRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const enterpriseController = require('../controllers/enterpriseController');

const uploadDir = path.join(process.cwd(), 'uploads', 'logos');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  }
});
const fileFilter = (_req, file, cb) => {
  const ok = /image\/(png|jpe?g|webp)$/i.test(file.mimetype);
  cb(ok ? null : new Error('Type de fichier non supporté'), ok);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// TODO: ajoute ton authMiddleware si besoin
router.post('/api/enterprises', upload.single('logo'), enterpriseController.create);
router.get('/api/enterprises', enterpriseController.list);

module.exports = router;

