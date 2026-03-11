require('dotenv').config();
const User = require('./models/User');
const mongoose = require('mongoose');

async function checkTestUser() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/edusphere'
    );

    const user = await User.findOne({ email: 'test@example.com' });
    if (user) {
      console.log('✅ Test user found:', {
        email: user.email,
        role: User.role,
        isApproved: User.isApproved,
        hasPassword: User.password ? 'Yes' : 'No',
      });

      // Test password comparison
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare('test123', user.password);
      console.log('Password match:', isMatch);
    } else {
      console.log('❌ Test user not found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTestUser();
