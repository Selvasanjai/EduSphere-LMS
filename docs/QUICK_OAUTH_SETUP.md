# ⚡ Quick OAuth Setup for Testing (5 minutes)

This guide shows you the **fastest way** to set up OAuth for testing.

## Option 1: Use Email/Password Login First (Fastest ✅)

For now, you can skip OAuth and use email/password:

**Test Accounts:**
```
Email: student@example.com
Password: password123

Email: staff@example.com  
Password: password123

Email: admin@example.com
Password: password123
```

Just use the email/password fields on the login page!

---

## Option 2: Quick Google OAuth (10 minutes)

### Step 1: Create Google Account (if you don't have one)
- Go to [Google Account](https://myaccount.google.com/)
- Create a free account

### Step 2: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** button (top right)
3. Name it: `EduSphere Test`
4. Click **Create**

### Step 3: Enable Google+ API
1. Click the **Search** icon (top search bar)
2. Type: `Google+ API`
3. Click on **Google+ API**
4. Click **Enable**

### Step 4: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials** (left menu)
2. Click **+ Create Credentials** → **OAuth Client ID**
3. If prompted, click **Configure Consent Screen** and select **External**, then **Create**
4. Fill the form:
   - App name: `EduSphere`
   - User support email: `your_email@gmail.com`
   - Developer contact: `your_email@gmail.com`
5. Click **Save & Continue** (twice)
6. Go back to **Credentials**
7. Click **+ Create Credentials** → **OAuth Client ID**
8. Choose **Web Application**
9. Add these under "Authorized redirect URIs":
   ```
   http://localhost:3000/login
   http://localhost:3000/login?provider=google
   ```
10. Click **Create**
11. **Copy the Client ID** (the long string)

### Step 5: Add to `.env.local`
Edit `frontend/.env.local`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=YOUR_COPIED_CLIENT_ID_HERE
REACT_APP_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID_HERE
```

**Save the file** and **restart the frontend:**
```bash
# In the frontend folder terminal, press Ctrl+C to stop
# Then run:
npm start
```

---

## Option 3: Quick GitHub OAuth (5 minutes)

### Step 1: Go to GitHub Settings
1. Log in to [GitHub](https://github.com/)
2. Click your profile (top right) → **Settings**
3. Click **Developer settings** (left menu)
4. Click **OAuth Apps**
5. Click **New OAuth App**

### Step 2: Fill the Form
- **Application name:** `EduSphere`
- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/login?provider=github`

Click **Register Application**

### Step 3: Copy Client ID
You'll see the **Client ID** on the page. Copy it.

### Step 4: Add to `.env.local`
Edit `frontend/.env.local`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
REACT_APP_GITHUB_CLIENT_ID=YOUR_COPIED_GITHUB_CLIENT_ID_HERE
```

**Save and restart:**
```bash
npm start
```

---

## ✅ Test It!

1. Go to `http://localhost:3000/login`
2. Try:
   - **Email/Password:** Use test accounts above ✅
   - **Google:** When configured ✅
   - **GitHub:** When configured ✅

---

## 🐛 Still Not Working?

### "Client ID not configured" Error
**Solution:**
1. Make sure `.env.local` file exists in `frontend/` folder
2. Check that values don't have `YOUR_..._HERE` text
3. Stop the dev server (Ctrl+C)
4. Run `npm start` again
5. Clear browser cache (Ctrl+Shift+Delete)

### OAuth buttons disabled?
- The error message will explain what to do
- Follow the instructions in the toast notification

### Backend issues?
Make sure `backend/.env` has:
```
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
```

(You can leave them blank for testing, but OAuth won't work)

---

## 📚 Complete Setup

When you're ready for the full setup with all details:
- Read: `docs/OAUTH_SETUP.md`
- Read: `docs/OAUTH_IMPLEMENTATION.md`

---

## 🚀 Quick Recap

| Method | Time | Setup |
|--------|------|-------|
| **Email/Password** | ⚡ Now | Nothing - just login |
| **GitHub OAuth** | 5 min | Follow Option 3 |
| **Google OAuth** | 10 min | Follow Option 2 |

**Recommended:** Start with email/password, then add OAuth when you're ready! 🎉
