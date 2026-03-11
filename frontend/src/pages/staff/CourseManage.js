import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Save, Users } from 'lucide-react';
import API from '../../api';

export default function CourseManage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', videoUrl: '', duration: 30, order: 1 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    Promise.all([
      API.get(`/courses/${id}`),
      API.get(`/analytics/staff/${id}`),
    ]).then(([courseRes, analyticsRes]) => {
      setCourse(courseRes.data.course);
      setEnrollments(analyticsRes.data.enrollments || []);
      setLessonForm(prev => ({ ...prev, order: (courseRes.data.course.lessons?.length || 0) + 1 }));
      setLoading(false);
    });
  }, [id]);

  const handlePublish = async () => {
    const newStatus = course.status === 'published' ? 'draft' : 'published';
    const { data } = await API.put(`/courses/${id}`, { status: newStatus });
    setCourse(data.course);
    setMsg(`Course ${newStatus}`);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await API.post(`/courses/${id}/lessons`, lessonForm);
      setCourse(data.course);
      setLessonForm({ title: '', description: '', videoUrl: '', duration: 30, order: data.course.lessons.length + 1 });
      setMsg('Lesson added!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add lesson');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!course) return null;

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>{course.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            {course.category} • {course.level}
          </p>
        </div>
        <button
          className={`btn ${course.status === 'published' ? 'btn-ghost' : 'btn-primary'}`}
          onClick={handlePublish}
        >
          {course.status === 'published' ? 'Unpublish' : '🚀 Publish'}
        </button>
      </div>

      {msg && <div className="alert alert-info">{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Lessons */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Course Lessons ({course.lessons?.length || 0})</h4>
            {course.lessons?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No lessons yet. Add your first one!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {course.lessons.map((lesson, i) => (
                  <div key={lesson._id} style={{
                    padding: '0.8rem 1rem', borderRadius: 'var(--radius)',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'rgba(0,212,255,0.1)', color: 'var(--accent-cyan)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{lesson.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lesson.duration} min</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Lesson Form */}
          <div className="card">
            <h4 style={{ marginBottom: '1rem' }}>Add Lesson</h4>
            <form onSubmit={handleAddLesson}>
              <div className="form-group">
                <label>Lesson Title</label>
                <input placeholder="e.g. Variables & Data Types" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Lesson overview…" value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} style={{ minHeight: 80 }} />
              </div>
              <div className="form-group">
                <label>Video URL</label>
                <input placeholder="https://…" value={lessonForm.videoUrl} onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input type="number" min={1} value={lessonForm.duration} onChange={e => setLessonForm({ ...lessonForm, duration: +e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                <Plus size={14} /> {saving ? 'Adding…' : 'Add Lesson'}
              </button>
            </form>
          </div>
        </div>

        {/* Students */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Users size={18} style={{ color: 'var(--accent-violet)' }} />
            <h4>Enrolled Students ({enrollments.length})</h4>
          </div>
          {enrollments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No students enrolled yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {enrollments.map(enr => (
                <div key={enr._id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.65rem', borderRadius: 'var(--radius)',
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(124,58,237,0.12)', color: '#a78bfa',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem',
                  }}>
                    {enr.student?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{enr.student?.name}</div>
                    <div className="progress-bar" style={{ marginTop: 4 }}>
                      <div className="progress-fill" style={{ width: `${enr.completionPercent}%` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{enr.completionPercent}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
