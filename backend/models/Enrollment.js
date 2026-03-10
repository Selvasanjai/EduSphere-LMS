const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  videosWatched: [{ type: mongoose.Schema.Types.ObjectId }], // video _ids
  attendancePercentage: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completionDate: { type: Date },
  enrolledAt: { type: Date, default: Date.now }
});

// Ensure a student can enroll in a course only once
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
