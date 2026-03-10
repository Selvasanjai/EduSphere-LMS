import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    duration: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/courses');
      setCourses(data.courses);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingId) {
        await axios.patch(`/api/courses/${editingId}`, formData);
        toast.success('Course updated successfully!');
      } else {
        await axios.post('/api/courses', formData);
        toast.success('Course created successfully!');
      }
      setShowModal(false);
      setFormData({ title: '', description: '', category: '', level: 'beginner', duration: '' });
      setEditingId(null);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration || '',
    });
    setEditingId(course._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/api/courses/${id}`);
        toast.success('Course deleted successfully!');
        fetchCourses();
      } catch (error) {
        toast.error('Failed to delete course');
      }
    }
  };

  const handleApproveCourse = async (id) => {
    try {
      await axios.patch(`/api/courses/${id}/approve`);
      toast.success('Course approved and published!');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to approve course');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', description: '', category: '', level: 'beginner', duration: '' });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Courses</h1>
          <p className="page-subtitle">Create, approve, and manage all courses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Create Course
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 20 }}>No courses yet</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus /> Create First Course
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {courses.map(course => (
            <div key={course._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                height: 150,
                background: `linear-gradient(135deg, hsl(${Math.random() * 360},70%,30%), hsl(${Math.random() * 360},70%,25%))`,
                borderRadius: '8px 8px 0 0',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                color: '#fff'
              }}>
                📚
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>{course.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, flexGrow: 1 }}>
                {course.description.substring(0, 100)}...
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-cyan">{course.category}</span>
                <span className="badge badge-violet">{course.level}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                <span>{(course.videos?.length ?? course.totalVideos ?? 0)} videos</span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {course.isApproved ? '✅ Approved' : '⏳ Pending'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!course.isApproved && (
                  <button
                    className="btn"
                    onClick={() => handleApproveCourse(course._id)}
                    style={{ color: 'var(--accent-emerald)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <FaCheckCircle /> Approve
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => handleEdit(course)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="btn"
                  onClick={() => handleDelete(course._id)}
                  style={{ color: 'var(--accent-rose)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>
              {editingId ? 'Edit Course' : 'Create Course'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Web Development Fundamentals"
                  required
                />
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Describe what students will learn"
                  rows="4"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div>
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Programming, Design, Business"
                  required
                />
              </div>

              <div>
                <label className="form-label">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="form-label">Duration (hours)</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., 10"
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? 'Update Course' : 'Create Course'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={closeModal}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
