import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import StudentProfilePage from './StudentProfilePage';
import StudentCoursesPage from './StudentCoursesPage';
import StudentCoursePage from './StudentCoursePage';
import StudentAttendancePage from './StudentAttendancePage';
import StudentLiveClassPage from './StudentLiveClassPage';
import StudentCertificatesPage from './StudentCertificatesPage';
import API_BASE_URL from '../../api';

function StudentHome() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Fetch actual enrollment data
    const fetchStudentData = async () => {
      try {
        const enrollmentRes = await axios.get(`${API_BASE_URL}/enrollments/my`);
        const enrollments = enrollmentRes.data.enrollments || [];

        setData({
          enrollments: enrollments,
          certificates: enrollments.filter(
            (e) => e.completed && e.completionDate
          ).length,
        });
      } catch (error) {
        toast.error('Failed to load student data');
      }
    };

    fetchStudentData();
  }, []);

  const enrolled = data?.enrollments || [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Continue your learning journey</p>
        </div>
        <span className="badge badge-cyan">{user?.college || 'Student'}</span>
      </div>

      <div className="stats-grid">
        {[
          {
            label: 'Enrolled Courses',
            value: enrolled.length,
            icon: '📚',
            color: 'var(--accent-cyan)',
          },
          {
            label: 'Certificates',
            value: data?.certificates ?? 0,
            icon: '🏆',
            color: 'var(--accent-amber)',
          },
          {
            label: 'Avg Attendance',
            value: enrolled.length
              ? `${(enrolled.reduce((a, e) => a + e.attendancePercentage, 0) / enrolled.length).toFixed(0)}%`
              : '0%',
            icon: '📅',
            color: 'var(--accent-emerald)',
          },
          {
            label: 'Completed',
            value: enrolled.filter((e) => e.completed).length,
            icon: '✅',
            color: 'var(--accent-violet)',
          },
        ].map((c, i) => (
          <div
            className="stat-card fade-up"
            key={i}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div
              className="icon"
              style={{ background: `${c.color}20`, fontSize: 20 }}
            >
              {c.icon}
            </div>
            <div className="value" style={{ color: c.color }}>
              {c.value}
            </div>
            <div className="label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 20 }}>
          Continue Course
        </h3>
        {enrolled.length === 0 ? (
          <p
            style={{
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: '40px 0',
            }}
          >
            No courses yet. Browse and enroll!
          </p>
        ) : (
          <div className="course-grid">
            {enrolled.map((e, i) => (
              <div
                key={i}
                className="course-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/student/course/${e.courseId._id}`)}
              >
                <div
                  className="course-thumb"
                  style={{
                    background: `linear-gradient(135deg, hsl(${i * 60},70%,30%), hsl(${i * 60 + 120},70%,25%))`,
                  }}
                >
                  📚
                </div>
                <div className="course-body">
                  <div className="course-title">{e.courseId.title}</div>
                  <div className="course-meta">
                    <span>🎥 {e.courseId.videos?.length || 0} videos</span>
                    <span>
                      📊 {(e.attendancePercentage || 0).toFixed(0)}% att.
                    </span>
                  </div>
                  <div className="progress-wrap">
                    <div
                      className="progress-bar"
                      style={{ width: `${e.progress || 0}%` }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginTop: 6,
                    }}
                  >
                    {e.progress || 0}% complete
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<StudentHome />} />
          <Route path="courses" element={<StudentCoursesPage />} />
          <Route path="course/:courseId" element={<StudentCoursePage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="certificates" element={<StudentCertificatesPage />} />
          <Route
            path="live-class/:classId"
            element={<StudentLiveClassPage />}
          />
          <Route path="profile" element={<StudentProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}
