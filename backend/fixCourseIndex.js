// Run this script to fix the E11000 duplicate key error on slug field
// Command: node fixCourseIndex.js

const mongoose = require('mongoose');
require('dotenv').config();

const fixCourseIndex = async () => {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Drop the problematic index if it exists
    try {
      console.log('🔍 Checking for existing slug index...');
      await db.collection('courses').dropIndex('slug_1');
      console.log('✅ Dropped old slug_1 index');
    } catch (err) {
      if (err.code === 27) {
        console.log('ℹ️ Index slug_1 does not exist (this is fine)');
      } else {
        console.error('Error dropping index:', err.message);
      }
    }

    // Create the correct sparse unique index
    console.log('📝 Creating new sparse unique index on slug...');
    await db
      .collection('courses')
      .createIndex({ slug: 1 }, { unique: true, sparse: true });
    console.log('✅ Created new sparse unique index on slug');

    // Update all existing courses with null slugs to generate slugs
    const Course = require('./models/Course');
    const courses = await Course.find({
      $or: [{ slug: null }, { slug: { $exists: false } }],
    });

    if (courses.length > 0) {
      console.log(`🔄 Generating slugs for ${courses.length} courses...`);
      for (const course of courses) {
        if (course.title) {
          course.slug = course.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
          await course.save();
        }
      }
      console.log('✅ Generated slugs for all courses');
    }

    console.log('\n✅ Database fix completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

fixCourseIndex();
