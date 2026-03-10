# 🚀 EduSphere - Getting Started Guide

Welcome to EduSphere! This guide will get you up and running in minutes.

---

## ✅ Application Status

**Frontend:** ✅ Running on `http://localhost:3000`  
**Backend:** ✅ Running on `http://localhost:5000`  
**Database:** ✅ Connected to MongoDB  

You're all set to start testing!

---

## 1️⃣ Create Your First Account

### Option A: Register New Account (Recommended)

1. **Go to Registration Page:**
   - Open: `http://localhost:3000/register`

2. **Fill in the Form:**
   - **Full Name:** Your Name
   - **Email:** your.email@example.com
   - **Password:** At least 8 characters
   - **Role:** Choose "Student" or "Staff"
   - **College:** (Optional) Your college name
   - **Department:** (Optional) Your department

3. **Click "Create Account"**

4. **You're Logged In! 🎉**
   - You'll be redirected to your dashboard
   - Student → Student Dashboard
   - Staff → Staff Dashboard

### Option B: Use OAuth (Google/GitHub)

See section below for setup instructions.

---

## 2️⃣ Explore the Dashboard

### Student Dashboard (`/student`)
- **My Courses:** Enroll in available courses
- **Attendance:** Track your attendance
- **Assignments:** View and submit assignments
- **Certificates:** Download earned certificates

### Staff Dashboard (`/staff`)
- **My Courses:** Manage your courses
- **Mark Attendance:** Take attendance for your classes
- **Upload Videos:** Add course content
- **Create Quizzes:** Make assessments
- **Post Assignments:** Create assignments for students
- **Schedule Classes:** Organize live sessions

### Admin Dashboard (`/admin`)
- **Courses:** Manage all courses on the platform
- **Users:** Manage students, staff, and admins
- **Certificates:** Verify and manage certificates
- **Analytics:** View platform statistics
- **Attendance:** Monitor attendance across courses

---

## 3️⃣ Set Up Google/GitHub Login (Optional)

You can use either Google, GitHub, or email/password to sign in.

### Quick Setup (5-10 minutes)

**For Google:**
1. Open: `docs/QUICK_OAUTH_SETUP.md`
2. Follow: **"Option 2: Quick Google OAuth"**
3. Add credentials to `frontend/.env.local`
4. Restart frontend: `npm start`

**For GitHub:**
1. Open: `docs/QUICK_OAUTH_SETUP.md`
2. Follow: **"Option 3: Quick GitHub OAuth"**
3. Add credentials to `frontend/.env.local`
4. Restart frontend: `npm start`

### Full Setup Guide
See: `docs/OAUTH_SETUP.md`

---

## 4️⃣ Test Features

### As a Student:

1. **Enroll in a Course**
   - Go to **Courses**
   - Find any course
   - Click **"Enroll Now"**

2. **Track Attendance**
   - Go to **Attendance**
   - View your attendance records
   - See passing percentage

3. **View Certificate**
   - Go to **Certificates**
   - See earned/available certificates

### As Staff:

1. **Create a Course**
   - Go to **Courses**
   - Click **"New Course"**
   - Fill details and publish

2. **Mark Attendance**
   - Go to **Attendance**
   - Select course and date
   - Mark students present/absent/partial

3. **Upload Content**
   - Go to **My Courses**
   - Select a course
   - Add videos, quizzes, assignments

### As Admin:

1. **View Platform Stats**
   - Dashboard shows total users, courses, etc.

2. **Manage Users**
   - Go to **Users**
   - Approve staff accounts
   - View student progress

3. **Attendance Reports**
   - Go to **Attendance**
   - Filter by date/status/course
   - Export reports as CSV

---

## 🎯 Key Features Ready to Use

### ✅ Student Features
- [x] Register/Login
- [x] Enroll in courses
- [x] View attendance tracking
- [x] View personal dashboard
- [x] Access certificates

### ✅ Staff Features
- [x] Create and manage courses
- [x] Mark student attendance
- [x] Upload course videos
- [x] Access class roster
- [x] View student progress

### ✅ Admin Features
- [x] Manage all courses
- [x] Manage all users
- [x] View system attendance records
- [x] Export attendance reports (CSV)
- [x] View platform analytics

---

## 📱 Pages Available

