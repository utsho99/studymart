const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, college, location } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, phone, college, location });
  const token = generateToken(user._id);

  res.status(201).json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      college: user.college,
      location: user.location,
      avatar: user.avatar,
      isVerifiedSeller: user.isVerifiedSeller,
      subscription: user.subscription,
    },
  });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      college: user.college,
      location: user.location,
      avatar: user.avatar,
      isVerifiedSeller: user.isVerifiedSeller,
      subscription: user.subscription,
    },
  });
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
