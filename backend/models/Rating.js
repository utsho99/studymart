const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);

ratingSchema.index({ reviewer: 1, seller: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
