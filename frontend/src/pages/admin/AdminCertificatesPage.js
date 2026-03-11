import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEye, FaCheck, FaTimes, FaAward, FaSearch } from 'react-icons/fa';
import CertificateTemplate from '../../components/CertificateTemplate';

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
  const [previewCert, setPreviewCert] = useState(null);

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
        attendancePercentage,
      });
      setCertificates([res.data.certificate, ...certificates]);
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
      setCertificates((prev) => prev.map((c) => (c._id === certId ? data.certificate : c)));
      toast.success('Certificate approved and issued!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve certificate');
    }
  };

  const handleReject = async (certId) => {
    if (!window.confirm('Are you sure you want to reject this certificate request?')) return;
    try {
      const { data } = await axios.patch(`/api/certificates/${certId}/reject`);
      setCertificates((prev) => prev.map((c) => (c._id === certId ? data.certificate : c)));
      toast.success('Certificate rejected.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject certificate');
    }
  };

  const stats = {
    total: certificates.length,
    pending: certificates.filter(c => c.approvalStatus === 'pending').length,
    approved: certificates.filter(c => c.approvalStatus === 'approved').length,
    rejected: certificates.filter(c => c.approvalStatus === 'rejected').length,
  };

  const filteredCerts = certificates.filter((c) => {
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
          <p className="page-subtitle">Manage student certificates and issuance requests</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 20 }}>
        <StatCard icon={<FaAward />} label="Total Requests" value={stats.total} color="var(--accent-blue)" />
        <StatCard icon={<FaAward />} label="Pending" value={stats.pending} color="#f59e0b" />
        <StatCard icon={<FaAward />} label="Approved" value={stats.approved} color="#10b981" />
        <StatCard icon={<FaAward />} label="Rejected" value={stats.rejected} color="#ef4444" />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)' }}>Generate New Certificate</h3>
        <form onSubmit={handleGenerateCertificate} style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Student</label>
              <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="form-input">
                <option value="">Select a student</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Course</label>
              <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="form-input">
                <option value="">Select a course</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={generating} style={{ width: 'fit-content' }}>
            {generating ? '🔄 Generating...' : '🏅 Generate Certificate'}
          </button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>Requests & Issued Certificates</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: 36 }} />
            </div>
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="form-input">
              <option value="">All Courses</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student & Course</th>
                <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Score & Grade</th>
                <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCerts.map((cert) => (
                <tr key={cert._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{cert.studentId?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cert.courseId?.title}</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 600 }}>{cert.finalScore}%</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Grade: {cert.grade} {cert.distinctionStatus}</div>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span className={`badge badge-${cert.approvalStatus === 'approved' ? 'emerald' : cert.approvalStatus === 'rejected' ? 'red' : 'amber'}`}>
                      {cert.approvalStatus}
                    </span>
                  </td>
                  <td style={{ padding: 12, fontSize: 13 }}>{new Date(cert.completionDate).toLocaleDateString()}</td>
                  <td style={{ padding: 12, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setPreviewCert(cert)}>
                        <FaEye /> Preview
                      </button>
                      {cert.approvalStatus === 'pending' && (
                        <>
                          <button className="btn btn-emerald" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => handleApprove(cert._id)}>
                            <FaCheck /> Approve
                          </button>
                          <button className="btn btn-red" style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => handleReject(cert._id)}>
                            <FaTimes /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {previewCert && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 40 }}>
          <div style={{ background: 'var(--bg-primary)', padding: 20, borderRadius: 12, position: 'relative', maxWidth: '100%', maxHeight: '100%', overflow: 'auto' }}>
            <button onClick={() => setPreviewCert(null)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: 20, zIndex: 1 }}><FaTimes /></button>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
              <CertificateTemplate certificate={previewCert} student={previewCert.studentId} course={previewCert.courseId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ icon, label, value, color }) => (
  <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ background: `${color}1a`, padding: 12, borderRadius: 12, color }}>{icon}</div>
    <div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{label}</p>
      <h2 style={{ margin: 0, fontSize: 24 }}>{value}</h2>
    </div>
  </div>
);
