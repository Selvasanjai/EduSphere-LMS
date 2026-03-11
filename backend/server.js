require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const certificateRoutes = require('./routes/certificate.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const quizRoutes = require('./routes/quiz.routes');
const liveclassRoutes = require('./routes/liveclass.routes');
const Enrollment = require('./models/Enrollment');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const corsOptions = {
  origin: process.env.CLIENT_URL || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/live-classes', liveclassRoutes);

// Health Check
app.get('/api/health', (req, res) =>
  res.json({ status: 'EduSphere API Running ✅', timestamp: new Date() })
);

// Error Handling
app.use((err, req, res, _next) => {
  console.error(err.stack);

  let statusCode = err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose-specific errors for better client feedback
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.code === 11000) {
    statusCode = 409; // Conflict
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}. Please use another value.`;
  } else if (err.name === 'CastError') {
    statusCode = 400; // Bad Request
    message = `Invalid ${err.path}: ${err.value}.`;
  }

  res.status(statusCode).json({ success: false, message });
});

// DB Connection + Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');

    // One-time cleanup: drop legacy unique index on (student, course)
    // Old index causes E11000 with dup key { student: null, course: null }
    (async () => {
      try {
        const indexes = await Enrollment.collection.indexes();
        const legacy = indexes.find(
          (i) => i?.key?.student === 1 && i?.key?.course === 1
        );
        if (legacy?.name) {
          await Enrollment.collection.dropIndex(legacy.name);
          console.log(`🧹 Dropped legacy enrollments index: ${legacy.name}`);
        }
      } catch (e) {
        // Non-fatal: app should still start
        console.warn('⚠️ Legacy index cleanup skipped:', e.message);
      }
    })();

    app.listen(process.env.PORT || 5000, () =>
      console.log(
        `🚀 EduSphere API running on port ${process.env.PORT || 5000}`
      )
    );
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('💡 Make sure MONGO_URI is set correctly in your Render environment variables!');
    process.exit(1);
  });
