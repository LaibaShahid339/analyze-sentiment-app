import React, { useState } from 'react';
import { Pie } from 'recharts';
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const API_BASE_URL = 'http://localhost:5000';

// Result Card Component
const ResultCard = ({ result, isLoading }) => {
  if (!result && !isLoading) return null;

  const chartData = result ? [
    { name: 'Positive', value: result.scores.positive * 100, fill: '#10B981' },
    { name: 'Neutral', value: result.scores.neutral * 100, fill: '#F59E0B' },
    { name: 'Negative', value: result.scores.negative * 100, fill: '#EF4444' }
  ] : [];

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-green-100 bg-gradient-to-r from-green-500 to-emerald-500';
      case 'negative':
        return 'text-red-100 bg-gradient-to-r from-red-500 to-pink-500';
      case 'neutral':
        return 'text-yellow-100 bg-gradient-to-r from-yellow-500 to-orange-500';
      default:
        return 'text-gray-100 bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return (
          <svg className="w-8 h-8 text-green-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'negative':
        return (
          <svg className="w-8 h-8 text-red-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-yellow-300 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h.01M15 10h.01" />
          </svg>
        );
    }
  };

  return (
    <div className="mt-8 animate-fadeIn">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-white mb-2">
            Analysis Results
          </h3>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-white/20 rounded-full animate-spin border-t-cyan-400"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl text-white/90 font-medium mb-2">Analyzing your text...</p>
              <p className="text-white/60">This may take a few moments</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Sentiment Display */}
            <div className="text-center lg:text-left space-y-6">
              {/* Main Sentiment Badge */}
              <div className="flex items-center justify-center lg:justify-start mb-8">
                {getSentimentIcon(result.sentiment)}
                <span className={`inline-flex items-center px-8 py-4 rounded-2xl text-2xl font-bold shadow-lg ${getSentimentColor(result.sentiment)}`}>
                  {result.sentiment}
                </span>
              </div>
              
              {/* Score Bars */}
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                      <span className="font-semibold text-white">Positive</span>
                    </div>
                    <span className="font-bold text-green-300 text-lg">{(result.scores.positive * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${result.scores.positive * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="font-semibold text-white">Neutral</span>
                    </div>
                    <span className="font-bold text-yellow-300 text-lg">{(result.scores.neutral * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${result.scores.neutral * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                      <span className="font-semibold text-white">Negative</span>
                    </div>
                    <span className="font-bold text-red-300 text-lg">{(result.scores.negative * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-pink-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{ width: `${result.scores.negative * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-8 shadow-2xl">
                  <Pie
                    width={256}
                    height={256}
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={3}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="text-3xl font-bold text-white mb-1">{result.sentiment}</div>
                      <div className="text-sm text-white/60 uppercase tracking-wide">Dominant</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Error Message Component
const ErrorMessage = ({ message, onClose }) => (
  <div className="mt-6 animate-fadeIn">
    <div className="bg-red-500/20 border border-red-500/30 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-red-200 font-semibold text-lg">Analysis Failed</p>
            <p className="text-red-300">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors duration-200"
        >
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const SentimentApp = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeSentiment = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      // Save to Firestore
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "sentimentHistory"), {
          uid: user.uid,
          text: inputText,
          sentiment: data.sentiment,
          scores: data.scores || {},
          timestamp: serverTimestamp()
        });
      } else {
        console.warn("No authenticated user, skipping Firestore save.");
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze sentiment. Please make sure the Flask server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      analyzeSentiment();
    }
  };

  const clearText = () => {
    setInputText('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sentiment
            <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent block">
              Analyzer
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto">
            Discover the emotional tone and sentiment of your text using advanced AI analysis
          </p>
        </div>

        {/* Main Input Section */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 mb-8">
          <div className="mb-8">
            <label htmlFor="textInput" className="block text-xl font-semibold text-white mb-4">
              Enter your text for analysis:
            </label>
            <div className="relative">
              <textarea
                id="textInput"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type or paste your text here... Share your thoughts, reviews, messages, or any content you'd like analyzed..."
                className="w-full h-48 px-6 py-4 bg-white/5 border-2 border-white/20 rounded-2xl focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 transition-all duration-300 resize-none text-white placeholder-white/40 text-lg leading-relaxed backdrop-blur-sm"
                maxLength={2000}
              />
              {inputText && (
                <button
                  onClick={clearText}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center space-x-4">
                <span className="text-white/60 text-sm">{inputText.length}/2000 characters</span>
                {inputText.length > 0 && (
                  <div className="flex items-center text-white/40 text-sm">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Ctrl+Enter to analyze
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={analyzeSentiment}
              disabled={isLoading || !inputText.trim()}
              className="group bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-2xl min-w-[200px]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Analyze Sentiment
                </div>
              )}
            </button>

            {inputText && !isLoading && (
              <button
                onClick={clearText}
                className="text-white/70 hover:text-white font-medium px-6 py-4 rounded-2xl border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/5"
              >
                Clear Text
              </button>
            )}
          </div>

          {error && <ErrorMessage message={error} onClose={() => setError('')} />}
        </div>

        <ResultCard result={result} isLoading={isLoading} />

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-white/60">Powered by AI • Built with React & Modern Web Technologies</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentApp;