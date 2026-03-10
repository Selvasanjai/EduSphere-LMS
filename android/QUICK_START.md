# Android LMS App - Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Android Studio installed
- Backend running on `localhost:5000`
- Emulator or physical device (Android 8.0+)

### Step 1: Open Project in Android Studio
1. Open Android Studio
2. Click **File > Open**
3. Navigate to `EduSphere/android` folder
4. Click **Open**
5. Grade will sync automatically (wait 2-3 minutes)

### Step 2: Configure Backend URL
Edit `android/src/main/java/com/edusphere/lms/data/api/RetrofitClient.kt`:

**For Android Emulator:**
```kotlin
const val BASE_URL = "http://10.0.2.2:5000/api/"
```

**For Physical Device:**
```kotlin
const val BASE_URL = "http://YOUR_COMPUTER_IP:5000/api/"
```
(Replace `YOUR_COMPUTER_IP` with your computer's IP, e.g., `192.168.1.100`)

### Step 3: Build and Run
1. Click **Run > Run 'app'** (or press Shift+F10)
2. Select your emulator/device
3. Wait for app to build and install
4. App opens automatically

### Step 4: Test Login
Use these credentials:
- **Email**: `student@test.com`
- **Password**: `password123`

Or create a new account using **Register**.

## Emulator Network Issues?

If "Cannot connect to backend":

### For Emulator:
1. **Restart ADB:**
   ```bash
   adb kill-server
   adb start-server
   ```

2. **Forward port:**
   ```bash
   adb forward tcp:5000 tcp:5000
   ```

3. **Update Base URL:**
   ```kotlin
   // Keep using 10.0.2.2
   const val BASE_URL = "http://10.0.2.2:5000/api/"
   ```

### For Physical Device:
1. Ensure device and computer on same WiFi
2. Find computer IP:
   - **Windows**: Open CMD, run `ipconfig`, find IPv4 Address
   - **Mac/Linux**: Open Terminal, run `ifconfig`, find inet
3. Update Base URL:
   ```kotlin
   const val BASE_URL = "http://192.168.x.x:5000/api/"  // Your IP
   ```

## Build Errors?

### "Cannot resolve symbol"
```bash
./gradlew cleanBuildCache
./gradlew build
```

### "Gradle sync failed"
1. File > Invalidate Caches
2. Restart Android Studio
3. Try sync again

### Missing Dependencies
```bash
./gradlew build --refresh-dependencies
```

## Run on Real Device

1. **Enable USB Debugging:**
   - Settings > Developer Options > USB Debugging (enable)
   - Connect phone via USB

2. **Run app:**
   ```bash
   ./gradlew installDebug
   # or use Run button in Android Studio
   ```

## App Features

### Login Screen
- Email/password authentication
- Register link for new users
- Show/hide password toggle

### Staff Dashboard
- View your courses
- Create new course button
- Click course to view/manage videos

### Course Video List
- List all videos in course
- Play video (green button)
- Add videos (staff only)
- Search/filter coming soon

### Video Player
- Full ExoPlayer integration
- Play/pause controls
- Fullscreen support
- Progress tracking

### Student Dashboard
- View enrolled courses
- Click course to watch videos
- Track progress across courses

## Troubleshooting

### "App keeps crashing"
1. Check Logcat for errors (View > Tool Windows > Logcat)
2. Common causes:
   - Backend not running
   - Wrong API endpoint
   - Missing internet permission

### "Videos won't play"
1. Check internet connection
2. Verify video URL is valid
3. For YouTube, use standard share link format
4. Check ExoPlayer logs

### "Can't create course"
1. Ensure logged in as staff (role: "staff")
2. Check all fields are filled
3. Check backend logs for errors

### "Progress not saving"
1. App writes to SharedPreferences locally
2. Check network connectivity
3. Verify backend is receiving requests
4. Check backend database

## Architecture Overview

```
App Startup
    ↓
LoginActivity
    ↓ (User logs in)
AuthViewModel (calls API)
    ↓ (Save token to SharedPreferences)
Dashboard Activity (Staff/Student/Admin)
    ↓ (Load courses)
StaffDashboardActivity
    ↓
CourseVideoListActivity
    ↓
VideoPlayerActivity (ExoPlayer)
```

## File Structure Explained

```
app/
├── java/com/edusphere/lms/
│   ├── ui/activities/          ← Your screens (Activities)
│   ├── ui/adapters/            ← List UI (RecyclerView Adapters)
│   ├── ui/viewmodels/          ← Data & Logic (MVVM)
│   └── data/
│       ├── api/                ← Network calls (Retrofit)
│       └── models/             ← Data classes (Kotlin data types)
└── res/
    ├── layout/                 ← XML UI files
    ├── values/strings.xml      ← Text strings
    └── drawable/               ← Images/icons
```

## Key Concepts

### ViewModel (Data Layer)
Manages data and business logic:
```kotlin
// Get data from ViewModel
authViewModel.authState.observe(this) { state ->
    // Update UI when data changes
}

// Request data
courseViewModel.loadCourses()
```

### Activity (UI Layer)
Display screens and handle user interaction:
```kotlin
// Activity displays UI
binding.loginBtn.setOnClickListener {
    // Call ViewModel when user clicks
    authViewModel.login(email, password)
}
```

### Retrofit (Network Layer)
Makes API calls:
```kotlin
// ViewModel uses Retrofit to call backend
val response = apiService.login(request)
```

## Next Steps

1. **Customize Colors:**
   - Edit `res/values/colors.xml`
   - Update toolbar/button colors

2. **Add More Courses:**
   - Run `curl -X POST localhost:5000/api/courses ...` to create test courses

3. **Enable Notifications:**
   - Add Firebase Cloud Messaging
   - Show alerts when new assignments posted

4. **Add Offline Mode:**
   - Use Room database to cache courses
   - Sync when internet returns

## More Resources

- [Kotlin Documentation](https://kotlinlang.org/docs/)
- [Android Developer Guide](https://developer.android.com/)
- [ExoPlayer Guide](https://exoplayer.dev/)
- [Retrofit Guide](https://square.github.io/retrofit/)
- [LiveData Guide](https://developer.android.com/topic/libraries/architecture/livedata)

## Support

Having issues? Check:
1. Backend is running on port 5000
2. API endpoint is correct (10.0.2.2 for emulator)
3. Gradle build completed without errors
4. Check Logcat for error messages

---

**Ready to learn? Let's code! 📱**
