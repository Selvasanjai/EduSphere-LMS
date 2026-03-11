const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');
const mongoose = require('mongoose');

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    console.log('Existing users:');
    users.forEach((user) => {
      console.log(
        `Email: ${user.email}, Role: ${user.role}, Password Set: ${user.password ? 'Yes' : 'No'}`
      );
    });
    process.exit(0);
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
}

checkUsers();
