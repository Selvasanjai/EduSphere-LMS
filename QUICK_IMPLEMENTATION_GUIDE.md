# Quick Implementation Guide - New Features (Phase 2)

**Date**: March 10, 2026  
**New Features**: Password Reset, Quiz System, Search & Filter

---

## 🚀 Quick Start Guide

### 1. Password Reset Feature

#### Testing Forgot Password
```
1. Go to: http://localhost:3000/login
2. Click "Forgot password?" link
3. Enter your email address
4. Click "Send Reset Link"
5. You'll be redirected to login

NOTE: Email sending requires Nodemailer setup in backend.
Currently shows success message but doesn't send actual email.

To Enable Email:
- Set up environment variables:
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_app_password
  
- Update auth.controller.js forgotPassword endpoint to:
  // Send email before response
  await sendResetEmail(user.email, resetToken);
```

#### Frontend Routes (Already Set Up)
```javascript
// These routes are already added to App.js:
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password/:token" element={<ResetPasswordPage />} />
```

#### Backend Endpoints (Ready to Use)
```
POST /api/auth/forgot-password
  Body: { email: "user@example.com" }
  Response: { success: true, message: "Reset link sent to email." }

PATCH /api/auth/reset-password/:token
  Body: { password: "newpassword123" }
  Response: { success: true, token, user }
```

---

### 2. Quiz System

#### Creating a Quiz (Staff)
```
1. Login as Staff
2. Go to Course or use API:

POST /api/quizzes
Headers: { Authorization: "Bearer <token>" }
Body: {
  "courseId": "copy_your_course_id",
  "title": "Web Development Quiz",
  "description": "Test Chapter 1-2",
  "questions": [
    {
      "text": "Which tag is used for heading?",
      "type": "mcq",
      "options": ["<div>", "<h1>", "<span>", "<header>"],
      "correctAnswer": "<h1>",
      "marks": 1,
      "explanation": "h1 tag is for main headings"
    },
    {
      "text": "HTML is a programming language",
      "type": "true-false",
      "options": ["True", "False"],
      "correctAnswer": "False",
      "marks": 1
    }
  ],
  "totalMarks": 10,
  "passingMarks": 6,
  "timeLimit": 30,
  "maxAttempts": 2,
  "dueDate": "2026-03-20"
}
```

#### Taking a Quiz (Student)
```
1. Navigate to course
2. Find quiz and click "Take Quiz"
3. Answer questions within time limit:

POST /api/quizzes/:quizId/start
  Response: { success: true, questions: [...], timeLimit: 1800 }

4. Submit answers:

POST /api/quizzes/:quizId/submit
Headers: { Authorization: "Bearer <token>" }
Body: {
  "answers": [
    { "questionId": "q1", "studentAnswer": "<h1>" },
    { "questionId": "q2", "studentAnswer": "False" }
  ]
}

Response: {
  success: true,
  marksObtained: 10,
  totalMarks: 10,
  percentage: 100,
  passed: true,
  message: "Passed!"
}
```

#### Checking Results
```
GET /api/quizzes/:quizId/result/:studentId
  Shows student's quiz result with answers

GET /api/quizzes/:quizId/results (Staff Only)
  Shows all student results for the quiz
```

#### Question Types Supported
```javascript
1. MCQ (Multiple Choice)
   {
     "type": "mcq",
     "text": "Which is a correct HTML tag?",
     "options": ["<div>", "<h1>", "<span>"],
     "correctAnswer": "<h1>"
   }

2. True/False
   {
     "type": "true-false",
     "text": "CSS is a programming language",
     "correctAnswer": "False"
   }

3. Short Answer (Manual Grading)
   {
     "type": "short-answer",
     "text": "What does HTML stand for?",
     "correctAnswer": "HyperText Markup Language"
     // Staff grades manually
   }
```

---

### 3. Search & Filter System

#### Using in Your Component
```javascript
import CourseSearchFilter from './components/CourseSearchFilter';

export default function MyCoursesPage() {
  const [filteredCourses, setFilteredCourses] = useState([]);

  return (
    <>
      <CourseSearchFilter 
        courses={allCourses}
        onFiltered={setFilteredCourses}
      />
      
      {/* Display filtered results */}
      {filteredCourses.map(course => (
        <CourseCard key={course._id} course={course} />
      ))}
    </>
  );
}
```

#### Features
```
✅ Real-time search by course name
✅ Filter by category (Programming, Web Dev, etc)
✅ Filter by level (Beginner, Intermediate, Advanced)
✅ Shows matching course count
✅ Clear filters button
✅ Mobile responsive
✅ Collapsible filter panel
```

