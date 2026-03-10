# Staff Assignment Management Guide

## Overview
Staff members can now post, edit, and manage assignments **only for their own courses**. This ensures secure, role-based content management in the EduSphere platform.

---

## Features ✨

### 1. Staff Course Filtering
- Staff see **only the courses they created** in the assignment management interface
- Dropdown shows only courses with `staffId === currentUser._id`
- Prevents accidental posting to wrong courses

### 2. Assignment Creation
Staff can create assignments with:
- **Title** - Assignment name (e.g., "Chapter 1-2 Practice Problems")
- **Description** - Detailed instructions and requirements
- **Deadline** - Due date for submission
- **Max Marks** - Total points for the assignment (default: 100)

### 3. Assignment Management
Staff can:
- ✏️ **Edit** - Update title, description, deadline, marks
- 🗑️ **Delete** - Remove assignment (with confirmation)
- 👁️ **View** - See total submissions and status per assignment

### 4. Submission Grading
Staff can grade student submissions:
- Assign marks (0 to maxMarks)
- Add feedback/comments
- Mark as "graded" when complete

---

## How It Works 🔧

### Frontend Implementation (React)
**Page:** `frontend/src/pages/staff/StaffAssignmentsPage.js`

```javascript
// 1. Filter courses by current staff member
const { user } = useAuthStore();
const myCourses = data.courses.filter(c => c.staffId?._id === user?._id);

// 2. Show dropdown with only user's courses
<select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
  {courses.map(course => (
    <option key={course._id} value={course._id}>
      {course.title}
    </option>
  ))}
</select>

// 3. Submit assignment with courseId
await axios.post('/api/assignments', {
  title: formData.title,
  description: formData.description,
  deadline: formData.deadline,
  maxMarks: formData.maxMarks,
  courseId: selectedCourse  // ← Current staff's course
});
```

### Backend Validation (Node.js/Express)
**File:** `backend/routes/assignment.routes.js`

#### POST /api/assignments (Create)
```javascript
// 1. Verify course exists
const course = await Course.findById(req.body.courseId);
if (!course) return 404 "Course not found"

// 2. Validate staff owns the course
if (user.role === 'staff' && course.staffId !== user._id) {
  return 403 "You can only post assignments to your own courses"
}

// 3. Create assignment
await Assignment.create({ ...req.body, staffId: user._id });
```

#### PATCH /api/assignments/:id (Edit)
```javascript
// 1. Find assignment
const assignment = await Assignment.findById(id);

// 2. Validate staff owns the assignment
if (user.role === 'staff' && assignment.staffId !== user._id) {
  return 403 "You can only edit your own assignments"
}

// 3. Update fields
await Assignment.findByIdAndUpdate(id, { title, description, deadline, maxMarks });
```

#### DELETE /api/assignments/:id (Delete)
```javascript
// 1. Find assignment
const assignment = await Assignment.findById(id);

// 2. Validate ownership
if (user.role === 'staff' && assignment.staffId !== user._id) {
  return 403 "You can only delete your own assignments"
}

// 3. Delete
await Assignment.findByIdAndDelete(id);
```

#### PATCH /api/assignments/:id/grade/:studentId (Grade)
```javascript
// 1. Verify staff created this assignment
if (user.role === 'staff' && assignment.staffId !== user._id) {
  return 403 "You can only grade assignments in your own courses"
}

// 2. Find submission and update marks/feedback
const submission = assignment.submissions.find(...);
submission.marks = req.body.marks;
submission.feedback = req.body.feedback;
```

---

## Security Architecture 🔒

### Multi-Layer Validation

| Layer | Method | Benefit |
|-------|--------|---------|
| **Frontend** | Course dropdown filtering | Better UX, prevents mistakes |
| **Backend** | courseId ownership check | Prevents API bypass attempts |
| **Authorization** | Role-based middleware | Ensures only staff/admin can create |
| **Data Models** | staffId field on Assignment | Tracks ownership for auditing |

