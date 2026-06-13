const express = require('express');
const router = express.Router();
const Tuition = require('../models/Tuition');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// GET /api/tuition
router.get('/', optionalAuth, async (req, res) => {
  const { type, tuitionType, location, search, page = 1, limit = 20 } = req.query;
  const query = { isActive: true };
  if (type) query.type = type;
  if (tuitionType) query.tuitionType = tuitionType;
  if (location) query.location = new RegExp(location, 'i');
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Tuition.find(query).populate('poster', 'name avatar college isVerifiedSeller isStudentVerified').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Tuition.countDocuments(query),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET /api/tuition/:id
router.get('/:id', async (req, res) => {
  const item = await Tuition.findById(req.params.id).populate('poster', 'name avatar college phone isVerifiedSeller isStudentVerified');
  if (!item) return res.status(404).json({ message: 'Not found' });
  await Tuition.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json(item);
});

// POST /api/tuition
router.post('/', protect, async (req, res) => {
  const { type, title, subjects, classes, tuitionType, location, salary, salaryNegotiable, experience, description, contactPhone, gender } = req.body;
  if (!type || !title || !tuitionType) return res.status(400).json({ message: 'Please fill required fields' });

  const item = await Tuition.create({
    type, title,
    subjects: Array.isArray(subjects) ? subjects : subjects?.split(',').map(s => s.trim()).filter(Boolean) || [],
    classes: Array.isArray(classes) ? classes : classes?.split(',').map(s => s.trim()).filter(Boolean) || [],
    tuitionType, location,
    salary: salary ? Number(salary) : undefined,
    salaryNegotiable: !!salaryNegotiable,
    experience, description, contactPhone, gender,
    poster: req.user._id,
  });
  await item.populate('poster', 'name avatar college isVerifiedSeller');
  res.status(201).json(item);
});

// DELETE /api/tuition/:id
router.delete('/:id', protect, async (req, res) => {
  const item = await Tuition.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  if (item.poster.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  item.isActive = false;
  await item.save();
  res.json({ message: 'Removed' });
});

module.exports = router;
