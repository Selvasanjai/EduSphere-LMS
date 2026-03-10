package com.edusphere.lms.ui.activities

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.edusphere.lms.databinding.ActivityStaffDashboardBinding

class AdminDashboardActivity : AppCompatActivity() {
    private lateinit var binding: ActivityStaffDashboardBinding
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityStaffDashboardBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        binding.toolbar.title = "Admin Dashboard"
    }
}
