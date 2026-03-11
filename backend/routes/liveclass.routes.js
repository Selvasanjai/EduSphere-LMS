const express = require('express');
const router = express.Router();
const {
  getLiveClasses,
  getLiveClass,
  getCourseActiveLiveClasses,
  createLiveClass,
  startLiveClass,
  endLiveClass,
  updateLiveClass,
  deleteLiveClass,
  joinLiveClass,
  leaveLiveClass,
  addChatMessage,
  raiseHand,
  answerRaisedHand,
  getAttendanceReport,
} = require('../controllers/liveclass.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getLiveClasses);
router.get('/:id', getLiveClass);
router.get('/course/:courseId', getCourseActiveLiveClasses);

// Staff routes - Create and manage live classes
router.post('/', protect, authorize('staff', 'admin'), createLiveClass);

router.patch('/:id', protect, authorize('staff', 'admin'), updateLiveClass);

router.delete('/:id', protect, authorize('staff', 'admin'), deleteLiveClass);

// Start and end live class
router.post('/:id/start', protect, authorize('staff', 'admin'), startLiveClass);

router.post('/:id/end', protect, authorize('staff', 'admin'), endLiveClass);

// Attendance report
router.get(
  '/:id/attendance',
  protect,
  authorize('staff', 'admin'),
  getAttendanceReport
);

// Student routes - Join and interact
router.post('/:id/join', protect, authorize('student'), joinLiveClass);

router.post('/:id/leave', protect, authorize('student'), leaveLiveClass);

// Chat routes
router.post('/:id/chat', protect, authorize('student'), addChatMessage);

// Raise hand routes
router.post('/:id/raise-hand', protect, authorize('student'), raiseHand);

router.post(
  '/:id/raise-hand/:handId/answer',
  protect,
  authorize('staff', 'admin'),
  answerRaisedHand
);

module.exports = router;
