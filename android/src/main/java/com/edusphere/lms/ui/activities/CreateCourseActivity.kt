package com.edusphere.lms.ui.activities

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import com.edusphere.lms.databinding.ActivityCreateCourseBinding
import com.edusphere.lms.ui.viewmodels.CourseViewModel
import com.edusphere.lms.ui.viewmodels.LoadingState

class CreateCourseActivity : AppCompatActivity() {
    private lateinit var binding: ActivityCreateCourseBinding
    private lateinit var courseViewModel: CourseViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCreateCourseBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        courseViewModel = ViewModelProvider(this).get(CourseViewModel::class.java)
        
        setupUI()
        setupObservers()
    }
    
    private fun setupUI() {
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
        
        binding.createBtn.setOnClickListener {
            createCourse()
        }
    }
    
    private fun setupObservers() {
        courseViewModel.loadingState.observe(this) { state ->
            when (state) {
                is LoadingState.Loading -> {
                    binding.createBtn.isEnabled = false
                    binding.loadingProgressBar.visibility = android.view.View.VISIBLE
                }
                is LoadingState.Success -> {
                    binding.createBtn.isEnabled = true
                    binding.loadingProgressBar.visibility = android.view.View.GONE
                    Toast.makeText(this, "Course created successfully", Toast.LENGTH_SHORT).show()
                    finish()
                }
                is LoadingState.Error -> {
                    binding.createBtn.isEnabled = true
                    binding.loadingProgressBar.visibility = android.view.View.GONE
                    Toast.makeText(this, state.message, Toast.LENGTH_SHORT).show()
                }
                else -> {}
            }
        }
    }
    
    private fun createCourse() {
        val title = binding.titleInput.text.toString().trim()
        val description = binding.descriptionInput.text.toString().trim()
        val category = binding.categoryInput.text.toString().trim()
        
        if (title.isEmpty() || description.isEmpty()) {
            Toast.makeText(this, "Title and description are required", Toast.LENGTH_SHORT).show()
            return
        }
        
        courseViewModel.createCourse(title, description, category.ifEmpty { null })
    }
}
