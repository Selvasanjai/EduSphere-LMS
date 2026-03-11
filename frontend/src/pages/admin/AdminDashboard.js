import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import axios from 'axios';
import StudentProfilePage from '../student/StudentProfilePage';
import AdminCoursesPage from './AdminCoursesPage';
import AdminUsersPage from './AdminUsersPage';
import AdminCertificatesPage from './AdminCertificatesPage';
import AdminAnalyticsPage from './AdminAnalyticsPage';
import AdminAttendancePage from './AdminAttendancePage';
import API_BASE_URL from '../../api';

function AdminHome() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios
        .get(`${API_BASE_URL}/analytics/admin`)
        .then((r) => setStats(r.data.stats))
        .catch(() => {});
    }
  }, []);

  const cards = [
    {
      label: 'Total Students',
      value: stats?.totalStudents ?? '—',
      icon: '🎓',
      color: '#00d4ff',
      bg: '#00d4ff',
    },
    {
      label: 'Total Courses',
      value: stats?.totalCourses ?? '—',
      icon: '📚',
      color: '#7c3aed',
      bg: '#7c3aed',
    },
    {
      label: 'Active Today',
      value: stats?.activeToday ?? '—',
      icon: '⚡',
      color: '#10b981',
      bg: '#10b981',
    },
    {
      label: 'Certificates',
      value: stats?.totalCertificates ?? '—',
      icon: '🏆',
      color: '#f59e0b',
      bg: '#f59e0b',
    },
    {
      label: 'Staff Members',
      value: stats?.totalStaff ?? '—',
      icon: '👨‍🏫',
      color: '#f43f5e',
      bg: '#f43f5e',
    },
    {
      label: 'Avg Attendance',
      value: stats?.avgAttendance ? `${stats.avgAttendance}%` : '—',
      icon: '📊',
      color: '#a78bfa',
      bg: '#7c3aed',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform-wide overview and controls</p>
        </div>
        <span className="badge badge-emerald">● Live</span>
      </div>

      <div className="stats-grid">
        {cards.map((c, i) => (
          <div
            className="stat-card fade-up"
            key={i}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="icon" style={{ background: `${c.bg}20` }}>
              {c.icon}
            </div>
            <div className="value" style={{ color: c.color }}>
              {c.value}
            </div>
            <div className="label">{c.label}</div>
            <div className="glow" style={{ background: c.bg }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              {
                label: 'Create New Course',
                icon: '📗',
                action: () => navigate('/admin/courses'),
              },
              {
                label: 'Approve Staff Accounts',
                icon: '✅',
                action: () => navigate('/admin/users'),
              },
              {
                label: 'Generate Certificates',
                icon: '🏅',
                action: () => navigate('/admin/certificates'),
              },
              {
                label: 'View Attendance Report',
                icon: '📋',
                action: () => navigate('/admin/analytics'),
              },
            ].map((a, i) => (
              <button
                key={i}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
                onClick={a.action}
              >
                {a.icon} {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>
            Certificate Rules
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              {
                rule: 'Attendance ≥ 80%',
                icon: '📅',
                color: 'var(--accent-emerald)',
              },
              {
                rule: 'All Videos Watched',
                icon: '▶️',
                color: 'var(--accent-cyan)',
              },
              {
                rule: 'Assignments Completed',
                icon: '📝',
                color: 'var(--accent-amber)',
              },
              {
                rule: 'Quiz Passed',
                icon: '✅',
                color: 'var(--accent-violet)',
              },
            ].map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <span style={{ fontSize: 14, color: r.color, fontWeight: 600 }}>
                  {r.rule}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="certificates" element={<AdminCertificatesPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="profile" element={<StudentProfilePage />} />
        </Routes>
      </main>
    </div>
  );
}
