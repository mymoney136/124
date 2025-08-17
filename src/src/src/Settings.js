import React, { useState } from "react";

export default function Settings() {
  const [theme, setTheme] = useState("light");
  const [lang, setLang] = useState("he");
  const [currency, setCurrency] = useState("ILS");

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">⚙️ הגדרות</h1>

      <div className="mb-4">
        <label className="block font-semibold">מצב:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)} className="p-2 border rounded">
          <option value="light">בהיר</option>
          <option value="dark">כהה</option>
          <option value="glass">שקוף</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold">שפה:</label>
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="p-2 border rounded">
          <option value="he">עברית</option>
          <option value="en">English</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold">מטבע:</label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="p-2 border rounded">
          <option value="ILS">שקל</option>
          <option value="USD">דולר</option>
          <option value="EUR">אירו</option>
        </select>
      </div>
    </div>
  );
}
