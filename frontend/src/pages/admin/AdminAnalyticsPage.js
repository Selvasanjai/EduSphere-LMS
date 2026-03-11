import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../api';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/analytics/admin`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        Loading analytics...
      </div>
    );
  }

  const stats = analytics?.stats || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Platform statistics and insights</p>
        </div>
        <button onClick={fetchAnalytics} className="btn btn-secondary">
          🔄 Refresh
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: 'Total Students',
            value: stats.totalStudents ?? '—',
            icon: '🎓',
            color: '#00d4ff',
          },
          {
            label: 'Total Courses',
            value: stats.totalCourses ?? '—',
            icon: '📚',
            color: '#7c3aed',
          },
          {
            label: 'Staff Members',
            value: stats.totalStaff ?? '—',
            icon: '👨‍🏫',
            color: '#f43f5e',
          },
          {
            label: 'Certificates Issued',
            value: stats.totalCertificates ?? '—',
            icon: '🏆',
            color: '#f59e0b',
          },
          {
            label: 'Active Today',
            value: stats.activeToday ?? '—',
            icon: '⚡',
            color: '#10b981',
          },
          {
            label: 'Avg Attendance',
            value: stats.avgAttendance ? `${stats.avgAttendance}%` : '—',
            icon: '📊',
            color: '#a78bfa',
          },
        ].map((c, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: c.color,
                marginBottom: 4,
              }}
            >
              {c.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            gap: 10,
            borderBottom: '1px solid var(--border)',
            marginBottom: 20,
          }}
        >
          {['overview', 'enrollments', 'courses'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 16px',
                background:
                  activeTab === tab ? 'var(--accent-violet)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                textTransform: 'capitalize',
                borderRadius: '6px 6px 0 0',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div>
              <h3
                style={{ marginBottom: 12, fontFamily: 'var(--font-display)' }}
              >
                Key Metrics
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    padding: 16,
                    background: 'var(--bg-secondary)',
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      marginBottom: 8,
                    }}
                  >
                    Student Enrollment Rate
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: 'var(--accent-cyan)',
                    }}
                  >
                    {stats.totalCourses > 0
                      ? Math.round(
                          (stats.totalStudents / stats.totalCourses) * 100
                        ) / 100
                      : 0}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    students per course (avg)
                  </div>
                </div>
                <div
                  style={{
                    padding: 16,
                    background: 'var(--bg-secondary)',
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      marginBottom: 8,
                    }}
                  >
                    Certificate Completion Rate
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: 'var(--accent-amber)',
                    }}
                  >
                    {stats.totalStudents > 0
                      ? Math.round(
                          (stats.totalCertificates / stats.totalStudents) * 100
                        )
                      : 0}
                    %
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    of students have certificates
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'enrollments' && (
          <div>
            <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)' }}>
              Recent Enrollments
            </h3>
            {analytics?.recentEnrollments &&
            analytics.recentEnrollments.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th
                        style={{
                          padding: 12,
                          textAlign: 'left',
                          fontWeight: 600,
                        }}
                      >
                        Student
                      </th>
                      <th
                        style={{
                          padding: 12,
                          textAlign: 'left',
                          fontWeight: 600,
                        }}
                      >
                        Course
                      </th>
                      <th
                        style={{
                          padding: 12,
                          textAlign: 'left',
                          fontWeight: 600,
                        }}
                      >
                        Enrolled Date
                      </th>
                      <th
                        style={{
                          padding: 12,
                          textAlign: 'left',
                          fontWeight: 600,
                        }}
                      >
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentEnrollments.map((enrollment, i) => (
                      <tr
                        key={i}
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <td style={{ padding: 12 }}>
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              {enrollment.studentId?.name}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {enrollment.studentId?.email}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: 12 }}>
                          {enrollment.courseId?.title}
                        </td>
                        <td
                          style={{
                            padding: 12,
                            fontSize: 14,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: 12 }}>
                          <div
                            style={{
                              width: 100,
                              height: 6,
                              background: 'var(--bg-secondary)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                background: 'var(--accent-emerald)',
                                width: `${enrollment.progressPercentage || 0}%`,
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              marginTop: 4,
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {enrollment.progressPercentage || 0}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: 'var(--text-secondary)',
                }}
              >
                No recent enrollments
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)' }}>
              Top Courses by Enrollments
            </h3>
            {analytics?.topCourses && analytics.topCourses.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {analytics.topCourses.map((course, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 16,
                      background: 'var(--bg-secondary)',
                      borderRadius: 10,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>
                        {i + 1}. {course.title}
                      </div>
                      <div
                        style={{ fontSize: 13, color: 'var(--text-secondary)' }}
                      >
                        {course.enrollments} students enrolled
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'var(--accent-violet)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 20,
                      }}
                    >
                      {course.enrollments}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: 'var(--text-secondary)',
                }}
              >
                No course data available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
