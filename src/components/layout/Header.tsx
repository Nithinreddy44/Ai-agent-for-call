'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  ShieldCheck,
  Globe,
  UserCheck,
  ChevronDown,
  PhoneCall,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  currentRole: 'Admin' | 'Manager' | 'Agent';
  onRoleChange: (role: 'Admin' | 'Manager' | 'Agent') => void;
  title?: string;
}

export default function Header({ currentRole, onRoleChange, title }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    { id: 1, title: 'Callback Scheduled', desc: 'Rajesh Kumar requested demo for tomorrow 11 AM', time: '10m ago', type: 'success' },
    { id: 2, title: 'Compliance Rule Triggered', desc: 'DNC number +91 94432 10987 blocked automatically', time: '1h ago', type: 'warning' },
    { id: 3, title: 'Campaign Running', desc: 'Q3 Enterprise Digital Outreach at 60% completion', time: '2h ago', type: 'info' }
  ];

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-slate-200 z-20 shrink-0">
      {/* Search & Breadcrumb */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            {title || 'Dashboard'}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Sennova Voice Automation Portal</p>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers, calls, agents..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Launch Live Call Button */}
        <Link
          href="/live-call"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-semibold text-xs transition-all shadow-md shadow-emerald-600/20"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Launch AI Call</span>
        </Link>

        {/* Role Selector Badge (RBAC Demo) */}
        <div className="relative flex items-center bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded-lg">
          <UserCheck className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
          <span className="text-[11px] text-slate-400 mr-1.5">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-indigo-300 focus:outline-none cursor-pointer"
          >
            <option value="Admin" className="bg-slate-900 text-white">Admin (Full)</option>
            <option value="Manager" className="bg-slate-900 text-white">Manager</option>
            <option value="Agent" className="bg-slate-900 text-white">Agent</option>
          </select>
        </div>

        {/* Verified Outbound Caller ID Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-mono">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
          <span>Caller ID: +91 63036 95181</span>
        </div>

        {/* Multi-language Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-300">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium">9+ Languages</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-white">Activity Notifications</span>
                <span className="text-[10px] text-indigo-400 font-semibold cursor-pointer">Mark all read</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-xs transition-all border border-slate-800">
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white text-xs ring-2 ring-indigo-500/30">
            NK
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">Nithin Kumar</p>
            <p className="text-[10px] text-slate-400">Sennova Team</p>
          </div>
        </div>
      </div>
    </header>
  );
}
