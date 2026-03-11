import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../api';

const CHART_COLORS = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#f43f5e'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/analytics/admin').then(({ data }) => { setData(data); setLoading(false); });
  }, []);

  if (loading) return <div className="spinner" />;

  const { stats, roleBreakdown, coursesByCategory, recentUsers, topCourses } = data;

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Admin Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
            Platform-wide overview
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: <Users size={20} />, color: 'cyan', value: stats.totalUsers, label: 'Total Users' },
          { icon: <BookOpen size={20} />, color: 'violet', value: stats.totalCourses, label: 'Total Courses' },
          { icon: <TrendingUp size={20} />, color: 'emerald', value: stats.totalEnrollments, label: 'Enrollments' },
          { icon: <Award size={20} />, color: 'amber', value: stats.totalCerts, label: 'Certificates' },
        ].map((stat, i) => (
          <motion.div key={i} className="stat-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Role Pie Chart */}
        <div className="card">
          <h4 style={{ marginBottom: '1.25rem' }}>Users by Role</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={roleBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}>
                {roleBreakdown.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Courses by Category Bar Chart */}
        <div className="card">
          <h4 style={{ marginBottom: '1.25rem' }}>Courses by Category</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={coursesByCategory}>
              <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="count" fill="var(--accent-cyan)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Users */}
        <div className="card">
          <h4 style={{ marginBottom: '1rem' }}>Recent Registrations</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {recentUsers?.map(u => (
              <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(124,58,237,0.12)', color: '#a78bfa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                }}>
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-rose' : u.role === 'staff' ? 'badge-violet' : 'badge-cyan'}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Courses */}
        <div className="card">
          <h4 style={{ marginBottom: '1rem' }}>Top Courses</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {topCourses?.map((c, i) => (
              <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By {c.instructor?.name}</div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                  {c.enrolledStudents?.length || 0} stu
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
