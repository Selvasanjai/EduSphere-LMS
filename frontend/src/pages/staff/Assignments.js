import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckCircle } from 'lucide-react';
import API from '../../api';
import useAuthStore from '../../store/authStore';

export default function StaffAssignments() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', courseId: '', deadline: '', maxScore: 100 });
  const [grading, setGrading] = useState(null);
  const [gradeVal, setGradeVal] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    API.get('/courses').then(({ data }) => {
      const mine = data.courses.filter(c => c.instructor?._id === user?._id || c.instructor === user?._id);
      setCourses(mine);
      if (mine[0]) {
        setSelectedCourse(mine[0]._id);
        setForm(f => ({ ...f, courseId: mine[0]._id }));
      }
    });
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      API.get(`/assignments/course/${selectedCourse}`).then(({ data }) => setAssignments(data.assignments));
    }
  }, [selectedCourse]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/assignments', form);
      setAssignments(prev => [...prev, data.assignment]);
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleGrade = async (assignmentId, studentId) => {
    try {
      await API.put(`/assignments/${assignmentId}/grade/${studentId}`, { grade: +gradeVal, feedback });
      API.get(`/assignments/course/${selectedCourse}`).then(({ data }) => setAssignments(data.assignments));
      setGrading(null);
    } catch (err) {
      alert('Failed to grade');
    }
  };

  return (
    <div>
      <div className="topbar">
        <h2>Assignments</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Assignment
        </button>
      </div>

      {/* Course Selector */}
      <div className="form-group" style={{ maxWidth: 300, marginBottom: '1.5rem' }}>
        <label>Filter by Course</label>
        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
      </div>

      {/* Assignments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {assignments.map(a => (
          <div key={a._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h4>{a.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>{a.description}</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Due: {new Date(a.deadline).toLocaleDateString()} • Max: {a.maxScore} pts
                </div>
              </div>
              <span className="badge badge-cyan">{a.submissions?.length || 0} submissions</span>
            </div>

            {a.submissions?.length > 0 && (
              <div>
                <h5 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Submissions
                </h5>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Submitted</th>
                        <th>Grade</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.submissions.map(sub => (
                        <tr key={sub._id}>
                          <td>{sub.student?.name || sub.student}</td>
                          <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                          <td>
                            {sub.grade !== null ? (
                              <span className="badge badge-emerald">{sub.grade}/{a.maxScore}</span>
                            ) : (
                              <span className="badge badge-amber">Pending</span>
                            )}
                          </td>
                          <td>
                            {sub.grade === null && (
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => { setGrading({ assignmentId: a._id, studentId: sub.student?._id || sub.student, max: a.maxScore }); setGradeVal(''); setFeedback(''); }}
                              >
                                Grade
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="card" style={{ width: '100%', maxWidth: 480 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>New Assignment</h3>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Title</label>
                  <input placeholder="Assignment title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Instructions…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Course</label>
                  <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Deadline</label>
                    <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Max Score</label>
                    <input type="number" value={form.maxScore} onChange={e => setForm({ ...form, maxScore: +e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Create Assignment</button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Grade Modal */}
        {grading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="card" style={{ width: '100%', maxWidth: 380 }}>
              <h3 style={{ marginBottom: '1.25rem' }}>Grade Submission</h3>
              <div className="form-group">
                <label>Score (out of {grading.max})</label>
                <input type="number" min={0} max={grading.max} value={gradeVal} onChange={e => setGradeVal(e.target.value)} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Feedback</label>
                <textarea placeholder="Optional feedback…" value={feedback} onChange={e => setFeedback(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" onClick={() => handleGrade(grading.assignmentId, grading.studentId)}>
                  <CheckCircle size={14} /> Submit Grade
                </button>
                <button className="btn btn-ghost" onClick={() => setGrading(null)}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
