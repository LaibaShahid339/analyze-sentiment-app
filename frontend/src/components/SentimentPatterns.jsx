// src/components/SentimentPatterns.jsx
import React, { useEffect, useState } from 'react';
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SentimentPatterns = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "sentimentHistory"),
      where("uid", "==", user.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chartData = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          date: d.timestamp?.toDate().toLocaleDateString() || "Unknown",
          positive: (d.scores?.positive || 0) * 100,
          neutral: (d.scores?.neutral || 0) * 100,
          negative: (d.scores?.negative || 0) * 100,
        };
      });
      setData(chartData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Sentiment Pattern Over Time
      </h2>

      {data.length === 0 ? (
        <p className="text-gray-500 text-center">No sentiment data available yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
            <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="neutral" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default SentimentPatterns;
