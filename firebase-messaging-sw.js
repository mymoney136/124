importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDvnS8L9r2LMKcUD78Ix7bldVp9qzbYwtk",
    projectId: "tast-7808e",
    messagingSenderId: "99024860024",
    appId: "1:99024860024:web:24ab70c10254a2014fce8d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification.title || "משימה חדשה מראלי מטו\"ס 🔔";
    const notificationOptions = {
        body: payload.notification.body || "המורה פרסם משימה חדשה, היכנס לבדוק!",
        icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
