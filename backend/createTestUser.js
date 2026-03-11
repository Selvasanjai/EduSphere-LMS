require('dotenv').config();
const User = require('./models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere'
    );

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isApproved: true
    });
    
    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: test123');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();
