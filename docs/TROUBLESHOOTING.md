# 🆘 OAuth & Login Troubleshooting Guide

## ❌ "Google Client ID not configured" / "GitHub Client ID not configured"

### Problem
You clicked the OAuth button and got an error message.

### Solution

**Option A: Use Email/Password Login (Recommended for now)**
1. Click **"Sign Up"** link on the login page
2. Register a test account with any email and password
3. You can now login with email/password anytime!

**Option B: Set Up OAuth (5-10 minutes)**

#### For Google:
1. Follow the quick setup in `docs/QUICK_OAUTH_SETUP.md` → "Option 2"
2. Copy your Google Client ID
3. Open `frontend/.env.local`
4. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID
5. **Stop and restart the frontend** (`npm start`)
6. Try again!

#### For GitHub:
1. Follow the quick setup in `docs/QUICK_OAUTH_SETUP.md` → "Option 3"
2. Copy your GitHub Client ID
3. Open `frontend/.env.local`
4. Replace `YOUR_GITHUB_CLIENT_ID_HERE` with your actual Client ID
5. **Stop and restart the frontend** (`npm start`)
6. Try again!

---

## ❌ OAuth Button is Disabled or Grayed Out

### Problem
The "Continue with Google" or "Continue with GitHub" buttons aren't clickable.

### Possible Causes & Solutions

**1. Environment file not loaded**
- Open browser DevTools: Press `F12`
- Go to **Console** tab
- Paste: `console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID)`
- If it shows `undefined`, your `.env.local` wasn't loaded

**Fix:**
```bash
# In frontend folder:
npm start
# If that doesn't work, try:
npm run start
```

**2. File doesn't exist**
- Make sure `frontend/.env.local` exists (not `.env` or `.env.example`)
- It should be in the root `frontend` folder

**3. Placeholder values**
- Open `frontend/.env.local`
- Make sure it doesn't have `YOUR_GOOGLE_CLIENT_ID_HERE` or similar text
- Replace with actual Client IDs from Google/GitHub

**4. Browser caching**
- Clear browser cache: `Ctrl+Shift+Delete`
- Close all browser tabs with `localhost:3000`
- Open `localhost:3000` fresh

---

## ❌ OAuth Redirect Loop

### Problem
You click OAuth button, log in on Google/GitHub, then get redirected back to login page again.

### Possible Causes

**1. Redirect URI mismatch**
- Google expected: `http://localhost:3000/login?provider=google`
- But your app is going to: `http://localhost:3000/oauth/callback` (different)

**Fix:**
- Go to Google/GitHub OAuth settings
- Make sure "Authorization callback URL" or "Redirect URI" is set exactly to:
  - Google: `http://localhost:3000/login?provider=google`
  - GitHub: `http://localhost:3000/login?provider=github`

**2. Backend not running**
- Make sure `http://localhost:5000` is accessible
- Check: `npm run dev` in backend folder

**Fix:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev
```

**3. Invalid code from OAuth provider**
- The authorization code expired or was invalid

**Fix:**
- Try again - the code expires after a few minutes

---

## ❌ Blank Page or White Screen After OAuth

### Problem
After Google/GitHub login, you see a blank page instead of dashboard.

### Possible Causes

**1. Backend not accessible**
- Can you reach `http://localhost:5000/api/health` in your browser?
- If not, backend isn't running

**Fix:**
```bash
cd backend
npm run dev
```

**2. Token not being stored**
- Open DevTools → **Application** tab
- Look for **LocalStorage**
- Check if `edusphere-auth` key exists with a token

**3. User doesn't exist yet**
- If you're a new OAuth user, account is auto-created
- But there might be an error in auto-creation

**Fix:**
- Check browser console for errors
- Try with a different email
- Use registration page first

---

## ❌ "Invalid Client ID" Error from Google/GitHub

### Problem
OAuth provider returns an error about invalid credentials.

### Possible Causes

