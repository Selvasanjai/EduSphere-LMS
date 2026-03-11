const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

async function testDB() {
  try {
    console.log('Testing database connection...');
    console.log('MONGO_URI:', process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database connected successfully!');

    const User = require('./models/User');
    const count = await User.countDocuments();
    console.log(`📊 Total users in database: ${count}`);

    if (count === 0) {
      console.log('⚠️ No users found. Creating test user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test123', 12);

      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isApproved: true,
      });

      console.log('✅ Test user created successfully!');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: test123');
      console.log('👤 Role: admin');
    } else {
      const users = await User.find({}, 'email name role');
      console.log('📋 Existing users:');
      users.forEach((user) => {
        console.log(`  - ${user.email} (${user.role})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

testDB();
