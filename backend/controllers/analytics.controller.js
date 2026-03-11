const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');

// GET /api/analytics/admin
exports.adminAnalytics = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalStudents,
      totalStaff,
      totalCourses,
      totalCertificates,
      activeToday,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'staff' }),
      Course.countDocuments({ isPublished: true }),
      Certificate.countDocuments(),
      Attendance.countDocuments({ date: today, status: 'present' }),
    ]);

    const avgAttendanceResult = await Enrollment.aggregate([
      { $group: { _id: null, avg: { $avg: '$attendancePercentage' } } },
    ]);

    const avgAttendance = avgAttendanceResult[0]?.avg?.toFixed(1) || 0;

    const recentEnrollments = await Enrollment.find()
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort('-enrolledAt')
      .limit(10);

    const topCourses = await Enrollment.aggregate([
      { $group: { _id: '$courseId', enrollments: { $sum: 1 } } },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      { $project: { title: '$course.title', enrollments: 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalStaff,
        totalCourses,
        totalCertificates,
        activeToday,
        avgAttendance,
      },
      recentEnrollments,
      topCourses,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/student
exports.studentAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id;
    const enrollments = await Enrollment.find({ studentId }).populate(
      'courseId',
      'title thumbnail category totalVideos'
    );
    const certificates = await Certificate.countDocuments({ studentId });

    const attendanceData = await Attendance.aggregate([
      { $match: { studentId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ success: true, enrollments, certificates, attendanceData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
