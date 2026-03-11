import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function VerifyCertPage() {
  const { certId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/certificates/verify/${certId}`)
      .then((r) => setResult({ valid: true, ...r.data }))
      .catch(() => setResult({ valid: false }))
      .finally(() => setLoading(false));
  }, [certId]);

  return (
    <div className="auth-page">
      <div className="auth-card fade-up" style={{ textAlign: 'center' }}>
        <div className="auth-logo">⬡ EduSphere</div>
        <p className="auth-subtitle">Certificate Verification</p>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Verifying...</p>
        ) : result?.valid ? (
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: 'var(--accent-emerald)', marginBottom: 8 }}>
              Valid Certificate
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
              Awarded to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {result.certificate?.studentId?.name}
              </strong>
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              Course:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {result.certificate?.courseId?.title}
              </strong>
            </p>
            <div style={{ marginTop: 16 }}>
              <span className="badge badge-emerald">ID: {certId}</span>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ color: 'var(--accent-rose)' }}>Invalid Certificate</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
              This certificate could not be verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
