const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Referral = require('../models/Referral');
const { generateToken } = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');

// Generate unique 6-digit referral code
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const EARLY_USER_LIMIT = 100;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, college, location, referralCode } = req.body;
  if (!name || !email || !password || !phone || !college || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  // Check if referral code is valid
  let referrer = null;
  if (referralCode) {
    referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!referrer) return res.status(400).json({ message: 'Invalid referral code' });
  }

  // Check early user status
  const totalUsers = await User.countDocuments();
  const isEarlyUser = totalUsers < EARLY_USER_LIMIT;

  // Generate unique referral code for new user
  let newReferralCode;
  let attempts = 0;
  do {
    newReferralCode = generateReferralCode();
    attempts++;
  } while (await User.findOne({ referralCode: newReferralCode }) && attempts < 10);

  const user = await User.create({
    name, email, password, phone, college, location,
    isEarlyUser,
    badges: isEarlyUser ? ['early_user'] : [],
    referralCode: newReferralCode,
  });

  // Handle referral reward
  if (referrer) {
    await Referral.create({ referrer: referrer._id, referee: user._id, code: referralCode });

    // Count successful referrals for referrer
    const referralCount = await Referral.countDocuments({ referrer: referrer._id });
    await User.findByIdAndUpdate(referrer._id, { referralCount });

    // Every 5 referrals = 15 days premium + 1 credit
    if (referralCount % 5 === 0) {
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 15);
      await User.findByIdAndUpdate(referrer._id, {
        'subscription.plan': 'premium',
        'subscription.expiresAt': premiumUntil,
        $inc: { featuredListingsRemaining: 1, credits: 1 },
      });
    }
  }

  const token = generateToken(user._id);
  sendWelcomeEmail(email, name).catch(() => {});

  res.status(201).json({ token, user: sanitize(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  if (user.isBanned) return res.status(403).json({ message: 'Your account has been suspended. Contact support.' });

  const token = generateToken(user._id);
  res.json({ token, user: sanitize(user) });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/change-password
router.post('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both fields required' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password changed successfully!' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'If this email is registered, a reset code has been sent.' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 15 * 60 * 1000);

  await User.findByIdAndUpdate(user._id, { resetCode: code, resetCodeExpiry: expiry });

  try {
    await sendPasswordResetEmail(email, user.name, code);
    res.json({ message: 'Reset code sent to your email! Check your inbox.' });
  } catch {
    res.status(500).json({ message: 'Failed to send email. Please try again.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ message: 'All fields required' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const user = await User.findOne({ email }).select('+resetCode +resetCodeExpiry');
  if (!user || user.resetCode !== code) return res.status(400).json({ message: 'Invalid reset code.' });
  if (new Date() > user.resetCodeExpiry) return res.status(400).json({ message: 'Reset code expired. Please request a new one.' });

  user.password = newPassword;
  user.resetCode = undefined;
  user.resetCodeExpiry = undefined;
  await user.save();
  res.json({ message: 'Password reset successfully! You can now login.' });
});

// GET /api/auth/referral-stats
router.get('/referral-stats', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('referralCode referralCount credits featuredListingsRemaining subscription');
  const referrals = await Referral.find({ referrer: req.user._id }).populate('referee', 'name avatar createdAt').sort({ createdAt: -1 }).limit(20);
  const nextRewardAt = 5 - (user.referralCount % 5);
  res.json({ user, referrals, nextRewardAt: nextRewardAt === 5 ? 0 : nextRewardAt });
});

function sanitize(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    college: user.college,
    location: user.location,
    avatar: user.avatar,
    isVerifiedSeller: user.isVerifiedSeller,
    isStudentVerified: user.isStudentVerified,
    isSenior: user.isSenior,
    isEarlyUser: user.isEarlyUser,
    badges: user.badges,
    referralCode: user.referralCode,
    referralCount: user.referralCount,
    credits: user.credits,
    featuredListingsRemaining: user.featuredListingsRemaining,
    subscription: user.subscription,
  };
}

module.exports = router;
