package com.edusphere.lms.ui.viewmodels

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.edusphere.lms.data.api.RetrofitClient
import com.edusphere.lms.data.models.AuthResponse
import com.edusphere.lms.data.models.LoginRequest
import com.edusphere.lms.data.models.User
import kotlinx.coroutines.launch

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    
    private val _authState = MutableLiveData<AuthState>(AuthState.Idle)
    val authState: LiveData<AuthState> = _authState
    
    private val _currentUser = MutableLiveData<User?>(null)
    val currentUser: LiveData<User?> = _currentUser
    
    private val sharedPref = application.getSharedPreferences("auth", Context.MODE_PRIVATE)
    private val apiService = RetrofitClient.getApiService()
    
    init {
        // Check if user is already logged in
        val token = sharedPref.getString("token", null)
        if (!token.isNullOrEmpty()) {
            _authState.value = AuthState.LoggedIn
            loadCurrentUser()
        }
    }
    
    fun login(email: String, password: String) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            try {
                val request = LoginRequest(email, password)
                val response = apiService.login(request)
                
                // Save token
                sharedPref.edit().apply {
                    putString("token", response.token)
                    putString("userId", response.user.id)
                    putString("userRole", response.user.role)
                    apply()
                }
                
                _currentUser.value = response.user
                _authState.value = AuthState.LoggedIn
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Login failed")
            }
        }
    }
    
    fun register(
        fullName: String,
        email: String,
        password: String,
        role: String
    ) {
        _authState.value = AuthState.Loading
        viewModelScope.launch {
            try {
                val user = User(
                    id = "",
                    name = fullName,
                    email = email,
                    role = role,
                    profileUrl = "",
                    enrolledCourses = emptyList(),
                    createdAt = System.currentTimeMillis()
                )
                
                // TODO: Call register endpoint
                // val response = apiService.register(user, password)
                
                _authState.value = AuthState.Registered
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Registration failed")
            }
        }
    }
    
    fun logout() {
        sharedPref.edit().apply {
            remove("token")
            remove("userId")
            remove("userRole")
            apply()
        }
        _currentUser.value = null
        _authState.value = AuthState.LoggedOut
    }
    
    private fun loadCurrentUser() {
        viewModelScope.launch {
            try {
                val user = apiService.getMe()
                _currentUser.value = user
            } catch (e: Exception) {
                // Token might be invalid
                logout()
            }
        }
    }
    
    fun isLoggedIn(): Boolean {
        return sharedPref.getString("token", null) != null
    }
    
    fun getUserRole(): String? {
        return sharedPref.getString("userRole", null)
    }
}

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    object LoggedIn : AuthState()
    object LoggedOut : AuthState()
    object Registered : AuthState()
    data class Error(val message: String) : AuthState()
}
