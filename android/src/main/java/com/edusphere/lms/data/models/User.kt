package com.edusphere.lms.data.models

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val email: String,
    val role: String, // admin, staff, student
    val avatar: String = "",
    val college: String = "",
    val department: String = "",
    val isVerified: Boolean = false,
    val isApproved: Boolean = false
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class AuthResponse(
    val success: Boolean,
    val token: String,
    val user: User
)
