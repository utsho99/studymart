const express = require('express');
const router = express.Router();
const LostFound = require('../models/LostFound');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadImages, uploadToCloudinary } = require('../middleware/uploadMiddleware');

// GET /api/lostfound
router.get('/', optionalAuth, async (req, res) => {
  const { type, category, search, page = 1, limit = 20 } = req.query;
  const query = { isResolved: false };
  if (type) query.type = type;
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    LostFound.find(query).populate('poster', 'name avatar college').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    LostFound.countDocuments(query),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET /api/lostfound/:id
router.get('/:id', async (req, res) => {
  const item = await LostFound.findById(req.params.id).populate('poster', 'name avatar college');
  if (!item) return res.status(404).json({ message: 'Not found' });
  await LostFound.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  const result = item.toObject();
  if (!req.user) delete result.contactPhone;
  res.json(result);
});

// POST /api/lostfound
router.post('/', protect, uploadImages.array('images', 3), async (req, res) => {
  const { type, title, description, category, location, campus, date, contactPhone } = req.body;
  if (!type || !title || !description || !category || !location || !date) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  let images = [];
  if (req.files && req.files.length > 0) {
    const uploads = req.files.map(f => uploadToCloudinary(f.buffer, 'studymart/lostfound'));
    images = await Promise.all(uploads);
  }

  const item = await LostFound.create({
    type, title, description, category, location, campus,
    date: new Date(date),
    contactPhone, images,
    poster: req.user._id,
  });

  await item.populate('poster', 'name avatar college phone');
  res.status(201).json(item);
});

// PATCH /api/lostfound/:id/resolve
router.patch('/:id/resolve', protect, async (req, res) => {
  const item = await LostFound.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (item.poster.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  item.isResolved = true;
  await item.save();
  res.json({ message: 'Marked as resolved!' });
});

// DELETE /api/lostfound/:id
router.delete('/:id', protect, async (req, res) => {
  const item = await LostFound.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (item.poster.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  await item.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
