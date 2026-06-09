const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/authMiddleware');

// GET /api/users/:id - public profile
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email');
  if (!user) return res.status(404).json({ message: 'User not found' });
  const listings = await Listing.find({ seller: req.params.id, isActive: true, isSold: false }).sort({ createdAt: -1 }).limit(20);
  res.json({ user, listings });
});

// PUT /api/users/profile - update own profile
router.put('/profile', protect, async (req, res) => {
  const { name, phone, college, location, bio } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, college, location, bio },
    { new: true, runValidators: true }
  ).select('-password');
  res.json(user);
});

module.exports = router;
