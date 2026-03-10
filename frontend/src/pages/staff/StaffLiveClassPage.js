import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaPlay,
  FaStop,
  FaPlus,
  FaClock,
  FaUsers,
  FaEye,
  FaTrash,
  FaVideo,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaComment,
  FaHandPaper,
  FaChartBar
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const StaffLiveClassPage = () => {
  const { courseId } = useParams();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeLiveClass, setActiveLiveClass] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledStartTime: '',
    duration: 60,
    chatEnabled: true,
    raiseHandEnabled: true,
    screenShareEnabled: true,
    recordingEnabled: false
  });

  useEffect(() => {
    if (courseId) {
      fetchLiveClasses();
    }
  }, [courseId]);

  const fetchLiveClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/live-classes/course/${courseId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setLiveClasses(response.data.data || []);
      
      // Check for active live class
      const active = response.data.data?.find(lc => lc.status === 'live');
      if (active) {
        setActiveLiveClass(active);
      }
    } catch (error) {
      toast.error('Error fetching live classes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCreateLiveClass = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.scheduledStartTime) {
      toast.error('Please select a start time');
      return;
    }

    try {
      const payload = {
        ...formData,
        courseId
      };

      if (editingId) {
        await axios.patch(
          `${API_URL}/live-classes/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Live class updated successfully');
      } else {
        await axios.post(
          `${API_URL}/live-classes`,
          payload,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        toast.success('Live class scheduled successfully');
      }

      resetForm();
      fetchLiveClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating live class');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledStartTime: '',
      duration: 60,
      chatEnabled: true,
      raiseHandEnabled: true,
      screenShareEnabled: true,
      recordingEnabled: false
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const handleStartLiveClass = async (classId) => {
    try {
      const response = await axios.post(
        `${API_URL}/live-classes/${classId}/start`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setActiveLiveClass(response.data.data);
      toast.success('🔴 Live class started!');
      fetchLiveClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error starting live class');
    }
  };

  const handleEndLiveClass = async (classId) => {
    if (!window.confirm('Are you sure you want to end the live class?')) return;

    try {
      await axios.post(
        `${API_URL}/live-classes/${classId}/end`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Live class ended');
      setActiveLiveClass(null);
      fetchLiveClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error ending live class');
    }
  };

  const handleDeleteLiveClass = async (classId) => {
    if (!window.confirm('Delete this scheduled live class?')) return;

    try {
      await axios.delete(
        `${API_URL}/live-classes/${classId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      toast.success('Live class deleted');
      fetchLiveClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting live class');
    }
  };

  const handleEditLiveClass = (liveClass) => {
    setEditingId(liveClass._id);
    setFormData({
      title: liveClass.title,
      description: liveClass.description || '',
      scheduledStartTime: new Date(liveClass.scheduledStartTime).toISOString().slice(0, 16),
      duration: liveClass.duration,
      chatEnabled: liveClass.chatEnabled,
      raiseHandEnabled: liveClass.raiseHandEnabled,
      screenShareEnabled: liveClass.screenShareEnabled,
      recordingEnabled: liveClass.recordingEnabled
    });
    setShowCreateForm(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#ffc107',
      live: '#dc3545',
      ended: '#6c757d',
      cancelled: '#e83e8c'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner"></div>
        <p>Loading live classes...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <div>
          <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <FaVideo /> Live Classes
          </h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            Manage and conduct live interactive sessions
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingId(null);
            resetForm();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <FaPlus /> Schedule Live Class
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div style={{
          background: 'white',
          border: '2px solid #667eea',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit' : 'Schedule'} Live Class</h2>
          <form onSubmit={handleCreateLiveClass}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Class Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to Web Development"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Class description (optional)"
                rows="3"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              ></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  name="scheduledStartTime"
                  value={formData.scheduledStartTime}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="15"
                  max="480"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '1rem' }}>
                Features
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { name: 'chatEnabled', label: '💬 Enable Chat' },
                  { name: 'raiseHandEnabled', label: '✋ Enable Raise Hand' },
                  { name: 'screenShareEnabled', label: '🖥️ Allow Screen Share' },
                  { name: 'recordingEnabled', label: '🔴 Record Class' }
                ].map(feature => (
                  <label key={feature.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name={feature.name}
                      checked={formData[feature.name]}
                      onChange={handleInputChange}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    {feature.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#764ba2'}
                onMouseLeave={(e) => e.target.style.background = '#667eea'}
              >
                {editingId ? 'Update' : 'Schedule'} Live Class
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Live Class */}
      {activeLiveClass && (
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{
              width: '12px',
              height: '12px',
              background: 'white',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }}></span>
            <span style={{ fontSize: '1rem', fontWeight: '600' }}>🔴 LIVE NOW</span>
          </div>

          <h2 style={{ margin: '0.5rem 0 1rem 0' }}>{activeLiveClass.title}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FaUsers /> Students
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {activeLiveClass.currentStudents.length}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FaEye /> Peak
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                {activeLiveClass.peakViewers}
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <FaClock /> Started
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                {new Date(activeLiveClass.actualStartTime).toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => handleEndLiveClass(activeLiveClass._id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#ff6b6b',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              <FaStop /> End Class
            </button>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              <FaComment /> {activeLiveClass.chatMessages?.length || 0} Messages
            </button>
          </div>
        </div>
      )}

      {/* Live Classes List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {liveClasses.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            border: '2px dashed #ddd'
          }}>
            <FaVideo size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ color: '#999', fontSize: '1.1rem' }}>
              No live classes scheduled yet
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Create First Live Class
            </button>
          </div>
        ) : (
          liveClasses.map((lc) => (
            <div
              key={lc._id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                border: `2px solid ${getStatusColor(lc.status)}22`,
                borderLeft: `4px solid ${getStatusColor(lc.status)}`,
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{lc.title}</h3>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: getStatusColor(lc.status),
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}>
                  {lc.status.toUpperCase()}
                </span>
              </div>

              {lc.description && (
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {lc.description}
                </p>
              )}

              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#555' }}>
                  <FaClock /> {new Date(lc.scheduledStartTime).toLocaleString()}
                </div>
                <div style={{ color: '#555' }}>Duration: {lc.duration} minutes</div>
                {lc.status === 'ended' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#555' }}>
                      <FaUsers /> {lc.totalStudentsJoined} students joined
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', color: '#555' }}>
                      <FaEye /> Peak: {lc.peakViewers} viewers
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {lc.chatEnabled && <span style={{ background: '#e7f3ff', color: '#0056b3', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>💬 Chat</span>}
                {lc.raiseHandEnabled && <span style={{ background: '#e7f3ff', color: '#0056b3', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>✋ Raise Hand</span>}
                {lc.screenShareEnabled && <span style={{ background: '#e7f3ff', color: '#0056b3', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>🖥️ Screen Share</span>}
                {lc.recordingEnabled && <span style={{ background: '#ffe7ea', color: '#c71c36', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>🔴 Recording</span>}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {lc.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleStartLiveClass(lc._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <FaPlay size={12} /> Start
                    </button>
                    <button
                      onClick={() => handleEditLiveClass(lc)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <FaEdit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLiveClass(lc._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <FaTrash size={12} /> Delete
                    </button>
                  </>
                )}

                {lc.status === 'live' && (
                  <>
                    <button
                      onClick={() => handleEndLiveClass(lc._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <FaStop size={12} /> End
                    </button>
                  </>
                )}

                {lc.status === 'ended' && (
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.5rem 0.75rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    <FaChartBar size={12} /> View Report
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default StaffLiveClassPage;
