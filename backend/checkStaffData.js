const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const staff = await User.findOne({ role: 'staff' });
    if (!staff) {
      console.log('❌ No staff user found');
    } else {
      console.log(`👨‍🏫 Found staff: ${staff.email} (${staff._id})`);
      const courses = await Course.find({ staffId: staff._id });
      console.log(`📚 Courses for this staff: ${courses.length}`);
      courses.forEach(c => console.log(` - ${c.title} (${c._id}) [Published: ${c.isPublished}, Approved: ${c.isApproved}]`));

      if (courses.length > 0) {
        const enrollments = await Enrollment.find({ courseId: { $in: courses.map(c => c._id) } });
        console.log(`🎓 Enrollments for these courses: ${enrollments.length}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
