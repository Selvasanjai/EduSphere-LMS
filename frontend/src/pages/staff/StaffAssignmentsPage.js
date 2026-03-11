import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { FaPlus, FaEdit, FaTrash, FaVideo } from 'react-icons/fa';
import API_BASE_URL from '../../api';

export default function StaffAssignmentsPage() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    maxMarks: 100,
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
      fetchAssignments(selectedCourse);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/courses`);
      // Filter courses created by this staff member
      const myCourses = data.courses.filter(
        (c) => c.staffId?._id === user?._id
      );
      setCourses(myCourses);
      if (myCourses.length > 0) {
        setSelectedCourse(myCourses[0]._id);
      }
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (courseId) => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/assignments/course/${courseId}`
      );
      setAssignments(data.assignments);
    } catch (error) {
      toast.error('Failed to load assignments');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const data = {
        ...formData,
        courseId: selectedCourse,
        maxMarks: parseInt(formData.maxMarks),
      };

      if (editingId) {
        await axios.patch(`${API_BASE_URL}/assignments/${editingId}`, data);
        toast.success('Assignment updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/assignments`, data);
        toast.success('Assignment posted successfully!');
      }
      setShowModal(false);
      setFormData({ title: '', description: '', deadline: '', maxMarks: 100 });
      setEditingId(null);
      fetchAssignments(selectedCourse);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save assignment');
    }
  };

  const handleEdit = (assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline?.split('T')[0],
      maxMarks: assignment.maxMarks || 100,
    });
    setEditingId(assignment._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await axios.delete(`${API_BASE_URL}/assignments/${id}`);
        toast.success('Assignment deleted!');
        fetchAssignments(selectedCourse);
      } catch (error) {
        toast.error('Failed to delete assignment');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', description: '', deadline: '', maxMarks: 100 });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">Create and manage course assignments</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Post Assignment
        </button>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 0',
            color: 'var(--text-muted)',
          }}
        >
          Loading...
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <label className="form-label">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="form-input"
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          {assignments.length === 0 ? (
            <div
              className="card"
              style={{ textAlign: 'center', padding: '40px' }}
            >
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
                No assignments yet
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                <FaPlus /> Post First Assignment
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {assignments.map((assignment) => (
                <div key={assignment._id} className="card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: 'var(--font-display)',
                          marginBottom: 4,
                        }}
                      >
                        {assignment.title}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {assignment.description.substring(0, 100)}...
                      </p>
                    </div>
                    <span className="badge badge-cyan">
                      Max: {assignment.maxMarks} marks
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      fontSize: 13,
                      color: 'var(--text-muted)',
                      marginBottom: 16,
                    }}
                  >
                    <span>
                      📅 Due:{' '}
                      {new Date(assignment.deadline).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      📦 {assignment.submissions?.length || 0} submissions
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(assignment)}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn"
                      onClick={() => handleDelete(assignment._id)}
                      style={{
                        color: 'var(--accent-rose)',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showModal && (
        <div
          style={{
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
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 500,
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>
              {editingId ? 'Edit Assignment' : 'Post Assignment'}
            </h2>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div>
                <label className="form-label">Assignment Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Chapter 1-2 Practice Problems"
                  required
                />
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Instructions and details"
                  rows="4"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <div>
                  <label className="form-label">Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Max Marks</label>
                  <input
                    type="number"
                    name="maxMarks"
                    value={formData.maxMarks}
                    onChange={handleChange}
                    className="form-input"
                    min="1"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {editingId ? 'Update Assignment' : 'Post Assignment'}
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
