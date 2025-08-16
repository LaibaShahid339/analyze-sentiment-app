import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let unsubAuth;
    let unsubSnapshot;

    setLoading(true);
    setErr(null);

    unsubAuth = onAuthStateChanged(auth, (user) => {
      // stop any prior listener if user changes
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = undefined;
      }

      if (!user) {
        setHistory([]);
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "sentimentHistory"),
          where("uid", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(100)
        );

        unsubSnapshot = onSnapshot(
          q,
          (snapshot) => {
            const rows = snapshot.docs.map((doc) => {
              const data = doc.data();
              // Safely convert timestamp
              let jsDate = null;
              const t = data.timestamp;
              if (t?.toDate) jsDate = t.toDate();
              else if (typeof t === "number") jsDate = new Date(t);
              else if (typeof t === "string") jsDate = new Date(t);

              return {
                id: doc.id,
                text: data.text ?? "",
                sentiment: data.sentiment ?? "-",
                timestamp: jsDate,
              };
            });
            setHistory(rows);
            setLoading(false);
          },
          (error) => {
            console.error("onSnapshot error:", error);
            setErr(error.message || "Failed to load history");
            setLoading(false);
          }
        );
      } catch (e) {
        console.error("History query setup error:", e);
        setErr(e.message || "Failed to set up history listener");
        setLoading(false);
      }
    });

    return () => {
      if (unsubSnapshot) unsubSnapshot();
      if (unsubAuth) unsubAuth();
    };
  }, []);

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'from-green-400 to-emerald-500';
      case 'negative':
        return 'from-red-400 to-pink-500';
      case 'neutral':
        return 'from-gray-400 to-slate-500';
      default:
        return 'from-blue-400 to-indigo-500';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'negative':
        return (
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'neutral':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h.01M15 10h.01" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return "Unknown time";
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl mb-6 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Analysis
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent"> History</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Track your sentiment analysis journey and insights over time
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
          {loading && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
                <div className="w-8 h-8 border-4 border-white/30 border-t-cyan-400 rounded-full animate-spin"></div>
              </div>
              <p className="text-white/80 text-lg">Loading your history...</p>
            </div>
          )}

          {err && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-red-200 font-medium">Error loading history</p>
                  <p className="text-red-300 text-sm">{err}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !err && history.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-white/60 text-lg mb-2">No analysis history yet</p>
              <p className="text-white/40">Your sentiment analyses will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              {history.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-white mb-2">{history.length}</div>
                    <div className="text-white/60">Total Analyses</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {history.filter(h => h.sentiment?.toLowerCase() === 'positive').length}
                    </div>
                    <div className="text-white/60">Positive</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
                    <div className="text-3xl font-bold text-red-400 mb-2">
                      {history.filter(h => h.sentiment?.toLowerCase() === 'negative').length}
                    </div>
                    <div className="text-white/60">Negative</div>
                  </div>
                </div>
              )}

              {/* History List */}
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Sentiment Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 bg-gradient-to-r ${getSentimentColor(item.sentiment)} rounded-xl flex items-center justify-center shadow-lg`}>
                          {getSentimentIcon(item.sentiment)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-white font-medium text-lg leading-relaxed break-words">
                              "{item.text}"
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-white/60 text-sm">Sentiment:</span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getSentimentColor(item.sentiment)} text-white shadow-sm`}>
                                {item.sentiment || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-white/50 text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatTimeAgo(item.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}