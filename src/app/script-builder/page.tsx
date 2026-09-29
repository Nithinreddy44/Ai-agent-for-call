'use client';

import React, { useState, useEffect } from 'react';
import { CallScript } from '@/lib/types';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { FileCode, Plus, Play, Sparkles, HelpCircle, Save, Variable, ShieldAlert } from 'lucide-react';
import { interpolateScript } from '@/lib/ai-engine';

export default function ScriptBuilderPage() {
  const { showToast } = useToast();
  const [scripts, setScripts] = useState<CallScript[]>([]);
  const [activeScript, setActiveScript] = useState<CallScript | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('English');
  const [opening, setOpening] = useState('');
  const [companyIntro, setCompanyIntro] = useState('');
  const [qualQuestions, setQualQuestions] = useState<string[]>(['']);
  const [interestResp, setInterestResp] = useState('');
  const [callbackResp, setCallbackResp] = useState('');
  const [notInterestedResp, setNotInterestedResp] = useState('');

  // Simulator Modal
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simCustomerName, setSimCustomerName] = useState('Nithin Kumar');
  const [simCompanyName, setSimCompanyName] = useState('Sennova Innovation Pvt Ltd');

  const fetchScripts = async () => {
    try {
      const res = await fetch('/api/scripts');
      const data = await res.json();
      if (data.success) {
        setScripts(data.scripts);
        if (data.scripts.length > 0) {
          loadScriptToEditor(data.scripts[0]);
        }
      }
    } catch (e) {
      showToast('Error loading scripts', 'error');
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const loadScriptToEditor = (s: CallScript) => {
    setActiveScript(s);
    setTitle(s.title);
    setLanguage(s.language);
    setOpening(s.opening);
    setCompanyIntro(s.companyIntro);
    setQualQuestions(s.qualificationQuestions.length > 0 ? s.qualificationQuestions : ['']);
    setInterestResp(s.interestResponse);
    setCallbackResp(s.callbackResponse);
    setNotInterestedResp(s.notInterestedResponse);
  };

  const handleInsertVariable = (varName: string, setter: React.Dispatch<React.SetStateAction<string>>, currentVal: string) => {
    setter(currentVal + ' ' + varName);
  };

  const handleAddQuestion = () => {
    setQualQuestions([...qualQuestions, '']);
  };

  const handleSaveScript = async () => {
    if (!title || !opening) {
      showToast('Script Title and Opening Greeting are required.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          language,
          opening,
          companyIntro,
          qualificationQuestions: qualQuestions.filter(q => q.trim().length > 0),
          interestResponse: interestResp,
          callbackResponse: callbackResp,
          notInterestedResponse: notInterestedResp,
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Call script saved successfully!', 'success');
        fetchScripts();
      }
    } catch (e) {
      showToast('Error saving script', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            Visual Cold Call Script Builder
          </h1>
          <p className="text-xs text-slate-400">
            Design structured conversational flows with dynamic variables, objection handlers, and company guardrails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            <span>Test Script Simulator</span>
          </button>

          <button
            onClick={handleSaveScript}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Script</span>
          </button>
        </div>
      </div>

      {/* Main Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Scripts Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white">Saved Call Scripts</span>
            <button
              onClick={() => {
                setActiveScript(null);
                setTitle('New Cold Outreach Script');
                setOpening("Hello, may I speak with {{customer_name}}? I'm calling on behalf of Sennova Innovation Pvt Ltd.");
                setCompanyIntro("We provide enterprise AI and software solutions.");
                setQualQuestions(['Are you currently looking for AI software solutions?']);
                setInterestResp("That's great! I can schedule a demo.");
                setCallbackResp("Sure! What time works best?");
                setNotInterestedResp("Thank you for your time!");
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              + New Script
            </button>
          </div>

          <div className="space-y-2">
            {scripts.map((s) => (
              <div
                key={s.id}
                onClick={() => loadScriptToEditor(s)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  activeScript?.id === s.id
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <h4 className="font-semibold text-xs">{s.title}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Language: {s.language}</span>
                  <span className="text-indigo-400">{s.dynamicVariables?.length || 3} variables</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Script Flow Nodes Editor */}
        <div className="lg:col-span-3 space-y-4">
          {/* Metadata Block */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Script Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sennova Enterprise Software Cold Outreach"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Language Architecture</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              </select>
            </div>
          </div>

          {/* Flow Step 1: Opening */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg relative border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Step 1: AI Opening & Legal Disclosure
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Insert Var:</span>
                <button
                  type="button"
                  onClick={() => handleInsertVariable('{{customer_name}}', setOpening, opening)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-300 border border-slate-700 hover:bg-slate-700"
                >
                  customer_name
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertVariable('{{agent_name}}', setOpening, opening)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-300 border border-slate-700 hover:bg-slate-700"
                >
                  agent_name
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Flow Step 2: Company Introduction */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg relative border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Step 2: Company Introduction & Value Proposition
              </span>
            </div>
            <textarea
              rows={3}
              value={companyIntro}
              onChange={(e) => setCompanyIntro(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Flow Step 3: Qualification */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg relative border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Step 3: Qualification Questions
              </span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                + Add Question
              </button>
            </div>

            <div className="space-y-2">
              {qualQuestions.map((q, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={q}
                  onChange={(e) => {
                    const updated = [...qualQuestions];
                    updated[idx] = e.target.value;
                    setQualQuestions(updated);
                  }}
                  placeholder={`Question ${idx + 1}...`}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              ))}
            </div>
          </div>

          {/* Flow Step 4: Outcome Handlers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl border-t-4 border-t-emerald-500 space-y-2 shadow">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Interest Detected Response</span>
              <textarea
                rows={3}
                value={interestResp}
                onChange={(e) => setInterestResp(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl border-t-4 border-t-amber-500 space-y-2 shadow">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Callback Requested Response</span>
              <textarea
                rows={3}
                value={callbackResp}
                onChange={(e) => setCallbackResp(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl border-t-4 border-t-slate-500 space-y-2 shadow">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Not Interested / Polite Exit</span>
              <textarea
                rows={3}
                value={notInterestedResp}
                onChange={(e) => setNotInterestedResp(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      <Modal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        title="Live Script Dynamic Interpolation Simulator"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Simulated Customer Name</label>
              <input
                type="text"
                value={simCustomerName}
                onChange={(e) => setSimCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Simulated Company Name</label>
              <input
                type="text"
                value={simCompanyName}
                onChange={(e) => setSimCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 font-sans text-xs">
            <div className="text-indigo-400 font-bold border-b border-slate-800 pb-2">
              Generated Script Audio Preview:
            </div>
            <p className="text-slate-200 leading-relaxed italic">
              "{interpolateScript(opening, { name: simCustomerName, company: simCompanyName })}"
            </p>
            <p className="text-slate-300 leading-relaxed">
              "{interpolateScript(companyIntro, { name: simCustomerName, company: simCompanyName })}"
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
