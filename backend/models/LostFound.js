const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['lost', 'found'] },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 1000 },
    category: {
      type: String,
      required: true,
      enum: ['ID Card', 'Calculator', 'Wallet', 'Phone', 'Keys', 'Bag', 'Books', 'Stationery', 'Clothing', 'Others'],
    },
    location: { type: String, required: true, trim: true },
    campus: { type: String, trim: true },
    date: { type: Date, required: true },
    images: [{ type: String }],
    contactPhone: { type: String, trim: true },
    isResolved: { type: Boolean, default: false },
    poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

lostFoundSchema.index({ type: 1, isResolved: 1, createdAt: -1 });
lostFoundSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('LostFound', lostFoundSchema);
