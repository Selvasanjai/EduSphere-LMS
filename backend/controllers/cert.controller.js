const { v4: uuidv4 } = require('uuid');
const { Certificate, Enrollment, Attendance, Assignment } = require('../models/index');
const Course = require('../models/Course');

// Helper: Check certification eligibility
const checkEligibility = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrollment) return { eligible: false, reason: 'Not enrolled in this course.' };

  // Check video completion (100%)
  const videoComplete = enrollment.completionPercent === 100;
  if (!videoComplete) return { eligible: false, reason: `Video completion is ${enrollment.completionPercent}%. Must be 100%.` };

  // Check attendance (>= 80%)
  const attendanceRecords = await Attendance.find({ student: studentId, course: courseId });
  const present = attendanceRecords.filter(a => a.status === 'present' || a.status === 'late').length;
  const attendancePercent = attendanceRecords.length > 0 ? Math.round((present / attendanceRecords.length) * 100) : 0;
  if (attendancePercent < 80) return { eligible: false, reason: `Attendance is ${attendancePercent}%. Minimum 80% required.` };

  // Check all assignments graded
  const courseAssignments = await Assignment.find({ course: courseId });
  for (const assignment of courseAssignments) {
    const submission = assignment.submissions.find(s => s.student.toString() === studentId.toString());
    if (!submission || submission.grade === null) {
      return { eligible: false, reason: `Assignment "${assignment.title}" not graded yet.` };
    }
  }

  return { eligible: true, attendancePercent, videoCompletionPercent: enrollment.completionPercent };
};

// @route GET /api/certificates/check/:courseId
exports.checkEligibility = async (req, res) => {
  try {
    const result = await checkEligibility(req.user._id, req.params.courseId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to check eligibility.', error: err.message });
  }
};

// @route POST /api/certificates/issue/:courseId
exports.issueCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const existing = await Certificate.findOne({ student: req.user._id, course: courseId });
    if (existing) return res.json({ message: 'Certificate already issued.', certificate: existing });

    const { eligible, reason, attendancePercent, videoCompletionPercent } = await checkEligibility(req.user._id, courseId);
    if (!eligible) return res.status(400).json({ message: reason });

    const certificate = await Certificate.create({
      student: req.user._id,
      course: courseId,
      certificateId: `EDU-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`,
      attendancePercent,
      videoCompletionPercent,
      assignmentsCompleted: true,
    });

    await certificate.populate('student', 'name email');
    await certificate.populate('course', 'title instructor');

    res.status(201).json({ message: 'Certificate issued successfully!', certificate });
  } catch (err) {
    res.status(500).json({ message: 'Failed to issue certificate.', error: err.message });
  }
};

// @route GET /api/certificates/verify/:certId
exports.verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certId })
      .populate('student', 'name email')
      .populate('course', 'title instructor');

    if (!certificate) return res.status(404).json({ message: 'Certificate not found or invalid.', valid: false });

    res.json({ valid: true, certificate });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed.', error: err.message });
  }
};

// @route GET /api/certificates/my
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ student: req.user._id })
      .populate('course', 'title thumbnail category')
      .sort({ issuedAt: -1 });
    res.json({ certificates: certs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch certificates.', error: err.message });
  }
};
