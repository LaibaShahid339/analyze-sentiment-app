import React, { useState } from "react";
import SentimentApp from "./SentimentApp";
import Login from "./Login";
import History from "./History";
import SentimentPatterns from "./SentimentPatterns";
import MentalHealthChat from "./MentalHealthChat";

export default function Home() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("analyze");

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div>
      <nav className="p-4 bg-[#482384] text-white flex justify-between">
        <button onClick={() => setPage("analyze")}>Analyze</button>
        <button onClick={() => setPage("history")}>History</button>
        <button onClick={() => setPage("patterns")}>Graph</button>
        <button onClick={() => setPage("chat")}>Chat</button>
      </nav>
      {page === "analyze" && <SentimentApp />}
      {page === "history" && <History />}
      {page === "patterns" && <SentimentPatterns />}
      {page === "chat" && <MentalHealthChat/>}
    </div>
  );
}
