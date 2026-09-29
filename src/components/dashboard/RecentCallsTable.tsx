'use client';

import React from 'react';
import Link from 'next/link';
import { CallRecord } from '@/lib/types';
import Badge from '@/components/common/Badge';
import { ExternalLink, PhoneCall, Play } from 'lucide-react';

interface RecentCallsTableProps {
  calls: CallRecord[];
  onStartLiveCall?: (call: CallRecord) => void;
}

export default function RecentCallsTable({ calls, onStartLiveCall }: RecentCallsTableProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Recent Call Log & Outcomes</h3>
          <p className="text-xs text-slate-400">Automated outbound calls placed by Sennova AI Agents</p>
        </div>
        <Link
          href="/call-history"
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          View All History →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Language & Voice</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Call Status</th>
              <th className="px-4 py-3">Interest Level</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-semibold text-white">
                  <div>{call.customerName}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{call.customerCompany}</div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-300">{call.customerPhone}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-200">{call.language}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{call.voiceName}</div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-300">
                  {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                </td>
                <td className="px-4 py-3">
                  <Badge status={call.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <Badge status={call.interestLevel} size="sm" />
                </td>
                <td className="px-4 py-3 text-slate-400 max-w-xs truncate" title={call.summary?.overview}>
                  {call.summary?.overview || 'Call completed.'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/call-history/${call.id}`}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-colors"
                      title="View Details & Transcript"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    {onStartLiveCall && (
                      <button
                        onClick={() => onStartLiveCall(call)}
                        className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                        title="Start AI Call"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
