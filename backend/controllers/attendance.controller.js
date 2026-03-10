const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const Course = require('../models/Course');

// Get attendance records for a specific course (staff/admin)
exports.getCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date, studentId } = req.query;

    // Verify course and permissions
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    // Check if user is staff teaching this course or admin
    if (req.user.role === 'staff' && course.staffId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this course attendance.' });
    }

    let query = { courseId };
    if (date) query.date = date;
    if (studentId) query.studentId = studentId;

    const records = await Attendance.find(query)
      .populate('studentId', 'name email avatar')
      .sort('-date');

    res.json({ success: true, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get attendance for a specific student in a course
exports.getStudentCourseAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const records = await Attendance.find({ studentId, courseId }).sort('date');
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const partial = records.filter(r => r.status === 'partial').length;
    const absent = records.filter(r => r.status === 'absent').length;

    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      records,
      summary: { total, present, partial, absent, percentage }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Mark attendance for students (staff/admin)
exports.markAttendance = async (req, res) => {
  try {
    const { courseId, attendanceData } = req.body;
    // attendanceData: [{ studentId, date, status, notes }]

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    // Check permissions
    if (req.user.role === 'staff' && course.staffId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to mark attendance for this course.' });
    }

    const results = [];
    for (const data of attendanceData) {
      const { studentId, date, status, notes } = data;

      let record = await Attendance.findOne({ studentId, courseId, date });
      if (!record) {
        record = new Attendance({ studentId, courseId, date, status });
      } else {
        record.status = status || record.status;
      }
      record.notes = notes || '';
      await record.save();
      results.push(record);
    }

    res.json({ success: true, records: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get students enrolled in a course (for marking attendance)
exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    // Check permissions
    if (req.user.role === 'staff' && course.staffId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const enrollments = await Enrollment.find({ courseId }).populate('studentId', 'name email avatar');
    const students = enrollments.map(e => e.studentId).filter(Boolean);

    res.json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get attendance summary for a student across all courses
exports.getStudentAttendanceSummary = async (req, res) => {
  try {
    const studentId = req.user._id;

    const records = await Attendance.find({ studentId }).populate('courseId', 'title');

    // Group by course
    const summary = {};
    records.forEach(r => {
      const courseId = r.courseId._id.toString();
      if (!summary[courseId]) {
        summary[courseId] = {
          courseId: r.courseId._id,
          courseName: r.courseId.title,
          total: 0,
          present: 0,
          partial: 0,
          absent: 0
        };
      }
      summary[courseId].total++;
      summary[courseId][r.status]++;
    });

    // Calculate percentages
    const data = Object.values(summary).map(course => ({
      ...course,
      percentage: course.total > 0 ? ((course.present / course.total) * 100).toFixed(1) : 0
    }));

    res.json({ success: true, summary: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get attendance report for all courses (admin)
exports.getAttendanceReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only.' });
    }

    const { courseId, date, status } = req.query;

    let query = {};
    if (courseId) query.courseId = courseId;
    if (date) query.date = date;
    if (status) query.status = status;

    const records = await Attendance.find(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort('-date');

    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const record = await Attendance.findById(id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });

    const course = await Course.findById(record.courseId);
    if (req.user.role === 'staff' && course.staffId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    record.status = status || record.status;
    record.notes = notes !== undefined ? notes : record.notes;
    await record.save();

    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
