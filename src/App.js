import React, { useState } from "react";
import { auth } from "./firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from "firebase/auth";
import Dashboard from "./Dashboard";
import Settings from "./Settings";

const provider = new GoogleAuthProvider();

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerMode, setRegisterMode] = useState(false);
  const [page, setPage] = useState("dashboard");

  const loginGoogle = async () => {
    const res = await signInWithPopup(auth, provider);
    setUser(res.user);
  };

  const loginEmail = async () => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    setUser(res.user);
  };

  const registerEmail = async () => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    setUser(res.user);
  };

  const loginGuest = async () => {
    const res = await signInAnonymously(auth);
    setUser(res.user);
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
        <div className="bg-white/40 backdrop-blur-lg p-6 rounded-2xl shadow-lg w-80">
          <h1 className="text-xl font-bold mb-4 text-center">💰 My Money Site</h1>

          <input
            className="w-full p-2 mb-2 rounded bg-white/70"
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full p-2 mb-2 rounded bg-white/70"
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {registerMode ? (
            <button onClick={registerEmail} className="w-full bg-green-500 text-white p-2 rounded mb-2">
              הרשמה
            </button>
          ) : (
            <button onClick={loginEmail} className="w-full bg-blue-500 text-white p-2 rounded mb-2">
              התחברות
            </button>
          )}

          <button onClick={() => setRegisterMode(!registerMode)} className="w-full text-sm underline mb-2">
            {registerMode ? "כבר יש לך חשבון? התחבר" : "אין לך חשבון? הירשם"}
          </button>

          <button onClick={loginGoogle} className="w-full bg-red-500 text-white p-2 rounded mb-2">
            התחברות עם Google
          </button>

          <button onClick={loginGuest} className="w-full bg-gray-500 text-white p-2 rounded">
            המשך כאורח
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200">
      <header className="flex justify-between items-center p-4 bg-white/50 backdrop-blur-md shadow">
        <h2 className="font-bold">שלום, {user.displayName || "משתמש"}</h2>
        <div>
          <button onClick={() => setPage("dashboard")} className="mr-2">🏠 לוח</button>
          <button onClick={() => setPage("settings")} className="mr-2">⚙️ הגדרות</button>
          <button onClick={logout} className="bg-red-500 text-white px-3 py-1 rounded">התנתק</button>
        </div>
      </header>

      {page === "dashboard" ? <Dashboard /> : <Settings />}
    </div>
  );
}
