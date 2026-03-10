import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../api';
import { FaDownload, FaEye, FaAward } from 'react-icons/fa';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/certificates/my`);
      setCertificates(data.certificates || []);
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificateId, format) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/certificates/${certificateId}/download/${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Certificate downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const previewCertificate = (certificateId) => {
    window.open(`${API_BASE_URL}/certificates/${certificateId}/preview`, '_blank');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Certificates</h1>
          <p className="page-subtitle">Approved certificates will be verifiable</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p>Loading certificates...</p>
          </div>
        ) : certificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            No certificates yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Cert ID</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Course</th>
                  <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Attendance</th>
                  <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Approval</th>
                  <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Actions</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map(cert => (
                  <tr key={cert._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12, fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>
                      {cert.certificateId}
                    </td>
                    <td style={{ padding: 12 }}>{cert.courseId?.title || '—'}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>{cert.attendancePercentage}%</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <span className={`badge badge-${cert.approvalStatus === 'approved' ? 'emerald' : cert.approvalStatus === 'rejected' ? 'red' : 'amber'}`}>
                        {cert.approvalStatus || 'pending'}
                      </span>
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                        {cert.approvalStatus === 'approved' && (
                          <>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '6px 10px', fontSize: 12 }}
                              onClick={() => previewCertificate(cert._id)}
                              title="Preview Certificate"
                            >
                              <FaEye /> Preview
                            </button>
                            <div style={{ position: 'relative' }}>
                              <button
                                className="btn btn-primary"
                                style={{ padding: '6px 10px', fontSize: 12 }}
                                title="Download Certificate"
                              >
                                <FaDownload /> Download
                              </button>
                              <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                background: 'var(--bg-primary)',
                                border: '1px solid var(--border)',
                                borderRadius: 4,
                                padding: 4,
                                display: 'none',
                                zIndex: 10
                              }}
                              className="download-dropdown">
                                <button
                                  className="btn btn-secondary"
                                  style={{ display: 'block', width: '100%', padding: '4px 8px', fontSize: 11, textAlign: 'left' }}
                                  onClick={() => downloadCertificate(cert._id, 'png')}
                                >
                                  📄 PNG
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{ display: 'block', width: '100%', padding: '4px 8px', fontSize: 11, textAlign: 'left' }}
                                  onClick={() => downloadCertificate(cert._id, 'jpg')}
                                >
                                  🖼️ JPG
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{ display: 'block', width: '100%', padding: '4px 8px', fontSize: 11, textAlign: 'left' }}
                                  onClick={() => downloadCertificate(cert._id, 'pdf')}
                                >
                                  📑 PDF
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                        {cert.approvalStatus !== 'approved' && (
                          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            <FaAward /> Pending approval
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
                      {new Date(cert.completionDate).toLocaleDateString()}
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

