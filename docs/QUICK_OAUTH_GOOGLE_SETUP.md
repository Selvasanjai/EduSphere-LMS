# 🔑 Google OAuth Setup - Quick Guide

**Status**: Google OAuth not configured yet
**Prerequisites**: Gmail account

## ⚡ 3-Minute Quick Setup

### Step 1: Get Google OAuth Credentials (2 minutes)

1. **Open** → https://console.cloud.google.com/
2. **Create New Project** (top left):
   - Project name: `EduSphere`
   - Click "Create"
   - Wait for notification ✓

3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search: `Google+ API`
   - Click "Enable"

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth Client ID"
   - Select: "Web application"
   - Fill in:
     - **Name**: `EduSphere OAuth`
     - **JavaScript origins**:
       ```
       http://localhost:3000
       http://localhost
       ```
     - **Redirect URIs**:
       ```
       http://localhost:3000/login?provider=google
       http://localhost:3000/login
       ```

5. **Copy Your Credentials**:
   - You'll see a popup with:
     ```
     Client ID: YOUR_CLIENT_ID
     Client Secret: YOUR_CLIENT_SECRET
     ```
   - **Save these!** (Copy them somewhere safe)

---

### Step 2: Add Credentials to Your App (1 minute)

**In your project folder**, edit `frontend/.env.local`:

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
REACT_APP_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
```

Replace `YOUR_CLIENT_ID` with the value from Step 1.

**Also** edit `backend/.env`:

```
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3000/login?provider=google
```

---

### Step 3: Restart App (30 seconds)

**Backend**:
```bash
cd backend
npm install axios  # if not already installed
npm start
```

**Frontend** (new terminal):
```bash
cd frontend
npm start
```

---

## ✅ Test It!

1. Open http://localhost:3000
2. Go to **Login** page
3. You should now see:
   - ✓ Email/Password field
   - ✓ Google "Continue with Google" button
   - ✓ GitHub button

4. Click **"Continue with Google"**
5. Log in with your Gmail
6. You should be redirected to your dashboard!

---

## 🐛 Troubleshooting

### "Client ID not configured"
❌ **Not Fixed** - You skipped Step 2 (adding to .env.local)
✅ **Fix**: Add `REACT_APP_GOOGLE_CLIENT_ID=YOUR_ID` to frontend/.env.local and restart

### "Redirect URI mismatch"
❌ **Not Fixed** - Wrong redirect URL in Google Console
✅ **Fix**: Make sure it says: `http://localhost:3000/login?provider=google`

### "Cannot contact identification server"
❌ **Not Fixed** - Backend not running
✅ **Fix**: Start backend: `cd backend && npm start`

### "Still doesn't work"
Try this:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart both servers
3. Refresh page
4. Try again

---

## 📋 Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Created OAuth Credentials
- [ ] Copied Client ID and Secret
- [ ] Added to `frontend/.env.local`
- [ ] Added to `backend/.env`
- [ ] Restarted frontend server
- [ ] Restarted backend server
- [ ] Can see Google button on login page
- [ ] Successfully logged in with Google

---

## 🎯 What Works After Setup

✅ Login with Gmail account  
✅ Automatic account creation  
✅ JWT token generation  
✅ Access to dashboard  
✅ Store login token in browser  

---

## 📞 Still Having Issues?

1. **Check Google Console**:
   - Are JavaScript origins correct?
   - Is redirect URI exactly: `http://localhost:3000/login?provider=google`?

2. **Check Config Files**:
   - Is `frontend/.env.local` saved?
   - Is `backend/.env` saved?

3. **Check Logs**:
   - Backend terminal: Any errors?
   - Browser console (F12): Any errors?

4. **Try Email Login First**:
   - Email/password should work immediately
   - Use that to test your setup while fixing OAuth

---

**For detailed instructions, see:** [OAUTH_SETUP.md](./OAUTH_SETUP.md)
