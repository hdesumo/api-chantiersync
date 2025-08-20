// routes/siteRoutes.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/siteController');

router.use(auth);

router.get('/', ctrl.list);
router.post('/', ctrl.create);

// ⚠️ mettre AVANT '/:id'
router.get('/by-qr/:token', ctrl.getByToken);

router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

router.get('/:id/qr.png', ctrl.qrPng);
router.post('/:id/qr/rotate', ctrl.rotateQr);

module.exports = router;

