import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    college: '',
    department: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name || !form.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!form.email || !form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the errors above');
      return;
    }

    setErrors({});

    try {
      console.log('Attempting registration with:', form.name, form.email);
      const data = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        college: form.college,
        department: form.department,
      });
      console.log('Registration successful:', data);
      toast.success('Account created! Welcome to EduSphere');
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'staff') navigate('/staff');
      else navigate('/student');
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg =
        err.response?.data?.message || 'Registration failed. Please try again.';
      if (errorMsg.includes('already')) {
        setErrors({ email: 'This email is already registered' });
        toast.error('Email already registered');
      } else {
        setGeneralError(errorMsg);
        toast.error(errorMsg);
      }
    }
  };

  const handleGithubLogin = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GITHUB_CLIENT_ID_HERE') {
      console.log('🧪 Triggering Mock GitHub Login');
      navigate('/login?provider=github&code=mock-github-code');
      return;
    }
    const redirectUri = `${window.location.origin}/login?provider=github`;
    const scope = 'user:email';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.log('🧪 Triggering Mock Google Login');
      navigate('/login?provider=google&code=mock-google-code');
      return;
    }
    const redirectUri = `${window.location.origin}/login?provider=google`;
    const scope = 'openid profile email';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up" style={{ maxWidth: 460 }}>
        <div className="auth-logo">⬡ EduSphere</div>
        
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="oauth-btn"
            style={{ marginBottom: '12px' }}
          >
            <FaGoogle color="#EA4335" size={16} />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={loading}
            className="oauth-btn"
          >
            <FaGithub size={16} />
            Continue with GitHub
          </button>
        </div>

        <div className="divider">or create account straight</div>

        <p className="auth-subtitle" style={{ marginTop: '0', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: '#4f46e5', fontWeight: '600' }}>Sign In</Link>
        </p>

        <form onSubmit={handleSubmit}>
          {generalError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
              }}
            >
              ⚠️ {generalError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              name="name"
              className="form-input"
              value={form.name}
              onChange={handle}
              placeholder="Your full name"
              required
              style={{ borderColor: errors.name ? '#ef4444' : undefined }}
            />
            {errors.name && (
              <span
                style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block',
                }}
              >
                ⚠️ {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handle}
              placeholder="you@example.com"
              required
              style={{ borderColor: errors.email ? '#ef4444' : undefined }}
            />
            {errors.email && (
              <span
                style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block',
                }}
              >
                ⚠️ {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-input"
              value={form.password}
              onChange={handle}
              placeholder="Min 8 characters"
              required
              minLength={8}
              style={{ borderColor: errors.password ? '#ef4444' : undefined }}
            />
            {errors.password && (
              <span
                style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block',
                }}
              >
                ⚠️ {errors.password}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              className="form-input"
              value={form.confirmPassword}
              onChange={handle}
              placeholder="Confirm your password"
              required
              style={{
                borderColor: errors.confirmPassword ? '#ef4444' : undefined,
              }}
            />
            {errors.confirmPassword && (
              <span
                style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block',
                }}
              >
                ⚠️ {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-input"
              value={form.role}
              onChange={handle}
            >
              <option value="student">Student</option>
              <option value="staff">Staff / Instructor</option>
            </select>
          </div>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <div className="form-group">
              <label className="form-label">College</label>
              <input
                name="college"
                className="form-input"
                value={form.college}
                onChange={handle}
                placeholder="College name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                name="department"
                className="form-input"
                value={form.department}
                onChange={handle}
                placeholder="e.g. CSE"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: 14,
              marginTop: 4,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
