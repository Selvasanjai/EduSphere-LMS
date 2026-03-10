const Assignment = require('../models/Assignment');

// GET /api/assignments/course/:courseId - Get assignments for a course
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ courseId: req.params.courseId })
      .populate('staffId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, assignments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/assignments/:id - Get single assignment
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('courseId', 'title')
      .populate('staffId', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Staff can only view their own assignments
    if (req.user?.role === 'staff' && assignment.staffId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this assignment.' });
    }

    res.json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/assignments - Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const assignmentData = {
      ...req.body,
      staffId: req.user._id
    };

    const assignment = await Assignment.create(assignmentData);
    await assignment.populate('staffId', 'name email');

    res.status(201).json({ success: true, assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/assignments/:id - Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Staff can only update their own assignments
    if (req.user?.role === 'staff' && assignment.staffId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this assignment.' });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.json({ success: true, assignment: updatedAssignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/assignments/:id - Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Staff can only delete their own assignments
    if (req.user?.role === 'staff' && assignment.staffId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this assignment.' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Assignment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/assignments/:id/submit - Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      sub => sub.studentId.toString() === req.user._id.toString()
    );

    if (existingSubmission) {
      return res.status(400).json({ 
        success: false, 
        message: 'Assignment already submitted.' 
      });
    }

    // Add submission
    assignment.submissions.push({
      studentId: req.user._id,
      fileUrl: req.body.fileUrl,
      fileName: req.body.fileName,
      submittedAt: new Date()
    });

    await assignment.save();
    res.status(201).json({ 
      success: true, 
      message: 'Assignment submitted successfully.' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/assignments/:id/review - Review assignment
exports.reviewAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Staff can only review their own assignments
    if (req.user?.role === 'staff' && assignment.staffId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this assignment.' });
    }

    const { studentId, marks, feedback } = req.body;
    
    // Find and update submission
    const submission = assignment.submissions.find(
      sub => sub.studentId.toString() === studentId
    );

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Submission not found.' 
      });
    }

    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = 'graded';

    await assignment.save();
    res.json({ 
      success: true, 
      message: 'Assignment reviewed successfully.' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
