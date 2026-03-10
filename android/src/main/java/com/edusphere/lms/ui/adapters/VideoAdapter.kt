package com.edusphere.lms.ui.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.ProgressBar
import androidx.recyclerview.widget.RecyclerView
import com.edusphere.lms.data.models.Video
import com.edusphere.lms.databinding.ItemVideoBinding
import kotlin.math.roundToInt

class VideoAdapter(
    private val videos: List<Video>,
    private val onVideoClick: (Video) -> Unit
) : RecyclerView.Adapter<VideoAdapter.VideoViewHolder>() {
    
    inner class VideoViewHolder(private val binding: ItemVideoBinding) :
        RecyclerView.ViewHolder(binding.root) {
        
        fun bind(video: Video) {
            binding.videoTitle.text = video.title
            binding.videoDescription.text = video.description
            binding.videoDuration.text = formatDuration(video.duration)
            binding.videoProgress.progress = video.progress
            binding.progressText.text = "${video.progress}%"
            
            // Show watched indicator
            if (video.watched) {
                binding.watchedBadge.visibility = android.view.View.VISIBLE
            } else {
                binding.watchedBadge.visibility = android.view.View.GONE
            }
            
            binding.root.setOnClickListener {
                onVideoClick(video)
            }
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VideoViewHolder {
        val binding = ItemVideoBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return VideoViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: VideoViewHolder, position: Int) {
        holder.bind(videos[position])
    }
    
    override fun getItemCount() = videos.size
    
    private fun formatDuration(seconds: Int): String {
        val minutes = seconds / 60
        val remainingSeconds = seconds % 60
        return String.format("%d:%02d", minutes, remainingSeconds)
    }
}
