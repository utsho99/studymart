const Notification = require('../models/Notification');
const User = require('../models/User');

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

    // Send FCM push if user has token
    const recipient = await User.findById(recipientId).select('fcmToken');
    if (recipient?.fcmToken && process.env.FCM_SERVER_KEY) {
      sendFCMPush(recipient.fcmToken, title, body, link).catch(() => {});
    }

    return notification;
  } catch (err) {
    console.error('Notification error:', err);
  }
};

// Send FCM push notification
const sendFCMPush = async (token, title, body, link) => {
  const payload = {
    to: token,
    notification: { title, body, icon: '/studymart-icon.png', click_action: link },
    data: { link },
  };

  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${process.env.FCM_SERVER_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  return res.json();
};

module.exports = { createNotification };
