package com.edusphere.lms.ui.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.edusphere.lms.data.models.Course
import com.edusphere.lms.databinding.ItemCourseBinding

class CourseAdapter(
    private val courses: List<Course>,
    private val onCourseClick: (Course) -> Unit
) : RecyclerView.Adapter<CourseAdapter.CourseViewHolder>() {
    
    inner class CourseViewHolder(private val binding: ItemCourseBinding) :
        RecyclerView.ViewHolder(binding.root) {
        
        fun bind(course: Course) {
            binding.courseTitle.text = course.title
            binding.courseDescription.text = course.description
            binding.videoCount.text = "${course.videoCount} videos"
            
            binding.root.setOnClickListener {
                onCourseClick(course)
            }
        }
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CourseViewHolder {
        val binding = ItemCourseBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return CourseViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: CourseViewHolder, position: Int) {
        holder.bind(courses[position])
    }
    
    override fun getItemCount() = courses.size
}
