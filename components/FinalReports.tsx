'use client';

import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Save, CheckCircle, Loader2 } from 'lucide-react';
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
      alert("Failed to save the report. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-100 mt-10">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
        Hiring <span className="text-cyan-600">Evaluation Report</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-12 items-center">
        <div className="w-full md:w-1/2 h-80 bg-gray-50 rounded-xl p-4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#374151', fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Tooltip />
              <Radar name="Candidate Score" dataKey="score" stroke="#0891b2" fill="#06b6d4" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full md:w-1/2 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Interviewer Feedback</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {report.detailed_feedback}
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={handleSaveToDashboard}
              disabled={isSaving || isSaved}
              className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-lg font-bold transition-all duration-300 ${
                isSaved 
                  ? 'bg-green-500 hover:bg-green-600 text-white cursor-default' 
                  : 'bg-gray-900 hover:bg-black text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {isSaving ? (
                <><Loader2 className="animate-spin" size={24} /> Saving to Dashboard...</>
              ) : isSaved ? (
                <><CheckCircle size={24} /> Saved Successfully</>
              ) : (
                <><Save size={24} /> Save to Dashboard</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}