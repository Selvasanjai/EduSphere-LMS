# 🎓 EduSphere LMS

> A comprehensive Learning Management System with automatic certificate generation, video management, and multi-role support.

---

## 🚀 Features

### ✅ Core Features
- **🎓 Multi-Role System**: Admin, Staff, and Student roles with distinct permissions
- **📹 Video Management**: Upload, organize, and stream course videos
- **🏆 Certificate Generation**: Automatic certificates with PNG, JPG, PDF download
- **📊 Course Management**: Create, approve, and manage courses
- **📝 Assignments & Quizzes**: Interactive assessments with grading
- **📈 Analytics Dashboard**: Comprehensive tracking for all users
- **🔐 Secure Authentication**: JWT-based auth with role-based access
- **📱 Responsive Design**: Works seamlessly on all devices

### ✅ Advanced Features
- **🎯 Attendance Tracking**: Automated attendance with daily requirements
- **� Email Notifications**: System alerts and updates
- **🔄 Real-time Updates**: Live progress tracking
- **📑 Certificate Verification**: Public certificate validation
- **🎨 Professional UI**: Modern, intuitive interface
- **� Production Ready**: Docker deployment with Nginx

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + React Router + Zustand |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| File Upload | Multer + Canvas.js |
| Certificate Generation | Canvas.js + jsPDF |
| Deployment | Docker + Nginx |
| Security | Helmet.js + CORS + Rate Limiting |

---

## 📁 Project Structure

```
EduSphere/
├── backend/
│   ├── controllers/      # Business logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── middleware/        # Auth, error handling
│   ├── services/         # Certificate generation
│   └── server.js         # App entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── pages/        # Admin / Staff / Student dashboards
│       ├── components/   # Reusable UI
│       ├── store/        # Zustand state (auth)
│       └── styles/       # Global CSS design system
├── production/           # Production build output
├── Dockerfile            # Docker configuration
├── docker-compose.yml   # Full stack deployment
├── nginx.conf           # Nginx reverse proxy
├── deploy.sh/.bat       # Deployment scripts
└── build.js             # Production build tool
```

---

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended)
```bash
# Clone and deploy with Docker
git clone https://github.com/Selvasanjai/EduSphere-LMS
cd EduSphere-LMS
docker-compose up -d

# Access: http://localhost (frontend) + http://localhost/api (backend)
```

### Option 2: Local Development
```bash
# Clone and install
git clone https://github.com/Selvasanjai/EduSphere-LMS
cd EduSphere-LMS

# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install

# Configure environment
cd backend
cp .env.example .env
# Fill in your MongoDB URI, JWT secret, etc.

# Start services
# Terminal 1 - Backend
cd backend
npm run dev       # runs on http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm start         # runs on http://localhost:3000
```

### Option 3: Production Build
```bash
# Build for production
node build.js

# Deploy to server
# Copy ./production to your server and follow deployment guide
```

---

## 🔐 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/forgot-password | Send reset link |
| PATCH | /api/auth/reset-password/:token | Reset password |

### Courses
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/courses | Public |
| GET | /api/courses/:id | Public |
| POST | /api/courses | Admin, Staff |
| PATCH | /api/courses/:id | Admin, Staff |
| DELETE | /api/courses/:id | Admin |
| PATCH | /api/courses/:id/approve | Admin |

### Certificates
| Method | Route | Access |
|--------|-------|--------|
| POST | /api/certificates/check | Student |
| POST | /api/certificates/generate | Student |
| GET | /api/certificates/my | Student |
| GET | /api/certificates/verify/:id | Public |
| GET | /api/certificates | Admin |

### Analytics
| Method | Route | Access |
|--------|-------|--------|
| GET | /api/analytics/admin | Admin |
| GET | /api/analytics/student | Student |

---

## 🏆 Certificate Eligibility Logic

```
IF attendance >= 80%
AND all videos watched
AND all assignments graded
THEN → generate certificate
```

Each certificate gets a unique ID like `EDU-A3F2B1C4` that can be publicly verified at:
```
GET /api/certificates/verify/EDU-A3F2B1C4
```

---

## 📊 Attendance System

- Student logs in daily
- Must watch **≥ 2 videos** per day
- Must complete the **daily quiz**
- Only then → `status: present`
- Attendance % recalculates automatically per course

---

## 👥 Roles

| Role | Can Do |
|------|--------|
| **Admin** | Create courses, manage users, approve staff, view analytics, generate certificates |
| **Staff** | Upload videos, create quizzes/assignments, schedule live classes, grade students |
| **Student** | Enroll in courses, watch videos, submit assignments, track attendance, earn certificates |

---

## 🔒 Security Features

- ✅ Password hashing (bcryptjs, salt 12)
- ✅ JWT authentication with expiry
- ✅ Role-based access control
- ✅ Rate limiting (100 req/15 min)
- ✅ Helmet.js HTTP headers
- ✅ CORS protection
- ✅ Email verification flow
- ✅ Password reset with token expiry

---

## 🤖 AI Features (Planned)

- AI course recommendation engine
- Skill gap analysis
- AI chatbot tutor
- Smart certificate QR verification

---

## 📱 Mobile (Flutter)

The Flutter app in `/mobile` mirrors the web dashboards for Android/iOS.
Connect it to the same backend by updating the `API_BASE_URL` in `lib/constants.dart`.

---

## 🌐 Deployment

| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Database |
| Railway / Render | Backend API |
| Vercel / Netlify | Frontend |
| Firebase Storage | Video/file uploads |
| Google Meet API | Live classes |

---

*Built with ⬡ EduSphere — Next-Gen Learning Platform*
