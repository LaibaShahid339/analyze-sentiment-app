import React, { useEffect, useMemo, useRef, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const API_BASE_URL = "http://localhost:5000"; // Flask backend

export default function MentalHealthChat() {
  const [sessionId] = useState(() => uuidv4());
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]); // [{id, role, content, timestamp}]
  const bottomRef = useRef(null);

  const user = auth.currentUser;

  // Subscribe to Firestore messages for this user + session
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "mhChatHistory"),
      where("uid", "==", user.uid),
      where("sessionId", "==", sessionId),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => {
        const data = d.data();
        let ts = null;
        const t = data.timestamp;
        if (t?.toDate) ts = t.toDate();
        else if (typeof t === "number") ts = new Date(t);
        else if (typeof t === "string") ts = new Date(t);
        return {
          id: d.id,
          role: data.role,
          content: data.content,
          timestamp: ts,
        };
      });
      setMessages(rows);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 10);
    });

    return () => unsub();
  }, [db, user, sessionId]);

  // Build short history to send to backend
  const historyForLLM = useMemo(() => {
    return messages
      .filter(m => m.role === "user" || m.role === "assistant")
      .map(m => ({ role: m.role, content: m.content }))
      .slice(-12); // last 12 turns
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    // 1) Save user message
    await addDoc(collection(db, "mhChatHistory"), {
      uid: user.uid,
      sessionId,
      role: "user",
      content: text,
      timestamp: serverTimestamp(),
    });

    try {
      // 2) Ask backend (includes recent history)
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyForLLM,
        }),
      });
      const data = await res.json();
      const reply = data.reply || "I'm here and listening.";
      // 3) Save assistant reply
      await addDoc(collection(db, "mhChatHistory"), {
        uid: user.uid,
        sessionId,
        role: "assistant",
        content: reply,
        timestamp: serverTimestamp(),
        crisis: !!data.crisis,
      });
    } catch (e) {
      console.error(e);
      await addDoc(collection(db, "mhChatHistory"), {
        uid: user.uid,
        sessionId,
        role: "assistant",
        content:
          "I couldn't reach the assistant right now. Please try again in a moment.",
        timestamp: serverTimestamp(),
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-amber-500/20 border border-amber-500/30 backdrop-blur-lg rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-amber-100 text-lg font-medium">
              Please log in to use the mental health companion.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen max-w-5xl mx-auto p-4 flex flex-col">
        {/* Header */}
        <header className="mb-6 text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl mb-4 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Your Mental Health
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent block">
              Companion
            </span>
          </h1>
          <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-sm rounded-2xl p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-200 font-semibold">Important Notice</span>
            </div>
            <p className="text-red-100 text-sm">
              This is not a crisis service. If you're in immediate danger, contact local emergency services.
            </p>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
                  <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-white/60 text-lg">
                  Say hello and share what's on your mind.
                </p>
                <p className="text-white/40 text-sm mt-2">
                  I'm here to listen and support you.
                </p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${m.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    m.role === "user" 
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500" 
                      : "bg-white/20"
                  }`}>
                    {m.role === "user" ? (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Message Bubble */}
                  <div
                    className={`relative px-6 py-4 rounded-2xl shadow-lg ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white"
                        : "bg-white/90 text-gray-800 backdrop-blur-sm"
                    } ${m.role === "user" ? "rounded-br-md" : "rounded-bl-md"}`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {m.content}
                    </div>
                    {m.timestamp && (
                      <div className={`text-xs mt-2 ${m.role === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {sending && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl rounded-bl-md shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 p-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm transition-all duration-300 resize-none"
                  placeholder="Type your message… (Enter to send, Shift+Enter for new line)"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="flex-shrink-0 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white p-4 rounded-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
              >
                {sending ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
            <p className="text-white/60 text-sm">
              For information only. Not a substitute for professional care.
            </p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}