### Permission Model

```
ROLE      Can Post Assignments to    Can Grade       Can Edit/Delete
─────────────────────────────────────────────────────────────────
Admin     ALL courses               ALL submissions  ANY assignment
Staff     ONLY own courses          ONLY own courses ONLY own courses  
Student   CANNOT post               CANNOT grade     CANNOT edit
```

---

## User Workflow 📋

### Step 1: Navigate to Assignments
```
Staff Dashboard → Assignments
```

### Step 2: Select Your Course
```
Dropdown shows: [Select a course ▼]
  - My Course 1 (3 assignments)
  - My Course 2 (1 assignment)
  
Admin courses are NOT shown (filtered out)
```

### Step 3: Create Assignment
```
Click "Post Assignment" button
  ├─ Title: "Midterm Exam Questions"
  ├─ Description: "Solve 5 problems from Chapter 3-4..."
  ├─ Deadline: 2024-02-28
  └─ Max Marks: 50
  
Click "Post Assignment" → Success!
```

### Step 4: View Assignments
```
Card shows:
  ├─ Title
  ├─ Description (truncated)
  ├─ Max Marks
  ├─ Deadline
  ├─ Submissions count
  └─ [Edit] [Delete] buttons
```

### Step 5: Grade Submissions
```
Click on assignment → See student submissions
  ├─ Student name
  ├─ Submission file
  ├─ Submitted date
  ├─ [Grade] button
  
Click [Grade] → Form to add marks and feedback
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Staff Dashboard                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ StaffAssignmentsPage.js                                      │
│ ├─ useAuthStore() → Get current user                        │
│ ├─ GET /api/courses                                          │
│ │  └─ Filter: staffId === user._id ✅                      │
│ └─ setSelectedCourse(myCourse[0]._id)                        │
└───────────────┬──────────────────────────────────────────────┘
                │
                ▼
        [Course Dropdown]
        (Staff's courses only)
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
[Post]      [Edit]     [Delete]
    │           │           │
    └─────┬─────┴─────┬─────┘
          │           │
          ▼           ▼
    POST/PATCH/DELETE /api/assignments
          │
          ▼
┌──────────────────────────────────────────────────────┐
│ Backend Validation (assignment.routes.js)            │
├──────────────────────────────────────────────────────┤
│ 1. Get courseId from request body                    │
│ 2. Find Course in database                           │
│ 3. Check: course.staffId === user._id               │
│    ├─ YES → Create/Update/Delete assignment ✅      │
│    └─ NO  → Return 403 Forbidden ❌                 │
└──────────────────────────────────────────────────────┘
```

---

## Error Handling

### Frontend Errors
| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to load courses" | Network issue | Check backend server |
| "Please fill all required fields" | Missing input | Complete all fields |
| "Assignment posted successfully!" | Form valid | ✅ Success! |

### Backend Errors (403 Forbidden)
```json
{
  "success": false,
  "message": "You can only post assignments to your own courses."
}
```
**When:** Staff tries to post assignment to another staff's course
**Why:** Security - prevent unauthorized course access
**How to fix:** Select your own course from dropdown

### Backend Errors (404 Not Found)
```json
{
  "success": false,
  "message": "Course not found."
}
```
**When:** Course doesn't exist in database
**Why:** Course was deleted or invalid ID provided
**How to fix:** Refresh page, select valid course

---

## API Reference

### Create Assignment
```
POST /api/assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Chapter 1 Practice",
  "description": "Solve problems 1-10",
  "deadline": "2024-02-28",
  "maxMarks": 100,
  "courseId": "course-id"
}

Response 201 Created:
{
  "success": true,
  "assignment": {
    "_id": "assignment-id",
    "courseId": "course-id",
    "staffId": "user-id",
    "title": "Chapter 1 Practice",
    "description": "Solve problems 1-10",
    "deadline": "2024-02-28T00:00:00Z",
    "maxMarks": 100,
    "submissions": [],
    "createdAt": "2024-02-14T10:00:00Z"
  }
}

Response 403 Forbidden:
{
  "success": false,
  "message": "You can only post assignments to your own courses."
}
```

