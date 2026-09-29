'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Bot,
  Mic,
  FileCode,
  PhoneCall,
  History,
  CalendarCheck,
  BookOpen,
  BarChart3,
  ShieldCheck,
  Settings,
  CheckCircle2,
  PhoneForwarded,
  Sparkles,
  MessageSquare,
  Send,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Quick Call & WhatsApp', href: '/quick-call', icon: MessageSquare, highlight: true },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
    { name: 'AI Agents', href: '/ai-agents', icon: Bot },
    { name: 'Voice Lab', href: '/voice-lab', icon: Mic },
    { name: 'Call Scripts', href: '/script-builder', icon: FileCode },
    { name: 'Live Call Studio', href: '/live-call', icon: PhoneCall },
    { name: 'Call History', href: '/call-history', icon: History },
    { name: 'Follow-ups', href: '/follow-ups', icon: CalendarCheck },
    { name: 'Knowledge Base', href: '/knowledge-base', icon: BookOpen },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Compliance Center', href: '/compliance', icon: ShieldCheck },
    { name: 'Admin Panel', href: '/admin', icon: Settings },
    { name: 'QA Test Suite', href: '/qa-testing', icon: CheckCircle2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between select-none shrink-0 transition-all duration-200">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-extrabold text-xl">
              S
            </div>
            <div>
              <div className="font-bold text-white tracking-wide text-sm flex items-center gap-1.5">
                Sennova <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-semibold border border-indigo-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Innovation Pvt Ltd</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 text-sm font-medium overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Main Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30 shadow-sm'
                    : item.highlight
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.highlight && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Compliance & System Status Badge */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <p className="text-[11px] font-semibold text-slate-200">AI Call & WhatsApp</p>
              <p className="text-[10px] text-slate-400">ISO 27001 Active</p>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      </div>
    </aside>
  );
}
