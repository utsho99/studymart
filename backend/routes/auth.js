const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');
const { sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, college, location } = req.body;
  if (!name || !email || !password || !phone || !college || !location) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, phone, college, location });
  const token = generateToken(user._id);

  // Send welcome email (don't await - non-blocking)
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
  // Always return success to prevent email enumeration
  if (!user) return res.json({ message: 'If this email is registered, a reset code has been sent.' });

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await User.findByIdAndUpdate(user._id, {
    resetCode: code,
    resetCodeExpiry: expiry,
  });

  // Send email via Resend
  try {
    await sendPasswordResetEmail(email, user.name, code);
    res.json({ message: 'Reset code sent to your email! Check your inbox.' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ message: 'Failed to send email. Please try again.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) return res.status(400).json({ message: 'All fields required' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const user = await User.findOne({ email }).select('+resetCode +resetCodeExpiry');
  if (!user || user.resetCode !== code) {
    return res.status(400).json({ message: 'Invalid reset code. Please check your email.' });
  }
  if (new Date() > user.resetCodeExpiry) {
    return res.status(400).json({ message: 'Reset code expired. Please request a new one.' });
  }

  user.password = newPassword;
  user.resetCode = undefined;
  user.resetCodeExpiry = undefined;
  await user.save();

  res.json({ message: 'Password reset successfully! You can now login.' });
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
    subscription: user.subscription,
  };
}

module.exports = router;
