# OAuth Setup Guide for EduSphere

This guide explains how to set up Google and GitHub OAuth authentication for EduSphere.

## Prerequisites
- Google Account
- GitHub Account
- Applications already running on `http://localhost:3000` (Frontend) and `http://localhost:5000` (Backend)

---

## 1️⃣ Google OAuth Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on **"Select a Project"** → **"New Project"**
3. Enter project name: `EduSphere`
4. Click **"Create"**
5. Wait for the project to be created (usually takes a minute)

### Step 2: Enable Google+ API
1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### Step 3: Create OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth Consent Screen"**
2. Select **"External"** as User Type
3. Click **"Create"**
4. Fill in the form:
   - **App name**: EduSphere
   - **User support email**: your-email@gmail.com
   - **Developer contact**: your-email@gmail.com
5. Click **"Save and Continue"**
6. On "Scopes" page, click **"Save and Continue"** (defaults are fine)
7. On "Test users" page, add your email and click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

### Step 4: Create OAuth Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth Client ID"**
3. Choose **"Web application"**
4. Fill in the form:
   - **Name**: EduSphere OAuth
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `http://localhost`
   - **Authorized redirect URIs**:
     - `http://localhost:3000/login?provider=google`
     - `http://localhost:3000/login`
5. Click **"Create"**
6. Copy the **Client ID** and **Client Secret**

### Step 5: Update Environment Variables
1. Open `backend/.env` and update:
   ```
   GOOGLE_CLIENT_ID=your_copied_client_id
   GOOGLE_CLIENT_SECRET=your_copied_client_secret
   ```

2. Open `frontend/.env.local` and update:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_copied_client_id
   ```

---

## 2️⃣ GitHub OAuth Setup

### Step 1: Go to GitHub Settings
1. Log in to [GitHub](https://github.com/)
2. Click your **profile icon** (top right) → **"Settings"**
3. Go to **"Developer settings"** (bottom left) → **"OAuth Apps"**
4. Click **"New OAuth App"**

### Step 2: Create OAuth Application
Fill in the OAuth Application form:
- **Application name**: EduSphere
- **Homepage URL**: `http://localhost:3000`
- **Application description**: Learning Management System
- **Authorization callback URL**: `http://localhost:3000/login?provider=github`

Click **"Register application"**

### Step 3: Get Credentials
1. You'll see the **Client ID** on the page
2. Click **"Generate a new client secret"**
3. Copy both **Client ID** and **Client Secret**

### Step 4: Update Environment Variables
1. Open `backend/.env` and update:
   ```
   GITHUB_CLIENT_ID=your_copied_client_id
   GITHUB_CLIENT_SECRET=your_copied_client_secret
   ```

2. Open `frontend/.env.local` and update:
   ```
   REACT_APP_GITHUB_CLIENT_ID=your_copied_client_id
   ```

---

## ✅ Testing OAuth

1. **Restart backend and frontend:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

2. **Test Google Login:**
   - Go to `http://localhost:3000/login`
   - Click **"Continue with Google"**
   - Sign in with your Google account
   - You should be redirected to the dashboard

3. **Test GitHub Login:**
   - Go to `http://localhost:3000/login`
   - Click **"Continue with GitHub"**
   - Authorize the application
   - You should be redirected to the dashboard

---

## 🔍 Troubleshooting

### Issue: "Client ID not configured"
- Ensure `.env.local` file exists in the frontend folder
- Check that `REACT_APP_GOOGLE_CLIENT_ID` and `REACT_APP_GITHUB_CLIENT_ID` are set
- Restart the frontend development server after adding `.env.local`

### Issue: Redirect URI mismatch
- Make sure the redirect URI in OAuth console matches exactly:
  - Should be: `http://localhost:3000/login?provider=google` (for Google)
  - Should be: `http://localhost:3000/login?provider=github` (for GitHub)
- Clear browser cookies and try again

### Issue: "CORS error"
- Ensure `CORS` is enabled in `backend/server.js`
- Check that `CLIENT_URL` in `backend/.env` is set to `http://localhost:3000`

### Issue: Token not being saved
- Check browser console for errors
- Verify the token is being returned from backend
- Check that `localStorage` is not being blocked

---

## 📝 Environment Variables Checklist

### Backend (`backend/.env`)
```
✅ PORT=5000
✅ MONGO_URI=<your_mongodb_connection_string>
✅ JWT_SECRET=<random_secret_key>
✅ CLIENT_URL=http://localhost:3000
✅ GOOGLE_CLIENT_ID=<from_google_cloud>
✅ GOOGLE_CLIENT_SECRET=<from_google_cloud>
✅ GITHUB_CLIENT_ID=<from_github>
✅ GITHUB_CLIENT_SECRET=<from_github>
```

### Frontend (`frontend/.env.local`)
```
✅ REACT_APP_API_URL=http://localhost:5000/api
✅ REACT_APP_GOOGLE_CLIENT_ID=<from_google_cloud>
✅ REACT_APP_GITHUB_CLIENT_ID=<from_github>
```

---

## 🚀 Production Setup

For production deployment, update the URLs:

### Google OAuth
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com/login?provider=google`

### GitHub OAuth
- Homepage URL: `https://yourdomain.com`
- Authorization callback URL: `https://yourdomain.com/login?provider=github`

Update environment variables accordingly with your production domain.

---

## ✨ What Happens Next

When a user signs in via Google/GitHub:
1. User clicks the OAuth button
2. They're redirected to Google/GitHub login
3. After authorization, they're sent back with an authorization code
4. Frontend sends the code to backend `/api/auth/google` or `/api/auth/github`
5. Backend exchanges the code for user information
6. Backend creates a JWT token and returns it
7. User is logged in and redirected to the appropriate dashboard

Existing users get linked to their OAuth account, and new users are auto-registered as students!
