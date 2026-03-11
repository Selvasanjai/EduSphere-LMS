const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  startQuizAttempt,
  submitQuizAnswers,
  getQuizResult,
  getQuizResults,
} = require('../controllers/quiz.controller');

// Get all quizzes for a course
router.get('/course/:courseId', protect, getQuizzes);

// Get single quiz details
router.get('/:quizId', protect, getQuiz);

// Create quiz (staff only)
router.post('/', protect, authorize('staff', 'admin'), createQuiz);

// Update quiz (staff only)
router.patch('/:quizId', protect, authorize('staff', 'admin'), updateQuiz);

// Delete quiz (staff only)
router.delete('/:quizId', protect, authorize('staff', 'admin'), deleteQuiz);

// Start quiz attempt
router.post('/:quizId/start', protect, authorize('student'), startQuizAttempt);

// Submit quiz answers
router.post(
  '/:quizId/submit',
  protect,
  authorize('student'),
  submitQuizAnswers
);

// Get quiz result (student - own result)
router.get('/:quizId/result/:studentId', protect, getQuizResult);

// Get all results (staff - all students)
router.get(
  '/:quizId/results',
  protect,
  authorize('staff', 'admin'),
  getQuizResults
);

module.exports = router;
