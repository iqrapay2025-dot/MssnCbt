importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAs_9uh7SPrddhvubI1-_uPSrFtF4Tb_ZI",
  authDomain: "mssncbt.firebaseapp.com",
  projectId: "mssncbt",
  storageBucket: "mssncbt.firebasestorage.app",
  messagingSenderId: "223425873057",
  appId: "1:223425873057:web:b5e667d2288602a7339ce0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.data || payload.notification || {};
  if (title) {
    self.registration.showNotification(title, {
      body: body || "",
      icon: "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      vibrate: [200, 100, 200],
    });
  }
});