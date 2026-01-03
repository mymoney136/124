// הוסף את זה בתחילת ה-Script
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// פונקציה לרישום השומר (Service Worker) וקבלת הרשאה
async function setupNotifications() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            console.log('Service Worker רשום בהצלחה');

            const messaging = getMessaging();
            // בקשת הרשאה וקבלת Token (מזהה מכשיר)
            const currentToken = await getToken(messaging, { 
                serviceWorkerRegistration: registration,
                vapidKey: 'YOUR_PUBLIC_VAPID_KEY' // יש להוציא מהגדרות Cloud Messaging ב-Firebase
            });

            if (currentToken) {
                // שמירת ה-Token ב-Database תחת התלמיד כדי שהמורה יוכל לשלוח לו
                console.log("Token התקבל:", currentToken);
                // כאן תוסיף קוד ששומר את ה-Token ב-Firestore
            }
        } catch (err) {
            console.error('שגיאה בהגדרת התראות:', err);
        }
    }
}

// קרא לפונקציה הזו ברגע שהתלמיד מתחבר לכיתה
