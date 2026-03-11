import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../../api';
import { FaDownload, FaEye, FaAward, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CertificateTemplate from '../../components/CertificateTemplate';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
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

  const handleDownloadPNG = async (cert) => {
    const element = document.getElementById('certificate-content');
    if (!element) return;
    
    try {
      toast.loading('Generating PNG...', { id: 'download' });
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `Certificate-${cert.certificateId}.png`;
      link.href = image;
      link.click();
      toast.success('Certificate downloaded as PNG', { id: 'download' });
    } catch (err) {
      toast.error('Failed to generate PNG', { id: 'download' });
    }
  };

  const handleDownloadPDF = async (cert) => {
    const element = document.getElementById('certificate-content');
    if (!element) return;

    try {
      toast.loading('Generating PDF...', { id: 'download' });
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'px', [1000, 700]);
      pdf.addImage(imgData, 'PNG', 0, 0, 1000, 700);
      pdf.save(`Certificate-${cert.certificateId}.pdf`);
      toast.success('Certificate saved as PDF', { id: 'download' });
    } catch (err) {
      toast.error('Failed to generate PDF', { id: 'download' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Certificates</h1>
          <p className="page-subtitle">Track your course completions and certificates</p>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading certificates...</div>
        ) : certificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            No course completions yet. Finish a course to request a certificate!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Course</th>
                  <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Score & Grade</th>
                  <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Date</th>
                  <th style={{ padding: 12, fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>{cert.courseId?.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>ID: {cert.certificateId}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      <div style={{ fontWeight: 600 }}>{cert.finalScore}%</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Grade: {cert.grade}</div>
                    </td>
                    <td style={{ padding: 12 }}>
                      {cert.approvalStatus === 'approved' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 14 }}>
                          <FaCheckCircle /> Approved & Issued
                        </div>
                      ) : cert.approvalStatus === 'rejected' ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 14 }}>
                          <FaTimesCircle /> Rejected
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 14 }}>
                            <FaClock /> Pending Approval
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontStyle: 'italic' }}>Awaiting admin review...</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      {new Date(cert.completionDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      {cert.approvalStatus === 'approved' ? (
                        <button 
                          className="btn btn-emerald" 
                          style={{ padding: '8px 14px', fontSize: 13 }}
                          onClick={() => setPreviewCert(cert)}
                        >
                          <FaEye /> View Certificate
                        </button>
                      ) : (
                        <button className="btn btn-secondary" disabled style={{ padding: '8px 14px', fontSize: 13, opacity: 0.5 }}>
                          <FaAward /> No Certificate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {previewCert && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          padding: 40
        }}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <button 
              onClick={() => setPreviewCert(null)}
              style={{
                position: 'absolute',
                top: -40, right: -40,
                background: 'none', border: 'none',
                color: 'white', cursor: 'pointer',
                fontSize: 32
              }}
            >
              ×
            </button>
            <div style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.5)', borderRadius: 12, overflow: 'hidden' }}>
              <CertificateTemplate 
                certificate={previewCert}
                student={previewCert.studentId}
                course={previewCert.courseId}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <button className="btn btn-emerald" style={{ padding: '12px 24px' }} onClick={() => handleDownloadPNG(previewCert)}>
              <FaDownload /> Download PNG
            </button>
            <button className="btn btn-primary" style={{ padding: '12px 24px' }} onClick={() => handleDownloadPDF(previewCert)}>
              <FaDownload /> Save as PDF
            </button>
            <button className="btn btn-secondary" style={{ padding: '12px 24px' }} onClick={() => window.print()}>
              Print Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
