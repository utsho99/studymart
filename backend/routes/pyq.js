const express = require('express');
const router = express.Router();
const PYQ = require('../models/PYQ');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadPdf } = require('../middleware/uploadMiddleware');

// GET /api/pyq
router.get('/', optionalAuth, async (req, res) => {
  const { search, examType, subject, year, page = 1, limit = 20 } = req.query;
  const query = { isApproved: true };
  if (search) query.$text = { $search: search };
  if (examType) query.examType = examType;
  if (subject) query.subject = new RegExp(subject, 'i');
  if (year) query.year = Number(year);

  const skip = (Number(page) - 1) * Number(limit);
  const [pyqs, total] = await Promise.all([
    PYQ.find(query).populate('uploader', 'name avatar college').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    PYQ.countDocuments(query),
  ]);
  res.json({ pyqs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET /api/pyq/:id
router.get('/:id', async (req, res) => {
  const pyq = await PYQ.findById(req.params.id).populate('uploader', 'name avatar college');
  if (!pyq) return res.status(404).json({ message: 'Not found' });
  res.json(pyq);
});

// POST /api/pyq
router.post('/', protect, uploadPdf.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'PDF file is required' });
  const { title, description, subject, examType, year, institution } = req.body;
  if (!title || !subject || !examType || !year) return res.status(400).json({ message: 'Please fill all required fields' });

  const pyq = await PYQ.create({
    title, description, subject, examType,
    year: Number(year),
    institution,
    fileUrl: `/uploads/files/${req.file.filename}`,
    fileSize: req.file.size,
    uploader: req.user._id,
  });
  await pyq.populate('uploader', 'name avatar college');
  res.status(201).json(pyq);
});

// PATCH /api/pyq/:id/download
router.patch('/:id/download', async (req, res) => {
  await PYQ.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
  res.json({ message: 'Download counted' });
});

// DELETE /api/pyq/:id
router.delete('/:id', protect, async (req, res) => {
  const pyq = await PYQ.findById(req.params.id);
  if (!pyq) return res.status(404).json({ message: 'Not found' });
  if (pyq.uploader.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  await pyq.deleteOne();
  res.json({ message: 'Deleted' });
});

module.exports = router;
