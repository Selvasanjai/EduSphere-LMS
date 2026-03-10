import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import API_BASE_URL from '../../api';

export default function StaffQuizzesPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalQuestions: 10,
    timeLimit: 30,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchQuizzes(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/courses`);
      const myCourses = data.courses.filter(c => c.staffId?._id === user?._id);
      setCourses(myCourses);
      if (myCourses.length > 0) {
        setSelectedCourse(myCourses[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    }
  };

  const fetchQuizzes = async (courseId) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/quizzes/course/${courseId}`);
      setQuizzes(data.quizzes);
    } catch (error) {
      toast.error('Failed to load quizzes');
    }
  };
  const [questions, setQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    if (field.startsWith('option-')) {
      const optionIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optionIndex] = value;
    } else {
      newQuestions[index][field] = value;
    }
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || questions.some(q => !q.question || q.options.some(o => !o))) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const quizData = {
        ...formData,
        courseId: selectedCourse,
        questions: questions.map((q, index) => ({
          text: q.question,
          type: 'mcq',
          options: q.options,
          correctAnswer: q.correctAnswer.toString(),
          marks: q.marks,
          order: index
        })),
        totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
        passingMarks: Math.floor(questions.reduce((sum, q) => sum + q.marks, 0) * 0.4)
      };

      if (editingId) {
        await axios.patch(`${API_BASE_URL}/quizzes/${editingId}`, quizData);
        toast.success('Quiz updated!');
      } else {
        await axios.post(`${API_BASE_URL}/quizzes`, quizData);
        toast.success('Quiz created successfully!');
      }
      
      setShowModal(false);
      setFormData({ title: '', description: '', totalQuestions: 10, timeLimit: 30 });
      setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]);
      setEditingId(null);
      fetchQuizzes(selectedCourse);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save quiz');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', description: '', totalQuestions: 10, timeLimit: 30 });
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 }]);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quizzes</h1>
          <p className="page-subtitle">Create and manage course quizzes</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text)',
              minWidth: 200
            }}
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={!selectedCourse}>
            <FaPlus /> Create Quiz
          </button>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 20 }}>No quizzes created yet</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={!selectedCourse}>
            <FaPlus /> Create First Quiz
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {quizzes.map((quiz, idx) => (
            <div key={idx} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 4 }}>{quiz.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{quiz.description}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                <span>❓ {quiz.totalQuestions} questions</span>
                <span>•</span>
                <span>⏱️ {quiz.timeLimit} minutes</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }}>
                  <FaEdit /> Edit
                </button>
                <button className="btn" style={{ color: 'var(--accent-rose)', flex: 1 }}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          overflowY: 'auto',
        }}>
          <div className="card" style={{ maxWidth: 600, width: '90%', margin: '20px auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>
              {editingId ? 'Edit Quiz' : 'Create Quiz'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">Quiz Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Chapter 1 Quiz"
                  required
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Quiz instructions"
                  rows="2"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">Total Questions</label>
                  <input
                    type="number"
                    name="totalQuestions"
                    value={formData.totalQuestions}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                  />
                </div>
                <div>
                  <label className="form-label">Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Questions</h3>
                {questions.map((q, idx) => (
                  <div key={idx} style={{ marginBottom: 20, padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <label className="form-label" style={{ margin: 0 }}>Question {idx + 1}</label>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          style={{ color: 'var(--accent-rose)', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                      className="form-input"
                      placeholder="Enter question"
                      style={{ marginBottom: 12 }}
                      required
                    />
                    {[0, 1, 2, 3].map(optIdx => (
                      <input
                        key={optIdx}
                        type="text"
                        value={q.options[optIdx]}
                        onChange={(e) => handleQuestionChange(idx, `option-${optIdx}`, e.target.value)}
                        className="form-input"
                        placeholder={`Option ${optIdx + 1}`}
                        style={{ marginBottom: 8 }}
                        required
                      />
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label className="form-label" style={{ fontSize: 12 }}>Correct Answer</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => handleQuestionChange(idx, 'correctAnswer', parseInt(e.target.value))}
                          className="form-input"
                        >
                          {[0, 1, 2, 3].map(i => (
                            <option key={i} value={i}>Option {i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="form-label" style={{ fontSize: 12 }}>Marks</label>
                        <input
                          type="number"
                          value={q.marks}
                          onChange={(e) => handleQuestionChange(idx, 'marks', parseInt(e.target.value))}
                          className="form-input"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="btn btn-secondary"
                  style={{ width: '100%', marginBottom: 16 }}
                >
                  <FaPlus /> Add Question
                </button>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingId ? 'Update Quiz' : 'Create Quiz'}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={closeModal}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