| Page | URL | Role | Status |
|------|-----|------|--------|
| Login | `/login` | All | ✅ |
| Register | `/register` | All | ✅ |
| Student Dashboard | `/student` | Student | ✅ |
| Staff Dashboard | `/staff` | Staff | ✅ |
| Admin Dashboard | `/admin` | Admin | ✅ |
| Attendance | `/student/attendance` | Student | ✅ |
| Mark Attendance | `/staff/attendance` | Staff | ✅ |
| Attendance Reports | `/admin/attendance` | Admin | ✅ |
| My Courses | `/student/courses` | Student | ✅ |
| Manage Courses | `/staff/courses` | Staff | ✅ |
| Course Management | `/admin/courses` | Admin | ✅ |

---

## 🔒 User Roles & Permissions

### Student
- Can view and enroll in courses
- Can track personal attendance
- Can view certificates
- Cannot see other students' data
- Cannot mark attendance

### Staff
- Can create and manage their own courses
- Can mark attendance for enrolled students
- Can upload videos and create content
- Cannot access admin features
- Cannot manage other staff's courses

### Admin
- Can manage all courses (create, edit, delete)
- Can manage all users (approve, manage, delete)
- Can view system-wide attendance reports
- Can export reports
- Full platform access

---

## 🐛 Troubleshooting

### Login Issues
- See: `docs/TROUBLESHOOTING.md` → "OAuth & Login Troubleshooting"
- Or use email/password login (skip OAuth)

### Feature Not Working
- Make sure you're the right user role
- Refresh the page: `Ctrl+R`
- Clear browser cache: `Ctrl+Shift+Delete`

### Backend Issues
- Check backend is running: `npm run dev` in `backend/` folder
- Check MongoDB connection in console output

### Frontend Issues
- Check frontend is running: `npm start` in `frontend/` folder
- Check DevTools console for errors: `F12`

---

## 📧 Support Docs

Click the links to jump to detailed setup guides:

- **Quick OAuth Setup:** `docs/QUICK_OAUTH_SETUP.md`
- **Full OAuth Setup:** `docs/OAUTH_SETUP.md`
- **Troubleshooting:** `docs/TROUBLESHOOTING.md`
- **OAuth Implementation:** `docs/OAUTH_IMPLEMENTATION.md`
- **Architecture:** `docs/architecture.md`

---

## 🎓 Example Workflow

### Complete Student Journey:

```
1. Register Account → http://localhost:3000/register
2. View Dashboard → http://localhost:3000/student
3. Enroll in Course → Student Dashboard → Courses → Enroll
4. Check Attendance → Student Dashboard → Attendance
5. View Certificate → Student Dashboard → Certificates
```

### Complete Staff Journey:

```
1. Register with Staff Role → http://localhost:3000/register
2. View Dashboard → http://localhost:3000/staff
3. Create Course → Staff Dashboard → Courses → New Course
4. Upload Video → Staff Dashboard → My Courses → Select Course
5. Mark Attendance → Staff Dashboard → Attendance → Select Course
```

### Complete Admin Journey:

```
1. Register with Admin Role (first user) → http://localhost:3000/register
2. View Dashboard → http://localhost:3000/admin
3. Manage Courses → Admin Dashboard → Courses
4. Manage Users → Admin Dashboard → Users
5. View Reports → Admin Dashboard → Attendance
```

---

## 🚀 Next Steps

**Option 1: Quick Start (Now)** ⚡
- Register a test account
- Explore the student/staff/admin dashboards
- Test out features

**Option 2: Set Up OAuth** (5-10 minutes)
- Follow `docs/QUICK_OAUTH_SETUP.md`
- Add Google or GitHub login
- Enjoy social authentication

**Option 3: Detailed Exploration**
- Read `docs/architecture.md` for system design
- Review `docs/OAUTH_SETUP.md` for complete setup
- Explore all features

---

## 💡 Pro Tips

1. **Use Different Accounts**
   - Create a student account: `student@test.com`
   - Create a staff account: `staff@test.com`
   - Test the app with multiple perspectives

2. **Test Attendance**
   - Staff can mark attendance in `/staff/attendance`
   - Students can see it in `/student/attendance`
   - Admin can view all in `/admin/attendance`

3. **Test Courses**
   - Staff can create courses
   - Students can enroll
   - Both can track progress

4. **Check Console**
   - Press `F12` to open DevTools
   - Check Console tab for errors
   - Check Network tab for API calls

---

## ✨ You're Ready!

The platform is fully functional. Start exploring:

**👉 Go to:** `http://localhost:3000`

Happy learning! 🎉
