import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FaVideo,
  FaComment,
  FaHandPaper,
  FaUsers,
  FaTimes,
  FaPlay,
  FaSignOutAlt,
  FaClock,
  FaUser,
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';

import API_BASE_URL from '../../api';

const StudentLiveClassPage = () => {
  const { classId } = useParams();
  const API_URL = API_BASE_URL;

  const [liveClass, setLiveClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [raisedHand, setRaisedHand] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchLiveClass();
    const interval = setInterval(fetchLiveClass, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [classId]);

  const fetchLiveClass = async () => {
    try {
      const response = await axios.get(`${API_URL}/live-classes/${classId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setLiveClass(response.data.data);
      setChatMessages(response.data.data.chatMessages || []);
      setStudents(response.data.data.currentStudents || []);

      if (!loading) setLoading(false);
    } catch (error) {
      if (!loading) toast.error('Error fetching live class');
      setLoading(false);
    }
  };

  const handleJoinClass = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.post(
        `${API_URL}/live-classes/${classId}/join`,
        { studentName: user.name },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setHasJoined(true);
      toast.success('Joined live class successfully!');
      fetchLiveClass();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error joining class');
    }
  };

  const handleLeaveClass = async () => {
    if (!window.confirm('Are you sure you want to leave the live class?'))
      return;

    try {
      await axios.post(
        `${API_URL}/live-classes/${classId}/leave`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setHasJoined(false);
      toast.success('Left live class');
      window.history.back();
    } catch (error) {
      toast.error('Error leaving class');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/live-classes/${classId}/chat`,
        { message: newMessage },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setNewMessage('');
      fetchLiveClass();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending message');
    }
  };

  const handleRaiseHand = async () => {
    try {
      await axios.post(
        `${API_URL}/live-classes/${classId}/raise-hand`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setRaisedHand(true);
      toast.success('Hand raised! Instructor will answer soon.');
      fetchLiveClass();
    } catch (error) {
      const msg = error.response?.data?.message;
      if (msg?.includes('already have')) {
        setRaisedHand(true);
      } else {
        toast.error(msg || 'Error raising hand');
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#1a1a1a',
          color: 'white',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner"></div>
          <p>Connecting to live class...</p>
        </div>
      </div>
    );
  }

  if (!liveClass) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'white',
            borderRadius: '12px',
          }}
        >
          <FaVideo size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p>Live class not found</p>
        </div>
      </div>
    );
  }

  if (liveClass.status !== 'live') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            maxWidth: '400px',
          }}
        >
          <FaVideo
            size={48}
            style={{ opacity: 0.3, marginBottom: '1rem', color: '#999' }}
          />
          <h2 style={{ margin: '1rem 0', color: '#333' }}>{liveClass.title}</h2>
          <p style={{ color: '#666', margin: '1rem 0' }}>
            This live class is not currently active.
          </p>
          <div
            style={{
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            <p style={{ margin: '0.5rem 0', color: '#555' }}>
              <strong>Status:</strong> {liveClass.status.toUpperCase()}
            </p>
            <p style={{ margin: '0.5rem 0', color: '#555' }}>
              <strong>Scheduled:</strong>{' '}
              {new Date(liveClass.scheduledStartTime).toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#fff',
      }}
    >
      {/* Main Video Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '1rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <FaVideo /> {liveClass.title}
            </h1>
            <p
              style={{
                margin: '0.25rem 0 0 0',
                opacity: 0.8,
                fontSize: '0.9rem',
              }}
            >
              Instructor: {liveClass.staffId?.name || 'Unknown'}
            </p>
          </div>
          {hasJoined && (
            <button
              onClick={handleLeaveClass}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              <FaSignOutAlt /> Leave Class
            </button>
          )}
        </div>

        {/* Video Player */}
        <div
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <FaVideo size={80} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
              {hasJoined ? '▶️ LIVE STREAM' : '📺 Click below to join'}
            </p>
            {!hasJoined && (
              <button
                onClick={handleJoinClass}
                style={{
                  marginTop: '2rem',
                  padding: '1rem 2rem',
                  background: '#fff',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                <FaPlay /> Join Live Class
              </button>
            )}
          </div>

          {/* Live Indicator */}
          {hasJoined && (
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#ff4444',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontWeight: '600',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  background: 'white',
                  borderRadius: '50%',
                  animation: 'pulse 1s infinite',
                }}
              ></span>
              LIVE
            </div>
          )}

          {/* Viewers Count */}
          {hasJoined && (
            <div
              style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
              }}
            >
              <FaUsers /> {liveClass.currentStudents?.length || 0} Watching
            </div>
          )}
        </div>

        {/* Controls */}
        {hasJoined && (
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            {liveClass.chatEnabled && (
              <button
                onClick={() => setShowChat(!showChat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: showChat ? '#667eea' : '#444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                <FaComment /> Chat ({chatMessages.length})
              </button>
            )}

            {liveClass.raiseHandEnabled && (
              <button
                onClick={handleRaiseHand}
                disabled={raisedHand}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: raisedHand ? '#ffc107' : '#667eea',
                  color: raisedHand ? '#333' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: raisedHand ? 'default' : 'pointer',
                  fontWeight: '600',
                  opacity: raisedHand ? 0.7 : 1,
                }}
              >
                <FaHandPaper /> {raisedHand ? 'Hand Raised' : 'Raise Hand'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      {hasJoined && showChat && (
        <div
          style={{
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            background: '#2a2a2a',
            borderLeft: '1px solid #444',
            padding: '1rem',
            gap: '1rem',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '1rem',
              borderBottom: '1px solid #444',
            }}
          >
            <h3 style={{ margin: 0 }}>
              <FaComment /> Live Chat
            </h3>
            <button
              onClick={() => setShowChat(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              paddingRight: '0.5rem',
            }}
          >
            {chatMessages.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: '#999',
                  padding: '2rem 0',
                }}
              >
                <p>No messages yet</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#3a3a3a',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <FaUser size={10} />
                    <strong style={{ fontSize: '0.8rem' }}>
                      {msg.studentName || 'Anonymous'}
                    </strong>
                  </div>
                  <p style={{ margin: 0, color: '#ddd' }}>{msg.message}</p>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: '#888',
                      marginTop: '0.25rem',
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#3a3a3a',
                border: '1px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: #3a3a3a;
        }

        div::-webkit-scrollbar-thumb {
          background: #667eea;
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #764ba2;
        }
      `}</style>
    </div>
  );
};

export default StudentLiveClassPage;
