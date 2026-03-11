# 🚀 Render.com Backend Setup Guide

## 📋 Step-by-Step Instructions

### Step 1: Create Render Account
1. Go to [https://dashboard.render.com/](https://dashboard.render.com/)
2. Click **"Sign Up"**
3. Choose **"Sign up with GitHub"** (Recommended)
4. Authorize Render to access your GitHub repositories
5. Verify your email if required

### Step 2: Connect Your Repository
1. After signing in, click **"New +"** in the dashboard
2. Select **"Web Service"**
3. Click **"Connect a repository"**
4. Find and select **"EduSphere-LMS"** from your repositories
5. Click **"Connect"**

### Step 3: Configure Web Service
Fill in the following configuration:

#### Basic Settings
- **Name**: `edusphere-backend`
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt, Singapore)
- **Branch**: `master`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Advanced Settings
- **Instance Type**: `Free` (to start, can upgrade later)
- **Health Check Path**: `/api/health`

### Step 4: Add Environment Variables
Add these environment variables in the "Environment" section:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://edusphere_user:YOUR_PASSWORD@edusphere.xxxxx.mongodb.net/edusphere?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_change_this_in_production_make_it_long_and_random_123456789
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

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait for the deployment to complete (2-3 minutes)
3. You'll see logs showing the build and deployment process

### Step 6: Get Your Backend URL
After deployment succeeds:
1. Copy your backend URL (e.g., `https://edusphere-backend.onrender.com`)
2. Test it by visiting: `https://edusphere-backend.onrender.com/api/health`
3. You should see: `{"status":"EduSphere API Running ✅","timestamp":"..."}`

## 🗄️ MongoDB Atlas Setup (Required)

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"**
3. Sign up with Google/GitHub or email
4. Verify your email

### Step 2: Create Free Cluster
1. Click **"Build a Database"**
2. Choose **"M0 Sandbox"** (FREE)
3. Cloud Provider: Choose any (AWS, GCP, Azure)
4. Region: Choose closest to your Render region
5. Cluster Name: `EduSphere`
6. Click **"Create Cluster"**

### Step 3: Create Database User
1. Go to **"Database Access"** → **"Add New Database User"**
2. Username: `edusphere_user`
3. Password: Generate strong password (save it!)
4. Privileges: **Read and write to any database**
5. Click **"Create User"**

### Step 4: Configure Network Access
1. Go to **"Network Access"** → **"Add IP Address"**
2. Choose **"Allow Access from Anywhere"** (0.0.0.0/0)
3. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **"Database"** → **"Connect"** → **"Connect your application"**
2. Driver: **Node.js**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Replace `<dbname>` with `edusphere`

**Example:**
```
mongodb+srv://edusphere_user:YOUR_STRONG_PASSWORD@edusphere.xxxxx.mongodb.net/edusphere?retryWrites=true&w=majority
```

### Step 6: Update Render Environment
1. Go back to your Render dashboard
2. Click on your service → **"Environment"**
3. Update the `MONGO_URI` with your actual connection string
4. Click **"Save Changes"**
5. Wait for automatic redeployment

## 🔧 Update Frontend API Configuration

### Step 1: Get Your Backend URL
From Render dashboard, copy your service URL (e.g., `https://edusphere-backend.onrender.com`)

### Step 2: Update API Configuration
Edit `frontend/src/api.js`:

```javascript
// Global API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://edusphere-backend.onrender.com/api'  // Your Render URL
  : 'http://localhost:5000/api';

export default API_BASE_URL;
```

### Step 3: Deploy Frontend Changes
```bash
cd frontend
npm run deploy
```

## ✅ Testing Your Setup

### Step 1: Test Backend
Visit: `https://edusphere-backend.onrender.com/api/health`
Expected response:
```json
{
  "status": "EduSphere API Running ✅",
  "timestamp": "2024-03-11T..."
}
```

### Step 2: Test Frontend
Visit: `https://selvasanjai.github.io/EduSphere-LMS`
- Try to register a new account
- Try to login
- Check browser console for any API errors

### Step 3: Test Full Functionality
1. **Admin Features**: Course management, user management
2. **Staff Features**: Video upload, course management
3. **Student Features**: Course enrollment, certificate viewing

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. "Cannot connect to database"
**Solution**: 
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

#### 2. "CORS error"
**Solution**:
- Verify `CLIENT_URL` matches your GitHub Pages URL exactly
- Check backend logs for CORS errors

#### 3. "Build failed"
**Solution**:
- Check Render build logs
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

#### 4. "API not responding"
**Solution**:
- Check service health: `/api/health`
- Verify environment variables
- Check Render service logs

#### 5. "Frontend not connecting to backend"
**Solution**:
- Verify API_BASE_URL is correct
- Check browser network tab for failed requests
- Ensure backend is deployed and running

## 🎯 Success Indicators

### ✅ Backend is Working When:
- Health endpoint returns success
- Database connection is established
- All API endpoints are accessible
- No CORS errors in browser console

### ✅ Frontend is Working When:
- Login/registration works
- Dashboard loads correctly
- All pages navigate properly
- No API errors in console

### ✅ Full System is Working When:
- Users can register and login
- Admin can manage courses and users
- Staff can upload videos and manage content
- Students can enroll and view certificates

## 🎉 Complete Setup Checklist

### ✅ Render Setup
- [ ] Account created and repository connected
- [ ] Web service configured
- [ ] Environment variables set
- [ ] Backend deployed successfully
- [ ] Health check passing

### ✅ MongoDB Setup
- [ ] Atlas account created
- [ ] Free cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string copied

### ✅ Integration
- [ ] Backend connects to database
- [ ] Frontend connects to backend
- [ ] All features working
- [ ] No errors in logs or console

## 🚀 Next Steps

### After Successful Setup:
1. **Test All Features**: Verify everything works end-to-end
2. **Add Custom Domain**: Configure custom domain if desired
3. **Set Up Monitoring**: Add error tracking and analytics
4. **Scale Up**: Upgrade Render plan if needed for more traffic

### Optional Enhancements:
1. **Custom Domain**: Point your own domain to the frontend
2. **Email Service**: Configure email notifications
3. **File Storage**: Add cloud storage for large files
4. **Analytics**: Add user behavior tracking

---

**🚀 Follow these steps to connect your backend to Render.com!**

**Your EduSphere LMS will be fully hosted and functional!** 🎉
