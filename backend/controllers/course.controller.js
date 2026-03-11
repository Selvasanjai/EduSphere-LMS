const Course = require('../models/Course');

// GET /api/courses - All published courses (or all courses for admin)
exports.getCourses = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = {};

    // Admin sees all courses (published/unpublished, approved/pending)
    // Staff sees only their own courses (all statuses)
    // Students/guests see only published and approved courses
    if (req.user?.role === 'staff') {
      query = { staffId: req.user._id };
    } else if (!req.user || req.user.role !== 'admin') {
      query = { isPublished: true, isApproved: true };
    }

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.$text = { $search: search };

    const courses = await Course.find(query)
      .populate('staffId', 'name avatar email')
      .sort('-createdAt');
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/courses/:id/videos - Videos for a course (public if course is accessible)
exports.getCourseVideos = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select(
      'videos isPublished isApproved'
    );
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found.' });

    // If request is unauthenticated or non-admin, only allow approved & published courses
    if (!req.user || req.user.role !== 'admin') {
      if (!course.isPublished || !course.isApproved) {
        return res
          .status(403)
          .json({ success: false, message: 'Course videos not available.' });
      }
    }

    const videos = Array.isArray(course.videos)
      ? [...course.videos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];

    res.json({ success: true, videos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/courses/:id
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'staffId',
      'name avatar department'
    );
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found.' });

    // Staff can only view their own courses (including unpublished)
    // Admin can view all courses
    // Students/guests can only view published and approved courses
    const courseStaffId = course.staffId?._id || course.staffId;

    if (
      req.user?.role === 'staff' &&
      courseStaffId?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Not authorized to view this course.',
        });
    }

    if (!req.user || req.user.role === 'student') {
      if (!course.isPublished || !course.isApproved) {
        return res
          .status(403)
          .json({ success: false, message: 'Course not available.' });
      }
    }

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/courses - Admin or Staff
exports.createCourse = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.user.role === 'staff') {
      data.staffId = req.user._id;
      data.isApproved = false;
      data.isPublished = false;
    }
    if (req.user.role === 'admin') {
      data.createdByAdmin = req.user._id;
      data.staffId = req.user._id; // Assign admin as staff for now
      data.isApproved = true;
      data.isPublished = true;
    }

    const course = await Course.create(data);
    res.status(201).json({ success: true, course });
  } catch (err) {
    // Handle E11000 duplicate key error for slug field
    if (err.code === 11000 && err.keyPattern?.slug) {
      return res.status(400).json({
        success: false,
        message:
          'A course with a similar name already exists. Please try a different title.',
        suggestion: 'Try making the course title more unique',
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const existing = await Course.findById(req.params.id).select('staffId');
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found.' });

    // Staff can only update their own courses
    if (
      req.user.role === 'staff' &&
      existing.staffId?.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: 'Not authorized to update this course.',
        });
    }

    const update = { ...req.body, updatedAt: new Date() };
    // Keep totalVideos in sync when videos are patched (findByIdAndUpdate bypasses pre('save'))
    if (Array.isArray(update.videos)) {
      update.totalVideos = update.videos.length;
    }

    const course = await Course.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found.' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/courses/:id - Admin only
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select('staffId');
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found.' });

    // Keep it strict: admin only (as route enforces), but still sanity-check ownership if ever expanded
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/courses/:id/approve - Admin only
exports.approveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isPublished: true },
      { new: true }
    );
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
