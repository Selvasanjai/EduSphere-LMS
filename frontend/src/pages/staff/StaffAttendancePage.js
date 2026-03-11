import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

export default function StaffAttendancePage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch staff courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('/api/courses');
        // Filter courses taught by this staff member
        const staffCourses = res.data.courses.filter(
          (c) => c.staffId && c.staffId._id === user._id
        );
        setCourses(staffCourses);
        if (staffCourses.length > 0) {
          setSelectedCourse(staffCourses[0]._id);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    };
    if (user) fetchCourses();
  }, [user]);

  // Fetch enrolled students when course is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/attendance/course/${selectedCourse}/students`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setStudents(res.data.students);
        // Initialize attendance records
        const initialAttendance = {};
        res.data.students.forEach((student) => {
          initialAttendance[student._id] = { status: 'absent', notes: '' };
        });
        setAttendance(initialAttendance);
      } catch (err) {
        console.error('Error fetching students:', err);
        setMessage('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedCourse]);

  const handleAttendanceChange = (studentId, field, value) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      setMessage('Please select a course');
      return;
    }

    setSaving(true);
    try {
      const attendanceData = Object.entries(attendance).map(
        ([studentId, data]) => ({
          studentId,
          date: selectedDate,
          status: data.status,
          notes: data.notes,
        })
      );

      await axios.post(
        '/api/attendance/mark',
        { courseId: selectedCourse, attendanceData },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setMessage('✅ Attendance marked successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(
        '❌ Failed to save attendance: ' + err.response?.data?.message
      );
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return '#10b981';
      case 'absent':
        return '#ef4444';
      case 'partial':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Attendance Management</h1>
          <p className="page-subtitle">Mark and manage student attendance</p>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: '8px',
            background: message.includes('✅')
              ? 'rgba(16,185,129,0.1)'
              : 'rgba(239,68,68,0.1)',
            color: message.includes('✅') ? '#10b981' : '#ef4444',
            border: `1px solid ${message.includes('✅') ? '#10b981' : '#ef4444'}`,
          }}
        >
          {message}
        </div>
      )}

      <div className="card" style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Select Course
            </label>
            <select
              value={selectedCourse || ''}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            >
              <option value="">-- Select a course --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>
            ⏳ Loading students...
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>
            📭 No students enrolled in this course yet
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                marginBottom: '16px',
              }}
            >
              Mark Attendance for {students.length} Students
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {students.map((student) => (
              <div
                key={student._id}
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  background: '#f9fafb',
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '4px',
                    }}
                  >
                    {student.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {student.email}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    Status
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['present', 'partial', 'absent'].map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          handleAttendanceChange(student._id, 'status', status)
                        }
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          fontSize: '12px',
                          border: `2px solid ${getStatusColor(status)}`,
                          background:
                            attendance[student._id]?.status === status
                              ? getStatusColor(status)
                              : 'white',
                          color:
                            attendance[student._id]?.status === status
                              ? 'white'
                              : getStatusColor(status),
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                        }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    Notes
                  </label>
                  <textarea
                    value={attendance[student._id]?.notes || ''}
                    onChange={(e) =>
                      handleAttendanceChange(
                        student._id,
                        'notes',
                        e.target.value
                      )
                    }
                    placeholder="Add notes (optional)"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      resize: 'none',
                      height: '60px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? '⏳ Saving...' : '✅ Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}
