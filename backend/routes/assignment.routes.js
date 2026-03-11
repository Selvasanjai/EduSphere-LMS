// assignment.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

router.get('/course/:courseId', protect, async (req, res) => {
  const assignments = await Assignment.find({ courseId: req.params.courseId });
  res.json({ success: true, assignments });
});

router.post('/', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    // Validate that course exists
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found.' });
    }

    // Validate that staff only posts to their own courses (unless admin)
    if (
      req.user.role === 'staff' &&
      course.staffId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'You can only post assignments to your own courses.',
        });
    }

    const assignment = await Assignment.create({
      ...req.body,
      staffId: req.user._id,
    });
    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    const alreadySubmitted = assignment.submissions.find(
      (s) => s.studentId.toString() === req.user._id.toString()
    );
    if (alreadySubmitted)
      return res
        .status(400)
        .json({ success: false, message: 'Already submitted.' });
    assignment.submissions.push({
      studentId: req.user._id,
      fileUrl: req.body.fileUrl,
    });
    await assignment.save();
    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id', protect, authorize('staff', 'admin'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    // Validate that staff can only edit their own assignments (unless admin)
    if (
      req.user.role === 'staff' &&
      assignment.staffId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'You can only edit your own assignments.',
        });
    }

    const updated = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        deadline: req.body.deadline,
        maxMarks: req.body.maxMarks,
      },
      { new: true }
    );
    res.json({ success: true, assignment: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete(
  '/:id',
  protect,
  authorize('staff', 'admin'),
  async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);

      // Validate that staff can only delete their own assignments (unless admin)
      if (
        req.user.role === 'staff' &&
        assignment.staffId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: 'You can only delete your own assignments.',
          });
      }

      await Assignment.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Assignment deleted successfully.' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

router.patch(
  '/:id/grade/:studentId',
  protect,
  authorize('staff', 'admin'),
  async (req, res) => {
    try {
      const assignment = await Assignment.findById(req.params.id);

      // Validate that staff can only grade assignments in their own courses (unless admin)
      if (
        req.user.role === 'staff' &&
        assignment.staffId.toString() !== req.user._id.toString()
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: 'You can only grade assignments in your own courses.',
          });
      }

      const submission = assignment.submissions.find(
        (s) => s.studentId.toString() === req.params.studentId
      );
      if (!submission)
        return res
          .status(404)
          .json({ success: false, message: 'Submission not found.' });
      submission.marks = req.body.marks;
      submission.feedback = req.body.feedback;
      submission.status = 'graded';
      await assignment.save();
      res.json({ success: true, assignment });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
