import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { FaPlay, FaEdit, FaClock, FaCheckCircle } from 'react-icons/fa';
import API_BASE_URL from '../../api';

export default function StudentCoursePage() {
  const { courseId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [currentVideo, setCurrentVideo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const courseRes = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      setCourse(courseRes.data.course);

      // Fetch enrollment details
      const enrollmentRes = await axios.get(`${API_BASE_URL}/enrollments/my`);
      const myEnrollment = enrollmentRes.data.enrollments.find(
        (e) => e.courseId._id === courseId
      );
      setEnrollment(myEnrollment);

      // Fetch assignments
      const assignmentRes = await axios.get(
        `${API_BASE_URL}/assignments/course/${courseId}`
      );
      setAssignments(assignmentRes.data.assignments || []);

      // Fetch quizzes
      const quizRes = await axios.get(
        `${API_BASE_URL}/quizzes/course/${courseId}`
      );
      setQuizzes(quizRes.data.quizzes || []);
    } catch (error) {
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const enrollmentRes = await axios.post(`${API_BASE_URL}/enrollments`, {
        courseId,
      });
      if (enrollmentRes.data.success) {
        toast.success('Successfully enrolled in course!');
        fetchCourseData(); // Refresh data
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const markVideoWatched = async (videoId) => {
    try {
      await axios.patch(`${API_BASE_URL}/enrollments/${enrollment._id}`, {
        $addToSet: { videosWatched: videoId },
      });

      // Update local state
      const updatedEnrollment = {
        ...enrollment,
        videosWatched: [...(enrollment.videosWatched || []), videoId],
      };
      setEnrollment(updatedEnrollment);

      // Check if course is completed and generate certificate
      if (updatedEnrollment.videosWatched.length === course.videos.length) {
        await checkAndGenerateCertificate();
      }
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const checkAndGenerateCertificate = async () => {
    try {
      // Check eligibility
      const eligibilityRes = await axios.post(
        `${API_BASE_URL}/certificates/check`,
        {
          courseId: course._id,
        }
      );

      if (eligibilityRes.data.eligible) {
        // Generate certificate
        const certRes = await axios.post(
          `${API_BASE_URL}/certificates/generate`,
          {
            courseId: course._id,
          }
        );

        toast.success(
          '🎉 Course completed! Certificate generated and pending approval.'
        );
      }
    } catch (error) {
      console.log('Certificate not eligible or already exists');
    }
  };

  const playVideo = (video) => {
    setCurrentVideo(video);
  };

  const closeVideoPlayer = () => {
    setCurrentVideo(null);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>;
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>Course not found</div>
    );
  }

  const isEnrolled = !!enrollment;
  const progress = enrollment ? enrollment.progress || 0 : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{course.title}</h1>
          <p className="page-subtitle">{course.description}</p>
        </div>
        {!isEnrolled ? (
          <button className="btn btn-primary" onClick={handleEnroll}>
            Enroll in Course
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Progress: {progress}%
            </div>
            <div
              style={{
                width: 200,
                height: 8,
                background: 'var(--border)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'var(--accent-cyan)',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <button
            className={`btn ${activeTab === 'videos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('videos')}
            disabled={!isEnrolled}
          >
            Videos ({course.videos?.length || 0})
          </button>
          <button
            className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('assignments')}
            disabled={!isEnrolled}
          >
            Assignments ({assignments.length})
          </button>
          <button
            className={`btn ${activeTab === 'quizzes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('quizzes')}
            disabled={!isEnrolled}
          >
            Quizzes ({quizzes.length})
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'videos' && isEnrolled && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Course Videos</h3>
          {course.videos?.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No videos available for this course
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {course.videos.map((video, index) => {
                const isWatched = enrollment?.videosWatched?.includes(
                  video._id
                );
                return (
                  <div key={video._id} className="card" style={{ padding: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0 }}>{video.title}</h4>
                        <p
                          style={{
                            margin: '4px 0',
                            color: 'var(--text-muted)',
                            fontSize: 14,
                          }}
                        >
                          Duration: {video.duration} seconds
                        </p>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        {isWatched ? (
                          <span style={{ color: 'var(--accent-emerald)' }}>
                            <FaCheckCircle /> Completed
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => playVideo(video)}
                          >
                            <FaPlay /> Play Video
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'assignments' && isEnrolled && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Course Assignments</h3>
          {assignments.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No assignments available for this course
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {assignments.map((assignment) => {
                const submission = assignment.submissions?.find(
                  (s) => s.studentId.toString() === user._id
                );
                return (
                  <div
                    key={assignment._id}
                    className="card"
                    style={{ padding: 16 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0 }}>{assignment.title}</h4>
                        <p
                          style={{
                            margin: '4px 0',
                            color: 'var(--text-muted)',
                            fontSize: 14,
                          }}
                        >
                          {assignment.description}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: 14 }}>
                          <strong>Deadline:</strong>{' '}
                          {new Date(assignment.deadline).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: 14 }}>
                          <strong>Max Marks:</strong> {assignment.maxMarks}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {submission ? (
                          <div>
                            <span style={{ color: 'var(--accent-emerald)' }}>
                              <FaCheckCircle /> Submitted
                            </span>
                            {submission.marks !== null && (
                              <p style={{ margin: '4px 0', fontSize: 14 }}>
                                <strong>Marks:</strong> {submission.marks}/
                                {assignment.maxMarks}
                              </p>
                            )}
                            {submission.feedback && (
                              <p
                                style={{
                                  margin: '4px 0',
                                  fontSize: 14,
                                  color: 'var(--text-muted)',
                                }}
                              >
                                <strong>Feedback:</strong> {submission.feedback}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button className="btn btn-primary">
                            <FaEdit /> Submit Assignment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && isEnrolled && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Course Quizzes</h3>
          {quizzes.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              No quizzes available for this course
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {quizzes.map((quiz) => {
                const attempt = quiz.attempts?.find(
                  (a) => a.studentId.toString() === user._id
                );
                return (
                  <div key={quiz._id} className="card" style={{ padding: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0 }}>{quiz.title}</h4>
                        <p
                          style={{
                            margin: '4px 0',
                            color: 'var(--text-muted)',
                            fontSize: 14,
                          }}
                        >
                          {quiz.description}
                        </p>
                        <p style={{ margin: '4px 0', fontSize: 14 }}>
                          <strong>Time Limit:</strong> {quiz.timeLimit} minutes
                        </p>
                        <p style={{ margin: '4px 0', fontSize: 14 }}>
                          <strong>Total Marks:</strong> {quiz.totalMarks}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {attempt ? (
                          <div>
                            <span style={{ color: 'var(--accent-emerald)' }}>
                              <FaCheckCircle /> Attempted
                            </span>
                            <p style={{ margin: '4px 0', fontSize: 14 }}>
                              <strong>Score:</strong> {attempt.marksObtained}/
                              {quiz.totalMarks}
                            </p>
                            <p style={{ margin: '4px 0', fontSize: 14 }}>
                              <strong>Percentage:</strong> {attempt.percentage}%
                            </p>
                          </div>
                        ) : (
                          <button className="btn btn-primary">
                            <FaEdit /> Attempt Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Video Player Modal */}
      {currentVideo && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '20px',
              maxWidth: '90%',
              maxHeight: '90%',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              onClick={closeVideoPlayer}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'var(--text)',
              }}
            >
              ×
            </button>

            {/* Video Title */}
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)' }}>
              {currentVideo.title}
            </h3>

            {/* Video Player */}
            {currentVideo.url.includes('youtube.com') ||
            currentVideo.url.includes('youtu.be') ? (
              // YouTube Video with fallback handling
              <div>
                <iframe
                  width="100%"
                  height="450"
                  src={
                    currentVideo.url
                      .replace('watch?v=', 'embed/')
                      .split('?')[0] + '?autoplay=1'
                  }
                  style={{
                    borderRadius: '8px',
                    border: 'none',
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() => {
                    toast.error(
                      'YouTube video failed to load. This might be due to network restrictions.'
                    );
                  }}
                  onLoad={() => {
                    // Mark as watched after 30 seconds for YouTube videos
                    setTimeout(() => {
                      markVideoWatched(currentVideo._id);
                    }, 30000);
                  }}
                />
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--text-muted)',
                      fontSize: 12,
                    }}
                  >
                    If video doesn't load, try opening directly:
                    <a
                      href={currentVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--accent-cyan)', marginLeft: '8px' }}
                    >
                      Open in YouTube
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              // Regular Video with enhanced error handling
              <div>
                <video
                  controls
                  autoPlay
                  style={{
                    width: '100%',
                    maxWidth: '800px',
                    borderRadius: '8px',
                    backgroundColor: '#000',
                  }}
                  onEnded={() => {
                    markVideoWatched(currentVideo._id);
                    closeVideoPlayer();
                  }}
                  onError={() => {
                    toast.error(
                      'Video cannot be played. The video URL may be invalid or the server is not responding.'
                    );
                  }}
                >
                  <source src={currentVideo.url} type="video/mp4" />
                  <source src={currentVideo.url} type="video/webm" />
                  <source src={currentVideo.url} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--text-muted)',
                      fontSize: 12,
                    }}
                  >
                    Video URL: {currentVideo.url}
                  </p>
                </div>
              </div>
            )}

            {/* Video Info and Manual Complete */}
            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <p
                style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}
              >
                Duration: {currentVideo.duration} seconds
              </p>
              {!enrollment?.videosWatched?.includes(currentVideo._id) && (
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: '8px', fontSize: '12px' }}
                  onClick={() => {
                    markVideoWatched(currentVideo._id);
                    toast.success('Video marked as completed!');
                  }}
                >
                  Mark as Completed (if video won't play)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
