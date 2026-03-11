const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    loginTime: { type: Date },
    videosWatchedToday: { type: Number, default: 0 },
    quizCompleted: { type: Boolean, default: false },
    assignmentSubmitted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['present', 'absent', 'partial'],
      default: 'absent',
    },
    notes: { type: String, default: '' },
    markedAt: { type: Date },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Mark present if student watched >= 2 videos AND completed quiz
attendanceSchema.methods.evaluate = function () {
  if (this.videosWatchedToday >= 2 && this.quizCompleted) {
    this.status = 'present';
  } else if (this.videosWatchedToday >= 1) {
    this.status = 'partial';
  } else {
    this.status = 'absent';
  }
  return this.status;
};

attendanceSchema.index(
  { studentId: 1, courseId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
