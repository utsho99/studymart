const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { uploadPdf } = require('../middleware/uploadMiddleware');

// GET /api/notes
router.get('/', optionalAuth, async (req, res) => {
  const { search, subject, class: noteClass, page = 1, limit = 20 } = req.query;
  const query = { isApproved: true };
  if (search) query.$text = { $search: search };
  if (subject) query.subject = new RegExp(subject, 'i');
  if (noteClass) query.class = noteClass;

  const skip = (Number(page) - 1) * Number(limit);
  const [notes, total] = await Promise.all([
    Note.find(query).populate('uploader', 'name avatar college').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Note.countDocuments(query),
  ]);
  res.json({ notes, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET /api/notes/:id
router.get('/:id', async (req, res) => {
  const note = await Note.findById(req.params.id).populate('uploader', 'name avatar college');
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json(note);
});

// POST /api/notes
router.post('/', protect, uploadPdf.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'PDF file is required' });
  const { title, description, subject, class: noteClass, isFree, price } = req.body;

  const note = await Note.create({
    title,
    description,
    subject,
    class: noteClass,
    fileUrl: `/uploads/files/${req.file.filename}`,
    fileSize: req.file.size,
    isFree: isFree !== 'false',
    price: isFree !== 'false' ? 0 : Number(price),
    uploader: req.user._id,
  });

  await note.populate('uploader', 'name avatar college');
  res.status(201).json(note);
});

// PATCH /api/notes/:id/download
router.patch('/:id/download', async (req, res) => {
  await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
  res.json({ message: 'Download counted' });
});

// DELETE /api/notes/:id
router.delete('/:id', protect, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Not found' });
  if (note.uploader.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  await note.deleteOne();
  res.json({ message: 'Note deleted' });
});

module.exports = router;
