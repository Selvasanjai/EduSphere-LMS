import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import useAuthStore from '../../store/authStore';
import StudentProfilePage from '../student/StudentProfilePage';
import StaffCoursesPage from './StaffCoursesPage';
import StaffVideosPage from './StaffVideosPage';
import AddVideoPage from './AddVideoPage';
import StaffAssignmentsPage from './StaffAssignmentsPage';
import StaffQuizzesPage from './StaffQuizzesPage';
import StaffLiveClassPage from './StaffLiveClassPage';
import StaffStudentsPage from './StaffStudentsPage';
import StaffAttendancePage from './StaffAttendancePage';

function StaffHome() {
  const { user } = useAuthStore();
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Dashboard</h1>
          <p className="page-subtitle">Manage your courses and students</p>
        </div>
        <span className="badge badge-violet">Instructor</span>
      </div>
      <div className="stats-grid">
        {[
          { label: 'My Courses', value: 0, icon: '📚', color: 'var(--accent-cyan)' },
          { label: 'Total Students', value: 0, icon: '🎓', color: 'var(--accent-emerald)' },
          { label: 'Pending Grading', value: 0, icon: '📝', color: 'var(--accent-amber)' },
          { label: 'Live Classes', value: 0, icon: '📹', color: 'var(--accent-violet)' },
        ].map((c, i) => (
          <div className="stat-card" key={i}>
            <div className="icon" style={{ fontSize: 20 }}>{c.icon}</div>
            <div className="value" style={{ color: c.color }}>{c.value}</div>
            <div className="label">{c.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Mark Attendance', path: '/staff/attendance', icon: '📋' },
              { label: 'Upload Video', path: '/staff/videos', icon: '📹' },
              { label: 'Create Quiz', path: '/staff/quizzes', icon: '❓' },
              { label: 'Post Assignment', path: '/staff/assignments', icon: '📝' },
              { label: 'Schedule Live Class', path: '/staff/live-class', icon: '🎥' }
            ].map((a, i) => (
              <button key={i} className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => window.location.href = a.path}>
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Live Class Tools</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn" style={{ background: 'rgba(26,115,232,0.15)', color: '#4285f4', border: '1px solid rgba(66,133,244,0.3)', justifyContent: 'flex-start' }}>
              📹 Start Google Meet
            </button>
            <button className="btn" style={{ background: 'rgba(45,140,255,0.1)', color: '#2d8cff', border: '1px solid rgba(45,140,255,0.3)', justifyContent: 'flex-start' }}>
              🎥 Start Zoom Class
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<StaffHome />} />
          <Route path="courses" element={<StaffCoursesPage />} />
          <Route path="videos" element={<StaffVideosPage />} />
          <Route path="videos/:courseId" element={<AddVideoPage />} />
          <Route path="assignments" element={<StaffAssignmentsPage />} />
          <Route path="quizzes" element={<StaffQuizzesPage />} />
          <Route path="live-class" element={<StaffLiveClassPage />} />
          <Route path="students" element={<StaffStudentsPage />} />
          <Route path="attendance" element={<StaffAttendancePage />} />
          <Route path="profile" element={<StudentProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}
