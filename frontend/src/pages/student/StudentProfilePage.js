import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function StudentProfilePage() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    college: user?.college || '',
    avatar: user?.avatar || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.patch('/api/users/profile', formData);
      if (data.success) {
        setUser(data.user);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30 }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 32,
            color: '#0a0f1e'
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>{user?.name}</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role} • Joined {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                disabled
                style={{ opacity: 0.6 }}
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</p>
            </div>

            <div>
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="form-label">College/Institution</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., XYZ University"
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    email: user?.email || '',
                    department: user?.department || '',
                    college: user?.college || '',
                    avatar: user?.avatar || '',
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Email</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.email}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Role</div>
                <div style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{user?.role}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Department</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.department || 'Not specified'}</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>College</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{user?.college || 'Not specified'}</div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
}
