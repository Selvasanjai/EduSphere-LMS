# EduSphere Android LMS App

A complete native Android learning management system app built with Kotlin and Jetpack Architecture Components.

## Features

### For Staff
- Create and manage courses
- Upload videos (YouTube URLs or local files)
- Track student progress
- View course analytics

### For Students  
- Browse available courses
- Enroll in courses
- Watch course videos with progress tracking
- Resume watching from previous position
- View attendance records

### For Admin
- Manage all courses and users
- View system analytics
- Generate attendance reports

## Technology Stack

- **Language**: Kotlin
- **Architecture**: MVVM with LiveData
- **Networking**: Retrofit2 + OkHttp
- **Database**: Room (local) + Firebase/MongoDB (cloud)
- **Media**: Media3 (ExoPlayer) for video playback
- **Authentication**: JWT with SharedPreferences
- **Dependency Injection**: Hilt
- **Async**: Coroutines
- **Image Loading**: Glide
- **UI Components**: Material Design 3
- **Minimum SDK**: Android 8.0 (API 26)
- **Target SDK**: Android 14 (API 34)

## Project Structure

```
android/
├── src/main/
│   ├── java/com/edusphere/lms/
│   │   ├── ui/
│   │   │   ├── activities/           # Activity screens
│   │   │   │   ├── LoginActivity
│   │   │   │   ├── RegisterActivity
│   │   │   │   ├── StaffDashboardActivity
│   │   │   │   ├── StudentDashboardActivity
│   │   │   │   ├── AdminDashboardActivity
│   │   │   │   ├── CourseVideoListActivity
│   │   │   │   ├── AddVideoActivity
│   │   │   │   ├── VideoPlayerActivity
│   │   │   │   └── CreateCourseActivity
│   │   │   ├── adapters/             # RecyclerView adapters
│   │   │   │   ├── CourseAdapter
│   │   │   │   └── VideoAdapter
│   │   │   └── viewmodels/           # MVVM ViewModels
│   │   │       ├── AuthViewModel
│   │   │       ├── CourseViewModel
│   │   │       └── VideoViewModel
│   │   ├── data/
│   │   │   ├── models/               # Data classes
│   │   │   │   ├── User.kt
│   │   │   │   ├── Course.kt
│   │   │   │   └── Video.kt
│   │   │   └── api/                  # Network layer
│   │   │       ├── ApiService.kt
│   │   │       └── RetrofitClient.kt
│   │   └── MainActivity
│   └── res/
│       ├── layout/                   # XML layouts
│       ├── values/                   # Colors, strings, styles
│       ├── drawable/                 # App icons and images
│       └── AndroidManifest.xml
└── build.gradle                      # Gradle configuration

```

## Setup Instructions

### Prerequisites
- Android Studio Arctic Fox or later
- Java 11+
- Android SDK 34
- Maven/Gradle

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd android
```

2. **Configure Backend URL**
Edit `RetrofitClient.kt`:
```kotlin
// For emulator
const val BASE_URL = "http://10.0.2.2:5000/api/"

// For physical device (replace with your computer's IP)
// const val BASE_URL = "http://192.168.x.x:5000/api/"
```

3. **Build the project**
```bash
./gradlew build
```

4. **Run the app**
```bash
./gradlew installDebug
# or use Android Studio Run button
```

## API Endpoints

The app communicates with the Node.js backend:

```
Base URL: http://localhost:5000/api

Authentication:
  POST /auth/login - User login
  POST /auth/register - User registration
  GET /auth/me - Get current user

Courses:
  GET /courses - Get all courses
  GET /courses/{id} - Get course details
  POST /courses - Create new course
  PATCH /courses/{id} - Update course
  POST /courses/{id}/enroll - Enroll student

Videos:
  GET /courses/{courseId}/videos - Get course videos
  GET /videos/{id} - Get video details
  POST /courses/{courseId}/videos - Upload video
  PATCH /videos/{id} - Update video
  DELETE /videos/{id} - Delete video
  POST /videos/{id}/progress - Save watch progress
