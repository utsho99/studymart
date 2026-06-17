const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, trim: true },
    college: { type: String, trim: true },
    location: { type: String, trim: true },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500 },
    isVerifiedSeller: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },

    // Badges
    isEarlyUser: { type: Boolean, default: false },
    badges: [{ type: String }], // ['early_user', 'top_contributor', etc]

    // Senior fields
    isSenior: { type: Boolean, default: false },
    department: { type: String, trim: true },
    year: { type: String, trim: true },
    followersCount: { type: Number, default: 0 },
    notesCount: { type: Number, default: 0 },
    pyqCount: { type: Number, default: 0 },

    // Student verification
    studentIdUrl: { type: String, default: '' },
    isStudentVerified: { type: Boolean, default: false },

    // Referral system
    referralCode: { type: String, unique: true, sparse: true },
    referralCount: { type: Number, default: 0 },
    credits: { type: Number, default: 0 }, // 1 credit = 1 featured listing boost

    // Password reset
    resetCode: { type: String, select: false },
    resetCodeExpiry: { type: Date, select: false },

    // Push notification FCM token
    fcmToken: { type: String, default: '' },

    // Subscription / Premium
    subscription: {
      plan: { type: String, enum: ['free', 'premium'], default: 'free' },
      expiresAt: { type: Date },
    },
    featuredListingsRemaining: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Check if premium is still active
userSchema.methods.isPremium = function () {
  return this.subscription?.plan === 'premium' && this.subscription?.expiresAt > new Date();
};

module.exports = mongoose.model('User', userSchema);
