const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Follow = require('../models/Follow');
const Note = require('../models/Note');
const PYQ = require('../models/PYQ');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// GET /api/seniors - browse seniors
router.get('/', optionalAuth, async (req, res) => {
  const { search, college, page = 1, limit = 20 } = req.query;
  const query = { isSenior: true };
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { college: new RegExp(search, 'i') }];
  if (college) query.college = new RegExp(college, 'i');

  const skip = (Number(page) - 1) * Number(limit);
  const seniors = await User.find(query)
    .select('name avatar college location bio department year followersCount notesCount pyqCount')
    .sort({ followersCount: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(query);
  res.json({ seniors, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET /api/seniors/:id - senior profile
router.get('/:id', optionalAuth, async (req, res) => {
  const senior = await User.findById(req.params.id)
    .select('-password -email');
  if (!senior) return res.status(404).json({ message: 'User not found' });

  const [notes, pyqs, followersCount, isFollowing] = await Promise.all([
    Note.find({ uploader: req.params.id }).sort({ createdAt: -1 }).limit(10),
    PYQ.find({ uploader: req.params.id }).sort({ createdAt: -1 }).limit(10),
    Follow.countDocuments({ following: req.params.id }),
    req.user ? Follow.findOne({ follower: req.user._id, following: req.params.id }) : null,
  ]);

  res.json({ senior, notes, pyqs, followersCount, isFollowing: !!isFollowing });
});

// POST /api/seniors/become - become a senior
router.post('/become', protect, async (req, res) => {
  const { department, year, bio } = req.body;
  await User.findByIdAndUpdate(req.user._id, { isSenior: true, department, year, bio });
  res.json({ message: 'You are now a senior contributor!' });
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

module.exports = router;