```

## Authentication Flow

1. **Login**
   - User enters email/password
   - AuthViewModel calls apiService.login()
   - Backend returns JWT token + user info
   - Token saved to SharedPreferences
   - User redirected to dashboard by role

2. **Auto-Login** (on app reopen)
   - LoginActivity checks if token exists in SharedPreferences
   - If yes, AuthViewModel automatically loads current user
   - Redirects to appropriate dashboard

3. **Token Injection**
   - AuthInterceptor automatically adds token to all requests
   - Authorization header: `Bearer <token>`

## Data Models

### User
```kotlin
data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String, // "student", "staff", "admin"
    val profileUrl: String?
)
```

### Course
```kotlin
@Entity(tableName = "courses")
data class Course(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val staffId: String,
    val videoCount: Int,
    val published: Boolean,
    val category: String?,
    val createdAt: Long
)
```

### Video
```kotlin
@Entity(tableName = "videos")
data class Video(
    @PrimaryKey val id: String,
    val courseId: String,
    val title: String,
    val description: String,
    val videoUrl: String,
    val duration: Int,
    val order: Int,
    val progress: Int = 0, // 0-100
    val watched: Boolean = false
)
```

## Video Player Features

- **ExoPlayer Integration**: Smooth video playback
- **Progress Tracking**: 
  - Saves playback position when paused
  - Resumes from last position on reopen
  - Syncs progress to backend
- **Adaptive Playback**: Supports multiple video sources
- **Controls**: Play, pause, seek, fullscreen
- **Buffering**: Network buffering with progress indicator

### Supported Video Sources
- YouTube URLs (with youtube-dl or direct links)
- Local uploaded videos (MP4, MKV, WebM)
- HLS streaming

## State Management

### AuthViewModel
```kotlin
// States
AuthState.Idle, Loading, LoggedIn, LoggedOut, Registered, Error

// Observe login status
authViewModel.authState.observe(this) { state ->
    when (state) {
        is AuthState.LoggedIn -> navigateToDashboard()
        is AuthState.Error -> showError(state.message)
    }
}
```

### CourseViewModel
```kotlin
// Observe courses list
courseViewModel.courses.observe(this) { courses ->
    adapter.submitList(courses)
}

// Load courses
courseViewModel.loadCourses()
courseViewModel.createCourse(title, description, category)
```

### VideoViewModel
```kotlin
// View and download progress
videoViewModel.videos.observe(this) { videos ->
    adapter.submitList(videos)
}

// Load videos for a course
videoViewModel.loadCourseVideos(courseId)

// Track video progress
videoViewModel.updateVideoProgress(videoId, progress)
```

## Network Configuration

### OkHttp Configuration
```kotlin
val okHttpClient = OkHttpClient.Builder()
    .connectTimeout(30, TimeUnit.SECONDS)
    .readTimeout(30, TimeUnit.SECONDS)
    .writeTimeout(30, TimeUnit.SECONDS)
    .addInterceptor(AuthInterceptor(context))
    .addInterceptor(HttpLoggingInterceptor())
    .build()
```

### Error Handling
- Network errors show user-friendly messages
- Automatic token refresh on 401
- Fallback to cached data when offline

## Debugging

### Enable Network Logging
```kotlin
val logging = HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY
}
```

### Check API Responses
- Android Studio Logcat filter: `OkHttp`
- Database Inspector: View Room database contents
- Network Profiler: Monitor network traffic

## Common Issues & Solutions

### "Cannot connect to backend"
1. Check backend is running on port 5000
2. For emulator, use `http://10.0.2.2:5000`
3. For device, use your computer's IP address

### "Token expired" on app reopen
- Token saved in SharedPreferences expires after backend timeout
- User needs to log in again
- Future: implement refresh token logic

### Video playback fails
1. Check video URL is accessible
2. For YouTube, ensure link is linkage format
3. Check internet connection
4. View ExoPlayer logs in Logcat

### Realm/Room database issues
- Clear app data: Settings > Apps > EduSphere > Clear Storage
- Rebuild database schema

## Testing

### Unit Tests
```bash
./gradlew test
```

### Instrumentation Tests (on device/emulator)
```bash
./gradlew connectedAndroidTest
```

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Registration with all roles
- [ ] View courses list
- [ ] Enroll in course
- [ ] Play video from course
- [ ] Check progress is saved
- [ ] Resume video from previous position
- [ ] Create new course (staff)
- [ ] Upload video (staff)
- [ ] Logout and re-login

## Performance Optimization

### Image Loading
- Glide automatically caches images
- Low-resolution thumbnails for lists
- Full resolution on-demand

### Video Streaming
- ExoPlayer adaptive bitrate streaming
- Network buffering with Retrofit
- LocalDatabase caching for offline

### Pagination
- Implement for large course/video lists
- Lazy load as user scrolls

## Future Enhancements

A. Real-time Features
- [ ] WebSocket notifications
- [ ] Live class streaming
- [ ] Real-time chat in courses

B. More Functionality
- [ ] Notifications/reminders
- [ ] Comment system on videos
- [ ] Quiz/assignments
- [ ] Certificates

C. Performance
- [ ] Offline mode with sync
- [ ] Background video download
- [ ] Multi-file caching

D. Analytics
- [ ] User engagement tracking
- [ ] Video watch analytics
- [ ] Course completion stats

## Contributing

1. Follow Kotlin conventions
2. Use meaningful variable names
3. Add comments for complex logic
4. Write unit tests for new features
5. Test on both emulator and physical device

## License

MIT License - See LICENSE file

## Support

For issues and questions:
1. Check documentation above
2. Search existing GitHub issues
3. Create new issue with:
   - Device/Android version
   - Steps to reproduce
   - Expected vs actual behavior
   - Relevant logs

---

**Happy Learning! 🎓**
