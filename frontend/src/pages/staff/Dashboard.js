import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardList, TrendingUp } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import API from '../../api';

export default function StaffDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/courses').then(({ data }) => {
      const myCourses = data.courses.filter(c => c.instructor?._id === user?._id || c.instructor === user?._id);
      setCourses(myCourses);
      setLoading(false);
    });
  }, [user]);

  const totalStudents = courses.reduce((a, c) => a + (c.enrolledStudents?.length || 0), 0);

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Staff Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
            Manage your courses and students
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/staff/courses')}>
          + New Course
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: <BookOpen size={20} />, color: 'cyan', value: courses.length, label: 'My Courses' },
          { icon: <Users size={20} />, color: 'violet', value: totalStudents, label: 'Total Students' },
          { icon: <BookOpen size={20} />, color: 'emerald', value: courses.filter(c => c.status === 'published').length, label: 'Published' },
          { icon: <TrendingUp size={20} />, color: 'amber', value: courses.filter(c => c.status === 'draft').length, label: 'Drafts' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            className="stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>Your Courses</h3>
        </div>

        {loading ? <div className="spinner" /> : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No courses yet. Create your first course!</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Students</th>
                  <th>Lessons</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{course.category}</div>
                    </td>
                    <td>
                      <span className={`badge ${course.status === 'published' ? 'badge-emerald' : course.status === 'draft' ? 'badge-amber' : 'badge-rose'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td>{course.enrolledStudents?.length || 0}</td>
                    <td>{course.lessons?.length || 0}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/staff/courses/${course._id}`)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
