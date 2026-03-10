// user.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/User');

router.get('/', protect, authorize('admin'), async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).sort('-createdAt');
  res.json({ success: true, users });
});

router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, department, college, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, college, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/approve', protect, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json({ success: true, user });
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'User deleted.' });
});

module.exports = router;