#### Example Search Scenarios
```
Scenario 1: Search for "Python"
  - Shows all courses with "Python" in name/description
  - Results: [Python Basics, Python Advanced, etc]

Scenario 2: Filter by Category "Web Development"
  - Shows all web dev courses
  - Results: [HTML/CSS, JavaScript, React, etc]

Scenario 3: Combine filters
  - Search "Database" + Category "Backend" + Level "Intermediate"
  - Shows: Database Design, SQL Advanced

Scenario 4: Clear filters
  - Click "Clear All Filters" button
  - Shows all courses again
```

---

## 📁 Files Added/Modified

### New Files Created
```
✅ backend/models/Quiz.js
✅ backend/controllers/quiz.controller.js
✅ backend/routes/quiz.routes.js
✅ frontend/pages/ForgotPasswordPage.js
✅ frontend/pages/ResetPasswordPage.js
✅ frontend/components/CourseSearchFilter.js
```

### Files Modified
```
✅ backend/server.js (added quiz routes)
✅ frontend/src/App.js (added forgot/reset routes)
✅ (LoginPage already has forgot password link)
```

---

## 🛠️ API Endpoints Summary

### Quiz Endpoints (NEW)
```
GET    /api/quizzes/course/:courseId      Get all quizzes
GET    /api/quizzes/:quizId               Get quiz details
POST   /api/quizzes                       Create quiz (staff)
PATCH  /api/quizzes/:quizId               Update quiz (staff)
DELETE /api/quizzes/:quizId               Delete quiz (staff)
POST   /api/quizzes/:quizId/start         Start attempt
POST   /api/quizzes/:quizId/submit        Submit answers
GET    /api/quizzes/:quizId/result/:studentId   Get result
GET    /api/quizzes/:quizId/results       Get all results (staff)
```

### Password Reset Endpoints (Existing)
```
POST   /api/auth/forgot-password          Request reset
PATCH  /api/auth/reset-password/:token    Reset password
```

---

## ✅ Testing Checklist

### Password Reset
- [ ] Can navigate to /forgot-password
- [ ] Can enter email and submit
- [ ] Success message appears
- [ ] Can access /reset-password/:token
- [ ] Can change password
- [ ] New password works for login

### Quiz System
- [ ] Can create quiz with questions
- [ ] Quiz appears in API response
- [ ] Can start quiz attempt
- [ ] Timer shows during quiz
- [ ] Can submit answers
- [ ] Score calculated correctly
- [ ] MCQ auto-graded properly
- [ ] Can view results

### Search & Filter
- [ ] Search works real-time
- [ ] Category filter works
- [ ] Level filter works
- [ ] Results counter updates
- [ ] Clear filters button works
- [ ] Mobile view responsive

---

## 🐛 Troubleshooting

### Quiz API not working
**Check**:
1. Is quiz routes added to server.js? ✅ (Already done)
2. Quiz controller imported? ✅ (Already done)
3. Course ID valid? (Copy from existing course)
4. Staff user creating? (Only staff can create)

### Search filter not filtering
**Check**:
1. Is component imported correctly?
2. Are courses being passed as prop?
3. Check console for JavaScript errors
4. Verify course has category field

### Password reset email not sending
**Check**:
1. SMTP credentials in .env?
2. Email sending code added to controller?
3. Check backend logs for errors
4. Try using Postman to test API

---

## 📊 Integration with Existing System

### Quiz with Courses
```javascript
// When course detail page loads, also load quizzes:
const quizzes = await axios.get(`/api/quizzes/course/${courseId}`);

// Show quiz button alongside videos
<button onClick={() => navigate(`/quiz/${quiz._id}`)}>
  📝 Take Quiz
</button>
```

### Search in Courses Page
```javascript
// In StudentCoursesPage or CoursesPage
<CourseSearchFilter 
  courses={allAvailableCourses} 
  onFiltered={setDisplayedCourses}
/>
```

### Password Reset in Login Flow
```javascript
// Login page already has link to /forgot-password
// User flow:
Login → Forgot Password → Reset Password → Automatic Login
```

---

## 🚀 Deployment Notes

### Before Production
1. Set up Nodemailer credentials for email
2. Configure Quiz time limits appropriately
3. Set database backup schedule
4. Enable rate limiting for APIs
5. Test password reset email flow

### Performance Tips
1. Add indexes to Quiz.courseId
2. Cache frequently searched courses
3. Limit quiz results pagination
4. Compress search filter results

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check server logs
3. Verify all imports are correct
4. Test endpoints with Postman
5. Check database connection

---

**Created**: March 10, 2026  
**Status**: Ready for Testing ✅
