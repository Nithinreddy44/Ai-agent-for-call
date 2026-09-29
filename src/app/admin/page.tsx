'use client';

import React, { useState } from 'react';
import { INITIAL_USERS } from '@/lib/store';
import { SystemUser } from '@/lib/types';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { Settings, Users, Key, ShieldCheck, Plus, CheckCircle2, Lock } from 'lucide-react';

export default function AdminPanelPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [apiKey, setApiKey] = useState('sk-sennova-prod-key-••••••••••••••••');
  const [showKey, setShowKey] = useState(false);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'Admin' | 'Manager' | 'Agent'>('Agent');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: SystemUser = {
      id: `usr-${Date.now()}`,
      name: userName,
      email: userEmail,
      role: userRole,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      lastActive: 'Just now'
    };
    setUsers([...users, newUser]);
    showToast(`User ${userName} added with ${userRole} permissions.`, 'success');
    setIsAddUserOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Administrator Panel & System Configuration
          </h1>
          <p className="text-xs text-slate-400">
            Manage user accounts, RBAC access roles, secure API credentials, and telephony provider settings.
          </p>
        </div>

        <button
          onClick={() => {
            setUserName('');
            setUserEmail('');
            setIsAddUserOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Grid: Users Table & API Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Accounts Management */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-3">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Authorized Users & Role RBAC
            </h3>
            <span className="text-[11px] text-slate-400">{users.length} Active Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">User Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{u.email}</td>
                    <td className="px-4 py-3 font-bold text-indigo-300">{u.role}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">{u.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* API Credentials & Secret Manager */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2 flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            API Secrets & Provider Configuration
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Telephony Provider Secret Key</label>
              <div className="flex items-center gap-2">
                <input
                  type={showKey ? 'text' : 'password'}
                  readOnly
                  value={apiKey}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-white"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
              <span className="font-bold text-white text-xs block">Security & Secret Protection Policy</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                API keys and provider credentials are strictly isolated within environment variables and backend routes. Secrets are never exposed to client-side JS bundles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add Authorized Platform User"
        maxWidth="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Ramesh Varma"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="e.g. ramesh@sennova.io"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">RBAC Role Permissions *</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            >
              <option value="Admin">Admin (Full Access & Configuration)</option>
              <option value="Manager">Manager (Campaigns, Customers, Calls)</option>
              <option value="Agent">Agent (Assigned Calls & Customers)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddUserOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow"
            >
              Add User Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
