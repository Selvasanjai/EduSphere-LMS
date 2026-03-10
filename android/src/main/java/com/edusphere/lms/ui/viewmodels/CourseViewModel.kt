package com.edusphere.lms.ui.viewmodels

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.edusphere.lms.data.api.RetrofitClient
import com.edusphere.lms.data.models.Course
import kotlinx.coroutines.launch

class CourseViewModel(application: Application) : AndroidViewModel(application) {
    
    private val _courses = MutableLiveData<List<Course>>(emptyList())
    val courses: LiveData<List<Course>> = _courses
    
    private val _selectedCourse = MutableLiveData<Course?>(null)
    val selectedCourse: LiveData<Course?> = _selectedCourse
    
    private val _loadingState = MutableLiveData<LoadingState>(LoadingState.Idle)
    val loadingState: LiveData<LoadingState> = _loadingState
    
    private val apiService = RetrofitClient.getApiService()
    
    fun loadCourses() {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.getCourses()
                _courses.value = response.courses
                _loadingState.value = LoadingState.Success
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to load courses")
            }
        }
    }
    
    fun loadEnrolledCourses() {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                val response = apiService.getEnrolledCourses()
                _courses.value = response.courses
                _loadingState.value = LoadingState.Success
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to load enrolled courses")
            }
        }
    }
    
    fun getCourseById(courseId: String) {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                val course = apiService.getCourse(courseId)
                _selectedCourse.value = course
                _loadingState.value = LoadingState.Success
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to load course")
            }
        }
    }
    
    fun createCourse(
        title: String,
        description: String,
        category: String?
    ) {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                val course = Course(
                    id = "",
                    title = title,
                    description = description,
                    staffId = "",
                    videoCount = 0,
                    published = false,
                    category = category,
                    createdAt = System.currentTimeMillis()
                )
                
                val response = apiService.createCourse(
                    com.edusphere.lms.data.models.CreateCourseRequest(
                        title = title,
                        description = description,
                        category = category
                    )
                )
                
                _selectedCourse.value = response.course
                _loadingState.value = LoadingState.Success
                
                // Reload courses list
                loadCourses()
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to create course")
            }
        }
    }
    
    fun enrollCourse(courseId: String) {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                apiService.enrollCourse(courseId)
                _loadingState.value = LoadingState.Success
                loadEnrolledCourses()
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to enroll course")
            }
        }
    }
    
    fun updateCourse(courseId: String, title: String, description: String) {
        _loadingState.value = LoadingState.Loading
        viewModelScope.launch {
            try {
                val updatedCourse = Course(
                    id = courseId,
                    title = title,
                    description = description,
                    staffId = _selectedCourse.value?.staffId ?: "",
                    videoCount = _selectedCourse.value?.videoCount ?: 0,
                    published = _selectedCourse.value?.published ?: false,
                    category = _selectedCourse.value?.category,
                    createdAt = _selectedCourse.value?.createdAt ?: 0
                )
                
                apiService.updateCourse(courseId, updatedCourse)
                _selectedCourse.value = updatedCourse
                _loadingState.value = LoadingState.Success
                loadCourses()
            } catch (e: Exception) {
                _loadingState.value = LoadingState.Error(e.message ?: "Failed to update course")
            }
        }
    }
}

sealed class LoadingState {
    object Idle : LoadingState()
    object Loading : LoadingState()
    object Success : LoadingState()
    data class Error(val message: String) : LoadingState()
}
