package com.edusphere.lms.ui.activities

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import com.edusphere.lms.databinding.ActivityCourseVideoListBinding
import com.edusphere.lms.data.models.Video
import com.edusphere.lms.ui.adapters.VideoAdapter
import com.edusphere.lms.ui.viewmodels.VideoViewModel
import com.edusphere.lms.ui.viewmodels.LoadingState

class CourseVideoListActivity : AppCompatActivity() {
    private lateinit var binding: ActivityCourseVideoListBinding
    private lateinit var courseId: String
    private lateinit var userRole: String
    private lateinit var videoViewModel: VideoViewModel
    private lateinit var videoAdapter: VideoAdapter
    private val videos = mutableListOf<Video>()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCourseVideoListBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        courseId = intent.getStringExtra("course_id") ?: return
        userRole = intent.getStringExtra("user_role") ?: "student"
        
        videoViewModel = ViewModelProvider(this).get(VideoViewModel::class.java)
        
        setupUI()
        setupRecyclerView()
        setupObservers()
        loadVideos()
    }
    
    private fun setupUI() {
        binding.toolbar.title = intent.getStringExtra("course_title") ?: "Course Videos"
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
        
        // Show add video button only for staff
        if (userRole == "staff") {
            binding.addVideoBtn.visibility = android.view.View.VISIBLE
            binding.addVideoBtn.setOnClickListener {
                val intent = Intent(this, AddVideoActivity::class.java).apply {
                    putExtra("course_id", courseId)
                }
                startActivity(intent)
            }
        } else {
            binding.addVideoBtn.visibility = android.view.View.GONE
        }
    }
    
    private fun setupRecyclerView() {
        videoAdapter = VideoAdapter(videos) { video ->
            val intent = Intent(this, VideoPlayerActivity::class.java).apply {
                putExtra("video_id", video.id)
                putExtra("video_url", video.videoUrl)
                putExtra("video_title", video.title)
                putExtra("course_id", courseId)
            }
            startActivity(intent)
        }
        
        binding.videosRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@CourseVideoListActivity)
            adapter = videoAdapter
        }
    }
    
    private fun setupObservers() {
        videoViewModel.videos.observe(this) { videoList ->
            videos.clear()
            videos.addAll(videoList)
            videoAdapter.notifyDataSetChanged()
            
            if (videos.isEmpty()) {
                binding.emptyState.visibility = android.view.View.VISIBLE
            } else {
                binding.emptyState.visibility = android.view.View.GONE
            }
        }
        
        videoViewModel.loadingState.observe(this) { state ->
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
    
    private fun loadVideos() {
        videoViewModel.loadCourseVideos(courseId)
    }
}
