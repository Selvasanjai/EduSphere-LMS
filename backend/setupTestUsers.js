require('dotenv').config();
const User = require('./models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function setupTestUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const users = [
      { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { name: 'Staff User', email: 'staff@example.com', role: 'staff' },
      { name: 'Student User', email: 'student@example.com', role: 'student' }
    ];

    for (const u of users) {
      const hashedPassword = await bcrypt.hash('test12345678', 12);
      await User.findOneAndUpdate(
        { email: u.email },
        { 
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          isVerified: true,
          isApproved: true
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Set up ${u.role}: ${u.email} / test12345678`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupTestUsers();
