const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Rating = require('../models/Rating');
const Block = require('../models/Block');
const Report = require('../models/Report');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { createNotification } = require('../utils/notifications');
const { createNotification } = require('../utils/notifications');
const { uploadImages, uploadToCloudinary } = require('../middleware/uploadMiddleware');

// GET /api/users/:id - public profile
router.get('/:id', optionalAuth, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -email');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const [listings, ratings, isBlocked] = await Promise.all([
    Listing.find({ seller: req.params.id, isActive: true, isSold: false }).sort({ createdAt: -1 }).limit(20),
    Rating.find({ seller: req.params.id }).populate('reviewer', 'name avatar').sort({ createdAt: -1 }).limit(10),
    req.user ? Block.findOne({ $or: [{ blocker: req.user._id, blocked: req.params.id }, { blocker: req.params.id, blocked: req.user._id }] }) : null,
  ]);

  const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b.stars, 0) / ratings.length : 0;

  res.json({ user, listings, ratings, avgRating: Math.round(avgRating * 10) / 10, isBlocked: !!isBlocked });
});

// PUT /api/users/profile - update own profile
router.put('/profile', protect, uploadImages.single('avatar'), async (req, res) => {
  const { name, phone, college, location, bio, department, year } = req.body;
  const updates = { name, phone, college, location, bio, department, year };

  if (req.file) {
    updates.avatar = await uploadToCloudinary(req.file.buffer, 'studymart/avatars');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
  res.json(user);
});

// POST /api/users/:id/rate - rate a seller
router.post('/:id/rate', protect, async (req, res) => {
  const { stars, comment, listingId } = req.body;
  if (!stars || stars < 1 || stars > 5) return res.status(400).json({ message: 'Stars must be between 1 and 5' });
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot rate yourself' });

  const existing = await Rating.findOne({ reviewer: req.user._id, seller: req.params.id, listing: listingId || null });
  if (existing) {
    existing.stars = stars;
    existing.comment = comment;
    await existing.save();
  } else {
    await Rating.create({ reviewer: req.user._id, seller: req.params.id, listing: listingId || null, stars, comment });
  }

  // Update user's average rating
  const allRatings = await Rating.find({ seller: req.params.id });
  const avg = allRatings.reduce((a, b) => a + b.stars, 0) / allRatings.length;
  await User.findByIdAndUpdate(req.params.id, { rating: Math.round(avg * 10) / 10, totalReviews: allRatings.length });
  createNotification({ recipientId: req.params.id, senderId: req.user._id, type: 'rating', title: `${req.user.name} rated you ${stars} stars`, body: comment || 'You received a new rating!', link: `/users/${req.params.id}` }).catch(() => {});

  res.json({ message: 'Rating submitted!' });
});

// POST /api/users/:id/block - block a user
router.post('/:id/block', protect, async (req, res) => {
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot block yourself' });

  const existing = await Block.findOne({ blocker: req.user._id, blocked: req.params.id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ blocked: false, message: 'User unblocked' });
  }

  await Block.create({ blocker: req.user._id, blocked: req.params.id });
  res.json({ blocked: true, message: 'User blocked' });
});

// POST /api/users/:id/report - report a user
router.post('/:id/report', protect, async (req, res) => {
  const { reason, description } = req.body;
  if (!reason) return res.status(400).json({ message: 'Reason is required' });

  await Report.create({ reporter: req.user._id, reportedUser: req.params.id, reason, description });
  res.json({ message: 'Report submitted. Our team will review it.' });
});

// POST /api/users/report-listing/:id - report a listing
router.post('/report-listing/:id', protect, async (req, res) => {
  const { reason, description } = req.body;
  if (!reason) return res.status(400).json({ message: 'Reason is required' });

  await Report.create({ reporter: req.user._id, reportedListing: req.params.id, reason, description });
  res.json({ message: 'Listing reported. Our team will review it.' });
});

// POST /api/users/verify-student - upload student ID
router.post('/verify-student', protect, uploadImages.single('studentId'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please upload your student ID' });
  const url = await uploadToCloudinary(req.file.buffer, 'studymart/verification');
  await User.findByIdAndUpdate(req.user._id, { studentIdUrl: url });
  res.json({ message: 'Student ID submitted for verification!' });
});

module.exports = router;
