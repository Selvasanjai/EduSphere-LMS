# MongoDB Atlas Setup for EduSphere

## 🗄️ Free MongoDB Database Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email

### Step 2: Create a Free Cluster
1. Click "Build a Database"
2. Choose **M0 Sandbox** (FREE)
3. Select a cloud provider and region (closest to you)
4. Cluster name: `EduSphere`
5. Click "Create Cluster"

### Step 3: Configure Database Access
1. Go to "Database Access" → "Add New Database User"
2. Username: `edusphere_user`
3. Password: Generate a secure password
4. Click "Create User"

### Step 4: Configure Network Access
1. Go to "Network Access" → "Add IP Address"
2. Choose "Allow Access from Anywhere" (0.0.0.0/0)
3. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → "Connect" → "Connect your application"
2. Choose "Node.js" driver
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with `edusphere`

**Example Connection String:**
```
mongodb+srv://edusphere_user:YOUR_PASSWORD@edusphere.xxxxx.mongodb.net/edusphere?retryWrites=true&w=majority
```

### Step 6: Update Environment Variables
Add this to your `.env` file:
```env
MONGO_URI=mongodb+srv://edusphere_user:YOUR_PASSWORD@edusphere.xxxxx.mongodb.net/edusphere?retryWrites=true&w=majority
```

## 🚀 Deploy Backend to Render

### Step 1: Create Render Account
1. Go to [Render](https://render.com)
2. Sign up with GitHub (free)
3. Authorize access to your EduSphere-LMS repository

### Step 2: Deploy Backend Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `EduSphere-LMS` repository
4. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard, add these environment variables:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://edusphere_user:YOUR_PASSWORD@edusphere.xxxxx.mongodb.net/edusphere?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production_make_it_long_and_random
CLIENT_URL=https://selvasanjai.github.io/EduSphere-LMS
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://edusphere-api.onrender.com`)

## 🌐 Update Frontend API URL

Update `frontend/src/api.js` with your Render backend URL:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://edusphere-api.onrender.com/api'  // Your Render URL
  : 'http://localhost:5000/api';
```

## 🎉 Complete Setup

Your EduSphere LMS is now hosted:
- **Frontend**: https://selvasanjai.github.io/EduSphere-LMS (GitHub Pages)
- **Backend**: https://edusphere-api.onrender.com (Render)
- **Database**: MongoDB Atlas (Free)

## 📱 Access Your Application

1. **Frontend**: Visit your GitHub Pages URL
2. **Login**: Use existing accounts or register new ones
3. **Test**: All features should work including video upload, certificates, etc.

## 🔧 Troubleshooting

### Common Issues:
1. **CORS Error**: Make sure CLIENT_URL matches your GitHub Pages URL
2. **Database Connection**: Verify MongoDB Atlas IP whitelist and credentials
3. **Build Failures**: Check Render logs for specific errors
4. **API Calls**: Verify backend URL is correct and accessible

### Tips:
- Use Render logs to debug backend issues
- Check browser console for frontend errors
- Verify all environment variables are set correctly
- Test both development and production environments
