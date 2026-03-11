import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import API from '../../api';
import useAuthStore from '../../store/authStore';

const CATEGORIES = ['Programming', 'Design', 'Data Science', 'Business', 'Marketing', 'Mathematics', 'Science', 'Language', 'Other'];

export default function StaffCourses() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Programming', level: 'Beginner', tags: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/courses').then(({ data }) => {
      setCourses(data.courses.filter(c => c.instructor?._id === user?._id || c.instructor === user?._id));
    });
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { data } = await API.post('/courses', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setCourses(prev => [data.course, ...prev]);
      setShowModal(false);
      navigate(`/staff/courses/${data.course._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="topbar">
        <h2>My Courses</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Course
        </button>
      </div>

      <div className="course-grid">
        {courses.map((course, i) => (
          <motion.div
            key={course._id}
            className="course-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/staff/courses/${course._id}`)}
          >
            <div className="course-thumbnail">📘</div>
            <div className="course-body">
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-cyan">{course.category}</span>
                <span className={`badge ${course.status === 'published' ? 'badge-emerald' : 'badge-amber'}`}>
                  {course.status}
                </span>
              </div>
              <div className="course-title">{course.title}</div>
              <div className="course-meta">{course.description?.slice(0, 80)}…</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {course.enrolledStudents?.length || 0} students • {course.lessons?.length || 0} lessons
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '1rem',
            }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Create New Course</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Course Title</label>
                  <input placeholder="e.g. Introduction to Python" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="What will students learn?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                      {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input placeholder="react, javascript, web" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                  {saving ? 'Creating…' : 'Create Course'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
