const mongoose = require('mongoose');

const pyqSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    subject: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    examType: {
      type: String,
      required: true,
      enum: ['SSC', 'HSC', 'Admission', 'University', 'Medical', 'Engineering', 'BBA', 'Law', 'Others'],
    },
    institution: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloads: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pyqSchema.index({ subject: 'text', title: 'text' });
pyqSchema.index({ examType: 1 });

module.exports = mongoose.model('PYQ', pyqSchema);
