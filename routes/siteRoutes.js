const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/siteController');

router.use(auth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', ctrl.getOne);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.get('/:id/qr.png', ctrl.qrPng);         // Image PNG à imprimer
router.post('/:id/qr/rotate', ctrl.rotateQr);  // Régénérer le token
router.get('/by-qr/:token', ctrl.getByToken);  // Retrouver un chantier via QR


module.exports = router;

