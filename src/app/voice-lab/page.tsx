'use client';

import React, { useState, useEffect } from 'react';
import { VoiceSetting } from '@/lib/types';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { Mic, Play, ShieldAlert, CheckCircle2, Sliders, Lock, Volume2, Sparkles } from 'lucide-react';
import { speechEngine } from '@/lib/speech';

export default function VoiceLabPage() {
  const { showToast } = useToast();
  const [voices, setVoices] = useState<VoiceSetting[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<VoiceSetting | null>(null);

  const [testText, setTestText] = useState('Hello! I am Sennova\'s AI voice assistant. How may I assist your business with AI voice automation today?');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Voice Cloning Modal state
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneConsentChecked, setCloneConsentChecked] = useState(false);
  const [cloneVoiceName, setCloneVoiceName] = useState('');
  const [cloneSpeakerName, setCloneSpeakerName] = useState('');

  const sampleTexts: Record<string, string> = {
    'en-IN': 'Hello! I am Sennova\'s AI voice assistant. How may I assist your business today?',
    'te-IN': 'నమస్కారం! నేను Sennova డిజిటల్ AI వాయిస్ అసిస్టెంట్‌ని. మీ బిజినెస్ వృద్ధికి సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.',
    'hi-IN': 'नमस्ते! मैं Sennova AI वॉइस असिस्टेंट हूँ। क्या आप अपने बिज़नेस कॉल्स को ऑटोमेट करना चाहते हैं?',
    'ta-IN': 'வணக்கம்! நான் Sennova AI குரல் உதவியாளர் பேசுகிறேன். உங்கள் வணிகத்திற்கு எவ்வாறு உதவ முடியும்?',
    'kn-IN': 'ನಮಸ್ಕಾರ! ನಾನು Sennova AI ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಉದ್ಯಮದ ಕರೆಗಳನ್ನು ಡಿಜಿಟಲೀಕರಣಗೊಳಿಸಲು ನಾವು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.'
  };

  useEffect(() => {
    async function loadVoices() {
      try {
        const res = await fetch('/api/agents');
        const data = await res.json();
        if (data.success) {
          setVoices(data.voices);
          if (data.voices.length > 0) {
            setSelectedVoice(data.voices[0]);
            setTestText(data.voices[0].previewText);
          }
        }
      } catch (e) {
        showToast('Error loading voices', 'error');
      }
    }
    loadVoices();
  }, []);

  const handlePlayVoice = (v?: VoiceSetting) => {
    const targetVoice = v || selectedVoice;
    if (!targetVoice) return;

    setIsPlaying(true);
    speechEngine.speak({
      text: testText,
      lang: targetVoice.languageCode,
      rate: speed,
      pitch: pitch,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
    showToast(`Playing speech sample in ${targetVoice.languageName}`, 'info');
  };

  const handleSelectVoice = (v: VoiceSetting) => {
    setSelectedVoice(v);
    if (sampleTexts[v.languageCode]) {
      setTestText(sampleTexts[v.languageCode]);
    } else {
      setTestText(v.previewText);
    }
  };

  const handleCreateVoiceClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneConsentChecked) {
      showToast('Explicit consent verification is required before creating a voice clone.', 'warning');
      return;
    }

    showToast(`Voice Clone "${cloneVoiceName}" authorized and registered under biometric audit logs.`, 'success');
    setIsCloneModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-400" />
            Voice Settings & Laboratory
          </h1>
          <p className="text-xs text-slate-400">
            Preview, test, and tune approved neural voices across 9+ Indian and international languages.
          </p>
        </div>

        <button
          onClick={() => {
            setCloneVoiceName('');
            setCloneSpeakerName('');
            setCloneConsentChecked(false);
            setIsCloneModalOpen(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Custom Voice Clone Request</span>
        </button>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approved Voices Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">
            Approved Neural Voice Profiles
          </h3>

          <div className="space-y-2">
            {voices.map((v) => {
              const isSelected = selectedVoice?.id === v.id;
              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVoice(v)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-md'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{v.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-indigo-300 font-mono">
                      {v.provider}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{v.accent} ({v.gender})</span>
                    <span className="text-emerald-400 font-medium">{v.languageName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Audio Test Bench & Sliders */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Live Voice Tuning & Audio Test Bench
              </h3>
              <p className="text-xs text-slate-400">
                Active Profile: <strong className="text-indigo-300">{selectedVoice?.name}</strong> ({selectedVoice?.languageName})
              </p>
            </div>

            <button
              onClick={() => handlePlayVoice()}
              className={`px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isPlaying ? 'Synthesizing...' : 'Synthesize Audio Speech'}</span>
            </button>
          </div>

          {/* Test Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preview Speech Text</label>
            <textarea
              rows={4}
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />
          </div>

          {/* Tuning Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Speaking Rate / Speed</span>
                <span className="font-mono text-indigo-400">{speed}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
                <span>Voice Pitch / Tone</span>
                <span className="font-mono text-indigo-400">{pitch}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voice Cloning Authorization Modal */}
      <Modal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        title="Custom Voice Clone Authorization & Consent Verification"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateVoiceClone} className="space-y-4">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Strict Anti-Impersonation Policy</strong>
              <p className="mt-0.5 text-amber-300/90 leading-relaxed">
                Sennova Innovation Pvt Ltd strictly prohibits cloning voice models of third-party individuals without verifiable written authorization and biometric consent. Unauthorized voice cloning will trigger account suspension.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Voice Profile Name *</label>
            <input
              type="text"
              required
              value={cloneVoiceName}
              onChange={(e) => setCloneVoiceName(e.target.value)}
              placeholder="e.g. Executive Custom Voice Model"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Authorized Speaker Full Name *</label>
            <input
              type="text"
              required
              value={cloneSpeakerName}
              onChange={(e) => setCloneSpeakerName(e.target.value)}
              placeholder="e.g. Authorized Sennova Executive"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                required
                checked={cloneConsentChecked}
                onChange={(e) => setCloneConsentChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                I explicitly certify that I am the authorized speaker or have obtained verifiable written and biometric consent to clone this voice model for Sennova Innovation Pvt Ltd.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCloneModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!cloneConsentChecked}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow"
            >
              Verify Consent & Request Clone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
