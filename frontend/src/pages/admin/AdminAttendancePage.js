import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminAttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    courseId: ''
  });
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    present: 0,
    absent: 0,
    partial: 0
  });

  useEffect(() => {
    fetchReports();
    fetchCourses();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.status) params.append('status', filters.status);
      if (filters.courseId) params.append('courseId', filters.courseId);

      const res = await axios.get(`/api/attendance/admin/report?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRecords(res.data.records);

      // Calculate stats
      const stats = {
        totalRecords: res.data.records.length,
        present: res.data.records.filter(r => r.status === 'present').length,
        absent: res.data.records.filter(r => r.status === 'absent').length,
        partial: res.data.records.filter(r => r.status === 'partial').length
      };
      setStats(stats);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data.courses);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportToCSV = () => {
    if (records.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Date', 'Student', 'Email', 'Course', 'Status', 'Notes'];
    const csv = [
      headers.join(','),
      ...records.map(r =>
        [
          r.date,
          r.studentId?.name || 'N/A',
          r.studentId?.email || 'N/A',
          r.courseId?.title || 'N/A',
          r.status,
          r.notes || ''
        ].map(field => `"${field}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return { bg: '#dcfce7', text: '#166534' };
      case 'absent': return { bg: '#fee2e2', text: '#991b1b' };
      case 'partial': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Attendance Reports</h1>
          <p className="page-subtitle">View and manage all attendance records</p>
        </div>
        <button
          onClick={exportToCSV}
          style={{
            padding: '8px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          📥 Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="icon">📋</div>
          <div className="value" style={{ color: '#4f46e5' }}>{stats.totalRecords}</div>
          <div className="label">Total Records</div>
        </div>
        <div className="stat-card">
          <div className="icon">✅</div>
          <div className="value" style={{ color: '#10b981' }}>{stats.present}</div>
          <div className="label">Present</div>
        </div>
        <div className="stat-card">
          <div className="icon">⚠️</div>
          <div className="value" style={{ color: '#f59e0b' }}>{stats.partial}</div>
          <div className="label">Partial</div>
        </div>
        <div className="stat-card">
          <div className="icon">❌</div>
          <div className="value" style={{ color: '#ef4444' }}>{stats.absent}</div>
          <div className="label">Absent</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px' }}>Filters</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              By Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              By Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="partial">Partial</option>
              <option value="absent">Absent</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              By Course
            </label>
            <select
              value={filters.courseId}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
              &nbsp;
            </label>
            <button
              onClick={() => setFilters({ date: '', status: '', courseId: '' })}
              style={{
                width: '100%',
                padding: '8px 12px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>⏳ Loading records...</div>
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            📭 No attendance records found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Student</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Course</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => {
                  const colors = getStatusColor(record.status);
                  return (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px' }}>{record.date}</td>
                      <td style={{ padding: '12px' }}>{record.studentId?.name || 'N/A'}</td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280' }}>
                        {record.studentId?.email || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>
                        {record.courseId?.title || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: colors.bg,
                            color: colors.text,
                            fontWeight: '600',
                            fontSize: '12px'
                          }}
                        >
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#6b7280', fontSize: '12px' }}>
                        {record.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
