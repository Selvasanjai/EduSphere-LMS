package com.edusphere.lms.ui.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.edusphere.lms.databinding.ActivityLoginBinding
import com.edusphere.lms.ui.viewmodels.AuthViewModel
import com.edusphere.lms.ui.viewmodels.AuthState

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private lateinit var authViewModel: AuthViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        // Initialize ViewModel
        authViewModel = ViewModelProvider(this).get(AuthViewModel::class.java)
        
        // Check if already logged in
        if (authViewModel.isLoggedIn()) {
            navigateToDashboard(authViewModel.getUserRole() ?: "student")
            return
        }
        
        setupUI()
        setupObservers()
    }
    
    private fun setupUI() {
        // Password visibility toggle
        binding.passwordToggle.setOnCheckedChangeListener { _, isChecked ->
            binding.passwordInput.inputType = if (isChecked) {
                android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            } else {
                android.text.InputType.TYPE_CLASS_TEXT
            }
        }
        
        // Login button
        binding.loginBtn.setOnClickListener {
            performLogin()
        }
        
        // Register link
        binding.registerLink.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }
    
    private fun setupObservers() {
        authViewModel.authState.observe(this) { state ->
            when (state) {
                is AuthState.Loading -> {
                    binding.loginBtn.isEnabled = false
                    binding.loadingProgressBar.visibility = android.view.View.VISIBLE
                }
                is AuthState.LoggedIn -> {
                    binding.loadingProgressBar.visibility = android.view.View.GONE
                    val role = authViewModel.getUserRole() ?: "student"
                    navigateToDashboard(role)
                }
                is AuthState.Error -> {
                    binding.loginBtn.isEnabled = true
                    binding.loadingProgressBar.visibility = android.view.View.GONE
                    binding.passwordError.text = state.message
                    Toast.makeText(this, state.message, Toast.LENGTH_SHORT).show()
                }
                else -> {}
            }
        }
    }
    
    private fun performLogin() {
        binding.emailError.text = ""
        binding.passwordError.text = ""
        
        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString()
        
        when {
            email.isEmpty() -> {
                binding.emailError.text = "Email is required"
            }
            password.isEmpty() -> {
                binding.passwordError.text = "Password is required"
            }
            else -> {
                authViewModel.login(email, password)
            }
        }
    }
    
    private fun navigateToDashboard(role: String) {
        val dashboardClass = when (role.lowercase()) {
            "staff" -> StaffDashboardActivity::class.java
            "admin" -> AdminDashboardActivity::class.java
            else -> StudentDashboardActivity::class.java
        }
        
        startActivity(Intent(this, dashboardClass))
        finish()
    }
}
