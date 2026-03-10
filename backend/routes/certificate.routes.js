// certificate.routes.js
const express = require('express');
const router = express.Router();
const { checkEligibility, generateCertificate, approveCertificate, getMyCertificates, verifyCertificate, getAllCertificates, adminGenerateCertificate } = require('../controllers/certificate.controller');
const { downloadCertificate, previewCertificate } = require('../controllers/certificateDownload.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/verify/:certId', verifyCertificate);
router.post('/check', protect, authorize('student'), checkEligibility);
router.post('/generate', protect, authorize('student'), generateCertificate);
router.post('/admin-generate', protect, authorize('admin'), adminGenerateCertificate);
router.patch('/:id/approve', protect, authorize('admin'), approveCertificate);
router.get('/my', protect, authorize('student'), getMyCertificates);
router.get('/', protect, authorize('admin'), getAllCertificates);
router.get('/:id/preview', previewCertificate);
router.get('/:id/download/:format', downloadCertificate);

module.exports = router;
