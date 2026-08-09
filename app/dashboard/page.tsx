'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { ArrowLeft, History, Trophy } from 'lucide-react';

export default function QuizHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from('quiz_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
      } else {
        setHistory(data || []);
      }
      setLoading(false);
    }

    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <History className="text-cyan-400" size={32} />
            <h1 className="text-3xl font-bold">Your Quiz History</h1>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-cyan-400 transition font-medium">
            <ArrowLeft size={18} /> Back to Generator
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-zinc-500 py-12">Loading your past challenges...</p>
        ) : history.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <p className="text-zinc-400 mb-4">No quiz attempts found yet.</p>
            <Link href="/dashboard" className="bg-cyan-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-400 transition">
              Take Your First Quiz 🚀
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
                <div>
                  <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                    {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString()}
                  </span>
                  <h2 className="text-xl font-bold mt-1 text-white">{item.topic}</h2>
                  <p className="text-sm text-zinc-400 mt-1">User: {item.user_email}</p>
                </div>

                <div className="flex items-center gap-4 bg-zinc-950 px-5 py-3 rounded-xl border border-zinc-800">
                  <Trophy className="text-yellow-400" size={24} />
                  <div>
                    <p className="text-xs text-zinc-400">Score</p>
                    <p className="text-lg font-extrabold text-white">
                      {item.score} / {item.total_questions}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}