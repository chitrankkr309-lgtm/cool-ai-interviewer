'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, Lock, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [reports, setReports] = useState<any[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passkey === 'admin123') { // Tum apna password yahan change kar sakte ho
      setIsAuthenticated(true);
      fetchReports();
    } else {
      alert('Incorrect Admin Password!');
    }
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from('interview_reports')
      .select('*')
      .order('created_at', { ascending: false });
    setReports(data || []);
  };

  const deleteReport = async (id: string) => {
    await supabase.from('interview_reports').delete().eq('id', id);
    fetchReports();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full space-y-6 shadow-2xl">
          <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <ShieldCheck size={32} />
            <h1 className="text-2xl font-bold">Admin Login</h1>
          </div>
          <div>
            <label className="block text-zinc-400 text-sm mb-2 font-medium">Enter Admin Passkey</label>
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="e.g. admin123"
              className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-700 text-white focus:border-cyan-500 outline-none"
            />
          </div>
          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-4 rounded-xl font-bold transition-all">
            Access Admin Dashboard 🔓
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-cyan-400" size={32} />
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Portal - All Interviews</h1>
          </div>
          <Link href="/" className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-zinc-800">
            <ArrowLeft size={18} /> Home
          </Link>
        </div>

        <div className="space-y-4">
          {reports.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex justify-between items-center gap-4">
              <div>
                <span className="text-xs text-cyan-400 font-semibold uppercase">{new Date(item.created_at).toLocaleString()}</span>
                <p className="text-zinc-300 mt-2 max-w-2xl">{item.feedback}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex gap-3 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 text-center text-sm">
                  <div><span className="text-zinc-500 text-xs block">Tech</span><b className="text-cyan-400">{item.technical_score}</b></div>
                  <div><span className="text-zinc-500 text-xs block">Comm</span><b className="text-cyan-400">{item.communication_score}</b></div>
                  <div><span className="text-zinc-500 text-xs block">Conf</span><b className="text-cyan-400">{item.confidence_score}</b></div>
                </div>
                <button onClick={() => deleteReport(item.id)} className="p-3 bg-red-950/50 hover:bg-red-900 text-red-400 rounded-xl transition border border-red-900/50">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}