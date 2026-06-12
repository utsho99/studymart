const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET /api/notifications - get all notifications
router.get('/', protect, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.json({ notifications, total, unreadCount });
});

// GET /api/notifications/unread-count
router.get('/unread-count', protect, async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ count });
});

// PATCH /api/notifications/read-all - mark all as read
router.patch('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
});

// PATCH /api/notifications/:id/read - mark one as read
router.patch('/:id/read', protect, async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true }
  );
  res.json({ message: 'Marked as read' });
});

// DELETE /api/notifications - clear all
router.delete('/', protect, async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  res.json({ message: 'All notifications cleared' });
});

// POST /api/notifications/fcm-token - save FCM token
router.post('/fcm-token', protect, async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'Token required' });
  await User.findByIdAndUpdate(req.user._id, { fcmToken: token });
  res.json({ message: 'FCM token saved' });
});

module.exports = router;
