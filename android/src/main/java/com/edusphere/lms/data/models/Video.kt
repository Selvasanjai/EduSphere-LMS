package com.edusphere.lms.data.models

import com.google.gson.annotations.SerializedName
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "videos")
data class Video(
    @PrimaryKey
    @SerializedName("_id")
    val id: String,
    @SerializedName("courseId")
    val courseId: String,
    val title: String,
    val description: String = "",
    @SerializedName("videoUrl")
    val url: String,
    val duration: Int = 0, // in seconds
    val order: Int = 0,
    val thumbnail: String = "",
    val uploadDate: String = "",
    var progress: Int = 0, // 0-100%
    var isWatched: Boolean = false
)

data class AddVideoRequest(
    val title: String,
    val description: String,
    val videoUrl: String,
    val duration: Int,
    val order: Int = 1,
    val thumbnail: String = ""
)

data class VideosResponse(
    val success: Boolean,
    val records: List<Video>
)

data class VideoProgressUpdate(
    val videoId: String,
    val progress: Int,
    val isWatched: Boolean
)
