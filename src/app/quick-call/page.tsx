'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import {
  PhoneCall,
  Send,
  MessageSquare,
  Sparkles,
  Play,
  PhoneOff,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Bot,
  User,
  Clock,
  FileText,
  RefreshCw,
  Radio,
} from 'lucide-react';
import { speechEngine } from '@/lib/speech';
import { validatePhoneNumber } from '@/lib/validation';
import { processCustomerUtterance, generateCallSummary } from '@/lib/ai-engine';
import { INITIAL_AGENTS, INITIAL_KNOWLEDGE, INITIAL_SCRIPTS } from '@/lib/store';
import Badge from '@/components/common/Badge';

function QuickCallContent() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // Form State
  const [phone, setPhone] = useState(searchParams.get('phone') || '+91 63036 95181');
  const [name, setName] = useState(searchParams.get('name') || 'Nithin Kumar');
  const [company, setCompany] = useState(searchParams.get('company') || 'Sennova Innovation Pvt Ltd');
  const [language, setLanguage] = useState('English');
  const [whatsappTemplate, setWhatsappTemplate] = useState<'standard' | 'telugu-regional' | 'pricing'>('standard');

  // Execution State
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<'Idle' | 'Dialing' | 'Connected' | 'Completed'>('Idle');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [activeCallDetails, setActiveCallDetails] = useState<any>(null);
  const [messages, setMessages] = useState<{ id: string; speaker: 'AI' | 'Customer'; text: string; timestamp: string }[]>([]);
  const [customUserInput, setCustomUserInput] = useState('');

  // WhatsApp Post-call state
  const [whatsappDispatched, setWhatsappDispatched] = useState<any>(null);
  const [dispatchHistory, setDispatchHistory] = useState<any[]>([]);

  const durationTimerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStartQuickCall = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneVal = validatePhoneNumber(phone);
    if (!phoneVal.valid) {
      showToast(`Phone validation error: ${phoneVal.error}`, 'error');
      return;
    }

    try {
      setMessages([]);
      setDurationSeconds(0);
      setCallStatus('Dialing');
      setWhatsappDispatched(null);

      const targetPhone = phoneVal.formatted || phone;
      const verifiedCallerId = '+91 63036 95181';

      // 1. Call Dialing API to initiate real telephony outbound routing
      const dialRes = await fetch('/api/calls/dial-real-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationPhone: targetPhone,
          recipientName: name,
          callerId: verifiedCallerId,
          language,
        })
      });

      const dialData = await dialRes.json();

      if (!dialData.success) {
        setCallStatus('Idle');
        showToast(dialData.error || 'Failed to initiate outbound call.', 'error');
        return;
      }

      setActiveCallDetails(dialData);

      // 2. Call Start API for transcript lifecycle
      const agent = INITIAL_AGENTS.find(a => a.language === language) || INITIAL_AGENTS[0];
      const startRes = await fetch('/api/calls/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetPhone,
          name,
          agentId: agent.id,
          language,
        })
      });

      const startData = await startRes.json();
      if (!startData.success) {
        setCallStatus('Idle');
        showToast(startData.error || 'Call rejected by compliance engine.', 'error');
        return;
      }

      setIsCalling(true);
      setCallStatus('Connected');

      // Start duration counter
      durationTimerRef.current = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);

      const initialGreeting = startData.call.transcript[0].text;
      setMessages([
        {
          id: `msg-${Date.now()}`,
          speaker: 'AI',
          text: initialGreeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);

      // Speak greeting
      speechEngine.speak({
        text: initialGreeting,
        lang: language === 'Telugu' ? 'te-IN' : language === 'Hindi' ? 'hi-IN' : 'en-US',
        rate: agent.speakingSpeed,
      });

      showToast(`Outbound Call connected! Caller ID (${verifiedCallerId}) ➔ Target (${targetPhone}). WhatsApp auto-send armed!`, 'success');

    } catch (e: any) {
      showToast('Error launching call', 'error');
      setCallStatus('Idle');
    }
  };

  // End Call & Trigger Automated WhatsApp Message
  const handleEndCallAndSendWhatsApp = async () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    speechEngine.stop();
    setIsCalling(false);
    setCallStatus('Completed');

    showToast('Call ended. Compiling company brochure & WhatsApp post-call package...', 'info');

    const summary = generateCallSummary(messages, 'COMPLETED');

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          customerName: name,
          companyName: company,
          templateType: whatsappTemplate,
          callSummary: summary.overview
        })
      });

      const data = await res.json();
      if (data.success) {
        setWhatsappDispatched(data.deliveryDetails);
        setDispatchHistory(prev => [data.deliveryDetails, ...prev]);
        showToast(`WhatsApp details package automatically sent to ${phone}!`, 'success');
      } else {
        showToast(data.error || 'Failed to dispatch WhatsApp message.', 'error');
      }
    } catch (e) {
      showToast('Error triggering WhatsApp API dispatch.', 'error');
    }
  };

  const handleCustomerSay = (text: string) => {
    if (!isCalling || !text.trim()) return;

    speechEngine.stop();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newCustMsg = { id: `msg-${Date.now()}`, speaker: 'Customer' as const, text, timestamp: timeStr };
    const updatedMessages = [...messages, newCustMsg];
    setMessages(updatedMessages);
    setCustomUserInput('');

    setTimeout(() => {
      const agent = INITIAL_AGENTS.find(a => a.language === language) || INITIAL_AGENTS[0];
      const aiResult = processCustomerUtterance(
        text,
        INITIAL_SCRIPTS[0],
        { id: 'c-temp', name, phone, email: '', company, country: 'India', preferredLanguage: language, leadSource: '', leadStatus: 'New', notes: '', createdAt: '' },
        agent,
        INITIAL_KNOWLEDGE,
        updatedMessages
      );

      const aiTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const aiMsg = { id: `msg-${Date.now() + 1}`, speaker: 'AI' as const, text: aiResult.text, timestamp: aiTimeStr };
      setMessages(prev => [...prev, aiMsg]);

      speechEngine.speak({
        text: aiResult.text,
        lang: language === 'Telugu' ? 'te-IN' : language === 'Hindi' ? 'hi-IN' : 'en-US',
      });
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Verified Outbound Caller ID: +91 63036 95181 Active</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Instant AI Voice Dialing & Automatic WhatsApp Share
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Enter ANY recipient phone number below. The AI places an outbound call using verified Caller ID <strong>+91 63036 95181</strong> to your entered number. Upon ending the call, company details are automatically sent to their WhatsApp!
          </p>
        </div>
      </div>

      {/* Grid: Form & Live Call Studio / WhatsApp Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call & WhatsApp Config Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Target Recipient & Calling Config
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              +91 63036 95181
            </span>
          </h3>

          <form onSubmit={handleStartQuickCall} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Destination Phone Number (E.164) *</label>
              <input
                type="text"
                required
                disabled={isCalling}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter number to call (e.g. +91 63036 95181)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50 font-bold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Outbound call will be placed to this target number.</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Recipient Name *</label>
              <input
                type="text"
                required
                disabled={isCalling}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nithin Kumar"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company / Industry Name</label>
              <input
                type="text"
                disabled={isCalling}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Sennova Innovation Pvt Ltd"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Calling Language</label>
              <select
                disabled={isCalling}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">WhatsApp Post-Call Package Template</label>
              <select
                disabled={isCalling}
                value={whatsappTemplate}
                onChange={(e) => setWhatsappTemplate(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                <option value="standard">📄 Sennova Company Brochure & Digital Pitch</option>
                <option value="telugu-regional">💡 Telugu Regional Voice Automation Package</option>
                <option value="pricing">💰 Commercial Pricing Tiers & API Documentation</option>
              </select>
            </div>

            <div className="pt-2">
              {!isCalling ? (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <PhoneCall className="w-4 h-4 fill-current" />
                  <span>Call {phone} from +91 63036 95181</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEndCallAndSendWhatsApp}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all animate-pulse"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Cut Call & Auto-Send WhatsApp Details</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Live Call Stage & Transcript Stream */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between min-h-[380px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isCalling ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`}></span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Call Status: <strong className="text-indigo-400">{callStatus}</strong>
                </span>
              </div>

              <div className="font-mono text-xs text-slate-300 font-bold">
                Duration: {Math.floor(durationSeconds / 60).toString().padStart(2, '0')}:
                {(durationSeconds % 60).toString().padStart(2, '0')}
              </div>
            </div>

            {/* Outbound Routing Banner */}
            {activeCallDetails && (
              <div className="mb-3 p-3 rounded-lg bg-slate-950 border border-emerald-500/30 text-xs font-mono flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">Outbound Route:</span>
                  <span>From <strong>{activeCallDetails.callerId}</strong> ➔ To <strong className="text-emerald-300">{activeCallDetails.destinationPhone}</strong></span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Active Channel</span>
              </div>
            )}

            {/* Transcript Area */}
            <div className="space-y-3 overflow-y-auto max-h-[280px] pr-2 scrollbar-thin flex-1">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-500 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-700" />
                  <p>Enter any destination phone number and click "Call from +91 63036 95181" to start.</p>
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
                          <span className="font-bold">{isAI ? 'Sennova AI Agent (+91 63036 95181)' : `${name} (${phone})`}</span>
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

            {/* Quick Customer Simulator Bench */}
            <div className="pt-3 border-t border-slate-800 mt-3 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">Simulate Customer Answer:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => handleCustomerSay("Yes, send me the company details on WhatsApp.")}
                  disabled={!isCalling}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded text-[11px] font-medium disabled:opacity-40"
                >
                  "Send details on WhatsApp"
                </button>
                <button
                  onClick={() => handleCustomerSay("What are your Telugu voice capabilities?")}
                  disabled={!isCalling}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded text-[11px] font-medium disabled:opacity-40"
                >
                  "Ask Telugu Voice Capabilities"
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={customUserInput}
                  onChange={(e) => setCustomUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomerSay(customUserInput)}
                  disabled={!isCalling}
                  placeholder={isCalling ? "Type customer response..." : "Call standby..."}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                />
                <button
                  onClick={() => handleCustomerSay(customUserInput)}
                  disabled={!isCalling || !customUserInput.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Automated Post-Call WhatsApp Delivery Card */}
          {whatsappDispatched && (
            <div className="p-5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-2xl space-y-3 animate-slideUp">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-white">WhatsApp Post-Call Package Dispatched!</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                  AUTO DISPATCHED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Recipient Number</span>
                  <span className="font-mono text-emerald-300 font-bold text-sm">{whatsappDispatched.recipientPhone}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Recipient Name</span>
                  <span className="text-white font-bold text-sm">{whatsappDispatched.recipientName} ({whatsappDispatched.companyName})</span>
                </div>
              </div>

              {/* Message Payload Box */}
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Delivered WhatsApp Message Content</span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-200 whitespace-pre-wrap leading-relaxed">
                  {whatsappDispatched.messagePayload}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <a
                  href={whatsappDispatched.whatsappWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open & Chat in WhatsApp Web / App</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuickCallPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Loading Instant Call & WhatsApp Studio...</div>}>
      <QuickCallContent />
    </Suspense>
  );
}
