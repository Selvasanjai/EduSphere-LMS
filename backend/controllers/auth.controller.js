const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ success: true, token, user });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, college } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    
    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name, email, password,
      role: role || 'student',
      department, college,
      emailVerificationToken: verificationToken,
      isApproved: role === 'student' ? true : false
    });

        // TODO: Send verification email using nodemailer
    sendToken(user, 201, res);
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Registration failed.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists and password matches
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    
    // Check if user is approved (applies to staff only)
    if (!user.isApproved && user.role === 'staff') {
      return res.status(403).json({ success: false, message: 'Your account is pending admin approval. Please try again later.' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

        sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Login failed. Please try again.' });
  }
};

// POST /api/auth/google - Exchange Google code for JWT
exports.googleAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Authorization code required.' });

    // Exchange code for Google tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
      grant_type: 'authorization_code'
    });

    // Get user info from Google
    const userInfo = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    const { email, name, picture } = userInfo.data;

    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user from Google
      user = await User.create({
        name,
        email,
        avatar: picture,
        googleId: userInfo.data.id,
        role: 'student',
        isVerified: true,
        isApproved: true
      });
    } else if (!user.googleId) {
      // Link Google to existing user
      user.googleId = userInfo.data.id;
      user.avatar = picture || user.avatar;
      await user.save({ validateBeforeSave: false });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
  } catch (err) {
    console.error('Google Auth Error:', err.message);
    res.status(500).json({ success: false, message: 'Google authentication failed: ' + err.message });
  }
};

// POST /api/auth/github - Exchange GitHub code for JWT
exports.githubAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Authorization code required.' });

    // Exchange code for GitHub tokens
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback'
    }, {
      headers: { Accept: 'application/json' }
    });

    // Get user info from GitHub
    const userInfo = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    const { login, name, avatar_url, email: githubEmail } = userInfo.data;
    const email = githubEmail || `${login}@github.placeholder`;

    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user from GitHub
      user = await User.create({
        name: name || login,
        email,
        avatar: avatar_url,
        githubId: userInfo.data.id,
        role: 'student',
        isVerified: true,
        isApproved: true
      });
    } else if (!user.githubId) {
      // Link GitHub to existing user
      user.githubId = userInfo.data.id;
      user.avatar = avatar_url || user.avatar;
      await user.save({ validateBeforeSave: false });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendToken(user, 200, res);
  } catch (err) {
    console.error('GitHub Auth Error:', err.message);
    res.status(500).json({ success: false, message: 'GitHub authentication failed: ' + err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email.' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    // TODO: Send reset email
    res.status(200).json({ success: true, message: 'Reset link sent to email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired.' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
