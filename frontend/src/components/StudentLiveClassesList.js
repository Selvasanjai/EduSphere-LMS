import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaVideo, FaPlay, FaClock, FaUsers, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import API_BASE_URL from '../api';

const StudentLiveClassesList = ({ courseId }) => {
  const API_URL = API_BASE_URL;
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveClasses();
    const interval = setInterval(fetchLiveClasses, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [courseId]);

  const fetchLiveClasses = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/live-classes/course/${courseId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setLiveClasses(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading live classes...</p>;
  }

  if (liveClasses.length === 0) {
    return null;
  }

  const activeLiveClasses = liveClasses.filter((lc) => lc.status === 'live');
  const upcomingLiveClasses = liveClasses.filter(
    (lc) => lc.status === 'scheduled'
  );

  return (
    <div>
      {/* Active Live Classes */}
      {activeLiveClasses.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                width: '12px',
                height: '12px',
                background: 'white',
                borderRadius: '50%',
                animation: 'pulse 1s infinite',
              }}
            ></span>
            <h2 style={{ margin: 0 }}>🔴 Live Classes Now</h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem',
            }}
          >
            {activeLiveClasses.map((lc) => (
              <Link
                key={lc._id}
                to={`/student/live-class/${lc._id}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '1rem',
                  textDecoration: 'none',
                  color: 'white',
                  transition: 'all 0.3s',
                  display: 'block',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0' }}>
                  <FaVideo /> {lc.title}
                </h3>
                <p
                  style={{
                    margin: '0.25rem 0',
                    fontSize: '0.9rem',
                    opacity: 0.9,
                  }}
                >
                  Instructor: {lc.staffId?.name || 'Unknown'}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '0.75rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>
                    <FaUsers /> {lc.currentStudents?.length || 0} watching
                  </span>
                  <span>
                    <FaEye /> Peak: {lc.peakViewers}
                  </span>
                </div>
                <button
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    padding: '0.6rem',
                    background: 'white',
                    color: '#ff6b6b',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <FaPlay /> Join Now
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Live Classes */}
      {upcomingLiveClasses.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            <FaClock /> Upcoming Live Classes
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1rem',
            }}
          >
            {upcomingLiveClasses.map((lc) => (
              <div
                key={lc._id}
                style={{
                  background: 'white',
                  border: '2px solid #667eea',
                  borderRadius: '12px',
                  padding: '1.5rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '1rem',
                  }}
                >
                  <h3 style={{ margin: 0 }}>
                    <FaVideo /> {lc.title}
                  </h3>
                  <span
                    style={{
                      background: '#fff3cd',
                      color: '#856404',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}
                  >
                    SCHEDULED
                  </span>
                </div>

                {lc.description && (
                  <p
                    style={{
                      color: '#666',
                      fontSize: '0.9rem',
                      marginBottom: '1rem',
                      margin: '0.5rem 0',
                    }}
                  >
                    {lc.description}
                  </p>
                )}

                <div
                  style={{
                    background: '#f8f9fa',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      color: '#555',
                    }}
                  >
                    <FaClock />{' '}
                    {new Date(lc.scheduledStartTime).toLocaleString()}
                  </div>
                  <div style={{ color: '#555' }}>
                    Duration: {lc.duration} minutes
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem',
                  }}
                >
                  {lc.chatEnabled && (
                    <span
                      style={{
                        background: '#e7f3ff',
                        color: '#0056b3',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                      }}
                    >
                      💬 Chat
                    </span>
                  )}
                  {lc.raiseHandEnabled && (
                    <span
                      style={{
                        background: '#e7f3ff',
                        color: '#0056b3',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                      }}
                    >
                      ✋ Q&A
                    </span>
                  )}
                  {lc.screenShareEnabled && (
                    <span
                      style={{
                        background: '#e7f3ff',
                        color: '#0056b3',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                      }}
                    >
                      🖥️ Share
                    </span>
                  )}
                  {lc.recordingEnabled && (
                    <span
                      style={{
                        background: '#ffe7ea',
                        color: '#c71c36',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                      }}
                    >
                      🔴 Recording
                    </span>
                  )}
                </div>

                <p
                  style={{
                    color: '#667eea',
                    fontSize: '0.85rem',
                    margin: '0.5rem 0 0 0',
                  }}
                >
                  ℹ️ Check back closer to start time to join
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default StudentLiveClassesList;
