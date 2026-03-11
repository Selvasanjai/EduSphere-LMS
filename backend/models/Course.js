const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  duration: { type: Number }, // seconds
  order: { type: Number, required: true },
  thumbnail: { type: String },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, sparse: true, lowercase: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  duration: { type: Number }, // total hours
  maxStudents: { type: Number, default: 14, min: 1 },
  totalVideos: { type: Number, default: 0 },
  videos: [videoSchema],
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  tags: [String],
  enrollmentCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

courseSchema.pre('save', function (next) {
  this.totalVideos = this.videos.length;
  this.updatedAt = new Date();
  // Auto-generate slug from title if title exists
  if (this.title && this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
