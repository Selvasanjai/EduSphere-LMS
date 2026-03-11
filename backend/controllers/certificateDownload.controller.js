const Certificate = require('../models/Certificate');
const CertificateGenerator = require('../services/certificateGeneratorSimple');

// GET /api/certificates/:id/download/:format
exports.downloadCertificate = async (req, res) => {
  try {
    const { id, format } = req.params;
    const certificate = await Certificate.findById(id)
      .populate('studentId', 'name')
      .populate('courseId', 'title category')
      .populate('instructorId', 'name');

    if (!certificate || certificate.approvalStatus !== 'approved') {
      return res.status(404).json({ success: false, message: 'Certificate not found or not approved' });
    }

    const generator = new CertificateGenerator();
    const certificateData = {
      studentName: certificate.studentId.name,
      courseTitle: certificate.courseId.title,
      courseCategory: certificate.courseId.category,
      duration: 'Self-paced',
      completionDate: certificate.completionDate,
      certificateId: certificate.certificateId,
      instructorName: certificate.instructorId?.name || 'Instructor'
    };

    let buffer, mimeType, filename;

    switch (format.toLowerCase()) {
      case 'png':
        buffer = await generator.generatePNG(certificateData);
        mimeType = 'image/png';
        filename = `certificate-${certificate.certificateId}.png`;
        break;
      case 'jpg':
      case 'jpeg':
        buffer = await generator.generateJPG(certificateData);
        mimeType = 'image/jpeg';
        filename = `certificate-${certificate.certificateId}.jpg`;
        break;
      case 'pdf':
        buffer = await generator.generatePDF(certificateData);
        mimeType = 'application/pdf';
        filename = `certificate-${certificate.certificateId}.pdf`;
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid format. Use png, jpg, or pdf' });
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/certificates/:id/preview
exports.previewCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id)
      .populate('studentId', 'name')
      .populate('courseId', 'title category')
      .populate('instructorId', 'name');

    if (!certificate || certificate.approvalStatus !== 'approved') {
      return res.status(404).json({ success: false, message: 'Certificate not found or not approved' });
    }

    const generator = new CertificateGenerator();
    const certificateData = {
      studentName: certificate.studentId.name,
      courseTitle: certificate.courseId.title,
      courseCategory: certificate.courseId.category,
      duration: 'Self-paced',
      completionDate: certificate.completionDate,
      certificateId: certificate.certificateId,
      instructorName: certificate.instructorId?.name || 'Instructor'
    };

    const buffer = await generator.generatePNG(certificateData);
    
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
