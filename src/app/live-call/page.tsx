'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CallRecord, CallStatus, Customer, AIAgent } from '@/lib/types';
import Badge from '@/components/common/Badge';
import { useToast } from '@/components/common/Toast';
import {
  PhoneCall,
  Mic,
  MicOff,
  Pause,
  Play,
  PhoneOff,
  Bot,
  User,
  Sparkles,
  Volume2,
  AlertTriangle,
  RefreshCw,
  Send,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { speechEngine } from '@/lib/speech';
import { processCustomerUtterance, generateCallSummary, interpolateScript } from '@/lib/ai-engine';
import { INITIAL_CUSTOMERS, INITIAL_AGENTS, INITIAL_KNOWLEDGE, INITIAL_SCRIPTS } from '@/lib/store';

function LiveCallStudioContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const paramPhone = searchParams.get('phone') || '+91 63036 95181';
  const paramName = searchParams.get('name') || 'Nithin Kumar';
  const paramCompany = searchParams.get('company') || 'Sennova Innovation Pvt Ltd';

  // Call state
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('Scheduled');
  const [aiState, setAiState] = useState<'Listening' | 'Thinking' | 'Speaking' | 'Paused' | 'Waiting'>('Waiting');
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Agent & Voice
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(INITIAL_AGENTS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(INITIAL_AGENTS[0].language);

  // Transcript feed
  const [messages, setMessages] = useState<{ id: string; speaker: 'AI' | 'Customer' | 'System'; text: string; timestamp: string }[]>([]);
  const [customUserInput, setCustomUserInput] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);

  // Post-call summary modal state
  const [finalSummary, setFinalSummary] = useState<any>(null);

  const durationTimerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Start Call Handler
  const handleStartCall = async () => {
    try {
      setMessages([]);
      setDurationSeconds(0);
      setCallStatus('Calling');
      setAiState('Waiting');

      // Call API to start call & run compliance checks
      const res = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: paramPhone,
          name: paramName,
          agentId: selectedAgent.id,
          language: selectedLanguage,
        })
      });

      const data = await res.json();

      if (!data.success) {
        setCallStatus('Failed');
        showToast(data.error || 'Call rejected by compliance engine.', 'error');
        return;
      }

      setCallActive(true);
      setCallStatus('Connected');
      setAiState('Speaking');

      // Start duration counter
      durationTimerRef.current = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);

      const initialGreeting = data.call.transcript[0].text;
      setMessages([
        {
          id: `msg-${Date.now()}`,
          speaker: 'AI',
          text: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);

      // Speak initial greeting via Web Speech API
      speechEngine.speak({
        text: initialGreeting,
        lang: getLangCode(selectedLanguage),
        rate: selectedAgent.speakingSpeed,
        onStart: () => setAiState('Speaking'),
        onEnd: () => setAiState('Listening'),
      });

    } catch (e: any) {
      showToast('Server error initiating call.', 'error');
      setCallStatus('Failed');
    }
  };

  // End Call Handler
  const handleEndCall = (outcomeStatus: CallStatus = 'Completed') => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    speechEngine.stop();
    setCallActive(false);
    setCallStatus(outcomeStatus);
    setAiState('Waiting');

    // Generate AI Summary
    const summary = generateCallSummary(messages, outcomeStatus === 'Do Not Call' ? 'DNC' : 'COMPLETED');
    setFinalSummary(summary);
    showToast(`Call ended cleanly. Summary generated.`, 'success');
  };

  // Process customer input (either preset button or user STT text)
  const handleCustomerSay = (text: string) => {
    if (!callActive || !text.trim()) return;

    speechEngine.stop();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Add Customer Message to Transcript
    const newCustMsg = { id: `msg-${Date.now()}`, speaker: 'Customer' as const, text, timestamp: timeStr };
    const updatedMessages = [...messages, newCustMsg];
    setMessages(updatedMessages);
    setCustomUserInput('');

    setAiState('Thinking');

    // 2. AI Reasoning & Knowledge Base Lookup
    setTimeout(() => {
      const mockCustomer: Customer = {
        id: 'c-temp',
        name: paramName,
        phone: paramPhone,
        email: '',
        company: paramCompany,
        country: 'India',
        preferredLanguage: selectedLanguage,
        leadSource: 'Live Studio',
        leadStatus: 'New',
        notes: '',
        createdAt: new Date().toISOString()
      };

      const aiResult = processCustomerUtterance(
        text,
        INITIAL_SCRIPTS[0],
        mockCustomer,
        selectedAgent,
        INITIAL_KNOWLEDGE,
        updatedMessages
      );

      const aiTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const aiMsg = { id: `msg-${Date.now() + 1}`, speaker: 'AI' as const, text: aiResult.text, timestamp: aiTimeStr };

      setMessages(prev => [...prev, aiMsg]);

      // If DNC triggered
      if (aiResult.detectedOutcome === 'DNC') {
        speechEngine.speak({
          text: aiResult.text,
          lang: getLangCode(selectedLanguage),
          onEnd: () => handleEndCall('Do Not Call')
        });
        return;
      }

      // Speak response
      speechEngine.speak({
        text: aiResult.text,
        lang: getLangCode(selectedLanguage),
        rate: selectedAgent.speakingSpeed,
        onStart: () => setAiState('Speaking'),
        onEnd: () => setAiState('Listening')
      });
    }, 800);
  };

  // Toggle Microphone STT Input
  const handleToggleMicInput = () => {
    if (isMicListening) {
      speechEngine.stopRecognition();
      setIsMicListening(false);
    } else {
      setIsMicListening(true);
      const ok = speechEngine.initSpeechRecognition(
        getLangCode(selectedLanguage),
        (transcript) => {
          handleCustomerSay(transcript);
          setIsMicListening(false);
        },
        () => setIsMicListening(false)
      );

      if (!ok) {
        showToast('Microphone STT recognition not supported in browser. Use preset buttons or text input.', 'warning');
        setIsMicListening(false);
      }
    }
  };

  function getLangCode(langName: string): string {
    switch (langName) {
      case 'Telugu': return 'te-IN';
      case 'Hindi': return 'hi-IN';
      case 'Tamil': return 'ta-IN';
      case 'Kannada': return 'kn-IN';
      default: return 'en-US';
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-400 animate-pulse" />
            Live AI Calling Studio
          </h1>
          <p className="text-xs text-slate-400">
            Real-time multi-lingual conversation engine, speech synthesis visualizer, and live transcript feed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!callActive ? (
            <button
              onClick={handleStartCall}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-extrabold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Outbound AI Call</span>
            </button>
          ) : (
            <button
              onClick={() => handleEndCall('Completed')}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-extrabold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all animate-pulse"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Call State & Audio Waveform Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
          {/* Target Customer Card */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">Target Recipient</span>
              <Badge status={callStatus} size="sm" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">{paramName}</h3>
              <p className="text-xs text-slate-400">{paramCompany}</p>
              <p className="text-xs font-mono text-indigo-300 mt-1">{paramPhone}</p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs">
              <span className="text-slate-400">Call Duration:</span>
              <span className="font-mono font-bold text-white text-sm">
                {Math.floor(durationSeconds / 60).toString().padStart(2, '0')}:
                {(durationSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* AI State Badge & Visualizer Waveform */}
          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 text-center space-y-4 shadow-inner">
            <div className="flex items-center justify-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                aiState === 'Speaking' ? 'bg-emerald-400 animate-ping' :
                aiState === 'Thinking' ? 'bg-amber-400 animate-bounce' :
                aiState === 'Listening' ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'
              }`}></span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-200">
                AI State: <strong className="text-indigo-400">{aiState}</strong>
              </span>
            </div>

            {/* Audio Waveform Bars */}
            <div className="h-16 flex items-center justify-center gap-1.5 px-4">
              {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.85, 0.5, 0.95, 0.4].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-2 rounded-full transition-all duration-300 ${
                    aiState === 'Speaking'
                      ? 'bg-gradient-to-t from-indigo-500 to-emerald-400 animate-wave'
                      : aiState === 'Listening'
                      ? 'bg-gradient-to-t from-slate-700 to-indigo-500 animate-pulse'
                      : 'bg-slate-800 h-2'
                  }`}
                  style={{
                    height: aiState === 'Speaking' ? `${Math.max(16, h * 56)}px` : aiState === 'Listening' ? `${Math.max(12, h * 24)}px` : '8px',
                    animationDelay: `${idx * 120}ms`
                  }}
                ></div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              {aiState === 'Speaking' ? '🔊 Synthesizing natural AI audio voice output...' :
               aiState === 'Listening' ? '🎙️ Listening for customer speech turn...' :
               aiState === 'Thinking' ? '⚡ Processing knowledge base lookup & dynamic response...' : 'Standby'}
            </p>
          </div>

          {/* Agent Persona Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Selected AI Agent Persona</label>
            <select
              value={selectedAgent.id}
              onChange={(e) => {
                const ag = INITIAL_AGENTS.find(a => a.id === e.target.value);
                if (ag) {
                  setSelectedAgent(ag);
                  setSelectedLanguage(ag.language);
                }
              }}
              disabled={callActive}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              {INITIAL_AGENTS.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.language})</option>
              ))}
            </select>
          </div>

          {/* Call Control Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsMuted(!isMuted)}
              disabled={!callActive}
              className={`p-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                isMuted ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              } disabled:opacity-40`}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-indigo-400" />}
              <span>{isMuted ? 'Muted' : 'Mute'}</span>
            </button>

            <button
              onClick={() => setAiState(aiState === 'Paused' ? 'Listening' : 'Paused')}
              disabled={!callActive}
              className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all disabled:opacity-40"
            >
              {aiState === 'Paused' ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
              <span>{aiState === 'Paused' ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={() => showToast('Transferring call to Senior Specialist...', 'info')}
              disabled={!callActive}
              className="p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex flex-col items-center gap-1 transition-all disabled:opacity-40"
            >
              <RefreshCw className="w-4 h-4 text-teal-400" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Right 2-Cols: Real-time Transcript Feed & Interactive Customer Bench */}
        <div className="lg:col-span-2 space-y-4 flex flex-col h-full">
          {/* Transcript Screen */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[380px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Live Conversation Stream & Speech-To-Text
              </span>
              <span className="text-[11px] text-slate-400">
                {messages.length} messages logged
              </span>
            </div>

            {/* Scrollable Messages Feed */}
            <div className="space-y-3 overflow-y-auto max-h-[340px] pr-2 scrollbar-thin flex-1">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500 text-xs space-y-2">
                  <PhoneCall className="w-8 h-8 text-slate-700" />
                  <p>Call standby. Click "Start Outbound AI Call" above to initiate natural two-way conversation.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isAI = m.speaker === 'AI';
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 text-xs animate-fadeIn ${isAI ? 'justify-start' : 'justify-end'}`}
                    >
                      {isAI && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold shrink-0">
                          AI
                        </div>
                      )}

                      <div
                        className={`max-w-md p-3 rounded-xl border leading-relaxed ${
                          isAI
                            ? 'bg-slate-800/90 border-slate-700/80 text-slate-100 rounded-tl-none shadow-md'
                            : 'bg-emerald-950/60 border-emerald-500/30 text-emerald-100 rounded-tr-none shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 mb-1 border-b border-slate-700/50 pb-1">
                          <span className="font-bold">{isAI ? selectedAgent.name : paramName}</span>
                          <span className="font-mono">{m.timestamp}</span>
                        </div>
                        <p className="text-xs">{m.text}</p>
                      </div>

                      {!isAI && (
                        <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shrink-0">
                          CU
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Customer Response Interactive Test Bench */}
            <div className="pt-4 border-t border-slate-800 space-y-3 mt-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Simulate Customer Response:</span>
                <span className="text-indigo-400">Click a preset query or speak via mic</span>
              </div>

              {/* Preset Response Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleCustomerSay("Yes, we are looking for AI voice solutions. Tell me about pricing.")}
                  disabled={!callActive}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded text-[11px] font-medium disabled:opacity-40 transition-colors"
                >
                  "Ask Pricing & Cost"
                </button>
                <button
                  onClick={() => handleCustomerSay("Does your platform support Telugu regional language?")}
                  disabled={!callActive}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded text-[11px] font-medium disabled:opacity-40 transition-colors"
                >
                  "Ask Telugu Support"
                </button>
                <button
                  onClick={() => handleCustomerSay("I am in a meeting right now. Please call back tomorrow at 3 PM.")}
                  disabled={!callActive}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded text-[11px] font-medium disabled:opacity-40 transition-colors"
                >
                  "Request Callback"
                </button>
                <button
                  onClick={() => handleCustomerSay("Please remove my number and do not call again.")}
                  disabled={!callActive}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-rose-500/20 text-rose-300 border border-slate-700 rounded text-[11px] font-medium disabled:opacity-40 transition-colors"
                >
                  "Request DNC"
                </button>
              </div>

              {/* Input bar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleMicInput}
                  disabled={!callActive}
                  className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                    isMicListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/30'
                  } disabled:opacity-40`}
                  title="Speak via Microphone Speech-To-Text"
                >
                  <Mic className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={customUserInput}
                  onChange={(e) => setCustomUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomerSay(customUserInput)}
                  disabled={!callActive}
                  placeholder={callActive ? "Type custom customer response..." : "Start call to simulate response..."}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />

                <button
                  onClick={() => handleCustomerSay(customUserInput)}
                  disabled={!callActive || !customUserInput.trim()}
                  className="p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs disabled:opacity-40 transition-colors shadow"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Call Summary Modal */}
      {finalSummary && (
        <div className="p-6 bg-slate-900 border border-indigo-500/40 rounded-xl shadow-2xl space-y-4 animate-slideUp">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Automated Post-Call AI Summary
            </h3>
            <span className="text-xs text-slate-400">Generated automatically for {paramName}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Overview</span>
              <p className="text-slate-200">{finalSummary.overview}</p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Detected Requirements</span>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {finalSummary.requirements.map((r: string, idx: number) => <li key={idx}>{r}</li>)}
              </ul>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Next Action</span>
              <p className="text-emerald-400 font-bold text-sm">{finalSummary.nextAction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveCallStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Loading Studio...</div>}>
      <LiveCallStudioContent />
    </Suspense>
  );
}
