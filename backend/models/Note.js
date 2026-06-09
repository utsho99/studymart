const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, maxlength: 1000 },
    subject: { type: String, required: true, trim: true },
    class: {
      type: String,
      enum: ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'HSC', 'SSC', 'Admission', 'University', 'Others'],
    },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },
    pageCount: { type: Number },
    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0, min: 0 },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloads: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

noteSchema.index({ subject: 'text', title: 'text' });

module.exports = mongoose.model('Note', noteSchema);
