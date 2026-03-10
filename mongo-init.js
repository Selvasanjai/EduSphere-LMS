// MongoDB initialization script
db = db.getSiblingDB('edusphere');

// Create application user
db.createUser({
  user: 'edusphere_user',
  pwd: 'your_secure_password',
  roles: [
    {
      role: 'readWrite',
      db: 'edusphere'
    }
  ]
});

// Create collections with indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.courses.createIndex({ title: 1 });
db.courses.createIndex({ staffId: 1 });
db.courses.createIndex({ isPublished: 1, isApproved: 1 });

db.enrollments.createIndex({ studentId: 1, courseId: 1 }, { unique: true });
db.enrollments.createIndex({ studentId: 1 });
db.enrollments.createIndex({ courseId: 1 });

db.certificates.createIndex({ certificateId: 1 }, { unique: true });
db.certificates.createIndex({ studentId: 1, courseId: 1 }, { unique: true });

db.assignments.createIndex({ courseId: 1 });
db.assignments.createIndex({ 'submissions.studentId': 1 });

db.quizzes.createIndex({ courseId: 1 });
db.quizzes.createIndex({ 'attempts.studentId': 1 });

db.attendance.createIndex({ studentId: 1, courseId: 1, date: 1 });

print('MongoDB initialized successfully');
