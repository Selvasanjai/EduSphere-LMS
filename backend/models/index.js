const mongoose = require('mongoose');

// ─── Enrollment ───────────────────────────────────────────────
const progressSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId },
  completed: { type: Boolean, default: false },
  watchedDuration: { type: Number, default: 0 },
  completedAt: { type: Date },
});

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: [progressSchema],
  completionPercent: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  enrolledAt: { type: Date, default: Date.now },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// ─── Attendance ───────────────────────────────────────────────
const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], default: 'present' },
  loggedIn: { type: Boolean, default: false },
  engagementScore: { type: Number, default: 0 }, // based on lessons/quizzes done
}, { timestamps: true });

attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

// ─── Assignment ───────────────────────────────────────────────
const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileUrl: { type: String },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: Number, default: null },
  feedback: { type: String, default: '' },
  gradedAt: { type: Date },
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deadline: { type: Date, required: true },
  maxScore: { type: Number, default: 100 },
  submissions: [submissionSchema],
}, { timestamps: true });

// ─── Certificate ──────────────────────────────────────────────
const certificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificateId: { type: String, required: true, unique: true },
  issuedAt: { type: Date, default: Date.now },
  attendancePercent: { type: Number },
  videoCompletionPercent: { type: Number },
  assignmentsCompleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = {
  Enrollment: mongoose.model('Enrollment', enrollmentSchema),
  Attendance: mongoose.model('Attendance', attendanceSchema),
  Assignment: mongoose.model('Assignment', assignmentSchema),
  Certificate: mongoose.model('Certificate', certificateSchema),
};
