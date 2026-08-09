'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import InterviewEngine from '@/components/InterviewEngine';
import { Sparkles, BrainCircuit, ArrowRight, History, LogOut, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(true);

  const [topic, setTopic] = useState('React.js');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Sign up successful! You can now log in.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  // 1. IF NOT LOGGED IN -> SHOW LOGIN / SIGNUP PAGE FIRST
  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
        
        <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-10 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-800/60 px-3.5 py-1 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Secure Access
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-zinc-400 text-sm">Sign in or register to track your interview history & mistakes.</p>
          </div>

          {/* Google OAuth Button with official logo */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="px-3 text-zinc-500 text-xs uppercase font-medium">Or continue with email</span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white focus:border-cyan-500 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-zinc-500" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white focus:border-cyan-500 outline-none transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              {isSignUp ? 'Sign Up 🚀' : 'Sign In 🚀'}
            </button>
          </form>

          <div className="text-center text-sm">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-cyan-400 hover:underline font-medium cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 2. IF LOGGED IN -> SHOW DASHBOARD WITH PROMINENT HISTORY BUTTON
  if (started) {
    return <InterviewEngine topic={topic} difficulty={difficulty} />;
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>

      {/* Top Navbar with Prominent History Button first */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
        <Link 
          href="/history" 
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-5 py-3 rounded-2xl text-sm font-extrabold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
        >
          <History size={18} /> View Interview History & Mistakes 📊
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-red-400"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="max-w-xl w-full bg-zinc-950/80 border border-zinc-800/80 p-8 md:p-10 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.15)] backdrop-blur-xl relative z-10 transition-all duration-500 hover:border-cyan-500/50">
        <div className="flex justify-center mb-6">
          <div className="relative p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-bounce">
            <BrainCircuit size={48} className="text-cyan-400 animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-800/60 px-4 py-1.5 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Logged in as {user.email}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-500 bg-clip-text text-transparent">
            COOL AI INTERVIEWER
          </h1>
          <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
            Autonomous multi-modal intelligence evaluating core technical competencies in real-time.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Interview Topic / Domain</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. React.js, System Design, Python"
              className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:border-cyan-500 outline-none transition-all shadow-inner placeholder-zinc-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:border-cyan-500 outline-none transition-all shadow-inner font-medium cursor-pointer"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced / Expert</option>
            </select>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black py-4 rounded-2xl font-extrabold text-lg transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-[1.02] flex items-center justify-center gap-3 cursor-pointer"
          >
            Start Interview Now <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}