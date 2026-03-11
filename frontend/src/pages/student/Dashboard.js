import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Award, TrendingUp, Clock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import API from '../../api';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics/student').then(({ data }) => {
      setAnalytics(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const enrollments = analytics?.enrollments || [];
  const certs = analytics?.certificates || [];
  const avgProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((a, e) => a + e.completionPercent, 0) / enrollments.length)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="topbar">
        <div>
          <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
            Continue your learning journey
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: <BookOpen size={20} />, color: 'cyan', value: enrollments.length, label: 'Enrolled Courses' },
          { icon: <TrendingUp size={20} />, color: 'violet', value: `${avgProgress}%`, label: 'Avg. Progress' },
          { icon: <Award size={20} />, color: 'emerald', value: certs.length, label: 'Certificates' },
          { icon: <Clock size={20} />, color: 'amber', value: enrollments.filter(e => !e.isCompleted).length, label: 'In Progress' },
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

      {/* Enrolled Courses */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3>My Courses</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/student/courses')}>Browse More</button>
        </div>

        {enrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <BookOpen size={40} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
            <p>No courses yet. Start exploring!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {enrollments.slice(0, 5).map((enr, i) => (
              <motion.div
                key={enr._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1rem', borderRadius: 'var(--radius)',
                  background: 'rgba(255,255,255,0.03)', cursor: 'pointer',
                  border: '1px solid var(--border)',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => navigate(`/student/courses/${enr.course?._id}`)}
                whileHover={{ scale: 1.01 }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 8, flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--accent-cyan)22, var(--accent-violet)22)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                }}>
                  📚
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 4 }}>
                    {enr.course?.title || 'Unknown Course'}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${enr.completionPercent}%` }} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    {enr.completionPercent}% complete
                  </div>
                </div>
                {enr.isCompleted && (
                  <span className="badge badge-emerald">✓ Done</span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
