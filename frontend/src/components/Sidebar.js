import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBook,
  FaUsers,
  FaChartBar,
  FaCertificate,
  FaCog,
  FaSignOutAlt,
  FaClipboardCheck,
  FaVideo,
  FaUserGraduate,
  FaUser,
} from 'react-icons/fa';
import useAuthStore from '../store/authStore';

const adminNav = [
  { icon: <FaTachometerAlt />, label: 'Dashboard', path: '/admin' },
  { icon: <FaBook />, label: 'Courses', path: '/admin/courses' },
  { icon: <FaUsers />, label: 'Users', path: '/admin/users' },
  {
    icon: <FaCertificate />,
    label: 'Certificates',
    path: '/admin/certificates',
  },
  { icon: <FaChartBar />, label: 'Analytics', path: '/admin/analytics' },
  {
    icon: <FaClipboardCheck />,
    label: 'Attendance',
    path: '/admin/attendance',
  },
];

const staffNav = [
  { icon: <FaTachometerAlt />, label: 'Dashboard', path: '/staff' },
  { icon: <FaVideo />, label: 'My Courses', path: '/staff/courses' },
  { icon: <FaVideo />, label: 'Manage Videos', path: '/staff/videos' },
  {
    icon: <FaClipboardCheck />,
    label: 'Attendance',
    path: '/staff/attendance',
  },
  {
    icon: <FaClipboardCheck />,
    label: 'Assignments',
    path: '/staff/assignments',
  },
  { icon: <FaUserGraduate />, label: 'Students', path: '/staff/students' },
];

const studentNav = [
  { icon: <FaTachometerAlt />, label: 'Dashboard', path: '/student' },
  { icon: <FaBook />, label: 'Courses', path: '/student/courses' },
  { icon: <FaChartBar />, label: 'Attendance', path: '/student/attendance' },
  {
    icon: <FaCertificate />,
    label: 'Certificates',
    path: '/student/certificates',
  },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems =
    user?.role === 'admin'
      ? adminNav
      : user?.role === 'staff'
        ? staffNav
        : studentNav;

  return (
    <nav className="sidebar">
      <div className="logo">⬡ EduSphere</div>
      <div className="nav-section-label">Menu</div>
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          {item.icon} {item.label}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <div className="nav-section-label">Account</div>
      <button
        className="nav-item"
        onClick={() => navigate(`/${user?.role}/profile`)}
        style={{ justifyContent: 'flex-start' }}
      >
        <FaUser /> My Profile
      </button>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 14,
            color: '#0a0f1e',
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'capitalize',
            }}
          >
            {user?.role}
          </div>
        </div>
      </div>
      <button
        className="nav-item"
        onClick={() => {
          logout();
          navigate('/login');
        }}
        style={{ color: 'var(--accent-rose)' }}
      >
        <FaSignOutAlt /> Logout
      </button>
    </nav>
  );
}
