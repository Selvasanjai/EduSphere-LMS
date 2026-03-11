const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');

// Check certificate eligibility
const checkEligibility = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) return { eligible: false, reason: 'Not enrolled.' };

  // Rule 1: Attendance >= 80%
  if (enrollment.attendancePercentage < 80)
    return {
      eligible: false,
      reason: `Attendance ${enrollment.attendancePercentage.toFixed(1)}% is below 80%.`,
    };

  // Rule 2: All videos watched
  const course = await Course.findById(courseId);
  if (enrollment.videosWatched.length < course.totalVideos)
    return {
      eligible: false,
      reason: `Only ${enrollment.videosWatched.length}/${course.totalVideos} videos watched.`,
    };

  // Rule 3: All assignments completed
  const assignments = await Assignment.find({ courseId });
  for (const asgn of assignments) {
    const submission = asgn.submissions.find(
      (s) => s.studentId.toString() === studentId.toString()
    );
    if (!submission || submission.status === 'submitted') {
      return {
        eligible: false,
        reason: 'Not all assignments are graded/completed.',
      };
    }
  }

  return { eligible: true };
};

// Helper: Calculate Score/Grade
const calculateGrade = (score) => {
  if (score >= 90) return { grade: 'A+', status: 'with Distinction' };
  if (score >= 80) return { grade: 'A', status: 'with Merit' };
  if (score >= 70) return { grade: 'B', status: '' };
  if (score >= 60) return { grade: 'C', status: '' };
  return { grade: 'D', status: '' };
};

// POST /api/certificates/check
exports.checkEligibility = async (req, res) => {
  try {
    const { courseId } = req.body;
    const result = await checkEligibility(req.user._id, courseId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/certificates/generate
exports.generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    const existing = await Certificate.findOne({ studentId, courseId });
    if (existing)
      return res.json({
        success: true,
        certificate: existing,
        message: 'Certificate already exists.',
      });

    const eligibility = await checkEligibility(studentId, courseId);
    if (!eligibility.eligible)
      return res
        .status(400)
        .json({ success: false, message: eligibility.reason });

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    const course = await Course.findById(courseId).select('staffId duration');

    // Basic scoring based on progress/attendance (or quiz if exists)
    const score = Math.min(
      100,
      Math.round(enrollment.progress * 0.7 + enrollment.attendancePercentage * 0.3)
    );
    const { grade, status } = calculateGrade(score);

    const certificate = await Certificate.create({
      studentId,
      courseId,
      instructorId: course?.staffId,
      attendancePercentage: enrollment.attendancePercentage,
      finalScore: score,
      grade,
      distinctionStatus: status,
      duration: course?.duration || '12 Weeks (120 Hours)',
      approvalStatus: 'pending',
    });

    const cert = await certificate.populate([
      { path: 'studentId', select: 'name email college' },
      { path: 'courseId', select: 'title category' },
    ]);

    res.status(201).json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/certificates/my
exports.getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      studentId: req.user._id,
    }).populate('courseId', 'title category thumbnail');
    res.json({ success: true, certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/certificates/verify/:certId - Public
exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.certId })
      .populate('studentId', 'name college')
      .populate('courseId', 'title');
    if (!cert || !cert.isValid || cert.approvalStatus !== 'approved') {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Certificate not found or not approved.',
        });
    }
    res.json({ success: true, valid: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/certificates - Admin: all certificates
exports.getAllCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find()
      .populate('studentId', 'name email college')
      .populate('courseId', 'title category')
      .populate('approvedBy', 'name email')
      .sort('-completionDate');
    res.json({ success: true, count: certs.length, certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/certificates/:id/approve - Admin approves certificate
exports.approveCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert)
      return res
        .status(404)
        .json({ success: false, message: 'Certificate not found.' });
    cert.approvalStatus = 'approved';
    cert.approvedAt = new Date();
    cert.approvedBy = req.user._id;
    await cert.save();
    const populated = await cert.populate([
      { path: 'studentId', select: 'name email college' },
      { path: 'courseId', select: 'title category' },
      { path: 'approvedBy', select: 'name email' },
    ]);
    res.json({ success: true, certificate: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/certificates/:id/reject - Admin rejects certificate
exports.rejectCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert)
      return res
        .status(404)
        .json({ success: false, message: 'Certificate not found.' });
    cert.approvalStatus = 'rejected';
    await cert.save();
    const populated = await cert.populate([
      { path: 'studentId', select: 'name email college' },
      { path: 'courseId', select: 'title category' },
    ]);
    res.json({ success: true, certificate: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/certificates/admin-generate - Admin generates certificate for student
exports.adminGenerateCertificate = async (req, res) => {
  try {
    const { studentId, courseId, attendancePercentage } = req.body;

    if (!studentId || !courseId || attendancePercentage === undefined) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' });
    }

    if (attendancePercentage < 0 || attendancePercentage > 100) {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Attendance percentage must be between 0-100',
        });
    }

    const existing = await Certificate.findOne({ studentId, courseId });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            'Certificate already issued for this student-course combination',
        });
    }

    const certificate = await Certificate.create({
      studentId,
      courseId,
      attendancePercentage,
    });

    const cert = await certificate.populate([
      { path: 'studentId', select: 'name email college' },
      { path: 'courseId', select: 'title category' },
    ]);

    res.status(201).json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
