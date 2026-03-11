import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaLock, FaCheck, FaTimes } from 'react-icons/fa';
import useAuthStore from '../store/authStore';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { user } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Invalid reset link');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [token, navigate]);

  // Check password match
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.patch(`/api/auth/reset-password/${token}`, {
        password,
      });
      toast.success('Password reset successfully!');
      // Login user with new credentials
      useAuthStore.setState({ user: data.user, token: data.token });
      setTimeout(() => {
        navigate(data.user.role === 'student' ? '/student' : `/staff`);
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      if (error.response?.status === 400) {
        setTokenValid(false);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, var(--accent-rose) 0%, var(--accent-orange) 100%)',
          padding: 16,
        }}
      >
        <div className="card" style={{ maxWidth: 400, width: '100%' }}>
          <div style={{ textAlign: 'center', padding: 40 }}>
            <FaTimes
              style={{
                fontSize: 48,
                color: 'var(--accent-rose)',
                marginBottom: 16,
              }}
            />
            <h2 style={{ color: 'var(--accent-rose)', marginBottom: 8 }}>
              Link Expired
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              This password reset link has expired or is invalid. Please request
              a new one.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="btn btn-primary"
            >
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, var(--accent-blue) 0%, var(--accent-purple) 100%)',
        padding: 16,
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 400,
          width: '100%',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              marginBottom: 8,
              color: 'var(--text-primary)',
            }}
          >
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Enter your new password below to regain access to your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {/* New Password */}
          <div>
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 14,
                  color: 'var(--text-muted)',
                  fontSize: 16,
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="form-input"
                style={{ paddingLeft: 40 }}
                required
              />
            </div>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                marginTop: 4,
              }}
            >
              At least 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock
                style={{
                  position: 'absolute',
                  left: 12,
                  top: 14,
                  color: 'var(--text-muted)',
                  fontSize: 16,
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="form-input"
                style={{
                  paddingLeft: 40,
                  borderColor:
                    confirmPassword && !passwordsMatch
                      ? 'var(--accent-rose)'
                      : 'var(--border-color)',
                }}
                required
              />
            </div>
            {confirmPassword && !passwordsMatch && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--accent-rose)',
                  marginTop: 4,
                }}
              >
                Passwords do not match
              </p>
            )}
            {confirmPassword && passwordsMatch && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--accent-green)',
                  marginTop: 4,
                }}
              >
                ✓ Passwords match
              </p>
            )}
          </div>

          {/* Show Password Checkbox */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Show password
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading || !passwordsMatch || !password || !confirmPassword
            }
            className="btn btn-primary"
            style={{
              opacity: loading || !passwordsMatch ? 0.6 : 1,
              cursor: loading || !passwordsMatch ? 'not-allowed' : 'pointer',
              marginTop: 8,
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
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
