import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Clock } from 'lucide-react';
import API from '../../api';

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const navigate = useNavigate();

  const fetchCourses = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    API.get(`/courses?${params.toString()}`).then(({ data }) => {
      setCourses(data.courses);
      setLoading(false);
    });
  };

  useEffect(() => { fetchCourses(); }, [search, category]);

  const handleEnroll = async (e, courseId) => {
    e.stopPropagation();
    setEnrolling(courseId);
    try {
      await API.post(`/courses/${courseId}/enroll`);
      navigate(`/student/courses/${courseId}`);
    } catch (err) {
      if (err.response?.status === 409) navigate(`/student/courses/${courseId}`);
    } finally {
      setEnrolling(null);
    }
  };

  const categories = [...new Set(courses.map(c => c.category).filter(Boolean))];

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Explore Courses</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
            {courses.length} courses available
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            placeholder="Search courses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          <Filter size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ paddingLeft: '2.5rem', minWidth: 160 }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <div className="course-grid">
          {courses.map((course, i) => (
            <motion.div
              key={course._id}
              className="course-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/student/courses/${course._id}`)}
            >
              <div className="course-thumbnail">🎓</div>
              <div className="course-body">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="badge badge-cyan">{course.category}</span>
                  <span className="badge badge-violet">{course.level}</span>
                </div>
                <div className="course-title">{course.title}</div>
                <div className="course-meta">{course.description?.slice(0, 80)}…</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={12} /> {course.enrolledStudents?.length || 0} students
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {course.lessons?.length || 0} lessons
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    By {course.instructor?.name}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={e => handleEnroll(e, course._id)}
                    disabled={enrolling === course._id}
                  >
                    {enrolling === course._id ? '…' : 'Enroll'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
