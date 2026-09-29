'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FollowUp } from '@/lib/types';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { CalendarCheck, Plus, PhoneCall, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function FollowUpsPage() {
  const { showToast } = useToast();
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<FollowUp['type']>('Callback');
  const [scheduledTime, setScheduledTime] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [notes, setNotes] = useState('');

  const fetchFollowups = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/followups');
      const data = await res.json();
      if (data.success) setFollowups(data.followups);
    } catch (e) {
      showToast('Error loading follow-ups.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, []);

  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          company,
          type,
          scheduledTime: scheduledTime || new Date(Date.now() + 86400000).toISOString(),
          priority,
          notes,
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Follow-up scheduled successfully!', 'success');
        setIsModalOpen(false);
        fetchFollowups();
      }
    } catch (e) {
      showToast('Error scheduling follow-up', 'error');
    }
  };

  const toggleComplete = (id: string) => {
    setFollowups(prev =>
      prev.map(f => (f.id === id ? { ...f, completed: !f.completed } : f))
    );
    showToast('Follow-up status updated.', 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-indigo-400" />
            Follow-Up & Callback Management
          </h1>
          <p className="text-xs text-slate-400">
            Schedule callbacks, sales demos, and meetings with automatic reminder notifications and 1-click AI call launch.
          </p>
        </div>

        <button
          onClick={() => {
            setCustomerName('');
            setPhone('+91 98765 43210');
            setCompany('Apex Tech');
            setScheduledTime(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Follow-Up</span>
        </button>
      </div>

      {/* Grid of Follow-up Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {followups.map((f) => (
          <div
            key={f.id}
            className={`p-5 rounded-xl border bg-slate-900 shadow-lg flex flex-col justify-between transition-all ${
              f.completed ? 'opacity-60 border-slate-800' : 'border-slate-800 hover:border-indigo-500/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={f.completed}
                    onChange={() => toggleComplete(f.id)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={`font-bold text-sm text-white ${f.completed ? 'line-through text-slate-400' : ''}`}>
                    {f.customerName}
                  </span>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-semibold border ${
                    f.priority === 'High'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : f.priority === 'Medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {f.priority} Priority
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="font-semibold text-indigo-300">{f.type}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-200">{f.phone}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Scheduled Time:</span>
                  <span className="font-mono text-amber-400 font-medium">
                    {new Date(f.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                {f.notes && (
                  <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 italic">
                    "{f.notes}"
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {f.completed ? 'Completed' : 'Pending Callback'}
              </span>

              <Link
                href={`/live-call?phone=${encodeURIComponent(f.phone)}&name=${encodeURIComponent(f.customerName)}`}
                className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Customer Follow-up / Callback"
        maxWidth="md"
      >
        <form onSubmit={handleCreateFollowup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Full Name *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Follow-up Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="Callback">Callback</option>
                <option value="Sales Follow-up">Sales Follow-up</option>
                <option value="Demo">Demo</option>
                <option value="Meeting">Meeting</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Action Details</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Discuss Telugu regional language voice AI pricing."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
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
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow"
            >
              Schedule Follow-Up
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
