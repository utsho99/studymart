const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  rewardGiven: { type: Boolean, default: false },
}, { timestamps: true });

referralSchema.index({ referrer: 1 });
referralSchema.index({ code: 1 });

module.exports = mongoose.model('Referral', referralSchema);
