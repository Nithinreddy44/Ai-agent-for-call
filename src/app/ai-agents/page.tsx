'use client';

import React, { useState, useEffect } from 'react';
import { AIAgent, VoiceSetting, AgentStyle } from '@/lib/types';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { Bot, Plus, Mic, Globe, Sliders, CheckCircle2, Play, Edit3 } from 'lucide-react';
import { speechEngine } from '@/lib/speech';

export default function AIAgentsPage() {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [voices, setVoices] = useState<VoiceSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [language, setLanguage] = useState('English');
  const [speakingSpeed, setSpeakingSpeed] = useState(1.0);
  const [style, setStyle] = useState<AgentStyle>('Professional');
  const [greeting, setGreeting] = useState('');
  const [companyIntro, setCompanyIntro] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  const languagesList = [
    'English', 'Telugu', 'Hindi', 'Tamil', 'Kannada',
    'Malayalam', 'Bengali', 'Marathi', 'Gujarati'
  ];

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/agents');
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
        setVoices(data.voices);
      }
    } catch (e) {
      showToast('Error loading AI agents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleSaveAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          voiceId: voiceId || (voices[0]?.id || 'v-eng-female-1'),
          language,
          speakingSpeed,
          style,
          greeting,
          companyIntro,
          systemPrompt,
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('AI Agent saved successfully!', 'success');
        setIsModalOpen(false);
        fetchAgents();
      }
    } catch (err: any) {
      showToast('Error saving AI Agent', 'error');
    }
  };

  const handlePreviewGreeting = (text: string, langName: string, speed: number) => {
    let langCode = 'en-US';
    if (langName === 'Telugu') langCode = 'te-IN';
    if (langName === 'Hindi') langCode = 'hi-IN';
    if (langName === 'Tamil') langCode = 'ta-IN';
    if (langName === 'Kannada') langCode = 'kn-IN';

    speechEngine.speak({
      text: text.replace(/\{\{\s*customer_name\s*\}\}/gi, 'Rajesh'),
      lang: langCode,
      rate: speed,
      onStart: () => showToast(`Playing preview in ${langName}...`, 'info')
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            AI Agents Configuration
          </h1>
          <p className="text-xs text-slate-400">
            Configure agent personas, approved voices, speech speed, greetings, and multi-lingual prompt guardrails.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setGreeting("Hello {{customer_name}}, I'm an AI voice assistant calling on behalf of Sennova Innovation Pvt Ltd.");
            setCompanyIntro("Sennova Innovation provides digital solutions that improve business operations.");
            setSystemPrompt("Always identify yourself as an AI assistant transparently. Address customer questions strictly using approved company knowledge.");
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create AI Agent</span>
        </button>
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{agent.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                        {agent.language}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        {agent.style}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Approved Voice:</span>
                  <span className="font-medium text-indigo-300 flex items-center gap-1">
                    <Mic className="w-3 h-3 text-indigo-400" />
                    {agent.voiceName}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">Speaking Speed:</span>
                  <span className="font-mono text-slate-200">{agent.speakingSpeed}x speed</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Initial Greeting Template</span>
                  <p className="text-[11px] text-slate-300 italic line-clamp-3">"{agent.greeting}"</p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => handlePreviewGreeting(agent.greeting, agent.language, agent.speakingSpeed)}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Audio Voice</span>
              </button>

              <button
                onClick={() => showToast('Editing agent configuration...', 'info')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Agent Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure New AI Agent Persona"
        maxWidth="xl"
      >
        <form onSubmit={handleSaveAgent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Agent Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ria - Telugu Cold Outreach Agent"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Calling Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {languagesList.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Approved Voice Profile</label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {voices.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.languageName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Speaking Speed ({speakingSpeed}x)</label>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={speakingSpeed}
                onChange={(e) => setSpeakingSpeed(parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Greeting Template</label>
            <textarea
              rows={3}
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="Hello {{customer_name}}, may I speak with you?"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company Introduction</label>
            <textarea
              rows={2}
              value={companyIntro}
              onChange={(e) => setCompanyIntro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">System Guardrail Prompt</label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-md shadow-indigo-600/30"
            >
              Save AI Agent
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
