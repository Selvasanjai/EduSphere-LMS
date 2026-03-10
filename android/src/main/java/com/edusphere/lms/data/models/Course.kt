package com.edusphere.lms.data.models

import com.google.gson.annotations.SerializedName
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "courses")
data class Course(
    @PrimaryKey
    @SerializedName("_id")
    val id: String,
    val title: String,
    val description: String,
    val category: String,
    val thumbnail: String = "",
    val duration: Int = 0,
    val totalVideos: Int = 0,
    @SerializedName("staffId")
    val staffId: String,
    val isPublished: Boolean = false,
    val isApproved: Boolean = false,
    val level: String = "beginner",
    val tags: List<String> = emptyList(),
    val enrollmentCount: Int = 0,
    val rating: Double = 0.0,
    val createdAt: String = "",
    val updatedAt: String = ""
)

data class CreateCourseRequest(
    val title: String,
    val description: String,
    val category: String,
    val thumbnail: String = "",
    val level: String = "beginner"
)

data class CoursesResponse(
    val success: Boolean,
    val count: Int,
    val courses: List<Course>
)
