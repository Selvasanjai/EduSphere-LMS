require('dotenv').config();
const User = require('./models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createTestUser(name, email, password, role) {
  try {
    console.log(`Processing test user: ${email}...`);
    await mongoose.connect(process.env.MONGO_URI);

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      console.log(`User ${email} already exists. Updating password...`);
      user.password = password; // The pre('save') hook will hash this
      await user.save();
      console.log(`✅ Password updated for ${email}`);
    } else {
      // Create new test user
      await User.create({
        name,
        email,
        password, // The pre('save') hook will hash this
        role,
        isVerified: true,
        isApproved: true,
      });
      console.log(`✅ Test user ${email} created successfully!`);
    }
  } catch (error) {
    console.error('Error processing test user:', error.message);
  } finally {
    // We'll disconnect in the run() function
  }
}

// Create default users
async function run() {
  await createTestUser('Admin User', 'admin@edusphere.com', 'admin123', 'admin');
  await createTestUser('Student User', 'student@edusphere.com', 'student123', 'student');
  await createTestUser('Staff User', 'staff@edusphere.com', 'staff123', 'staff');
  
  await mongoose.disconnect();
  console.log('Database disconnected. Process complete.');
  process.exit(0);
}

run();
