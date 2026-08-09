'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, History, Sparkles, Eye, CheckCircle, X, ShieldAlert } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function HistoryPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    async function fetchReports() {
      // Fetch all reports without restrictions
      const { data, error } = await supabase
        .from('interview_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
      } else {
        setReports(data || []);
      }
      setLoading(false);
    }

    fetchReports();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-8 overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 border-b border-zinc-800 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-950/80 border border-cyan-800/60 px-4 py-1.5 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles size={14} /> Mistake Analysis & History
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-500 bg-clip-text text-transparent">
              Interview History & Correction Guide
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Review your past performance, analyze exact mistakes, and learn how to improve.
            </p>
          </div>
          <Link href="/" className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500 px-5 py-3 rounded-2xl text-sm font-semibold transition-all shadow-lg cursor-pointer">
            <ArrowLeft size={18} /> Back to Home
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-500 animate-pulse text-lg">
            Loading your performance logs...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/60 border border-zinc-800 rounded-3xl backdrop-blur-md shadow-2xl">
            <History size={48} className="mx-auto text-cyan-500 mb-4 animate-spin" />
            <p className="text-zinc-400 text-lg mb-4">No interview history found.</p>
            <Link href="/" className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3.5 rounded-2xl font-extrabold transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] inline-block">
              Launch Interview 🚀
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((item, index) => (
              <div 
                key={item.id || index} 
                className="group bg-zinc-900/80 border border-zinc-800 hover:border-cyan-500 p-6 rounded-3xl shadow-xl transition-all duration-300 backdrop-blur-md relative overflow-hidden space-y-5"
              >
                <div className="flex justify-between items-center border-b border-zinc-800/80 pb-3">
                  <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest bg-cyan-950/80 border border-cyan-900/50 px-3 py-1 rounded-full">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                  
                  <div className="flex gap-3 bg-zinc-950 px-4 py-2 rounded-2xl border border-zinc-800 text-center text-xs">
                    <div><span className="text-zinc-500 block">Tech</span><b className="text-cyan-400">{Math.round(item.technical_score || 0)}%</b></div>
                    <div className="border-r border-zinc-800"></div>
                    <div><span className="text-zinc-500 block">Comm</span><b className="text-cyan-400">{Math.round(item.communication_score || 0)}%</b></div>
                    <div className="border-r border-zinc-800"></div>
                    <div><span className="text-zinc-500 block">Conf</span><b className="text-cyan-400">{Math.round(item.confidence_score || 0)}%</b></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                      <ShieldAlert size={16} /> What Mistakes You Made:
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {item.feedback || "Incomplete conceptual delivery and lack of depth in technical structure."}
                    </p>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-900/40 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <CheckCircle size={16} /> How to Fix / Improve:
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      Focus on structural fundamentals, elaborate code snippets clearly, and maintain assertive communication under questioning.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    onClick={() => setSelectedReport(item)}
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-cyan-500 hover:text-black px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
                  >
                    <Eye size={16} /> View Full Detailed Report & Radar Chart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedReport && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl p-8 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto text-white">
              
              <button 
                onClick={() => setSelectedReport(null)}
                className="absolute top-6 right-6 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer"
              >
                <X size={20} />
              </button>

              <h2 className="text-3xl font-extrabold text-cyan-400 mb-6">Detailed Performance Breakdown</h2>

              <div className="space-y-6 mb-8">
                <div className="h-64 bg-zinc-900/50 rounded-2xl p-4 border border-zinc-900 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: 'Technical', score: selectedReport.technical_score, fullMark: 100 },
                      { subject: 'Communication', score: selectedReport.communication_score, fullMark: 100 },
                      { subject: 'Confidence', score: selectedReport.confidence_score, fullMark: 100 },
                    ]}>
                      <PolarGrid stroke="#27272a" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontWeight: 600 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                      <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-zinc-200 border-b border-zinc-800 pb-2">Complete Interview Feedback</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                    {selectedReport.feedback}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-3.5 rounded-2xl font-bold transition-all cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}