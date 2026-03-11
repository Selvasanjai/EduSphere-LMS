import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import API from '../../api';

export default function CourseView() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get(`/courses/${id}`),
      API.get(`/assignments/course/${id}`),
    ]).then(([courseRes, assignRes]) => {
      setCourse(courseRes.data.course);
      setEnrollment(courseRes.data.enrollment);
      setAssignments(assignRes.data.assignments);
      if (courseRes.data.course.lessons?.length) {
        setActiveLesson(courseRes.data.course.lessons[0]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const markComplete = async (lessonId) => {
    const { data } = await API.put(`/courses/${id}/progress`, { lessonId, watchedDuration: 100 });
    setEnrollment(data.enrollment);
  };

  const isLessonComplete = (lessonId) => {
    return enrollment?.progress?.find(p => p.lessonId === lessonId)?.completed;
  };

  if (loading) return <div className="spinner" />;
  if (!course) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem' }}>Course not found.</div>;

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>{course.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
            {course.instructor?.name} • {course.lessons?.length} lessons
          </p>
        </div>
        {enrollment && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              {enrollment.completionPercent}% complete
            </div>
            <div className="progress-bar" style={{ width: 140 }}>
              <div className="progress-fill" style={{ width: `${enrollment.completionPercent}%` }} />
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Video Player */}
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{
              background: 'var(--bg-primary)', aspectRatio: '16/9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {activeLesson?.videoUrl ? (
                <video
                  src={activeLesson.videoUrl}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Play size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p style={{ fontSize: '0.9rem' }}>No video for this lesson</p>
                </div>
              )}
            </div>
            <div style={{ padding: '1.5rem' }}>
              <h3>{activeLesson?.title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {activeLesson?.description}
              </p>
              {enrollment && activeLesson && !isLessonComplete(activeLesson._id) && (
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem' }}
                  onClick={() => markComplete(activeLesson._id)}
                >
                  <CheckCircle size={14} /> Mark as Complete
                </button>
              )}
              {enrollment && activeLesson && isLessonComplete(activeLesson._id) && (
                <span className="badge badge-emerald" style={{ marginTop: '1rem', display: 'inline-flex' }}>
                  ✓ Completed
                </span>
              )}
            </div>
          </div>

          {/* Assignments */}
          {assignments.length > 0 && (
            <div className="card">
              <h4 style={{ marginBottom: '1rem' }}>Assignments</h4>
              {assignments.map(a => {
                const submission = a.submissions?.find(s => s.student === enrollment?.student);
                return (
                  <div key={a._id} style={{
                    padding: '1rem', borderRadius: 'var(--radius)',
                    background: 'rgba(255,255,255,0.03)', marginBottom: '0.75rem',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          Due: {new Date(a.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      {submission ? (
                        submission.grade !== null
                          ? <span className="badge badge-emerald">Graded: {submission.grade}/{a.maxScore}</span>
                          : <span className="badge badge-amber">Submitted</span>
                      ) : (
                        <span className="badge badge-rose">Pending</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      {a.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lesson List */}
        <div className="card" style={{ position: 'sticky', top: '1rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Course Content</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {course.lessons?.map((lesson, i) => {
              const done = isLessonComplete(lesson._id);
              const isActive = activeLesson?._id === lesson._id;
              return (
                <motion.div
                  key={lesson._id}
                  whileHover={{ x: 3 }}
                  onClick={() => setActiveLesson(lesson)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.75rem', borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                    color: done ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    fontSize: '0.7rem', fontWeight: 700,
                  }}>
                    {done ? <CheckCircle size={13} /> : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.85rem', fontWeight: 500,
                      color: isActive ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {lesson.title}
                    </div>
                    {lesson.duration > 0 && (
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock size={10} /> {lesson.duration} min
                      </div>
                    )}
                  </div>
                  {isActive && <ChevronRight size={14} style={{ color: 'var(--accent-cyan)' }} />}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
