const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    default: () => `EDU-${uuidv4().slice(0, 8).toUpperCase()}`,
    unique: true,
  },
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
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completionDate: { type: Date, default: Date.now },
  attendancePercentage: { type: Number, required: true },
  finalScore: { type: Number, default: 0 },
  grade: { type: String, default: 'F' },
  duration: { type: String, default: '12 Weeks (120 Hours)' },
  distinctionStatus: { type: String, default: '' }, // e.g., "with Distinction", "with Merit"
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isValid: { type: Boolean, default: true },
  pdfUrl: { type: String },
});

module.exports = mongoose.model('Certificate', certificateSchema);
