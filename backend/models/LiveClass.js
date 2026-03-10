const mongoose = require('mongoose');

// Schema for live class chat messages
const chatMessageSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['message', 'question', 'announcement'],
    default: 'message'
  }
});

// Schema for student attendance in live class
const attendanceRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  joinTime: {
    type: Date,
    required: true
  },
  leaveTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number,
    default: 0 // in minutes
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  }
});

// Schema for raised hands
const raiseHandSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  raisedAt: {
    type: Date,
    default: Date.now
  },
  answeredAt: {
    type: Date,
    default: null
  },
  isAnswered: {
    type: Boolean,
    default: false
  }
});

// Schema for live polls/quizzes during class
const liveQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    votes: { type: Number, default: 0 }
  }],
  correctAnswer: String,
  duration: Number, // in seconds
  startedAt: Date,
  endedAt: Date,
  responses: [{
    studentId: mongoose.Schema.Types.ObjectId,
    selectedOption: String,
    timestamp: Date
  }]
});

// Main Live Class Schema
const liveClassSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  
  // Timing
  scheduledStartTime: {
    type: Date,
    required: true,
    index: true
  },
  actualStartTime: {
    type: Date,
    default: null
  },
  actualEndTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  
  // Streaming info
  streamUrl: String,
  rtcOffers: [mongoose.Schema.Types.Mixed], // WebRTC offers from students
  
  // Features
  chatEnabled: { type: Boolean, default: true },
  raiseHandEnabled: { type: Boolean, default: true },
  screenShareEnabled: { type: Boolean, default: true },
  recordingEnabled: { type: Boolean, default: false },
  isScreenSharing: { type: Boolean, default: false },
  
  // Recording
  recordingUrl: String,
  isRecording: { type: Boolean, default: false },
  recordingStartTime: Date,
  recordingEndTime: Date,
  
  // Live data
  currentStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalStudentsJoined: { type: Number, default: 0 },
  
  // Messages and interactions
  chatMessages: [chatMessageSchema],
  attendanceRecords: [attendanceRecordSchema],
  raisedHands: [raiseHandSchema],
  liveQuestions: [liveQuestionSchema],
  
  // Notes/materials
  notesUrl: String,
  resourcesShared: [{
    name: String,
    url: String,
    uploadedAt: Date,
    uploadedBy: mongoose.Schema.Types.ObjectId
  }],
  
  // Metadata
  viewsCount: { type: Number, default: 0 },
  peakViewers: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt before saving
liveClassSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
liveClassSchema.index({ courseId: 1, status: 1 });
liveClassSchema.index({ staffId: 1, status: 1 });
liveClassSchema.index({ scheduledStartTime: -1 });

module.exports = mongoose.model('LiveClass', liveClassSchema);
