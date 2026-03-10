import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentAttendancePage() {
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetail, setCourseDetail] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const res = await axios.get('/api/attendance/student/summary', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAttendanceSummary(res.data.summary);
        if (res.data.summary.length > 0) {
          setSelectedCourse(res.data.summary[0].courseId);
          fetchCourseDetail(res.data.summary[0].courseId);
        }
      } catch (err) {
        console.error('Error fetching attendance summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceSummary();
  }, []);

  const fetchCourseDetail = async (courseId) => {
    try {
      const res = await axios.get(`/api/attendance/student/course/${courseId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCourseDetail(res.data.records);
    } catch (err) {
      console.error('Error fetching course detail:', err);
    }
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    fetchCourseDetail(courseId);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'present': return { bg: '#dcfce7', text: '#166534' };
      case 'absent': return { bg: '#fee2e2', text: '#991b1b' };
      case 'partial': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px' }}>⏳ Loading attendance...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 My Attendance</h1>
          <p className="page-subtitle">Track your attendance across all courses</p>
        </div>
      </div>

      {attendanceSummary.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>
            📭 No courses enrolled yet
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Summary Cards */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px', fontSize: '18px' }}>
                Course Overview
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
              {attendanceSummary.map(course => (
                <div
                  key={course.courseId}
                  onClick={() => handleCourseSelect(course.courseId)}
                  style={{
                    padding: '16px',
                    border: selectedCourse === course.courseId ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: selectedCourse === course.courseId ? '#f3f4f6' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                      {course.courseName}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {course.total} classes
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                        {course.present}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Present</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
                        {course.partial}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Partial</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>
                        {course.absent}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>Absent</div>
                    </div>
                  </div>

                  <div style={{
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    height: '8px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}>
                    <div
                      style={{
                        height: '100%',
                        background: getPercentageColor(course.percentage),
                        width: `${course.percentage}%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: getPercentageColor(course.percentage) }}>
                      {course.percentage}%
                    </div>
                    <div style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: course.percentage >= 75 ? '#dcfce7' : course.percentage >= 60 ? '#fef3c7' : '#fee2e2',
                      color: course.percentage >= 75 ? '#166534' : course.percentage >= 60 ? '#92400e' : '#991b1b'
                    }}>
                      {course.percentage >= 75 ? '✅ Good' : course.percentage >= 60 ? '⚠️ Warning' : '❌ Critical'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Records */}
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px', fontSize: '18px' }}>
                Detailed Records
              </h3>
            </div>
            <div className="card" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {courseDetail.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                  📭 No attendance records
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {courseDetail.map((record, index) => {
                    const colors = getStatusBadgeColor(record.status);
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '500' }}>{record.date}</div>
                          {record.notes && (
                            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                              📝 {record.notes}
                            </div>
                          )}
                        </div>
                        <div
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: colors.bg,
                            color: colors.text,
                            fontSize: '12px',
                            fontWeight: '600',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
