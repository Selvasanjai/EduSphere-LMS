const Quiz = require('../models/Quiz');
const Course = require('../models/Course');

// GET all quizzes for a course
exports.getQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await Quiz.find({ courseId })
      .select('-attempts') // Don't send answer details to students
      .populate('staffId', 'name email');
    res.json({ success: true, quizzes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single quiz
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
    
    // If student accessing, don't show answers
    if (req.user.role === 'student') {
      quiz.questions.forEach(q => {
        if (q.type === 'short-answer') q.correctAnswer = ''; // Hide answer
      });
    }
    
    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE quiz (only staff)
exports.createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, totalMarks, passingMarks, timeLimit, maxAttempts, dueDate, questions } = req.body;

    // Verify course exists and belongs to staff
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    
    if (req.user.role === 'staff' && course.staffId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only create quizzes for your own courses.' });
    }

    // Calculate total marks from questions
    const calculatedMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const quiz = await Quiz.create({
      courseId,
      staffId: req.user._id,
      title,
      description,
      questions,
      totalMarks: totalMarks || calculatedMarks,
      passingMarks: passingMarks || Math.ceil((totalMarks || calculatedMarks) * 0.4),
      timeLimit: timeLimit || 60,
      maxAttempts: maxAttempts || 1,
      dueDate,
      isPublished: true
    });

    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE quiz (only staff)
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    // Verify ownership
    if (req.user.role === 'staff' && quiz.staffId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own quizzes.' });
    }

    const updated = await Quiz.findByIdAndUpdate(
      req.params.quizId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );

    res.json({ success: true, quiz: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    if (req.user.role === 'staff' && quiz.staffId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own quizzes.' });
    }

    await Quiz.findByIdAndDelete(req.params.quizId);
    res.json({ success: true, message: 'Quiz deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// START a quiz attempt
exports.startQuizAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    // Check if student already attempted max times
    const attempts = quiz.attempts.filter(a => a.studentId.toString() === req.user._id.toString());
    if (attempts.length >= quiz.maxAttempts) {
      return res.status(400).json({ success: false, message: `Max ${quiz.maxAttempts} attempts allowed.` });
    }

    // Return quiz without showing answers
    const quizCopy = quiz.questions.map(q => ({
      _id: q._id,
      text: q.text,
      type: q.type,
      options: q.options,
      marks: q.marks
    }));

    res.json({ success: true, questions: quizCopy, timeLimit: quiz.timeLimit * 60 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// SUBMIT quiz answers
exports.submitQuizAnswers = async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionId, studentAnswer }, ...]
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    // Grade the quiz
    let marksObtained = 0;
    const gradedAnswers = [];

    answers.forEach(ans => {
      const question = quiz.questions.find(q => q._id.toString() === ans.questionId);
      if (!question) return;

      let isCorrect = false;
      let marks = 0;

      if (question.type === 'mcq' || question.type === 'true-false') {
        isCorrect = ans.studentAnswer === question.correctAnswer;
        marks = isCorrect ? question.marks : 0;
      } else if (question.type === 'short-answer') {
        // Manual grading needed
        marks = 0;
        isCorrect = false;
      }

      marksObtained += marks;
      gradedAnswers.push({
        questionId: question._id,
        studentAnswer: ans.studentAnswer,
        isCorrect,
        marksObtained: marks
      });
    });

    const percentage = Math.round((marksObtained / quiz.totalMarks) * 100);
    const passed = marksObtained >= quiz.passingMarks;

    // Save attempt
    const attempt = {
      studentId: req.user._id,
      answers: gradedAnswers,
      totalMarks: quiz.totalMarks,
      marksObtained,
      percentage,
      submittedAt: new Date()
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    res.json({
      success: true,
      marksObtained,
      totalMarks: quiz.totalMarks,
      percentage,
      passed,
      message: passed ? 'Passed!' : 'Failed. Try again.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET student's quiz result
exports.getQuizResult = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    const attempt = quiz.attempts.find(
      a => a.studentId.toString() === req.user._id.toString()
    );

    if (!attempt) return res.status(404).json({ success: false, message: 'Quiz not attempted.' });

    res.json({ success: true, result: attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET all results (for staff)
exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate('attempts.studentId', 'name email');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    // Verify staff owns quiz
    if (req.user.role === 'staff' && quiz.staffId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    res.json({ success: true, results: quiz.attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
