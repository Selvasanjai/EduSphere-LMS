# ⚡ Render Backend - Quick Start

## 🚀 5-Minute Setup

### 1. Go to Render Dashboard
**URL**: https://dashboard.render.com/

### 2. Connect Repository
1. **New +** → **Web Service**
2. **Connect repository** → **EduSphere-LMS**
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`

### 3. Add Environment Variables
Copy-paste these (update MONGO_URI after MongoDB setup):

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://edusphere_user:PASSWORD@cluster.mongodb.net/edusphere
JWT_SECRET=your_super_secure_jwt_secret_key_123456789
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

### 4. MongoDB Atlas (2 minutes)
1. Go to https://www.mongodb.com/cloud/atlas
2. **Build a Database** → **M0 Sandbox** (FREE)
3. **Database Access** → Add user: `edusphere_user`
4. **Network Access** → **Allow from Anywhere** (0.0.0.0/0)
5. **Connect** → Copy connection string
6. Update `MONGO_URI` in Render

### 5. Deploy & Test
1. **Create Web Service** in Render
2. Wait 2-3 minutes for deployment
3. Test: `https://your-service.onrender.com/api/health`
4. Update frontend API URL with your Render URL

## ✅ Success Check

### Backend Health Check
Visit: `https://your-service.onrender.com/api/health`
Should see: `{"status":"EduSphere API Running ✅"}`

### Frontend Integration
Update `frontend/src/api.js`:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-service.onrender.com/api'
  : 'http://localhost:5000/api';
```

Deploy frontend: `cd frontend && npm run deploy`

## 🎯 URLs After Setup

- **Frontend**: https://selvasanjai.github.io/EduSphere-LMS
- **Backend**: https://your-service.onrender.com
- **Database**: MongoDB Atlas (free tier)

## 🚨 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Database error | Check MONGO_URI and IP whitelist |
| CORS error | Verify CLIENT_URL matches GitHub Pages |
| Build failed | Check Render logs |
| API not working | Test health endpoint |

---

**🚀 Your backend will be live in 5 minutes!**

**Follow the detailed guide in RENDER_BACKEND_SETUP.md for complete instructions.**
