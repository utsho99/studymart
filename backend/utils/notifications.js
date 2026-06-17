const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendPushNotification } = require('./firebase');

// Create a notification in DB
const createNotification = async ({ recipientId, senderId, type, title, body, link }) => {
  try {
    if (recipientId.toString() === senderId?.toString()) return; // Don't notify yourself
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      body,
      link: link || '/',
    });

    // Send real background push if user has a device token
    const recipient = await User.findById(recipientId).select('fcmToken');
    if (recipient?.fcmToken) {
      sendPushNotification(recipient.fcmToken, title, body, link).catch(() => {});
    }

    return notification;
  } catch (err) {
    console.error('Notification error:', err);
  }
};

module.exports = { createNotification };
