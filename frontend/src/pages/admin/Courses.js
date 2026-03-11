import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2 } from 'lucide-react';
import API from '../../api';

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = search ? `?search=${search}` : '';
    API.get(`/courses${params}`).then(({ data }) => { setCourses(data.courses); setLoading(false); });
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await API.delete(`/courses/${id}`);
    setCourses(courses.filter(c => c._id !== id));
  };

  const handleStatus = async (course) => {
    const newStatus = course.status === 'published' ? 'archived' : 'published';
    const { data } = await API.put(`/courses/${course._id}`, { status: newStatus });
    setCourses(courses.map(c => c._id === course._id ? data.course : c));
  };

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>All Courses</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
            {courses.length} courses on platform
          </p>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: 380, marginBottom: '1.5rem' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Category</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, i) => (
                  <motion.tr key={course._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{course.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{course.level}</div>
                    </td>
                    <td>{course.instructor?.name}</td>
                    <td><span className="badge badge-cyan">{course.category}</span></td>
                    <td>{course.enrolledStudents?.length || 0}</td>
                    <td>
                      <span className={`badge ${course.status === 'published' ? 'badge-emerald' : course.status === 'draft' ? 'badge-amber' : 'badge-rose'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(course)}>
                          {course.status === 'published' ? 'Archive' : 'Publish'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course._id)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
