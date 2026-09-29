'use client';

import React, { useState, useEffect } from 'react';
import { ComplianceRecord, AuditLog } from '@/lib/types';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { ShieldCheck, Lock, AlertTriangle, Plus, FileText, CheckCircle2, Clock, Ban } from 'lucide-react';
import { validatePhoneNumber } from '@/lib/validation';

export default function CompliancePage() {
  const { showToast } = useToast();
  const [dncRecords, setDncRecords] = useState<ComplianceRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual DNC modal
  const [isDncModalOpen, setIsDncModalOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/compliance');
      const data = await res.json();
      if (data.success) {
        setDncRecords(data.dncRecords);
        setAuditLogs(data.auditLogs);
      }
    } catch (e) {
      showToast('Error loading compliance data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const handleAddDnc = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneVal = validatePhoneNumber(phone);
    if (!phoneVal.valid) {
      showToast('Invalid phone number format.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactPhone: phoneVal.formatted || phone,
          customerName: name,
          reason,
          source: 'Admin Manual Entry',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Contact added to Do-Not-Call (DNC) list.', 'success');
        setIsDncModalOpen(false);
        fetchComplianceData();
      }
    } catch (e) {
      showToast('Error adding DNC record', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Legal Compliance & Safety Center
          </h1>
          <p className="text-xs text-slate-400">
            Enforce Do-Not-Call (DNC) registers, calling-hour windows, mandatory AI disclosure, and audit trail logs.
          </p>
        </div>

        <button
          onClick={() => {
            setPhone('');
            setName('');
            setReason('Opted out of telemarketing outreach.');
            setIsDncModalOpen(true);
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-rose-600/30 flex items-center gap-1.5"
        >
          <Ban className="w-4 h-4" />
          <span>Add Number to DNC List</span>
        </button>
      </div>

      {/* Compliance Policies Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 shadow">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Legal Calling Window</span>
          </div>
          <p className="text-xs text-slate-300">
            Enforced window: <strong>09:00 AM - 08:00 PM</strong> local time. Automated calls are automatically blocked outside these hours.
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 shadow">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mandatory AI Disclosure</span>
          </div>
          <p className="text-xs text-slate-300">
            Every outbound call explicitly identifies the AI nature in initial greetings ("I am an AI voice assistant...").
          </p>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 shadow">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <Ban className="w-4 h-4 text-rose-400" />
            <span>Instant Verbal DNC Opt-Out</span>
          </div>
          <p className="text-xs text-slate-300">
            Verbal opt-out intents ("do not call", "remove number") automatically register contacts to DNC and terminate calls.
          </p>
        </div>
      </div>

      {/* DNC List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Ban className="w-4 h-4 text-rose-400" />
            Do-Not-Call (DNC) Registry ({dncRecords.length} records)
          </h3>
          <span className="text-[11px] text-slate-400">Strictly enforced across all campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Contact Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date Added</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {dncRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-rose-300">{r.contactPhone}</td>
                  <td className="px-4 py-3 text-white font-medium">{r.customerName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-semibold">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                    {new Date(r.dateAdded).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{r.source}</td>
                  <td className="px-4 py-3 text-slate-400">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Security & Compliance Audit Logs
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User / System</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{log.user}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-300">{log.role}</td>
                  <td className="px-4 py-3 text-slate-200">{log.action}</td>
                  <td className="px-4 py-3 text-slate-400">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add DNC Modal */}
      <Modal
        isOpen={isDncModalOpen}
        onClose={() => setIsDncModalOpen(false)}
        title="Add Phone Number to Do-Not-Call (DNC) Registry"
        maxWidth="md"
      >
        <form onSubmit={handleAddDnc} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (E.164) *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 94432 10987"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karthik Subramanian"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Opt-Out Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for DNC registration..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsDncModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow"
            >
              Register on DNC Registry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
