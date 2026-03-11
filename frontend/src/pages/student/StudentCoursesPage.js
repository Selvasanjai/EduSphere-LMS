import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaAward, FaTimes } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import API_BASE_URL from '../../api';
import CertificateTemplate from '../../components/CertificateTemplate';

export default function StudentCoursesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [search, setSearch] = useState('');
  const [previewCert, setPreviewCert] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchCourses();
    fetchEnrolledCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/courses`);
      setCourses(data.courses || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/enrollments/my`);
      setEnrolledCourses(data.enrollments?.map((e) => e.courseId._id) || []);
    } catch (error) {
      console.error('Failed to load enrolled courses');
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/enrollments`, {
        courseId,
      });
      toast.success('Successfully enrolled in course!');
      setEnrolledCourses([...enrolledCourses, courseId]);
      fetchCourses();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to enroll in course'
      );
    }
  };

  const filteredCourses = courses.filter((course) => {
    const title = (course.title || '').toString();
    const description = (course.description || '').toString();
    const category = (course.category || '').toString();

    const q = search.toLowerCase();
    const matchesSearch =
      title.toLowerCase().includes(q) || description.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || category === filter;
    const matchesCourse = !selectedCourse || course._id === selectedCourse;
    return matchesSearch && matchesFilter && matchesCourse;
  });

  const categories = [
    ...new Set(
      courses.map((c) => (c.category || '').toString()).filter(Boolean)
    ),
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Courses</h1>
          <p className="page-subtitle">
            Explore and enroll in available courses
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Search courses..."
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
              fontFamily: 'inherit',
            }}
          />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text)',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
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
              cursor: 'pointer',
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <p>Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)' }}>
            No courses found
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {filteredCourses.map((course) => {
            const isEnrolled = enrolledCourses.includes(course._id);
            return (
              <div
                key={course._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: isEnrolled ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  transform: isEnrolled ? 'translateY(0)' : 'none',
                }}
                onClick={() =>
                  isEnrolled && navigate(`/student/course/${course._id}`)
                }
                onMouseEnter={(e) =>
                  isEnrolled &&
                  (e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(0,0,0,0.15)')
                }
                onMouseLeave={(e) =>
                  isEnrolled && (e.currentTarget.style.boxShadow = '')
                }
              >
                <div
                  style={{
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
                    marginTop: -20,
                  }}
                >
                  📚
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    marginBottom: 8,
                    fontSize: 16,
                  }}
                >
                  {course.title || 'Untitled Course'}
                </h3>

                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    marginBottom: 12,
                    flexGrow: 1,
                  }}
                >
                  {(course.description || '').toString().substring(0, 80)}
                  {course.description ? '...' : ''}
                </p>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginBottom: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <span className="badge badge-cyan">{course.category}</span>
                  <span className="badge badge-violet">{course.level}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginBottom: 16,
                  }}
                >
                  <span>
                    🎥 {course.videos?.length ?? course.totalVideos ?? 0} videos
                  </span>
                  <span>•</span>
                  <span>👥 {course.enrollmentCount || 0} enrolled</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {isEnrolled ? (
                    <button
                      className="btn"
                      style={{
                        flex: 1,
                        background: 'var(--accent-emerald)',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/student/course/${course._id}`);
                      }}
                    >
                      ▶ Watch Videos
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(course._id);
                      }}
                      style={{ flex: 1 }}
                    >
                      📝 Enroll Now
                    </button>
                  )}
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '8px 12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewCert({
                        studentId: user,
                        courseId: course,
                        certificateId: 'SAMPLE-XXXX',
                        completionDate: new Date(),
                        finalScore: 95,
                        grade: 'A+',
                        distinctionStatus: 'with Distinction',
                        duration: course.duration || '12 Weeks (120 Hours)'
                      });
                    }}
                    title="View Reference Certificate"
                  >
                    <FaAward />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 40
        }}>
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '90%', overflow: 'auto' }}>
            <button 
              onClick={() => setPreviewCert(null)}
              style={{
                position: 'absolute',
                top: 10, right: 10,
                background: 'rgba(255,255,255,0.2)', 
                border: 'none',
                borderRadius: '50%',
                width: 36, height: 36,
                color: 'white', cursor: 'pointer',
                fontSize: 18, zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <FaTimes />
            </button>
            <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center', padding: '20px 0' }}>
              <CertificateTemplate 
                certificate={previewCert} 
                student={previewCert.studentId} 
                course={previewCert.courseId} 
              />
            </div>
          </div>
          <p style={{ color: 'white', marginTop: 20, fontStyle: 'italic' }}>
            Reference Sample: This is how your certificate will look after course completion.
          </p>
        </div>
      )}
    </div>
  );
}
