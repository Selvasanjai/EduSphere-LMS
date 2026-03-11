require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'EduSphere API Running', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere')
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 EduSphere API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err);
    process.exit(1);
  });
