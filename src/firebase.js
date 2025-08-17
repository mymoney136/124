import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCAkTramEw9xQsKDJafmKPTRaoQMyxl_88",
  authDomain: "my-money-site-177b1.firebaseapp.com",
  projectId: "my-money-site-177b1",
  storageBucket: "my-money-site-177b1.firebasestorage.app",
  messagingSenderId: "1001673216101",
  appId: "1:1001673216101:web:1135329ea119260a89b68c"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
