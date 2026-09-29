'use client';

import React, { useState, useEffect } from 'react';
import ActivityChart from '@/components/dashboard/ActivityChart';
import StatCard from '@/components/dashboard/StatCard';
import { BarChart3, Globe, PhoneCall, CheckCircle2, ThumbsUp, Clock, Percent } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

export default function AnalyticsPage() {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        if (data.success) setMetrics(data);
      } catch (e) {
        showToast('Error loading analytics data.', 'error');
      }
    }
    loadAnalytics();
  }, []);

  const overview = metrics?.overview || {
    totalCalls: 128,
    connectedCalls: 104,
    connectionRate: 81,
    interestedCustomers: 46,
    interestRate: 36,
    avgDurationFormatted: '2m 15s'
  };

  const languageDist = metrics?.languageDistribution || [
    { language: 'English', count: 45, percentage: 42 },
    { language: 'Telugu', count: 28, percentage: 26 },
    { language: 'Hindi', count: 20, percentage: 19 },
    { language: 'Tamil', count: 9, percentage: 8 },
    { language: 'Other', count: 5, percentage: 5 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            AI Voice Performance & Outreach Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Conversion rates, multi-lingual performance breakdown, and call volume trends for Sennova Innovation Pvt Ltd.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard title="Total Calls" value={overview.totalCalls} icon={PhoneCall} color="indigo" />
        <StatCard title="Connected Rate" value={`${overview.connectionRate}%`} icon={CheckCircle2} color="emerald" />
        <StatCard title="Lead Conversion" value={`${overview.interestRate}%`} icon={ThumbsUp} color="amber" />
        <StatCard title="Avg Call Duration" value={overview.avgDurationFormatted} icon={Clock} color="blue" />
      </div>

      <ActivityChart data={metrics?.activityData || []} />

      {/* Language Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          Multi-Lingual Outreach Distribution
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {languageDist.map((item: any) => (
            <div key={item.language} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{item.language}</span>
                <span className="font-mono text-indigo-400 font-bold">{item.percentage}%</span>
              </div>

              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>

              <span className="text-[10px] text-slate-400 block">{item.count} total calls placed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
