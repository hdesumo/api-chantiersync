// routes/siteRoutes.js
const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/siteController');
router.use(auth);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
module.exports = router;

