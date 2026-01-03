importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDvnS8L9r2LMKcUD78Ix7bldVp9qzbYwtk",
    projectId: "tast-7808e",
    messagingSenderId: "99024860024",
    appId: "1:99024860024:web:24ab70c10254a2014fce8d"
});

const messaging = firebase.messaging();

// מה קורה כשהתראה מגיעה כשהמסך נעול
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.png' // שים כאן לוגו של האפליקציה שלך
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
