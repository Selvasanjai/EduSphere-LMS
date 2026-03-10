import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import API_BASE_URL from '../../api';

export default function StaffVideosPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/courses`);
      // Backend already restricts staff to own courses
      setCourses(data.courses || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📹 Upload Videos</h1>
          <p className="page-subtitle">Manage course videos</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Loading courses...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)' }}>No courses yet. Create a course first!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
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
                color: '#fff',
                marginLeft: -20,
                marginRight: -20,
                marginTop: -20
              }}>
                📚
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8, fontSize: 16 }}>
                {course.title}
              </h3>

              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, flexGrow: 1 }}>
                {course.description.substring(0, 80)}...
              </p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-cyan">{course.category}</span>
                <span className="badge badge-violet">{course.level}</span>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                <span>🎥 {(course.videos?.length ?? course.totalVideos ?? 0)} videos</span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize' }}>
                  {course.isApproved ? '✅ Approved' : '⏳ Pending'}
                </span>
              </div>

              <button
                onClick={() => navigate(`/staff/videos/${course._id}`)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                📹 Manage Videos
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
