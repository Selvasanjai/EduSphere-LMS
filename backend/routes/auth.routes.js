const express = require('express');
const router = express.Router();
const { register, login, getMe, forgotPassword, resetPassword, googleAuth, githubAuth } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/github', githubAuth);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

module.exports = router;
