import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaGoogle, FaGithub, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import API_BASE_URL from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const { login, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const provider = searchParams.get('provider');

    if (code && provider) {
      handleOAuthCallback(code, provider);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (code, provider) => {
    setLoading(true);
    setGeneralError('');
    try {
      const endpoint =
        provider === 'google'
          ? `${API_BASE_URL}/auth/google`
          : `${API_BASE_URL}/auth/github`;
      const response = await axios.post(endpoint, { code });

      if (response.data.success) {
        setAuth(response.data.user, response.data.token);
        toast.success(`Welcome, ${response.data.user.name}!`);

        const role = response.data.user.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'staff') navigate('/staff');
        else navigate('/student');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || `${provider} authentication failed`;
      setGeneralError(errorMsg);
      toast.error(errorMsg);
      console.error(`${provider} Auth Error:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    // Handle Demo/Mock Login if keys are not set
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.log('🧪 Triggering Mock Google Login');
      handleOAuthCallback('mock-google-code', 'google');
      return;
    }

    const redirectUri = `${window.location.origin}/login?provider=google`;
    const scope = 'openid profile email';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  const handleGithubLogin = () => {
    const clientId = process.env.REACT_APP_GITHUB_CLIENT_ID;

    // Handle Demo/Mock Login if keys are not set
    if (!clientId || clientId === 'YOUR_GITHUB_CLIENT_ID_HERE') {
      console.log('🧪 Triggering Mock GitHub Login');
      handleOAuthCallback('mock-github-code', 'github');
      return;
    }

    const redirectUri = `${window.location.origin}/login?provider=github`;
    const scope = 'user:email';

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email || !email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      const data = await login(email, password);
      console.log('Login successful:', data);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'staff') navigate('/staff');
      else navigate('/student');
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg =
        err.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setGeneralError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
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

        <div className="divider">or straight to sign in</div>

        <p className="auth-subtitle" style={{ marginTop: '0', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: '#4f46e5', fontWeight: '600' }}>Sign Up</Link>
        </p>

        <p className="auth-subtitle" style={{ marginTop: '8px', textAlign: 'center', fontSize: '14px' }}>
          Or sign in with email
        </p>

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

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: '' });
              }}
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
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors({ ...errors, password: '' });
                }}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  paddingRight: 44,
                  borderColor: errors.password ? '#ef4444' : undefined,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                {showPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
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

          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <Link
              to="/forgot-password"
              style={{
                fontSize: 13,
                color: 'var(--accent-cyan)',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: 14,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
