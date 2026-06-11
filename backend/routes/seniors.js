const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Follow = require('../models/Follow');
const Note = require('../models/Note');
const PYQ = require('../models/PYQ');
const Rating = require('../models/Rating');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// GET /api/seniors
router.get('/', optionalAuth, async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const query = { isSenior: true };
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { college: new RegExp(search, 'i') }, { department: new RegExp(search, 'i') }];

  const skip = (Number(page) - 1) * Number(limit);
  const [seniors, total] = await Promise.all([
    User.find(query)
      .select('name avatar college location bio department year followersCount notesCount pyqCount isStudentVerified')
      .sort({ followersCount: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(query),
  ]);
  res.json({ seniors, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET /api/seniors/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const senior = await User.findById(req.params.id).select('-password');
  if (!senior) return res.status(404).json({ message: 'User not found' });

  const [notes, pyqs, followersCount, followingCount, isFollowing, reviews] = await Promise.all([
    Note.find({ uploader: req.params.id }).sort({ createdAt: -1 }).limit(20),
    PYQ.find({ uploader: req.params.id }).sort({ createdAt: -1 }).limit(20),
    Follow.countDocuments({ following: req.params.id }),
    Follow.countDocuments({ follower: req.params.id }),
    req.user ? Follow.findOne({ follower: req.user._id, following: req.params.id }) : null,
    Rating.find({ seller: req.params.id }).populate('reviewer', 'name avatar').sort({ createdAt: -1 }).limit(10),
  ]);

  const avgRating = reviews.length > 0 ? reviews.reduce((a, b) => a + b.stars, 0) / reviews.length : 0

  res.json({ senior, notes, pyqs, followersCount, followingCount, isFollowing: !!isFollowing, reviews, avgRating: Math.round(avgRating * 10) / 10 });
});

// POST /api/seniors/become
router.post('/become', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.isStudentVerified) {
    return res.status(403).json({ message: 'You must verify your student ID before becoming a Senior Contributor.' });
  }
  const { department, year, bio } = req.body;
  if (!department) return res.status(400).json({ message: 'Department is required' });
  await User.findByIdAndUpdate(req.user._id, { isSenior: true, department, year, bio });
  res.json({ message: 'You are now a Senior Contributor!' });
});

// POST /api/seniors/:id/follow
router.post('/:id/follow', protect, async (req, res) => {
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot follow yourself' });

  const existing = await Follow.findOne({ follower: req.user._id, following: req.params.id });
  if (existing) {
    await existing.deleteOne();
    await User.findByIdAndUpdate(req.params.id, { $inc: { followersCount: -1 } });
    return res.json({ following: false, message: 'Unfollowed' });
  }

  await Follow.create({ follower: req.user._id, following: req.params.id });
  await User.findByIdAndUpdate(req.params.id, { $inc: { followersCount: 1 } });
  res.json({ following: true, message: 'Following!' });
});

// GET /api/seniors/:id/followers - list followers
router.get('/:id/followers', async (req, res) => {
  const follows = await Follow.find({ following: req.params.id })
    .populate('follower', 'name avatar college')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(follows.map(f => f.follower));
});

// POST /api/seniors/:id/review - write a review
router.post('/:id/review', protect, async (req, res) => {
  const { stars, comment } = req.body;
  if (!stars || stars < 1 || stars > 5) return res.status(400).json({ message: 'Stars must be 1-5' });
  if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot review yourself' });

  const existing = await Rating.findOne({ reviewer: req.user._id, seller: req.params.id });
  if (existing) {
    existing.stars = stars;
    existing.comment = comment;
    await existing.save();
  } else {
    await Rating.create({ reviewer: req.user._id, seller: req.params.id, stars, comment });
  }

  const allRatings = await Rating.find({ seller: req.params.id });
  const avg = allRatings.reduce((a, b) => a + b.stars, 0) / allRatings.length;
  await User.findByIdAndUpdate(req.params.id, { rating: Math.round(avg * 10) / 10, totalReviews: allRatings.length });

  res.json({ message: 'Review submitted!' });
});

module.exports = router;
