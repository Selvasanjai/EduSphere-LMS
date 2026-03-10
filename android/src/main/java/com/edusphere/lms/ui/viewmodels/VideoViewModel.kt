package com.edusphere.lms.ui.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.edusphere.lms.data.api.RetrofitClient
import com.edusphere.lms.data.models.Video
import com.edusphere.lms.data.models.VideoProgressUpdate
import kotlinx.coroutines.launch

class VideoViewModel(application: Application) : AndroidViewModel(application) {
    
    private val _videos = MutableLiveData<List<Video>>(emptyList())
    val videos: LiveData<List<Video>> = _videos
    
    private val _selectedVideo = MutableLiveData<Video?>(null)
    val selectedVideo: LiveData<Video?> = _selectedVideo
    
    private val _loadingState = MutableLiveData<LoadingState>(LoadingState.Idle)
    val loadingState: LiveData<LoadingState> = _loadingState
    
    private val apiService = RetrofitClient.getApiService()
    
    fun loadCourseVideos(courseId: String) {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.getVideos(courseId)
                _videos.value = response.videos
                _loadingState.value = LoadingState.Success
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to load videos")
            }
        }
    }
    
    fun getVideoById(videoId: String) {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                val video = apiService.getVideo(videoId)
                _selectedVideo.value = video
                _loadingState.value = LoadingState.Success
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to load video")
            }
        }
    }
    
    fun uploadVideo(
        courseId: String,
        title: String,
        description: String,
        videoUrl: String,
        duration: Int
    ) {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                val request = com.edusphere.lms.data.models.AddVideoRequest(
                    title = title,
                    description = description,
                    videoUrl = videoUrl,
                    duration = duration,
                    order = (_videos.value?.size ?: 0) + 1
                )
                
                val response = apiService.uploadVideo(courseId, request)
                _loadingState.value = LoadingState.Success
                
                // Reload videos
                loadCourseVideos(courseId)
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to upload video")
            }
        }
    }
    
    fun updateVideoProgress(videoId: String, progress: Int, duration: Long) {
        viewModelScope.launch {
            try {
                val request = VideoProgressUpdate(
                    progress = progress,
                    timestamp = System.currentTimeMillis()
                )
                
                apiService.updateVideo(videoId, request)
            } catch (e: Exception) {
                // Log error but don't show to user (background operation)
                e.printStackTrace()
            }
        }
    }
    
    fun deleteVideo(courseId: String, videoId: String) {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                apiService.deleteVideo(videoId)
                _loadingState.value = LoadingState.Success
                loadCourseVideos(courseId)
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to delete video")
            }
        }
    }
}
