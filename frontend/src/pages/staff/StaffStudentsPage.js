import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSearch, FaDownload } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import API_BASE_URL from '../../api';

export default function StaffStudentsPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/courses`);
      // Backend already restricts staff to own courses
      const staffCourses = data.courses || [];
      setCourses(staffCourses);
      if (staffCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(staffCourses[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (courseId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/enrollments/course/${courseId}/students`
      );
      setStudents(data.enrollments || []);
    } catch (error) {
      toast.error('Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (enrollment) =>
      enrollment.studentId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.studentId?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.studentId?.department
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const downloadAttendanceReport = () => {
    if (filteredStudents.length === 0) {
      toast.error('No students to export');
      return;
    }

    const csv = [
      [
        'Name',
        'Email',
        'Department',
        'College',
        'Progress',
        'Attendance',
        'Status',
      ],
      ...filteredStudents.map((e) => [
        e.studentId?.name || 'N/A',
        e.studentId?.email || 'N/A',
        e.studentId?.department || 'N/A',
        e.studentId?.college || 'N/A',
        `${e.progress}%`,
        `${e.attendancePercentage}%`,
        e.completed ? 'Completed' : 'In Progress',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${selectedCourse}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report downloaded!');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Students</h1>
          <p className="page-subtitle">
            View and manage students in your courses
          </p>
        </div>
        {filteredStudents.length > 0 && (
          <button
            className="btn btn-secondary"
            onClick={downloadAttendanceReport}
          >
            <FaDownload /> Download Report
          </button>
        )}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 0',
            color: 'var(--text-muted)',
          }}
        >
          Loading...
        </div>
      ) : courses.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: 'center', padding: '60px 40px' }}
        >
          <p
            style={{
              fontSize: 18,
              color: 'var(--text-muted)',
              marginBottom: 20,
            }}
          >
            No courses yet
          </p>
          <p>Create a course first to see enrolled students</p>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <label className="form-label">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-input"
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {students.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: 'center', padding: '40px' }}
            >
              <p style={{ color: 'var(--text-muted)' }}>
                No students enrolled in this course yet
              </p>
            </div>
          ) : (
            <>
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                  <FaSearch
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, email, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    background: 'var(--bg-primary)',
                  }}
                >
                  <thead>
                    <tr
                      style={{ borderBottom: '1px solid var(--border-color)' }}
                    >
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-muted)',
                        }}
                      >
                        NAME
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-muted)',
                        }}
                      >
                        EMAIL
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-muted)',
                        }}
                      >
                        DEPARTMENT
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-muted)',
                        }}
                      >
                        COLLEGE
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-muted)',
                        }}
                      >
                        PROGRESS
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-muted)',
                        }}
                      >
                        ATTENDANCE
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: 13,
                          color: 'var(--text-muted)',
                        }}
                      >
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((enrollment, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            'var(--bg-secondary)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = 'transparent')
                        }
                      >
                        <td style={{ padding: '12px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
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
                                fontSize: 12,
                                color: '#0a0f1e',
                              }}
                            >
                              {enrollment.studentId?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 500 }}>
                                {enrollment.studentId?.name || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            padding: '12px',
                            fontSize: 13,
                            color: 'var(--text-muted)',
                          }}
                        >
                          {enrollment.studentId?.email || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', fontSize: 13 }}>
                          {enrollment.studentId?.department || 'N/A'}
                        </td>
                        <td
                          style={{
                            padding: '12px',
                            fontSize: 13,
                            color: 'var(--text-muted)',
                          }}
                        >
                          {enrollment.studentId?.college || 'N/A'}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-block',
                              background: 'rgba(0, 212, 255, 0.1)',
                              color: 'var(--accent-cyan)',
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {enrollment.progress}%
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-block',
                              background:
                                enrollment.attendancePercentage >= 80
                                  ? 'rgba(16, 185, 129, 0.1)'
                                  : 'rgba(245, 158, 11, 0.1)',
                              color:
                                enrollment.attendancePercentage >= 80
                                  ? 'var(--accent-emerald)'
                                  : 'var(--accent-amber)',
                              padding: '4px 12px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {enrollment.attendancePercentage}%
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              background: enrollment.completed
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(124, 58, 237, 0.1)',
                              color: enrollment.completed
                                ? 'var(--accent-emerald)'
                                : 'var(--accent-violet)',
                              padding: '4x 8px',
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {enrollment.completed
                              ? '✅ Completed'
                              : '⏳ In Progress'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: 'var(--text-muted)',
                  }}
                >
                  No students match your search
                </div>
              )}

              <div className="card" style={{ marginTop: 20 }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    marginBottom: 12,
                  }}
                >
                  Course Statistics
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginBottom: 4,
                      }}
                    >
                      TOTAL STUDENTS
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: 'var(--accent-cyan)',
                      }}
                    >
                      {students.length}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginBottom: 4,
                      }}
                    >
                      COMPLETED
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: 'var(--accent-emerald)',
                      }}
                    >
                      {students.filter((e) => e.completed).length}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginBottom: 4,
                      }}
                    >
                      AVG PROGRESS
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: 'var(--accent-violet)',
                      }}
                    >
                      {students.length > 0
                        ? Math.round(
                            students.reduce((a, e) => a + e.progress, 0) /
                              students.length
                          )
                        : 0}
                      %
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginBottom: 4,
                      }}
                    >
                      AVG ATTENDANCE
                    </div>
                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,
                        color: 'var(--accent-amber)',
                      }}
                    >
                      {students.length > 0
                        ? Math.round(
                            students.reduce(
                              (a, e) => a + e.attendancePercentage,
                              0
                            ) / students.length
                          )
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
