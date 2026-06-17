import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyA9iwLUIQHq-ioyv37mmKrVNTZDG6xNxb0',
  authDomain: 'studymart-82e07.firebaseapp.com',
  projectId: 'studymart-82e07',
  storageBucket: 'studymart-82e07.firebasestorage.app',
  messagingSenderId: '278307499170',
  appId: '1:278307499170:web:d6dcf515c20e8dd80d7bfb',
}

const VAPID_KEY = 'BGILZR0_GgSjweGhYKWie_dMy8xTYxP5BKV0dMynY6YU9K5iKnkMRYGz0NdUmCnsBmtX6bhuQcZ55Mbengv6LNE'

let app = null
let messaging = null

export const initMessaging = async () => {
  try {
    const supported = await isSupported()
    if (!supported) return null
    if (!app) app = initializeApp(firebaseConfig)
    if (!messaging) messaging = getMessaging(app)
    return messaging
  } catch (err) {
    console.error('Firebase messaging init failed:', err)
    return null
  }
}

// Request permission and get a device token
export const requestPushPermission = async () => {
  try {
    const msg = await initMessaging()
    if (!msg) return null

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const registration = await navigator.serviceWorker.ready
    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
    return token
  } catch (err) {
    console.error('Failed to get push token:', err)
    return null
  }
}

// Listen for messages while app is in foreground
export const onForegroundMessage = (callback) => {
  initMessaging().then(msg => {
    if (msg) onMessage(msg, callback)
  })
}
