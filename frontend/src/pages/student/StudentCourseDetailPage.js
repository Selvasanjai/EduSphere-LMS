import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';

export default function StudentCourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    fetchCourseAndVideos();
  }, [courseId]);

  const fetchCourseAndVideos = async () => {
    try {
      setLoading(true);
      const { data: courseData } = await axios.get(`/api/courses/${courseId}`);
      setCourse(courseData.course);

      const normalizeVideos = (rawVideos) => {
        const list = Array.isArray(rawVideos) ? rawVideos : [];
        return [...list]
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map((v) => ({
            ...v,
            // Back-compat for old UI expectations
            videoUrl: v.videoUrl || v.url,
          }));
      };

      // Prefer embedded videos already on course, otherwise call the videos endpoint
      let nextVideos = normalizeVideos(courseData.course?.videos);
      if (nextVideos.length === 0) {
        try {
          const { data: videosData } = await axios.get(`/api/courses/${courseId}/videos`);
          nextVideos = normalizeVideos(videosData.videos);
        } catch (_) {
          nextVideos = [];
        }
      }
      setVideos(nextVideos);

      // Fetch progress data
      try {
        const { data: progressData } = await axios.get(`/api/analytics/student`);
        const courseProgress = progressData.enrollments?.find(e => e.courseId?._id === courseId);
        if (courseProgress) {
          setProgress({
            completed: courseProgress.completed,
            progress: courseProgress.progress,
            completedVideos: courseProgress.completedVideos || []
          });
        }
      } catch (err) {
        console.log('Progress data not available');
      }

      // Select first video by default
      if (nextVideos.length > 0) {
        setSelectedVideo(nextVideos[0]);
      }
    } catch (error) {
      toast.error('Failed to load course');
      navigate('/student/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPlay = async (video) => {
    setSelectedVideo(video);
    // Track that student is watching
    try {
      await axios.post(`/api/videos/${video._id}/progress`, {
        progress: 0,
        timestamp: new Date().toISOString()
      }).catch(() => {});
    } catch (err) {
      console.log('Could not track progress');
    }
  };

  const handleVideoComplete = async (video) => {
    try {
      const { data } = await axios.post(`/api/enrollments/course/${courseId}/videos/${video._id}/complete`);
      toast.success(`Completed: ${video.title}`);
      
      // Refresh progress
      try {
        const { data } = await axios.get(`/api/analytics/student`);
        const courseProgress = data.enrollments?.find(e => e.courseId?._id === courseId);
        if (courseProgress) {
          setProgress({
            completed: courseProgress.completed,
            progress: courseProgress.progress,
            completedVideos: courseProgress.completedVideos || []
          });
        }
      } catch (err) {}

      // If backend created a pending certificate, surface it
      if (data?.certificate?.approvalStatus === 'pending') {
        toast('Certificate generated (pending admin approval).');
      }
    } catch (error) {
      toast.error('Failed to mark as complete');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <button
          onClick={() => navigate('/student/courses')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-cyan)',
            cursor: 'pointer',
            fontSize: 14,
            marginBottom: 10
          }}
        >
          ← Back to Courses
        </button>
        <div>
          <h1 className="page-title">{course.title}</h1>
          <p className="page-subtitle">{course.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
              {progress.progress || 0}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Complete</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
        {/* Video Player Area */}
        <div className="card">
          {selectedVideo ? (
            <div>
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                background: '#000',
                borderRadius: 8,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                overflow: 'hidden'
              }}>
                {selectedVideo.videoUrl?.includes('youtube') || selectedVideo.videoUrl?.includes('youtu.be') ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={selectedVideo.videoUrl
                      .replace('watch?v=', 'embed/')
                      .replace('youtu.be/', 'www.youtube.com/embed/')}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedVideo.title}
                  />
                ) : (
                  <video
                    width="100%"
                    height="100%"
                    controls
                    style={{ maxHeight: '100%' }}
                  >
                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              <h2 style={{ marginBottom: 8 }}>{selectedVideo.title}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                {selectedVideo.description}
              </p>

              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <span style={{
                  padding: '6px 12px',
                  background: 'var(--accent-violet)20',
                  color: 'var(--accent-violet)',
                  borderRadius: 4,
                  fontSize: 12
                }}>
                  {selectedVideo.duration ? `${Math.floor(selectedVideo.duration / 60)}:${String(selectedVideo.duration % 60).padStart(2, '0')}` : 'N/A'}
                </span>
                {progress.completedVideos?.includes(selectedVideo._id) && (
                  <span style={{
                    padding: '6px 12px',
                    background: 'var(--accent-emerald)20',
                    color: 'var(--accent-emerald)',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    ✓ Completed
                  </span>
                )}
              </div>

              {!progress.completedVideos?.includes(selectedVideo._id) && (
                <button
                  onClick={() => handleVideoComplete(selectedVideo)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--accent-emerald)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    marginBottom: 20
                  }}
                >
                  Mark as Complete
                </button>
              )}

              <div style={{
                padding: 12,
                background: 'var(--bg-secondary)',
                borderRadius: 6,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Course Progress</span>
                  <span style={{ fontSize: 12, color: 'var(--accent-cyan)' }}>{progress.progress || 0}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: 6,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress.progress || 0}%`,
                    height: '100%',
                    background: 'var(--accent-cyan)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <p>No videos available in this course</p>
            </div>
          )}
        </div>

        {/* Videos Sidebar */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 12, fontSize: 14 }}>
              Course Videos ({videos.length})
            </h3>
            <div style={{
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto'
            }}>
              {videos.map((video, idx) => {
                const isCompleted = progress.completedVideos?.includes(video._id);
                const isActive = selectedVideo?._id === video._id;
                return (
                  <button
                    key={video._id || `${idx}-${video.title}`}
                    onClick={() => handleVideoPlay(video)}
                    style={{
                      width: '100%',
                      padding: 12,
                      marginBottom: 8,
                      border: isActive ? '2px solid var(--accent-cyan)' : '1px solid var(--border)',
                      background: isActive ? 'var(--accent-cyan)20' : 'var(--bg-secondary)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        minWidth: 24
                      }}>
                        {idx + 1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 500,
                          marginBottom: 4,
                          color: isActive ? 'var(--accent-cyan)' : 'var(--text)'
                        }}>
                          {video.title}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>
                            {video.duration ? `${Math.floor(video.duration / 60)}m` : 'N/A'}
                          </span>
                          {isCompleted && <span style={{ color: 'var(--accent-emerald)' }}>✓</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
