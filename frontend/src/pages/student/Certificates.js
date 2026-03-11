import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, ExternalLink } from 'lucide-react';
import API from '../../api';

export default function StudentCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/certificates/my').then(({ data }) => {
      setCerts(data.certificates);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>My Certificates</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
            {certs.length} certificate{certs.length !== 1 ? 's' : ''} earned
          </p>
        </div>
      </div>

      {certs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Award size={48} style={{ marginBottom: '1rem', opacity: 0.3, color: 'var(--accent-amber)' }} />
          <h3 style={{ color: 'var(--text-secondary)' }}>No certificates yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Complete a course with ≥80% attendance and all assignments to earn a certificate.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {certs.map((cert, i) => (
            <motion.div
              key={cert._id}
              className="card card-glow"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Certificate Header */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(124,58,237,0.12))',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
                textAlign: 'center',
                marginBottom: '1rem',
              }}>
                <Award size={32} style={{ color: 'var(--accent-amber)', marginBottom: '0.5rem' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                  Certificate of Completion
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
                  EduSphere Learning Platform
                </div>
              </div>

              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{cert.course?.title}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.65rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Attendance</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{cert.attendancePercent}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '0.65rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Completion</div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{cert.videoCompletionPercent}%</div>
                </div>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>ID: </span>
                <span style={{ fontFamily: 'monospace' }}>{cert.certificateId}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={`/verify/${cert.certificateId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <ExternalLink size={13} /> Verify
                </a>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
