const express = require('express');
const router = express.Router();
const Like = require('../models/Like');
const Bookmark = require('../models/Bookmark');
const Listing = require('../models/Listing');
const { protect } = require('../middleware/authMiddleware');
const { createNotification } = require('../utils/notifications');

// POST /api/likes/:listingId/like - toggle like
router.post('/:listingId/like', protect, async (req, res) => {
  const existing = await Like.findOne({ user: req.user._id, listing: req.params.listingId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ liked: false });
  }
  await Like.create({ user: req.user._id, listing: req.params.listingId });

  // Notify listing owner
  const listing = await Listing.findById(req.params.listingId).select('seller title');
  if (listing && listing.seller.toString() !== req.user._id.toString()) {
    createNotification({
      recipientId: listing.seller,
      senderId: req.user._id,
      type: 'like',
      title: `${req.user.name} liked your listing`,
      body: listing.title,
      link: `/listings/${listing._id}`,
    }).catch(() => {});
  }
  res.json({ liked: true });
});

// POST /api/likes/:listingId/bookmark - toggle bookmark
router.post('/:listingId/bookmark', protect, async (req, res) => {
  const existing = await Bookmark.findOne({ user: req.user._id, listing: req.params.listingId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ bookmarked: false });
  }
  await Bookmark.create({ user: req.user._id, listing: req.params.listingId });
  res.json({ bookmarked: true });
});

// GET /api/likes/status/:listingId - get like/bookmark status
router.get('/status/:listingId', protect, async (req, res) => {
  const [liked, bookmarked, likeCount] = await Promise.all([
    Like.findOne({ user: req.user._id, listing: req.params.listingId }),
    Bookmark.findOne({ user: req.user._id, listing: req.params.listingId }),
    Like.countDocuments({ listing: req.params.listingId }),
  ]);
  res.json({ liked: !!liked, bookmarked: !!bookmarked, likeCount });
});

// GET /api/likes/bookmarks - get all bookmarks for current user
router.get('/bookmarks', protect, async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .populate({ path: 'listing', populate: { path: 'seller', select: 'name avatar isVerifiedSeller' } })
    .sort({ createdAt: -1 });
  const listings = bookmarks.map(b => b.listing).filter(Boolean);
  res.json(listings);
});

// GET /api/likes/liked - get all liked listings
router.get('/liked', protect, async (req, res) => {
  const likes = await Like.find({ user: req.user._id })
    .populate({ path: 'listing', populate: { path: 'seller', select: 'name avatar isVerifiedSeller' } })
    .sort({ createdAt: -1 });
  const listings = likes.map(l => l.listing).filter(Boolean);
  res.json(listings);
});

module.exports = router;
