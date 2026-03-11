const express = require('express');
const router = express.Router();
const {
  adminAnalytics,
  studentAnalytics,
} = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/admin', protect, authorize('admin'), adminAnalytics);
router.get('/student', protect, authorize('student'), studentAnalytics);

module.exports = router;
