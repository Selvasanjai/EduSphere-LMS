package com.edusphere.lms.data.api

import com.edusphere.lms.data.models.*
import retrofit2.http.*

interface ApiService {
    
    // Auth endpoints
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse
    
    @POST("/api/auth/register")
    suspend fun register(@Body request: Map<String, String>): AuthResponse
    
    @GET("/api/auth/me")
    suspend fun getMe(): AuthResponse
    
    // Course endpoints
    @GET("/api/courses")
    suspend fun getCourses(
        @Query("category") category: String? = null,
        @Query("level") level: String? = null,
        @Query("search") search: String? = null
    ): CoursesResponse
    
    @GET("/api/courses/{id}")
    suspend fun getCourse(@Path("id") courseId: String): CourseDetailResponse
    
    @POST("/api/courses")
    suspend fun createCourse(@Body request: CreateCourseRequest): CourseDetailResponse
    
    @PATCH("/api/courses/{id}")
    suspend fun updateCourse(
        @Path("id") courseId: String,
        @Body request: Map<String, String>
    ): CourseDetailResponse
    
    // Video endpoints
    @GET("/api/courses/{courseId}/videos")
    suspend fun getVideos(@Path("courseId") courseId: String): VideosResponse
    
    @GET("/api/videos/{videoId}")
    suspend fun getVideo(@Path("videoId") videoId: String): VideoDetailResponse
    
    @POST("/api/courses/{courseId}/videos")
    suspend fun uploadVideo(
        @Path("courseId") courseId: String,
        @Body request: AddVideoRequest
    ): VideoDetailResponse
    
    @PATCH("/api/videos/{videoId}")
    suspend fun updateVideo(
        @Path("videoId") videoId: String,
        @Body request: Map<String, Any>
    ): VideoDetailResponse
    
    @DELETE("/api/videos/{videoId}")
    suspend fun deleteVideo(@Path("videoId") videoId: String)
    
    // Enrollment endpoints
    @POST("/api/enrollments")
    suspend fun enrollCourse(@Body request: Map<String, String>)
    
    @GET("/api/enrollments/student")
    suspend fun getEnrolledCourses(): EnrollmentsResponse
}

data class CourseDetailResponse(
    val success: Boolean,
    val course: Course
)

data class VideoDetailResponse(
    val success: Boolean,
    val record: Video
)

data class EnrollmentsResponse(
    val success: Boolean,
    val enrollments: List<Enrollment>
)

data class Enrollment(
    @SerializedName("_id")
    val id: String,
    val studentId: String,
    val courseId: String,
    val enrolledAt: String,
    val progress: Int = 0,
    val completed: Boolean = false,
    val attendancePercentage: Double = 0.0
)
