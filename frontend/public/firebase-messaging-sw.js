importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA9iwLUIQHq-ioyv37mmKrVNTZDG6xNxb0',
  authDomain: 'studymart-82e07.firebaseapp.com',
  projectId: 'studymart-82e07',
  storageBucket: 'studymart-82e07.firebasestorage.app',
  messagingSenderId: '278307499170',
  appId: '1:278307499170:web:d6dcf515c20e8dd80d7bfb',
});

const messaging = firebase.messaging();

// Handle background push messages (app fully closed)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const link = payload.fcmOptions?.link || payload.data?.link || '/';

  self.registration.showNotification(title || 'StudyMart', {
    body: body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { link },
  });
});

// Handle notification click - open the app to the right page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  const fullUrl = new URL(link, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(fullUrl);
    })
  );
});
