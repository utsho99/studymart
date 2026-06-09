const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadImages } = require('../middleware/uploadMiddleware');

// GET /api/listings - fetch with filters
router.get('/', optionalAuth, async (req, res) => {
  const { search, category, condition, minPrice, maxPrice, location, page = 1, limit = 20, sort = 'newest' } = req.query;

  const query = { isActive: true, isSold: false };

  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (location) query.location = new RegExp(location, 'i');
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    newest: { isFeatured: -1, createdAt: -1 },
    oldest: { createdAt: 1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);
  const [listings, total] = await Promise.all([
    Listing.find(query).populate('seller', 'name avatar college isVerifiedSeller').sort(sortOptions[sort] || sortOptions.newest).skip(skip).limit(Number(limit)),
    Listing.countDocuments(query),
  ]);

  res.json({ listings, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET /api/listings/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('seller', 'name avatar college location phone isVerifiedSeller rating totalReviews createdAt');
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  await Listing.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json(listing);
});

// POST /api/listings - create
router.post('/', protect, uploadImages.array('images', 5), async (req, res) => {
  const { title, description, price, category, condition, location, isNegotiable, isFree } = req.body;

  if (!title || !description || !category || !condition || !location) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  const images = req.files ? req.files.map((f) => `/uploads/images/${f.filename}`) : [];

  const listing = await Listing.create({
    title,
    description,
    price: isFree ? 0 : Number(price),
    isFree: !!isFree,
    isNegotiable: !!isNegotiable,
    category,
    condition,
    location,
    images,
    seller: req.user._id,
  });

  await listing.populate('seller', 'name avatar college isVerifiedSeller');
  res.status(201).json(listing);
});

// PUT /api/listings/:id - update
router.put('/:id', protect, uploadImages.array('images', 5), async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const updates = { ...req.body };
  if (req.files && req.files.length > 0) {
    updates.images = req.files.map((f) => `/uploads/images/${f.filename}`);
  }

  const updated = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('seller', 'name avatar college isVerifiedSeller');
  res.json(updated);
});

// DELETE /api/listings/:id
router.delete('/:id', protect, async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.seller.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  await listing.deleteOne();
  res.json({ message: 'Listing deleted' });
});

// PATCH /api/listings/:id/sold
router.patch('/:id/sold', protect, async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Not found' });
  if (listing.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  listing.isSold = true;
  listing.isActive = false;
  await listing.save();
  res.json({ message: 'Marked as sold', listing });
});

module.exports = router;
