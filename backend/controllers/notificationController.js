let admin;

// Firebase admin SDK ni lazy load qilish
const getFirebaseAdmin = () => {
  if (!admin) {
    admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
    }
  }
  return admin;
};

// Push notification yuborish
const sendNotification = async (fcmToken, title, body, data = {}) => {
  try {
    const firebaseAdmin = getFirebaseAdmin();

    const message = {
      notification: { title, body },
      data,
      token: fcmToken,
      android: {
        notification: {
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await firebaseAdmin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Notification xatosi:', error.message);
    return { success: false, error: error.message };
  }
};

// Ko'p foydalanuvchiga yuborish
const sendMulticastNotification = async (fcmTokens, title, body, data = {}) => {
  try {
    const firebaseAdmin = getFirebaseAdmin();

    const message = {
      notification: { title, body },
      data,
      tokens: fcmTokens
    };

    const response = await firebaseAdmin.messaging().sendMulticast(message);
    return { success: true, successCount: response.successCount };
  } catch (error) {
    console.error('Multicast notification xatosi:', error.message);
    return { success: false };
  }
};

module.exports = { sendNotification, sendMulticastNotification };
