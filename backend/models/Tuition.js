const mongoose = require('mongoose');
const tuitionSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['offer', 'request'] },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  subjects: [{ type: String, trim: true }],
  classes: [{ type: String }],
  tuitionType: { type: String, required: true, enum: ['online', 'home', 'both'] },
  location: { type: String, trim: true },
  salary: { type: Number },
  salaryNegotiable: { type: Boolean, default: false },
  experience: { type: String, trim: true },
  description: { type: String, maxlength: 1000 },
  contactPhone: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });
tuitionSchema.index({ type: 1, isActive: 1, createdAt: -1 });
tuitionSchema.index({ title: 'text', description: 'text' });
module.exports = mongoose.model('Tuition', tuitionSchema);