**1. Wrong Client ID**
- Make sure you copied the **Client ID**, not **Client Secret**
- Client ID: Usually starts with numbers/letters, ~40 characters
- Client Secret: Longer, keep it secret! (**Only use in backend**)

**Fix:**
- Go back to Google/GitHub console
- Copy the correct Client ID
- Update `.env.local`

**2. Client ID for wrong provider**
- You're using GitHub Client ID for Google OAuth (or vice versa)

**Fix:**
- Make sure:
  - `REACT_APP_GOOGLE_CLIENT_ID` = from Google
  - `REACT_APP_GITHUB_CLIENT_ID` = from GitHub

**3. OAuth app deleted**
- If you deleted the OAuth app from Google/GitHub console, it won't work

**Fix:**
- Create a new OAuth app in Google/GitHub
- Copy the new Client IDs
- Update `.env.local`

---

## ❌ Backend Gets "405 Method Not Allowed"

### Problem
When OAuth callback sends data to `/api/auth/google`, you get a 405 error.

### Possible Causes

**1. Routes not added to backend**
- The backend routes `POST /api/auth/google` and `POST /api/auth/github` might not exist

**Fix:**
- Check `backend/routes/auth.routes.js` has these lines:
  ```javascript
  router.post('/google', googleAuth);
  router.post('/github', githubAuth);
  ```
- If missing, add them
- Restart backend: `npm run dev`

**2. Wrong endpoint URL**
- Frontend might be calling wrong endpoint

**Fix:**
- Check `frontend/.env.local` has:
  ```
  REACT_APP_API_URL=http://localhost:5000/api
  ```

---

## ❌ "CORS Error" or "Network Error"

### Problem
You see errors about CORS or blocked requests in the DevTools Network tab.

### Possible Causes

**1. Backend not accessible from frontend**
- Frontend on `localhost:3000` can't reach `localhost:5000`

**Fix:**
```bash
# Check backend is running
cd backend
npm run dev

# Check it's accessible:
curl http://localhost:5000/api/health
```

**2. CORS not enabled in backend**
- `backend/server.js` might not have CORS configured

**Fix:**
- Check `backend/server.js` has:
  ```javascript
  app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
  ```
- Make sure `backend/.env` has:
  ```
  CLIENT_URL=http://localhost:3000
  ```
- Restart backend

---

## ✅ Verification Checklist

Before trying OAuth again:

- [ ] `frontend/.env.local` exists with real Client IDs (not placeholders)
- [ ] `backend/.env` has Client IDs and Secrets configured
- [ ] Frontend is running: `http://localhost:3000`
- [ ] Backend is running: `http://localhost:5000`
- [ ] OAuth app created in Google/GitHub console
- [ ] Redirect URIs match exactly in OAuth console settings
- [ ] Browser cache cleared (`Ctrl+Shift+Delete`)
- [ ] Latest version of frontend running (`npm start` in frontend folder)

---

## 🚀 Quick Start Without OAuth

**Use Email/Password Login for now:**
1. Go to `http://localhost:3000/register`
2. Create a test account
3. Use it to login anytime
4. Set up OAuth later when ready!

---

## 📚 More Information

- **Quick Setup:** `docs/QUICK_OAUTH_SETUP.md`
- **Full Setup:** `docs/OAUTH_SETUP.md`
- **Technical Details:** `docs/OAUTH_IMPLEMENTATION.md`

---

## 💬 Still Stuck?

Check the browser console for specific error messages:
1. Open DevTools: Press `F12`
2. Go to **Console** tab
3. Look for red error messages
4. Read the error carefully - it usually tells you exactly what's wrong!

Common console messages:
- `"REACT_APP_GOOGLE_CLIENT_ID is undefined"` → `.env.local` not loaded
- `"Unexpected token"` → `.env.local` has syntax error
- `"Network Error"` → Backend not running
- `"Invalid client_id"` → Wrong Client ID in `.env.local`
