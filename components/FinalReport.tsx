'use client';

import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Save, CheckCircle, Loader2, History } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface FinalReportProps {
  report: {
    technical_score: number;
    communication_score: number;
    confidence_score: number;
    detailed_feedback: string;
  };
}

export default function FinalReport({ report }: FinalReportProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const chartData = [
    { subject: 'Technical', score: report.technical_score, fullMark: 100 },
    { subject: 'Communication', score: report.communication_score, fullMark: 100 },
    { subject: 'Confidence', score: report.confidence_score, fullMark: 100 },
  ];

  const handleSaveToDashboard = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('interview_reports')
        .insert([
          {
            report_data: report, 
            technical_score: report.technical_score,
            communication_score: report.communication_score,
            confidence_score: report.confidence_score,
            feedback: report.detailed_feedback,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving to Supabase:", error);
      alert("Failed to save: " + (error as any).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-8 bg-zinc-950 text-white shadow-2xl rounded-3xl border border-zinc-800 mt-10">
      <h1 className="text-4xl font-extrabold text-white mb-8 text-center tracking-tight">
        Hiring <span className="text-cyan-400">Evaluation Report</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="w-full md:w-1/2 h-80 bg-zinc-900/50 rounded-2xl p-4 border border-zinc-900 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
              <Radar name="Candidate Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full md:w-1/2 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 border-b border-zinc-800 pb-2">Interviewer Feedback & Mistakes</h3>
            <p className="text-zinc-400 leading-relaxed text-lg">
              {report.detailed_feedback}
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <button
              onClick={handleSaveToDashboard}
              disabled={isSaving || isSaved}
              className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl text-lg font-bold transition-all duration-300 cursor-pointer ${
                isSaved 
                  ? 'bg-green-600 text-white cursor-default' 
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg'
              }`}
            >
              {isSaving ? (
                <><Loader2 className="animate-spin" size={24} /> Saving Report...</>
              ) : isSaved ? (
                <><CheckCircle size={24} /> Saved Successfully</>
              ) : (
                <><Save size={24} /> Save to Dashboard</>
              )}
            </button>

            <Link
              href="/history"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-md font-semibold bg-zinc-900 hover:bg-zinc-800 text-white transition-all border border-zinc-800"
            >
              <History size={18} /> View Interview History →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}