const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ['mcq', 'true-false', 'short-answer'],
    required: true,
  },
  options: [String], // For MCQ
  correctAnswer: { type: String, required: true }, // Index for MCQ, T/F, or text
  marks: { type: Number, default: 1 },
  explanation: { type: String, default: '' },
  order: { type: Number },
});

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  studentAnswer: { type: String },
  isCorrect: { type: Boolean, default: false },
  marksObtained: { type: Number, default: 0 },
});

const attemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  answers: [answerSchema],
  totalMarks: { type: Number, default: 0 },
  marksObtained: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  timeTaken: { type: Number }, // in seconds
  status: {
    type: String,
    enum: ['submitted', 'reviewed'],
    default: 'submitted',
  },
  submittedAt: { type: Date, default: Date.now },
  feedback: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  questions: [questionSchema],
  totalMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 40 },
  timeLimit: { type: Number, default: 60 }, // in minutes
  attempts: [attemptSchema],
  isPublished: { type: Boolean, default: false },
  showAnswersAfter: { type: Boolean, default: true },
  allowRetake: { type: Boolean, default: true },
  maxAttempts: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  dueDate: { type: Date },
});

module.exports = mongoose.model('Quiz', quizSchema);
