const router = require('express').Router();
const ctrl = require('../controllers/cert.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/my', authenticate, authorize('student'), ctrl.getMyCertificates);
router.get('/check/:courseId', authenticate, authorize('student'), ctrl.checkEligibility);
router.post('/issue/:courseId', authenticate, authorize('student'), ctrl.issueCertificate);
router.get('/verify/:certId', ctrl.verifyCertificate); // public route

module.exports = router;
