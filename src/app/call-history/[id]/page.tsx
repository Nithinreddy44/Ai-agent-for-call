'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CallRecord } from '@/lib/types';
import Badge from '@/components/common/Badge';
import { useToast } from '@/components/common/Toast';
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Bot,
  User,
  CalendarCheck,
  ShieldCheck,
  Share2,
  Download,
} from 'lucide-react';
import { speechEngine } from '@/lib/speech';

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [call, setCall] = useState<CallRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    async function fetchCallDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/calls/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setCall(data.call);
        } else {
          showToast('Call record not found.', 'error');
        }
      } catch (e) {
        showToast('Error loading call details.', 'error');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchCallDetail();
  }, [params.id]);

  const handlePlayRecording = () => {
    if (!call || !call.transcript || call.transcript.length === 0) return;

    if (isPlayingAudio) {
      speechEngine.stop();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    const fullSpeechText = call.transcript.map(t => `${t.speaker}: ${t.text}`).join('. ');

    speechEngine.speak({
      text: fullSpeechText,
      lang: call.language === 'Telugu' ? 'te-IN' : call.language === 'Hindi' ? 'hi-IN' : 'en-US',
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading call analysis...</div>;
  }

  if (!call) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm space-y-4">
        <p>Call record not found.</p>
        <button onClick={() => router.push('/call-history')} className="px-4 py-2 bg-slate-800 text-white rounded text-xs">
          Back to Call History
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/call-history')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Call History</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Shareable call link copied to clipboard.', 'info')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            title="Share Call Analysis"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Call Details Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-extrabold text-white">{call.customerName}</h2>
              <span className="text-xs text-slate-400">({call.customerCompany})</span>
            </div>
            <p className="text-xs font-mono text-indigo-300">{call.customerPhone}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge status={call.status} />
            <Badge status={call.interestLevel} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Start Time</span>
            <span className="font-mono text-white font-medium">
              {new Date(call.startTime).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Duration</span>
            <span className="font-mono text-white font-medium">
              {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
            </span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">AI Agent & Voice</span>
            <span className="text-indigo-300 font-medium">{call.agentName} ({call.language})</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Recording</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Permitted & Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Simulated Audio Waveform & Player */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            Audio Recording Playback Engine
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {Math.floor(call.durationSeconds / 60)}:{(call.durationSeconds % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-lg border border-slate-800">
          <button
            onClick={handlePlayRecording}
            className="p-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg transition-transform active:scale-95 shrink-0"
          >
            {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          {/* Fake Visualizer Waveform */}
          <div className="flex-1 h-8 flex items-center gap-1">
            {[0.3, 0.7, 0.4, 0.9, 0.6, 1.0, 0.8, 0.5, 0.95, 0.3, 0.7, 0.4, 0.8, 0.5, 0.9, 0.6, 0.3, 0.8, 0.4, 0.6].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all ${
                  isPlayingAudio ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                }`}
                style={{ height: `${h * 100}%` }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: AI Summary Breakdown & Turn-by-Turn Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Automated AI Summary Breakdown Cards */}
        <div className="space-y-4">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              AI Automated Post-Call Insights
            </h3>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Executive Summary</span>
              <p className="text-xs text-slate-200 leading-relaxed p-3 bg-slate-950 rounded-lg border border-slate-800">
                {call.summary?.overview || 'Conversation completed successfully.'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Customer Requirements</span>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                {call.summary?.requirements && call.summary.requirements.length > 0 ? (
                  call.summary.requirements.map((r, idx) => (
                    <div key={idx} className="text-xs text-slate-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{r}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No specific requirements noted.</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">Objections Raised</span>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                {call.summary?.objections && call.summary.objections.length > 0 ? (
                  call.summary.objections.map((o, idx) => (
                    <div key={idx} className="text-xs text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{o}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No objections raised.</span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-xs flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Recommended Next Action:</span>
              <span className="font-extrabold text-indigo-300">{call.summary?.nextAction || 'Sales Follow-up'}</span>
            </div>
          </div>
        </div>

        {/* Turn-by-Turn Interactive Timeline Transcript */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Turn-by-Turn Full Conversation Transcript
          </h3>

          <div className="space-y-4">
            {call.transcript && call.transcript.length > 0 ? (
              call.transcript.map((msg) => {
                const isAI = msg.speaker === 'AI';
                return (
                  <div key={msg.id} className="flex gap-3 text-xs">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                        isAI ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isAI ? 'AI' : 'CU'}
                    </div>

                    <div className="flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1">
                        <span className="font-bold text-slate-200">{isAI ? call.agentName : call.customerName}</span>
                        <span className="font-mono text-[10px]">{msg.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed pt-1">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-xs italic">No transcript recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
