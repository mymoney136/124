const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // מאפשר לאתר שלך לדבר עם השרת

// טעינת מפתח השרת שהורדת מ-Firebase (Service Account JSON)
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const messaging = admin.messaging();

// API לקבלת משימות
app.get('/api/tasks/:classCode', async (req, res) => {
    try {
        const snapshot = await db.collection('tasks')
            .where('classCode', '==', req.params.classCode).get();
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(tasks);
    } catch (err) { res.status(500).send(err.message); }
});

// API לשמירת טוקן להתראות (Push)
app.post('/api/save-token', async (req, res) => {
    const { studentName, classCode, token } = req.body;
    try {
        await db.collection('push_tokens').doc(`${studentName}_${classCode}`).set({
            token, classCode, studentName, lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        res.send("Token Saved");
    } catch (err) { res.status(500).send(err.message); }
});

// API למורה: שליחת משימה + התראה
app.post('/api/send-task', async (req, res) => {
    const { title, classCode, endTime, teacherKey } = req.body;
    
    // בדיקת אבטחה בשרת
    if (teacherKey !== "YOUR_SECRET_SERVER_PASSWORD") {
        return res.status(403).send("Unauthorized");
    }

    try {
        // 1. שמירה ב-DB
        await db.collection('tasks').add({ title, classCode, endTime });

        // 2. שליחת Push לכל התלמידים בכיתה
        const tokensSnapshot = await db.collection('push_tokens')
            .where('classCode', '==', classCode).get();
        
        const registrationTokens = tokensSnapshot.docs.map(d => d.data().token);

        if (registrationTokens.length > 0) {
            const message = {
                notification: { title: "משימה חדשה!", body: title },
                tokens: registrationTokens,
            };
            await messaging.sendEachForMulticast(message);
        }
        
        res.send("Task Sent and Notifications Delivered");
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(3000, () => console.log('Server running on port 3000'));
