# EduSphere — System Architecture

## Component Flow

```
Android/Web App
        │
        │ HTTPS API Requests (JWT Bearer Token)
        ▼
Express.js Backend (Node.js)
        │
        ├── Auth Middleware (JWT verify + RBAC)
        ├── Rate Limiter (express-rate-limit)
        ├── Helmet (Security headers)
        │
        ▼
Business Logic Controllers
        │
        ▼
Mongoose ODM
        │
        ▼
MongoDB Atlas
        │
        ├── users
        ├── courses
        ├── enrollments
        ├── attendance
        ├── assignments
        └── certificates
```

## Certificate Eligibility Decision Tree

```
Student requests certificate
        │
        ▼
Is student enrolled? ──No──→ REJECT
        │ Yes
        ▼
attendance >= 80%? ──No──→ REJECT (show current %)
        │ Yes
        ▼
All videos watched? ──No──→ REJECT (show remaining)
        │ Yes
        ▼
All assignments graded? ──No──→ REJECT
        │ Yes
        ▼
Generate Certificate (unique ID)
Save to DB + Update enrollment.completed = true
```

## Attendance State Machine

```
Daily Login
    │
    ▼
videosWatchedToday >= 2 AND quizCompleted?
    ├── YES → status: "present"
    ├── videosWatchedToday >= 1 → status: "partial"
    └── NO → status: "absent"
    │
    ▼
Recalculate enrollment.attendancePercentage
= (present days / total days) * 100
```
