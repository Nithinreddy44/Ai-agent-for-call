'use client';

import React, { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import RecentCallsTable from '@/components/dashboard/RecentCallsTable';
import {
  PhoneCall,
  PhoneIncoming,
  CheckCircle2,
  ThumbsUp,
  CalendarCheck,
  PhoneOff,
  AlertCircle,
  Clock,
  Plus,
  Play,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { CallRecord, FollowUp } from '@/lib/types';
import { INITIAL_CALL_RECORDS, INITIAL_FOLLOWUPS } from '@/lib/store';
import Link from 'next/link';
import { useToast } from '@/components/common/Toast';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<any>(null);
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>(INITIAL_CALL_RECORDS.slice(0, 5));
  const [followups, setFollowups] = useState<FollowUp[]>(INITIAL_FOLLOWUPS);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [analyticsRes, callsRes, followupsRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/calls'),
          fetch('/api/followups')
        ]);

        if (analyticsRes.ok) {
          const analytics = await analyticsRes.json();
          if (analytics.success) setMetrics(analytics);
        }
        if (callsRes.ok) {
          const calls = await callsRes.json();
          if (calls.success) setRecentCalls(calls.calls.slice(0, 5));
        }
        if (followupsRes.ok) {
          const followupsData = await followupsRes.json();
          if (followupsData.success) setFollowups(followupsData.followups);
        }
      } catch (e: any) {
        // Initial seed data handles render smoothly
      }
    }

    loadDashboardData();
  }, []);

  const overview = metrics?.overview || {
    totalCalls: 128,
    callsToday: 18,
    connectedCalls: 104,
    connectionRate: 81,
    interestedCustomers: 46,
    interestRate: 36,
    callbacksScheduled: 14,
    noAnswerCalls: 18,
    failedCalls: 6,
    avgDurationFormatted: '2m 15s'
  };

  const defaultActivityData = [
    { day: 'Mon', calls: 14, connected: 11, interested: 6, callbacks: 3, failed: 1 },
    { day: 'Tue', calls: 22, connected: 18, interested: 9, callbacks: 5, failed: 2 },
    { day: 'Wed', calls: 19, connected: 15, interested: 8, callbacks: 4, failed: 1 },
    { day: 'Thu', calls: 28, connected: 23, interested: 12, callbacks: 7, failed: 2 },
    { day: 'Fri', calls: 25, connected: 20, interested: 10, callbacks: 6, failed: 2 },
    { day: 'Sat', calls: 8,  connected: 6,  interested: 2, callbacks: 1, failed: 0 },
    { day: 'Sun', calls: 4,  connected: 3,  interested: 1, callbacks: 0, failed: 0 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Top Banner & Quick Controls */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sennova AI Voice Engine v3.4 Active</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            AI Cold Calling & Conversational Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Automate natural outbound calls across 9+ Indian & Global languages with instant AI post-call summarization, compliance guardrails, and interest detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </Link>

          <Link
            href="/live-call"
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span>Start AI Call Studio</span>
          </Link>
        </div>
      </div>

      {/* Grid of Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard
          title="Total Calls"
          value={overview.totalCalls}
          subtitle="All time outbound"
          icon={PhoneCall}
          trend={{ value: '+14%', positive: true }}
          color="indigo"
        />
        <StatCard
          title="Calls Today"
          value={overview.callsToday}
          subtitle="Active batch"
          icon={PhoneIncoming}
          trend={{ value: '+8%', positive: true }}
          color="blue"
        />
        <StatCard
          title="Connected"
          value={overview.connectedCalls}
          subtitle={`${overview.connectionRate}% connect rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Interested"
          value={overview.interestedCustomers}
          subtitle={`${overview.interestRate}% conversion`}
          icon={ThumbsUp}
          color="emerald"
        />
        <StatCard
          title="Callbacks"
          value={overview.callbacksScheduled}
          subtitle="Upcoming demos"
          icon={CalendarCheck}
          color="amber"
        />
        <StatCard
          title="No Answer"
          value={overview.noAnswerCalls}
          subtitle="Retry queued"
          icon={PhoneOff}
          color="amber"
        />
        <StatCard
          title="Failed Calls"
          value={overview.failedCalls}
          subtitle="Network / DNC"
          icon={AlertCircle}
          color="rose"
        />
        <StatCard
          title="Avg Duration"
          value={overview.avgDurationFormatted}
          subtitle="Talk time"
          icon={Clock}
          color="indigo"
        />
      </div>

      {/* Performance Chart & Upcoming Follow-ups split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart data={metrics?.activityData || defaultActivityData} />
        </div>

        {/* Follow-ups Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Upcoming Follow-ups</h3>
                <p className="text-[11px] text-slate-400">Callbacks & scheduled demos</p>
              </div>
              <Link href="/follow-ups" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {followups.slice(0, 3).map((f) => (
                <div key={f.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{f.customerName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {f.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{f.company} • {f.phone}</p>
                    <p className="text-[10px] text-amber-400 font-medium mt-1">
                      ⏰ {new Date(f.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                  <Link
                    href={`/live-call?phone=${encodeURIComponent(f.phone)}&name=${encodeURIComponent(f.customerName)}`}
                    className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    title="Call Now"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-4">
            <Link
              href="/campaigns"
              className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Outbound Campaigns</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Calls Table */}
      <RecentCallsTable calls={recentCalls} />
    </div>
  );
}