### Get Course Assignments
```
GET /api/assignments/course/:courseId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "assignments": [
    {
      "_id": "assignment-id",
      "title": "Chapter 1 Practice",
      "deadline": "2024-02-28T00:00:00Z",
      "maxMarks": 100,
      "submissions": [
        {
          "studentId": "student-id",
          "fileUrl": "url-to-file",
          "submittedAt": "2024-02-16T14:30:00Z",
          "marks": 85,
          "feedback": "Good work!",
          "status": "graded"
        }
      ]
    }
  ]
}
```

### Edit Assignment
```
PATCH /api/assignments/:assignmentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "deadline": "2024-03-05",
  "maxMarks": 100
}

Response 200:
{
  "success": true,
  "assignment": { ...updated fields }
}
```

### Grade Submission
```
PATCH /api/assignments/:assignmentId/grade/:studentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "marks": 85,
  "feedback": "Excellent work! Well explained."
}

Response 200:
{
  "success": true,
  "assignment": { ...with updated submission }
}
```

### Delete Assignment
```
DELETE /api/assignments/:assignmentId
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Assignment deleted successfully."
}
```

---

## Testing Checklist ✅

### Functional Tests
- [ ] Staff login and navigate to Assignments
- [ ] Course dropdown shows only staff's courses
- [ ] Click "Post Assignment" opens modal
- [ ] Fill form and submit - appears in list
- [ ] Click Edit - form pre-populates data
- [ ] Update fields and save - reflects in list
- [ ] Click Delete - shows confirmation
- [ ] Confirm delete - assignment removed
- [ ] Assignments persist after page refresh

### Security Tests
- [ ] Staff A tries to edit Staff B's assignment (should fail)
- [ ] Staff tries to post to another staff's course (should fail)
- [ ] Student login - cannot access assignments page
- [ ] Admin can post to any course
- [ ] Admin can grade any assignment

### UI Tests
- [ ] Empty state shows "No assignments yet"
- [ ] Assignment cards display all data
- [ ] Form validation prevents empty submission
- [ ] Toast notifications appear (success/error)
- [ ] Modal closes after successful submit

---

## Troubleshooting

### Assignment doesn't appear after posting
**Check:**
1. Refresh the page (browser cache)
2. Check browser console for errors
3. Verify course is selected correctly
4. Check network tab - POST request succeeded (201)?

### Course dropdown is empty
**Check:**
1. Are you logged in as staff?
2. Have you created any courses? (Go to "Courses" page)
3. Did admin approve your courses?
4. Check browser console for 401/403 errors

### Can't edit assignment
**Check:**
1. Are you the creator (owner) of this assignment?
2. Is the form complete (all required fields)?
3. Check network tab - PATCH request succeeded (200)?

### Error: "You can only post assignments to your own courses"
**Reason:** Backend validation prevented posting to another staff's course
**Fix:** Select your own course from dropdown

---

## Related Files

| File | Purpose |
|------|---------|
| `frontend/src/pages/staff/StaffAssignmentsPage.js` | Assignment UI (create/edit/delete) |
| `frontend/src/store/authStore.js` | User authentication context |
| `backend/routes/assignment.routes.js` | API endpoints and validation |
| `backend/models/Assignment.js` | MongoDB schema |
| `backend/middleware/auth.middleware.js` | JWT authentication |

---

## Summary

✅ **Staff access control**: Only manage own courses
✅ **Frontend filtering**: Dropdown shows only user's courses
✅ **Backend validation**: API enforces ownership checks
✅ **Error handling**: Clear messages guide users
✅ **Security**: Multiple layers prevent unauthorized access
✅ **Admin override**: Admins can manage all assignments

**Your assignment system is now secure and functional!** 🎓
