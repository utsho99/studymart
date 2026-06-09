const mongoose = require('mongoose');

// Future-ready transaction tracking
const transactionSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'completed', 'cancelled', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, enum: ['bkash', 'nagad', 'rocket', 'cash', 'other'] },
    paymentRef: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Future-ready subscription plans
const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['premium_monthly', 'premium_yearly'], required: true },
    amount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    paymentRef: { type: String },
    features: {
      featuredListings: { type: Number, default: 5 },
      prioritySupport: { type: Boolean, default: true },
      verifiedBadge: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = { Transaction, Subscription };
