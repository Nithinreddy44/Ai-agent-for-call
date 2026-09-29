import React from 'react';
import { CallStatus, InterestLevel, LeadStatus } from '@/lib/types';

interface BadgeProps {
  status: CallStatus | InterestLevel | LeadStatus | string;
  size?: 'sm' | 'md';
}

export default function Badge({ status, size = 'md' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  switch (status) {
    case 'Connected':
    case 'Completed':
    case 'Interested':
    case 'High':
    case 'Active':
    case 'Qualified':
    case 'Running':
      colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      break;
    case 'In Conversation':
    case 'Calling':
    case 'Ringing':
      colorClasses = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse';
      break;
    case 'Medium':
    case 'Callback Requested':
    case 'Callback':
    case 'Scheduled':
    case 'Contacted':
      colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      break;
    case 'Low':
    case 'New':
    case 'Draft':
      colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      break;
    case 'Not Interested':
    case 'No Answer':
    case 'Busy':
    case 'Voicemail':
      colorClasses = 'bg-slate-700/50 text-slate-400 border-slate-600/50';
      break;
    case 'Failed':
    case 'Do Not Call':
    case 'Active DNC':
      colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      break;
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${colorClasses}`}>
      {status}
    </span>
  );
}
