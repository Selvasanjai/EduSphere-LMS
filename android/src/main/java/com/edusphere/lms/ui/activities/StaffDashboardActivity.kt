package com.edusphere.lms.ui.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.edusphere.lms.databinding.ActivityStaffDashboardBinding
import com.edusphere.lms.ui.adapters.CourseAdapter
import com.edusphere.lms.ui.viewmodels.CourseViewModel
import com.edusphere.lms.ui.viewmodels.LoadingState

class StaffDashboardActivity : AppCompatActivity() {
    private lateinit var binding: ActivityStaffDashboardBinding
    private lateinit var courseViewModel: CourseViewModel
    private lateinit var courseAdapter: CourseAdapter
    private val courses = mutableListOf<com.edusphere.lms.data.models.Course>()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityStaffDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        courseViewModel = ViewModelProvider(this).get(CourseViewModel::class.java)
        
        setupRecyclerView()
        setupObservers()
        setupButtons()
        loadCourses()
    }
    
    private fun setupRecyclerView() {
        courseAdapter = CourseAdapter(courses) { course ->
            val intent = Intent(this, CourseVideoListActivity::class.java).apply {
                putExtra("course_id", course.id)
                putExtra("course_title", course.title)
                putExtra("user_role", "staff")
            }
            startActivity(intent)
        }
        
        binding.coursesRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@StaffDashboardActivity)
            adapter = courseAdapter
        }
    }
    
    private fun setupObservers() {
        courseViewModel.courses.observe(this) { courseList ->
            courses.clear()
            courses.addAll(courseList)
            courseAdapter.notifyDataSetChanged()
            
            if (courses.isEmpty()) {
                binding.emptyState.visibility = android.view.View.VISIBLE
            } else {
                binding.emptyState.visibility = android.view.View.GONE
            }
        }
        
        courseViewModel.loadingState.observe(this) { state ->
            when (state) {
                is LoadingState.Loading -> {
                    binding.loadingProgressBar.visibility = android.view.View.VISIBLE
                }
                is LoadingState.Success -> {
                    binding.loadingProgressBar.visibility = android.view.View.GONE
                }
                is LoadingState.Error -> {
                    binding.loadingProgressBar.visibility = android.view.View.GONE
                    Toast.makeText(this, state.message, Toast.LENGTH_SHORT).show()
                }
                else -> {}
            }
        }
    }
    
    private fun setupButtons() {
        binding.addVideoBtn.setOnClickListener {
            startActivity(Intent(this, CreateCourseActivity::class.java))
        }
        
        binding.toolbar.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                // Add profile click handling
                else -> false
            }
        }
    }
    
    private fun loadCourses() {
        courseViewModel.loadCourses()
    }
}
