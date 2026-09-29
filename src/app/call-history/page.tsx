'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CallRecord } from '@/lib/types';
import Badge from '@/components/common/Badge';
import { History, Search, ExternalLink, Filter, Calendar } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

export default function CallHistoryPage() {
  const { showToast } = useToast();
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/calls?search=${encodeURIComponent(search)}&status=${statusFilter}&language=${languageFilter}`);
      const data = await res.json();
      if (data.success) {
        setCalls(data.calls);
      }
    } catch (e) {
      showToast('Error loading call history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, statusFilter, languageFilter]);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-400" />
            Outbound Call History & Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Review detailed transcripts, AI post-call summaries, extracted customer requirements, and audio recordings.
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, phone, company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Callback Requested">Callback Requested</option>
              <option value="Do Not Call">Do Not Call</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Language:</span>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="All">All Languages</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Language & Voice</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Interest Level</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading call records...</td>
                </tr>
              ) : calls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No matching call records found.</td>
                </tr>
              ) : (
                calls.map((call) => (
                  <tr key={call.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">
                      <div>{call.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{call.customerCompany}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{call.customerPhone}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {new Date(call.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{call.language}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{call.voiceName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={call.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={call.interestLevel} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/call-history/${call.id}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
