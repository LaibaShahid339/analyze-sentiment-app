import React, { useState, useEffect} from 'react';
import { Brain, MessageCircle, BarChart3, Heart, Shield, Zap, ChevronRight, Star, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [isVisible, setIsVisible] = useState({});
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const navigate = useNavigate();

  const testimonials = [
    { name: "Tech Review", role: "Portfolio Showcase", text: "Impressive integration of modern web technologies with practical AI applications." },
    { name: "Code Quality", role: "Development Practice", text: "Clean architecture, well-documented code, and excellent use of design patterns." },
    { name: "Innovation", role: "Technical Achievement", text: "Creative approach to combining sentiment analysis with conversational AI interfaces." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleIntersection = (id) => {
    setIsVisible(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 group cursor-pointer">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl group-hover:bg-white/30 transition-all duration-300">
              <Brain className="w-8 h-8 text-cyan-300" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              MindScope
            </span>
          </div>
          <div className="hidden md:flex space-x-8">
            {['Features', 'Tech Stack', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-white/80 hover:text-white transition-all duration-300 hover:scale-105">
                {item}
              </a>
            ))}
          </div>
          <button onClick={() => navigate('/home')} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              AI-Powered
              <span className="bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent block">
                Mental Wellness
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              A personal portfolio project combining advanced sentiment analysis with compassionate AI counseling. 
              Built to showcase modern web development and machine learning integration.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={() => navigate('/home')} className="group bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              Login
              <ChevronRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-full font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105">
              View Code
            </button>
          </div>

          {/* Stats */}
          <div id="tech stack" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {[
              { icon: Users, value: "React", label: "Frontend Framework" },
              { icon: TrendingUp, value: "Python", label: "ML Backend" },
              { icon: Star, value: "Ollama", label: "AI Integration" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 group-hover:bg-white/20 transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-cyan-300" />
                </div>
                <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id = 'features' className="relative z-10 px-6 py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Technical Features &
              <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent"> Implementation</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              A showcase of modern development practices, AI integration, and user-centered design principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart3,
                title: "Real-time Sentiment Analysis",
                description: "Built with Python and scikit-learn, featuring custom NLP models for emotion detection with data visualization using Chart.js.",
                color: "from-blue-400 to-cyan-400"
              },
              {
                icon: MessageCircle,
                title: "AI Mental Health Chatbot",
                description: "OpenAI GPT integration with custom prompt engineering for empathetic responses and conversation memory management.",
                color: "from-purple-400 to-pink-400"
              },
              {
                icon: Shield,
                title: "Secure Data Handling",
                description: "Implemented with JWT authentication, encrypted data storage, and privacy-first design principles throughout the application.",
                color: "from-green-400 to-teal-400"
              },
              {
                icon: Brain,
                title: "Machine Learning Pipeline",
                description: "Custom trained models using TensorFlow for sentiment classification with preprocessing and feature extraction pipelines.",
                color: "from-orange-400 to-red-400"
              },
              {
                icon: Heart,
                title: "Interactive Dashboard",
                description: "React-based responsive UI with real-time updates, state management using Redux, and modern component architecture.",
                color: "from-pink-400 to-rose-400"
              },
              {
                icon: Zap,
                title: "Full-Stack Integration",
                description: "RESTful API design with Node.js/Express backend, PostgreSQL database, and seamless frontend-backend communication.",
                color: "from-yellow-400 to-orange-400"
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:border-white/20">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">
            Trusted by
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent"> Professionals</span>
          </h2>
          
          <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 min-h-[200px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 p-8 transition-all duration-500 ${
                  index === currentTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
                }`}
              >
                <p className="text-xl md:text-2xl text-white/90 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full flex items-center justify-center font-bold text-white">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-white/60">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-cyan-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
            {/* Contact Section */}
<section id="contact" className="relative z-10 px-6 py-20 bg-black/30 backdrop-blur-sm">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-4xl md:text-5xl font-bold mb-6">
      Contact <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">Me</span>
    </h2>
    <p className="text-white/70 mb-12">
      Let’s connect! You can reach me through any of the platforms below.
    </p>

    <div className="flex flex-col sm:flex-row justify-center gap-6">
      {/* Email */}
      <a
        href="mailto:laibashahid1062@gmail.com"
        className="group flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m0 0l-4 4m4-4l-4-4m8 4h4m0 0l4 4m-4-4l4-4" />
        </svg>
        <span>Email</span>
      </a>

      {/* LinkedIn */}
      <a
        href="https://www.linkedin.com/in/laiba-shahid-02a5382a6"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 24V7h5v17H0zM7 24V7h4.78v2.56h.07c.67-1.27 2.31-2.56 4.76-2.56 5.09 0 6.02 3.34 6.02 7.69V24h-5V15.21c0-2.09-.04-4.78-2.91-4.78-2.91 0-3.36 2.27-3.36 4.62V24H7z"/>
        </svg>
        <span>LinkedIn</span>
      </a>

      {/* GitHub */}
      <a
        href="https://github.com/LaibaShahid339"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.48 2 2 6.58 2 12.15c0 4.45 2.87 8.22 6.84 9.55.5.09.66-.22.66-.48v-1.7c-2.78.61-3.37-1.37-3.37-1.37-.45-1.17-1.1-1.48-1.1-1.48-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.54 2.34 1.09 2.91.83.09-.66.35-1.1.64-1.35-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.02a9.2 9.2 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.4.2 2.44.1 2.7.64.71 1.03 1.62 1.03 2.74 0 3.92-2.34 4.8-4.56 5.06.36.31.68.93.68 1.88v2.79c0 .26.16.57.67.48A10.17 10.17 0 0 0 22 12.15C22 6.58 17.52 2 12 2z" clipRule="evenodd" />
        </svg>
        <span>GitHub</span>
      </a>

    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="w-8 h-8 text-cyan-300" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                MindScope
              </span>
            </div>
            <div className="text-white/60">
              © 2025 MindScope. Empowering mental wellness through AI.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}