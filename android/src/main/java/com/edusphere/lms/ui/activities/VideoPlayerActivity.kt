package com.edusphere.lms.ui.activities

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import com.edusphere.lms.databinding.ActivityVideoPlayerBinding
import android.widget.Toast

class VideoPlayerActivity : AppCompatActivity() {
    private lateinit var binding: ActivityVideoPlayerBinding
    private var exoPlayer: ExoPlayer? = null
    private lateinit var videoUrl: String
    private lateinit var videoId: String
    private lateinit var courseId: String
    private var videoTitle: String = ""
    private var lastPlaybackPosition: Long = 0
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityVideoPlayerBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        videoId = intent.getStringExtra("video_id") ?: return
        videoUrl = intent.getStringExtra("video_url") ?: return
        videoTitle = intent.getStringExtra("video_title") ?: "Video"
        courseId = intent.getStringExtra("course_id") ?: return
        
        binding.videoTitle.text = videoTitle
        binding.toolbar.setNavigationOnClickListener { onBackPressed() }
        
        initializePlayer()
    }
    
    private fun initializePlayer() {
        exoPlayer = ExoPlayer.Builder(this).build().apply {
            setMediaItem(MediaItem.fromUri(videoUrl))
            prepare()
            
            // Add listener for playback progress
            addListener(object : Player.Listener {
                override fun onPlaybackStateChanged(playbackState: Int) {
                    when (playbackState) {
                        Player.STATE_READY -> {
                            binding.loadingProgressBar.visibility = android.view.View.GONE
                        }
                        Player.STATE_BUFFERING -> {
                            binding.loadingProgressBar.visibility = android.view.View.VISIBLE
                        }
                        Player.STATE_ENDED -> {
                            // Video finished - mark as complete
                            saveVideoProgress(100)
                            Toast.makeText(
                                this@VideoPlayerActivity,
                                "Video completed!",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }
                }
            })
        }
        
        binding.playerView.player = exoPlayer
    }
    
    private fun saveVideoProgress(progress: Int) {
        // TODO: Save progress to backend using ViewModel
        // Retrofit call to /api/videos/{videoId}/progress
    }
    
    override fun onPause() {
        super.onPause()
        exoPlayer?.let {
            lastPlaybackPosition = it.currentPosition
            // Save progress when paused
            val progressPercent = if (it.duration > 0) {
                ((it.currentPosition.toFloat() / it.duration) * 100).toInt()
            } else {
                0
            }
            saveVideoProgress(progressPercent)
        }
    }
    
    override fun onResume() {
        super.onResume()
        exoPlayer?.let {
            if (lastPlaybackPosition > 0) {
                it.seekTo(lastPlaybackPosition)
            }
            it.play()
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        exoPlayer?.release()
        exoPlayer = null
    }
}
