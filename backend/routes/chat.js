const express = require('express');
const router = express.Router();
const { Message, Conversation } = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// GET /api/chat/conversations - get all conversations for current user
router.get('/conversations', protect, async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name avatar college')
    .populate('listing', 'title images price')
    .sort({ lastMessageAt: -1 });
  res.json(conversations);
});

// POST /api/chat/conversations - start or get existing conversation
router.post('/conversations', protect, async (req, res) => {
  const { recipientId, listingId } = req.body;
  if (!recipientId) return res.status(400).json({ message: 'recipientId required' });

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, recipientId] },
    listing: listingId || null,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      listing: listingId || null,
    });
  }

  await conversation.populate('participants', 'name avatar college');
  await conversation.populate('listing', 'title images price');
  res.json(conversation);
});

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', protect, async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
  if (!conversation.participants.includes(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

  const { page = 1, limit = 50 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const messages = await Message.find({ conversation: req.params.id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Mark messages as read
  await Message.updateMany(
    { conversation: req.params.id, sender: { $ne: req.user._id }, isRead: false },
    { isRead: true }
  );

  res.json(messages.reverse());
});

// POST /api/chat/conversations/:id/messages - send message (REST fallback)
router.post('/conversations/:id/messages', protect, async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: 'Message text required' });

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
  if (!conversation.participants.includes(req.user._id)) return res.status(403).json({ message: 'Not authorized' });

  const message = await Message.create({ conversation: req.params.id, sender: req.user._id, text });
  await Conversation.findByIdAndUpdate(req.params.id, { lastMessage: text, lastMessageAt: new Date() });
  await message.populate('sender', 'name avatar');
  res.status(201).json(message);
});

module.exports = router;
