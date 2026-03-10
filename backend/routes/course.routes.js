const express = require('express');
const router = express.Router();
const { getCourses, getCourse, getCourseVideos, createCourse, updateCourse, deleteCourse, approveCourse } = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware for GET /
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return next();

  const token = auth.split(' ')[1];
  if (!token) return next();

  // Important: ignore invalid/expired token for "optional" auth routes
  // so public/published course browsing still works.
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(decoded.id)
      .then((user) => {
        if (user) req.user = user;
        next();
      })
      .catch(() => next());
  } catch (_) {
    next();
  }
};

router.get('/', optionalAuth, getCourses);
router.get('/:id/videos', optionalAuth, getCourseVideos);
router.get('/:id', protect, getCourse);
router.post('/', protect, authorize('admin', 'staff'), createCourse);
router.patch('/:id', protect, authorize('admin', 'staff'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);
router.patch('/:id/approve', protect, authorize('admin'), approveCourse);

module.exports = router;
