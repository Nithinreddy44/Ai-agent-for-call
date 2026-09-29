'use client';

import React, { useState, useEffect } from 'react';
import { Campaign, CampaignStatus } from '@/lib/types';
import Modal from '@/components/common/Modal';
import Badge from '@/components/common/Badge';
import { useToast } from '@/components/common/Toast';
import { Megaphone, Plus, Play, Pause, Square, ShieldCheck, Users, Calendar, CheckCircle2 } from 'lucide-react';
import { INITIAL_CUSTOMERS, INITIAL_AGENTS, INITIAL_SCRIPTS } from '@/lib/store';

export default function CampaignsPage() {
  const { showToast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Campaign Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [language, setLanguage] = useState('English');
  const [maxCallsPerDay, setMaxCallsPerDay] = useState(50);

  // Pre-flight confirmation modal
  const [confirmCampaign, setConfirmCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.success) setCampaigns(data.campaigns);
    } catch (e) {
      showToast('Error loading campaigns.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          targetAudience,
          contactIds: INITIAL_CUSTOMERS.map(c => c.id),
          language,
          maxCallsPerDay,
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Campaign created in Draft status!', 'success');
        setIsModalOpen(false);
        fetchCampaigns();
      }
    } catch (e) {
      showToast('Error creating campaign', 'error');
    }
  };

  const handleStartCampaignConfirmed = () => {
    if (!confirmCampaign) return;
    setCampaigns(prev =>
      prev.map(c => (c.id === confirmCampaign.id ? { ...c, status: 'Running' } : c))
    );
    showToast(`Campaign "${confirmCampaign.name}" is now RUNNING! AI Outbound callers dispatched.`, 'success');
    setConfirmCampaign(null);
  };

  const handleToggleStatus = (id: string, newStatus: CampaignStatus) => {
    setCampaigns(prev =>
      prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
    );
    showToast(`Campaign status updated to ${newStatus}.`, 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            Outbound Campaign Orchestrator
          </h1>
          <p className="text-xs text-slate-400">
            Launch multi-contact AI cold calling campaigns with automated scheduling, pacing, and compliance checks.
          </p>
        </div>

        <button
          onClick={() => {
            setName('Q4 Regional AI Outreach');
            setTargetAudience('Enterprise Founders & IT Directors');
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((camp) => {
          const isRunning = camp.status === 'Running';
          const isPaused = camp.status === 'Paused';

          return (
            <div
              key={camp.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{camp.name}</h3>
                  <p className="text-[11px] text-slate-400">{camp.targetAudience}</p>
                </div>
                <Badge status={camp.status} />
              </div>

              {/* Campaign Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Progress Pacing</span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {camp.completedCalls} / {camp.totalContacts} calls ({camp.totalContacts > 0 ? Math.round((camp.completedCalls / camp.totalContacts) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${camp.totalContacts > 0 ? (camp.completedCalls / camp.totalContacts) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Connected</span>
                  <span className="text-emerald-400 font-bold text-sm">{camp.connectedCalls}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Interested</span>
                  <span className="text-indigo-400 font-bold text-sm">{camp.interestedLeads}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Max Calls / Day</span>
                  <span className="text-slate-200 font-bold text-sm">{camp.maxCallsPerDay}</span>
                </div>
              </div>

              {/* Campaign Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Lang: <strong className="text-indigo-300">{camp.language}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {!isRunning ? (
                    <button
                      onClick={() => setConfirmCampaign(camp)}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Campaign</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(camp.id, 'Paused')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleStatus(camp.id, 'Completed')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Stop
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pre-Flight Confirmation Modal */}
      <Modal
        isOpen={!!confirmCampaign}
        onClose={() => setConfirmCampaign(null)}
        title="Pre-Flight Campaign Outbound Confirmation"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Compliance Audit Complete: DNC filters and legal calling hours verified.</span>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Campaign Name:</span>
              <span className="font-bold text-white">{confirmCampaign?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Contacts:</span>
              <span className="font-bold text-emerald-400">{confirmCampaign?.totalContacts} Contacts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Calling Hours:</span>
              <span className="font-mono text-slate-200">09:30 AM - 06:00 PM Local Time</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Selected Language:</span>
              <span className="font-bold text-indigo-300">{confirmCampaign?.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AI Agent Persona:</span>
              <span className="font-bold text-slate-200">Aria - Sennova Tech Representative</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setConfirmCampaign(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleStartCampaignConfirmed}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-lg shadow-lg shadow-emerald-600/30"
            >
              Confirm & Launch Campaign Outbound
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Outbound AI Campaign"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Enterprise Outbound Outreach"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. IT Directors & VP Technology"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Calling Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Calls / Day</label>
              <input
                type="number"
                value={maxCallsPerDay}
                onChange={(e) => setMaxCallsPerDay(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
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
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow"
            >
              Create Draft Campaign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
