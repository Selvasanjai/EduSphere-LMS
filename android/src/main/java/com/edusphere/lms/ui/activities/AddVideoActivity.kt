package com.edusphere.lms.ui.activities

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.edusphere.lms.databinding.ActivityAddVideoBinding
import com.edusphere.lms.data.models.AddVideoRequest

class AddVideoActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAddVideoBinding
    private var selectedVideoUri: Uri? = null
    private var selectedThumbnailUri: Uri? = null
    private lateinit var courseId: String
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddVideoBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        courseId = intent.getStringExtra("course_id") ?: return
        
        setupUI()
    }
    
    private fun setupUI() {
        // YouTube link option
        binding.youtubeRadio.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                binding.uploadVideoLayout.visibility = android.view.View.GONE
                binding.youtubeUrlLayout.visibility = android.view.View.VISIBLE
            }
        }
        
        // Upload video option
        binding.uploadRadio.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                binding.uploadVideoLayout.visibility = android.view.View.VISIBLE
                binding.youtubeUrlLayout.visibility = android.view.View.GONE
            }
        }
        
        // Select video file
        binding.selectVideoBtn.setOnClickListener {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "video/*"
            }
            startActivityForResult(intent, VIDEO_PICK_REQUEST)
        }
        
        // Select thumbnail
        binding.selectThumbnailBtn.setOnClickListener {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "image/*"
            }
            startActivityForResult(intent, THUMBNAIL_PICK_REQUEST)
        }
        
        // Upload video
        binding.uploadBtn.setOnClickListener {
            uploadVideo()
        }
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (resultCode == Activity.RESULT_OK && data != null) {
            when (requestCode) {
                VIDEO_PICK_REQUEST -> {
                    selectedVideoUri = data.data
                    binding.videoStatus.text = "Video selected: ${selectedVideoUri?.lastPathSegment}"
                }
                THUMBNAIL_PICK_REQUEST -> {
                    selectedThumbnailUri = data.data
                    binding.thumbnailStatus.text = "Thumbnail selected: ${selectedThumbnailUri?.lastPathSegment}"
                }
            }
        }
    }
    
    private fun uploadVideo() {
        val title = binding.titleInput.text.toString().trim()
        val description = binding.descriptionInput.text.toString().trim()
        val durationStr = binding.durationInput.text.toString().trim()
        
        if (title.isEmpty() || durationStr.isEmpty()) {
            Toast.makeText(this, "Please fill all required fields", Toast.LENGTH_SHORT).show()
            return
        }
        
        val duration = durationStr.toIntOrNull() ?: 0
        val videoUrl = if (binding.youtubeRadio.isChecked) {
            binding.youtubeUrlInput.text.toString().trim()
        } else {
            selectedVideoUri?.toString() ?: ""
        }
        
        if (videoUrl.isEmpty()) {
            Toast.makeText(this, "Please provide video URL or select file", Toast.LENGTH_SHORT).show()
            return
        }
        
        // TODO: Upload video using ViewModel
        val request = AddVideoRequest(
            title = title,
            description = description,
            videoUrl = videoUrl,
            duration = duration,
            order = 1
        )
        
        Toast.makeText(this, "Uploading video...", Toast.LENGTH_SHORT).show()
        // uploadVideoWithRequest(request)
    }
    
    companion object {
        private const val VIDEO_PICK_REQUEST = 101
        private const val THUMBNAIL_PICK_REQUEST = 102
    }
}
