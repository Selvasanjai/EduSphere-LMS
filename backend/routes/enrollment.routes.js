// enrollment.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');

router.post('/', protect, authorize('student'), async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required.' });

    const exists = await Enrollment.findOne({ studentId: req.user._id, courseId });
    if (exists) return res.status(400).json({ success: false, message: 'Already enrolled.' });

    const course = await Course.findById(courseId).select('isPublished isApproved enrollmentCount maxStudents');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    if (!course.isPublished || !course.isApproved) {
      return res.status(400).json({ success: false, message: 'Course is not available for enrollment.' });
    }

    // Limit: student can have max 2 active enrollments
    const activeCount = await Enrollment.countDocuments({ studentId: req.user._id, completed: { $ne: true } });
    if (activeCount >= 2) {
      return res.status(400).json({
        success: false,
        message: 'You can enroll in only 2 courses at a time. Complete one course to enroll in a new one.'
      });
    }

    // Limit: course max students (default 14)
    const max = course.maxStudents || 14;
    if ((course.enrollmentCount || 0) >= max) {
      return res.status(400).json({ success: false, message: `Enrollment limit reached (max ${max} students).` });
    }

    const enrollment = await Enrollment.create({ studentId: req.user._id, courseId });
    await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });
    res.status(201).json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/my', protect, authorize('student'), async (req, res) => {
  const enrollments = await Enrollment.find({ studentId: req.user._id })
    .populate('courseId', 'title thumbnail category totalVideos level');
  res.json({ success: true, enrollments });
});

// POST /api/enrollments/course/:courseId/videos/:videoId/complete
// Marks a video as completed, updates progress + attendance, and triggers pending certificate on completion.
router.post('/course/:courseId/videos/:videoId/complete', protect, authorize('student'), async (req, res) => {
  try {
    const { courseId, videoId } = req.params;

    const [course, enrollment] = await Promise.all([
      Course.findById(courseId).select('videos totalVideos staffId title'),
      Enrollment.findOne({ studentId: req.user._id, courseId })
    ]);

    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found.' });

    const videoExists = Array.isArray(course.videos) && course.videos.some(v => v._id.toString() === videoId);
    if (!videoExists) return res.status(404).json({ success: false, message: 'Video not found in this course.' });

    const alreadyWatched = enrollment.videosWatched?.some(v => v.toString() === videoId);
    if (!alreadyWatched) {
      enrollment.videosWatched = Array.isArray(enrollment.videosWatched) ? enrollment.videosWatched : [];
      enrollment.videosWatched.push(videoId);
    }

    const total = course.totalVideos || course.videos.length || 0;
    const watchedCount = new Set((enrollment.videosWatched || []).map(v => v.toString())).size;
    const progress = total > 0 ? Math.min(100, Math.round((watchedCount / total) * 100)) : 0;

    enrollment.progress = progress;
    enrollment.attendancePercentage = progress; // keep simple + consistent with video-based attendance requirement

    if (progress >= 100 && !enrollment.completed) {
      enrollment.completed = true;
      enrollment.completionDate = new Date();
    }

    await enrollment.save();

    // Daily attendance record (kept for analytics views)
    const today = new Date().toISOString().split('T')[0];
    const att = await Attendance.findOneAndUpdate(
      { studentId: req.user._id, courseId, date: today },
      {
        $setOnInsert: { studentId: req.user._id, courseId, date: today, loginTime: new Date() },
        $inc: { videosWatchedToday: alreadyWatched ? 0 : 1 },
        $set: { status: 'present', markedAt: new Date(), markedBy: req.user._id }
      },
      { new: true, upsert: true }
    );

    // Create pending certificate record on completion (admin approval required)
    let certificate = null;
    if (progress >= 100) {
      certificate = await Certificate.findOne({ studentId: req.user._id, courseId });
      if (!certificate) {
        certificate = await Certificate.create({
          studentId: req.user._id,
          courseId,
          instructorId: course.staffId,
          attendancePercentage: enrollment.attendancePercentage,
          approvalStatus: 'pending'
        });
      }
    }

    res.json({ success: true, enrollment, attendance: att, certificate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/course/:courseId/students', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    // Verify staff owns this course or user is admin (even when no enrollments exist)
    if (req.user.role === 'staff') {
      const course = await Course.findById(req.params.courseId).select('staffId');
      if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
      if (course.staffId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to view these students.' });
      }
    }

    const enrollments = await Enrollment.find({ courseId: req.params.courseId })
      .populate('studentId', 'name email department college avatar')
      .populate('courseId', 'title staffId');
    res.json({ success: true, enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/progress', protect, authorize('student'), async (req, res) => {
  const enrollment = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, enrollment });
});

module.exports = router;
