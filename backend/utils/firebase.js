const admin = require('firebase-admin');

let initialized = false;

const initFirebase = () => {
  if (initialized) return admin;
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT not set. Background push notifications disabled.');
    return null;
  }
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log('✅ Firebase Admin initialized');
    return admin;
  } catch (err) {
    console.error('Firebase init error:', err.message);
    return null;
  }
};

// Send a push notification to a single device token
const sendPushNotification = async (token, title, body, link) => {
  const fbAdmin = initFirebase();
  if (!fbAdmin || !token) return;

  try {
    await fbAdmin.messaging().send({
      token,
      notification: { title, body },
      webpush: {
        notification: {
          icon: 'https://studymartbd.shop/icon-192.png',
          badge: 'https://studymartbd.shop/icon-192.png',
        },
        fcmOptions: {
          link: link ? `https://studymartbd.shop${link}` : 'https://studymartbd.shop',
        },
      },
    });
  } catch (err) {
    // Token might be expired/invalid - that's fine, just log it
    console.error('Push notification failed:', err.message);
  }
};

module.exports = { initFirebase, sendPushNotification };
