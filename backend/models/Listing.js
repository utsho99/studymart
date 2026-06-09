const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    isNegotiable: { type: Boolean, default: false },
    isFree: { type: Boolean, default: false },

    category: {
      type: String,
      required: true,
      enum: ['Books', 'Notes', 'Calculator', 'Stationery', 'Electronics', 'Uniform', 'Others'],
    },
    condition: { type: String, required: true, enum: ['New', 'Like New', 'Used', 'Heavily Used'] },

    images: [{ type: String }],
    location: { type: String, required: true, trim: true },
    division: { type: String, trim: true },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    views: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isSold: { type: Boolean, default: false },

    // Monetization (future-ready)
    isFeatured: { type: Boolean, default: false },
    featuredUntil: { type: Date },
    boostLevel: { type: Number, default: 0, min: 0, max: 3 },
  },
  { timestamps: true }
);

listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ category: 1, isActive: 1 });
listingSchema.index({ seller: 1 });
listingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);
