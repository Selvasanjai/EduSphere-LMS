# ⚡ Quick Fix: Google & GitHub OAuth Not Working

## The Problem
OAuth buttons say "Client ID not configured"

## The Solution (Choose One)

### 🟢 Option 1: Use Email/Password Login RIGHT NOW ✅ (RECOMMENDED)

1. Open: **`http://localhost:3000/register`**
2. Create a test account:
   ```
   Name: John Doe
   Email: john@test.com
   Password: password123
   Role: Student
   ```
3. Click "Create Account"
4. You're logged in! ✨

**Use email/password login anytime - OAuth is optional!**

---

### 🔵 Option 2: Set Up Google OAuth (10 minutes)

1. Read: **`docs/QUICK_OAUTH_SETUP.md`** → Section "Option 2"
2. Get your Google Client ID
3. Edit **`frontend/.env.local`**:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=YOUR_ACTUAL_ID_HERE
   ```
4. Clear browser cache: `Ctrl+Shift+Delete`
5. Refresh page: `Ctrl+R`
6. Try OAuth button again!

---

### 🟤 Option 3: Set Up GitHub OAuth (5 minutes)

1. Read: **`docs/QUICK_OAUTH_SETUP.md`** → Section "Option 3"
2. Get your GitHub Client ID  
3. Edit **`frontend/.env.local`**:
   ```
   REACT_APP_GITHUB_CLIENT_ID=YOUR_ACTUAL_ID_HERE
   ```
4. Clear browser cache: `Ctrl+Shift+Delete`
5. Refresh page: `Ctrl+R`
6. Try OAuth button again!

---

## 📋 What I Changed

✅ **Better error messages** - Now tells you how to fix it  
✅ **Helper text on login** - Shows you can register or set up OAuth  
✅ **Quick setup guides** - In `docs/` folder  

---

## 🚀 Right Now:

1. **Go to:** `http://localhost:3000/login`
2. **Click "Sign Up"** (blue link at bottom)
3. **Create a test account**
4. **Start exploring!** 🎉

---

## 📚 Helpful Docs
- **`docs/GETTING_STARTED.md`** - Complete guide
- **`docs/QUICK_OAUTH_SETUP.md`** - 5-minute OAuth setup
- **`docs/TROUBLESHOOTING.md`** - Common issues & fixes

---

## ✨ You're Ready!

Everything is working. Just need to register or set up OAuth.

**👉 Start here:** `http://localhost:3000/register`
