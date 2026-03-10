// attendance.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const attendanceController = require('../controllers/attendance.controller');

// Student routes
router.get('/student/summary', protect, authorize('student'), attendanceController.getStudentAttendanceSummary);
router.get('/student/course/:courseId', protect, authorize('student'), attendanceController.getStudentCourseAttendance);

// Staff/Admin routes
router.post('/mark', protect, authorize('staff', 'admin'), attendanceController.markAttendance);
router.get('/course/:courseId', protect, authorize('staff', 'admin'), attendanceController.getCourseAttendance);
router.get('/course/:courseId/students', protect, authorize('staff', 'admin'), attendanceController.getCourseStudents);
router.patch('/:id', protect, authorize('staff', 'admin'), attendanceController.updateAttendance);

// Admin only
router.get('/admin/report', protect, authorize('admin'), attendanceController.getAttendanceReport);

module.exports = router;
