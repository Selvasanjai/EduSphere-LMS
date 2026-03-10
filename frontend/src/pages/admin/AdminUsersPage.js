import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const role = filter === 'all' ? '' : filter;
      const url = role ? `/api/users?role=${role}` : '/api/users';
      const res = await axios.get(url);
      setUsers(res.data.users);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      const res = await axios.patch(`/api/users/${userId}/approve`);
      setUsers(users.map(u => u._id === userId ? res.data.user : u));
      toast.success('Staff approved successfully!');
    } catch (err) {
      toast.error('Failed to approve staff');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      toast.success('User deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Users</h1>
          <p className="page-subtitle">System users and staff approvals</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text)',
              minWidth: 200,
              fontFamily: 'inherit'
            }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text)',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Users</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="student">Students</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Department</th>
                  <th style={{ padding: 12, textAlign: 'left', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: 12, textAlign: 'center', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: user.avatar ? `url(${user.avatar})` : 'var(--accent-violet)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600
                        }}>
                          {!user.avatar && user.name && user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td style={{ padding: 12, fontSize: 14, color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: 12 }}>
                      <span className={`badge badge-${user.role === 'admin' ? 'rose' : user.role === 'staff' ? 'amber' : 'cyan'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 14 }}>{user.department || '—'}</td>
                    <td style={{ padding: 12 }}>
                      {user.role === 'staff' && !user.isApproved ? (
                        <span className="badge badge-red">Pending Approval</span>
                      ) : (
                        <span className="badge badge-emerald">Approved</span>
                      )}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        {user.role === 'staff' && !user.isApproved && (
                          <button
                            onClick={() => handleApprove(user._id)}
                            className="btn btn-sm"
                            style={{ background: 'var(--accent-emerald)', color: 'white' }}
                          >
                            ✓ Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="btn btn-sm"
                          style={{ background: 'var(--accent-rose)', color: 'white' }}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
              No users found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
