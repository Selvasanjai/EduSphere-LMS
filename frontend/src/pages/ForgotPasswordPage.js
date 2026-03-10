import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      toast.success('Password reset link sent to your email!');
      setSubmitted(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)',
      padding: 16
    }}>
      <div className="card" style={{
        maxWidth: 400,
        width: '100%',
        animation: 'slideUp 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            marginBottom: 8,
            color: 'var(--text-primary)'
          }}>
            Forgot Password?
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email Input */}
            <div>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{
                  position: 'absolute',
                  left: 12,
                  top: 14,
                  color: 'var(--text-muted)',
                  fontSize: 16
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input"
                  style={{ paddingLeft: 40 }}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>

            {/* Back to Login */}
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: 'var(--accent-blue)',
                textDecoration: 'none',
                fontSize: 13,
                marginTop: 8
              }}
            >
              <FaArrowLeft style={{ fontSize: 12 }} />
              Back to Login
            </Link>
          </form>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: 24,
            background: 'rgba(46, 204, 113, 0.1)',
            borderRadius: 8,
            border: '1px solid rgba(46, 204, 113, 0.2)'
          }}>
            <h3 style={{ color: 'var(--accent-green)', marginBottom: 12 }}>
              ✓ Email Sent Successfully!
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 14 }}>
              Check your email inbox for a password reset link. The link expires in 10 minutes.
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Redirecting to login in 3 seconds...
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-muted)'
        }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
            Login here
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
