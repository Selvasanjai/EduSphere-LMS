package com.edusphere.lms.ui.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.edusphere.lms.databinding.ActivityRegisterBinding

class RegisterActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegisterBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupUI()
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
        
        binding.confirmPasswordToggle.setOnCheckedChangeListener { _, isChecked ->
            binding.confirmPasswordInput.inputType = if (isChecked) {
                android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            } else {
                android.text.InputType.TYPE_CLASS_TEXT
            }
        }
        
        // Register button
        binding.registerBtn.setOnClickListener {
            registerUser()
        }
        
        // Login link
        binding.loginLink.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
    
    private fun registerUser() {
        val fullName = binding.fullNameInput.text.toString().trim()
        val email = binding.emailInput.text.toString().trim()
        val password = binding.passwordInput.text.toString()
        val confirmPassword = binding.confirmPasswordInput.text.toString()
        val role = binding.roleSpinner.selectedItem.toString()
        
        // Validation
        when {
            fullName.isEmpty() -> {
                binding.fullNameError.text = "Full name is required"
                return
            }
            email.isEmpty() -> {
                binding.emailError.text = "Email is required"
                return
            }
            password.isEmpty() -> {
                binding.passwordError.text = "Password is required"
                return
            }
            password.length < 6 -> {
                binding.passwordError.text = "Password must be at least 6 characters"
                return
            }
            password != confirmPassword -> {
                binding.confirmPasswordError.text = "Passwords do not match"
                return
            }
        }
        
        // TODO: Call register API via ViewModel
        binding.registerBtn.isEnabled = false
        binding.loadingProgressBar.visibility = android.view.View.VISIBLE
        
        Toast.makeText(this, "Registering account...", Toast.LENGTH_SHORT).show()
        
        // Simulated registration
        Thread {
            Thread.sleep(2000)
            runOnUiThread {
                binding.registerBtn.isEnabled = true
                binding.loadingProgressBar.visibility = android.view.View.GONE
                
                Toast.makeText(this, "Registration successful! Please login.", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, LoginActivity::class.java))
                finish()
            }
        }.start()
    }
}
