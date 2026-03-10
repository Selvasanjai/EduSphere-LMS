import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaEdit, FaTimes } from 'react-icons/fa';
import API_BASE_URL from '../../api';

export default function AddVideoPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    duration: '',
  });
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    duration: '',
    order: 1
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      setCourse(data.course);
      setVideos(data.course.videos || []);
      // Initialize course form data
      setCourseFormData({
        title: data.course.title,
        description: data.course.description,
        category: data.course.category,
        level: data.course.level,
        duration: data.course.duration || '',
      });
      if (data.course.videos) {
        setFormData(prev => ({ ...prev, order: data.course.videos.length + 1 }));
      }
    } catch (error) {
      toast.error('Failed to load course');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeCourse = (e) => {
    const { name, value } = e.target;
    setCourseFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseFormData.title || !courseFormData.description || !courseFormData.category) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setEditingCourse(true);
      const updateData = {
        title: courseFormData.title,
        description: courseFormData.description,
        category: courseFormData.category,
        level: courseFormData.level,
        duration: courseFormData.duration
      };
      
      await axios.patch(`${API_BASE_URL}/courses/${courseId}`, updateData);
      toast.success('Course details updated successfully!');
      setShowEditCourse(false);
      fetchCourse();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update course');
    } finally {
      setEditingCourse(false);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url || !formData.duration) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const videoData = {
        ...formData,
        duration: parseInt(formData.duration),
        order: parseInt(formData.order)
      };

      // Add video to course
      const courseRes = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      const currentCourse = courseRes.data.course;
      const currentVideos = currentCourse.videos || [];
      
      await axios.patch(`${API_BASE_URL}/courses/${courseId}`, {
        videos: [...currentVideos, videoData]
      });

      toast.success('Video added successfully!');
      setFormData({ title: '', url: '', duration: '', order: currentVideos.length + 2 });
      setShowForm(false);
      fetchCourse();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add video');
    }
  };

  const handleDeleteVideo = async (videoIndex) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      const courseRes = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      const currentCourse = courseRes.data.course;
      const currentVideos = currentCourse.videos || [];
      const updatedVideos = currentVideos.filter((_, i) => i !== videoIndex);
      await axios.patch(`${API_BASE_URL}/courses/${courseId}`, { videos: updatedVideos });
      toast.success('Video deleted successfully!');
      fetchCourse();
    } catch (error) {
      toast.error('Failed to delete video');
    }
  };

  const handleReorderVideo = async (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= videos.length) return;
    const courseRes = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
    const currentCourse = courseRes.data.course;
    const currentVideos = currentCourse.videos || [];
    const newVideos = [...currentVideos];
    [newVideos[fromIndex], newVideos[toIndex]] = [newVideos[toIndex], newVideos[fromIndex]];
    try {
      await axios.patch(`${API_BASE_URL}/courses/${courseId}`, { videos: newVideos });
      fetchCourse();
    } catch (error) {
      toast.error('Failed to reorder videos');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📹 Manage Videos</h1>
          <p className="page-subtitle">{course?.title}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowEditCourse(true)}>
            <FaEdit /> Edit Course
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <FaPlus /> Add Video
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)' }}>Add New Video</h3>
          <form onSubmit={handleAddVideo} style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Video Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Introduction to React"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Duration (seconds) *</label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="e.g., 600"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Video URL *</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  fontFamily: 'inherit'
                }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                💡 Use direct video URLs (MP4, WebM). YouTube may have connection issues.
                <br />
                <strong>Working examples:</strong> W3Schools videos, sample-videos.com
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary">
                ✓ Add Video
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 16, fontFamily: 'var(--font-display)' }}>
          Course Videos ({videos.length})
        </h3>
        {videos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            No videos added yet
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {videos.map((video, index) => (
              <div
                key={index}
                style={{
                  padding: 16,
                  background: 'var(--bg-secondary)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {index + 1}. {video.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    ⏱️ {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')} •🔗 {video.url.substring(0, 30)}...
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleReorderVideo(index, index - 1)}
                    disabled={index === 0}
                    className="btn"
                    style={{ padding: '8px 10px', opacity: index === 0 ? 0.5 : 1 }}
                  >
                    <FaArrowUp />
                  </button>
                  <button
                    onClick={() => handleReorderVideo(index, index + 1)}
                    disabled={index === videos.length - 1}
                    className="btn"
                    style={{ padding: '8px 10px', opacity: index === videos.length - 1 ? 0.5 : 1 }}
                  >
                    <FaArrowDown />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(index)}
                    className="btn"
                    style={{ color: 'var(--accent-rose)', padding: '8px 10px' }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditCourse && (
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
          <div className="card" style={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button
              onClick={() => setShowEditCourse(false)}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 20,
                padding: 0
              }}
            >
              <FaTimes />
            </button>

            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>Edit Course Details</h2>

            <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={courseFormData.title}
                  onChange={handleChangeCourse}
                  className="form-input"
                  placeholder="e.g., Web Development Fundamentals"
                  required
                />
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={courseFormData.description}
                  onChange={handleChangeCourse}
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
                  value={courseFormData.category}
                  onChange={handleChangeCourse}
                  className="form-input"
                  placeholder="e.g., Programming, Design, Business"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label">Level</label>
                  <select
                    name="level"
                    value={courseFormData.level}
                    onChange={handleChangeCourse}
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
                    value={courseFormData.duration}
                    onChange={handleChangeCourse}
                    className="form-input"
                    placeholder="e.g., 20"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={editingCourse} style={{ flex: 1 }}>
                  {editingCourse ? 'Saving...' : '✓ Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditCourse(false)}
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
