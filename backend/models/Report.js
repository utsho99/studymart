const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'fake_listing', 'inappropriate', 'scam', 'harassment', 'other'],
    },
    description: { type: String, maxlength: 500 },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
