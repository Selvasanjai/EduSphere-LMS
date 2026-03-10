import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [attendancePercentage, setAttendancePercentage] = useState(80);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCertificates();
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await axios.get('/api/certificates');
      setCertificates(res.data.certificates || []);
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses');
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to load courses');
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/users?role=student');
      setStudents(res.data.users || []);
    } catch (err) {
      console.error('Failed to load students');
    }
  };

  const handleGenerateCertificate = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedCourse || attendancePercentage < 0 || attendancePercentage > 100) {
      toast.error('Please fill all fields with valid attendance percentage (0-100)');
      return;
    }

    try {
      setGenerating(true);
      const res = await axios.post('/api/certificates/admin-generate', {
        studentId: selectedStudent,
        courseId: selectedCourse,
        attendancePercentage
      });
      setCertificates([...certificates, res.data.certificate]);
      toast.success('Certificate generated successfully!');
      setSelectedStudent('');
      setSelectedCourse('');
      setAttendancePercentage(80);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (certId) => {
    try {
      const { data } = await axios.patch(`/api/certificates/${certId}/approve`);
      setCertificates(prev => prev.map(c => (c._id === certId ? data.certificate : c)));
      toast.success('Certificate approved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve certificate');
    }
  };

  const filteredCerts = certificates.filter(c => {
    const matchesSearch =
      (c.studentId?.name && c.studentId.name.toLowerCase().includes(search.toLowerCase())) ||
      (c.courseId?.title && c.courseId.title.toLowerCase().includes(search.toLowerCase())) ||
      (c.certificateId && c.certificateId.toLowerCase().includes(search.toLowerCase()));

    const matchesCourse = !filterCourse || c.courseId?._id === filterCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Certificate Management</h1>
          <p className="page-subtitle">Generate and manage student certificates</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)' }}>Generate New Certificate</h3>
        <form onSubmit={handleGenerateCertificate} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select a student</option>
                {students.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select a course</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>
              Attendance Percentage ({attendancePercentage}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={attendancePercentage}
              onChange={(e) => setAttendancePercentage(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={generating}>
            {generating ? '🔄 Generating...' : '🏅 Generate Certificate'}
          </button>
        </form>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12, fontFamily: 'var(--font-display)' }}>All Certificates ({filteredCerts.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 12 }}>
            <input
              type="text"
              placeholder="Search by student name, course, or certificate ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text)',
                fontFamily: 'inherit'
              }}
            />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text)',
                fontFamily: 'inherit',
                cursor: 'pointer'
              }}
            >
              <option value="">All courses</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p>Loading certificates...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Cert ID</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Student</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Course</th>
                  <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Attendance</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.map(cert => (
                  <tr key={cert._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>
                      {cert.certificateId}
                    </td>
                    <td style={{ padding: 12 }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{cert.studentId?.name || '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cert.studentId?.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: 12 }}>{cert.courseId?.title || '—'}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        background: cert.attendancePercentage >= 80 ? 'var(--accent-emerald)' : cert.attendancePercentage >= 70 ? 'var(--accent-amber)' : 'var(--accent-rose)',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600
                      }}>
                        {cert.attendancePercentage}%
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                      {new Date(cert.completionDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${cert.approvalStatus === 'approved' ? 'emerald' : cert.approvalStatus === 'rejected' ? 'red' : 'amber'}`}>
                          {cert.approvalStatus || 'pending'}
                        </span>
                        {cert.approvalStatus !== 'approved' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleApprove(cert._id)}
                            style={{ padding: '6px 10px', fontSize: 12 }}
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredCerts.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            No certificates found
          </div>
        )}
      </div>
    </div>
  );
}
