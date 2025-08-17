import React, { useState } from "react";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [history, setHistory] = useState([]);

  const addTransaction = (type) => {
    const val = parseFloat(amount);
    if (isNaN(val)) return;
    const newBalance = type === "income" ? balance + val : balance - val;
    setBalance(newBalance);
    setHistory([...history, { type, val }]);
    setAmount("");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">💸 לוח מחוונים</h1>
      <p className="text-lg mb-4">יתרה: {balance} ₪</p>

      <input
        type="number"
        className="border p-2 rounded mb-2"
        placeholder="סכום"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <div>
        <button onClick={() => addTransaction("income")} className="bg-green-500 text-white px-3 py-1 rounded mr-2">
          הכנסה
        </button>
        <button onClick={() => addTransaction("expense")} className="bg-red-500 text-white px-3 py-1 rounded">
          הוצאה
        </button>
      </div>

      <h2 className="mt-4 font-bold">היסטוריה</h2>
      <ul>
        {history.map((h, i) => (
          <li key={i} className={h.type === "income" ? "text-green-600" : "text-red-600"}>
            {h.type === "income" ? "+" : "-"} {h.val} ₪
          </li>
        ))}
      </ul>
    </div>
  );
}
