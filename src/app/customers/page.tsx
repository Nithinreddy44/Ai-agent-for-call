'use client';

import React, { useState, useEffect } from 'react';
import { Customer, LeadStatus } from '@/lib/types';
import Badge from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Download,
  PhoneCall,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Link2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { validatePhoneNumber, parseCustomerCSV } from '@/lib/validation';
import Link from 'next/link';

export default function CustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formCountry, setFormCountry] = useState('India');
  const [formLanguage, setFormLanguage] = useState('Telugu');
  const [formStatus, setFormStatus] = useState<LeadStatus>('New');
  const [formNotes, setFormNotes] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // CSV Import state
  const [csvRawText, setCsvRawText] = useState('');
  const [importResult, setImportResult] = useState<any>(null);

  // Google Sheets Sync State
  const [googleSheetUrl, setGoogleSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1OPacKLl0wWiWi6wIhLWVHnSktEEfT6nilzQcdaP44sk/edit?gid=1425009838#gid=1425009838'
  );
  const [googleSheetCsvBackup, setGoogleSheetCsvBackup] = useState('');
  const [syncingGoogleSheets, setSyncingGoogleSheets] = useState(false);

  const languagesList = ['All', 'English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati'];
  const statusList = ['All', 'New', 'Contacted', 'Interested', 'Qualified', 'Callback', 'Not Interested', 'Do Not Call'];

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}&language=${languageFilter}&status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (e) {
      showToast('Failed to fetch customer contacts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, languageFilter, statusFilter]);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const phoneVal = validatePhoneNumber(formPhone);
    if (!phoneVal.valid) {
      setPhoneError(phoneVal.error || 'Invalid phone format.');
      return;
    }

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          phone: phoneVal.formatted || formPhone,
          email: formEmail,
          company: formCompany,
          country: formCountry,
          preferredLanguage: formLanguage,
          leadStatus: formStatus,
          notes: formNotes,
        })
      });

      const data = await res.json();

      if (data.success) {
        showToast(editingCustomer ? 'Customer updated successfully!' : 'Customer added successfully!', 'success');
        setIsAddModalOpen(false);
        setEditingCustomer(null);
        resetForm();
        fetchCustomers();
      } else {
        if (res.status === 409) {
          showToast(data.error, 'warning');
        } else {
          showToast(data.error || 'Error saving customer', 'error');
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Server error', 'error');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;
    try {
      const res = await fetch(`/api/customers/${deletingCustomer.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Customer deleted successfully.', 'success');
        setDeletingCustomer(null);
        fetchCustomers();
      }
    } catch (e) {
      showToast('Error deleting customer', 'error');
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCompany('');
    setFormCountry('India');
    setFormLanguage('Telugu');
    setFormStatus('New');
    setFormNotes('');
    setPhoneError('');
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormEmail(c.email);
    setFormCompany(c.company);
    setFormCountry(c.country);
    setFormLanguage(c.preferredLanguage);
    setFormStatus(c.leadStatus);
    setFormNotes(c.notes);
    setIsAddModalOpen(true);
  };

  // Google Sheets Lead Sync Handler
  const handleSyncGoogleSheets = async () => {
    try {
      setSyncingGoogleSheets(true);
      const res = await fetch('/api/customers/import-google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetUrl: googleSheetUrl,
          csvContent: googleSheetCsvBackup
        })
      });

      const data = await res.json();

      if (data.success) {
        showToast(data.message || `Successfully integrated ${data.importedCount} leads from Google Spreadsheet!`, 'success');
        setIsGoogleSheetsModalOpen(false);
        fetchCustomers();
      } else {
        if (data.isAuthRequired) {
          showToast('Google Sheet requires public access or CSV content. Use the direct CSV backup paste area below.', 'warning');
        } else {
          showToast(data.error || 'Failed to import leads from Google Sheet.', 'error');
        }
      }
    } catch (e: any) {
      showToast(e.message || 'Error syncing Google Sheet', 'error');
    } finally {
      setSyncingGoogleSheets(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const targetList = selectedIds.length > 0
      ? customers.filter(c => selectedIds.includes(c.id))
      : customers;

    if (targetList.length === 0) {
      showToast('No customers available to export.', 'warning');
      return;
    }

    const headers = 'Name,Phone,Email,Company,Country,Language,Status,Notes\n';
    const rows = targetList.map(c =>
      `"${c.name}","${c.phone}","${c.email}","${c.company}","${c.country}","${c.preferredLanguage}","${c.leadStatus}","${c.notes || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sennova_Customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast(`Exported ${targetList.length} customer records.`, 'success');
  };

  // Process CSV Import Text
  const handleProcessCSV = async () => {
    if (!csvRawText.trim()) {
      showToast('Please paste CSV content or select file.', 'warning');
      return;
    }
    const result = parseCustomerCSV(csvRawText);
    setImportResult(result);

    if (result.successful.length > 0) {
      for (const item of result.successful) {
        await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
      showToast(`Imported ${result.successful.length} customers successfully!`, 'success');
      fetchCustomers();
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(customers.map(c => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            Customer Contact Directory
          </h1>
          <p className="text-xs text-slate-400">
            Manage prospects, language preferences, E.164 phone verification, and bulk outbound calling lists.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Google Sheets Sync Trigger */}
          <button
            onClick={() => setIsGoogleSheetsModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Link2 className="w-4 h-4 text-emerald-200" />
            <span>Sync Google Sheet Leads</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => { resetForm(); setEditingCustomer(null); setIsAddModalOpen(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, company..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lang:</span>
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {languagesList.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {statusList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Banner */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-between animate-fadeIn text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span><strong>{selectedIds.length}</strong> contacts selected</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/live-call?batchIds=${selectedIds.join(',')}`}
              className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded font-bold text-xs flex items-center gap-1 shadow"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Launch Batch AI Call ({selectedIds.length})</span>
            </Link>
          </div>
        </div>
      )}

      {/* Customer Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === customers.length && customers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Phone & E.164 Status</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Lead Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No matching customer contacts found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isSelected = selectedIds.includes(c.id);
                  const isDNC = c.leadStatus === 'Do Not Call';

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-indigo-950/20' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(c.id)}
                          className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        <div>{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{c.email || 'No email registered'}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span>{c.phone}</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            E.164 Valid
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{c.company}</td>
                      <td className="px-4 py-3 font-medium text-indigo-300">{c.preferredLanguage}</td>
                      <td className="px-4 py-3">
                        <Badge status={c.leadStatus} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px]">{c.leadSource}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isDNC ? (
                            <Link
                              href={`/live-call?phone=${encodeURIComponent(c.phone)}&name=${encodeURIComponent(c.name)}&company=${encodeURIComponent(c.company)}`}
                              className="p-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors"
                              title="Call Customer Now"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span
                              className="p-1.5 rounded bg-rose-500/10 text-rose-400 cursor-not-allowed"
                              title="Call Blocked: Contact on Do-Not-Call registry"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </span>
                          )}

                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Edit Contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingCustomer(c)}
                            className="p-1.5 rounded bg-slate-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Sheets Sync Integration Modal */}
      <Modal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        title="Sync Inbound Leads from Google Spreadsheet"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Google Sheets Real-Time Sync Engine</strong>
              <p className="mt-0.5 text-emerald-300/90 leading-relaxed">
                Connect your Google Spreadsheet URL. Sennova's engine will parse lead rows, map headers (Name, Phone, Company, Language), validate phone numbers against E.164 compliance, and add them to your outbound calling directory.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Google Spreadsheet URL *</label>
            <div className="relative">
              <input
                type="text"
                value={googleSheetUrl}
                onChange={(e) => setGoogleSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full pl-3 pr-24 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setGoogleSheetUrl('https://docs.google.com/spreadsheets/d/1OPacKLl0wWiWi6wIhLWVHnSktEEfT6nilzQcdaP44sk/edit?gid=1425009838#gid=1425009838')}
                className="absolute right-1 top-1 bottom-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-[10px] font-semibold"
              >
                Reset Default Sheet
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              CSV Lead Backup / Direct Paste (Optional if Sheet requires auth)
            </label>
            <textarea
              rows={4}
              value={googleSheetCsvBackup}
              onChange={(e) => setGoogleSheetCsvBackup(e.target.value)}
              placeholder={`Name,Phone,Email,Company,Language\nRajesh Kumar,+919876543210,rajesh@apextech.in,Apex Tech,Telugu\nPriya Sharma,+919812345678,priya@innovatehub.co,InnovateHub,Hindi`}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsGoogleSheetsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSyncGoogleSheets}
              disabled={syncingGoogleSheets}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-lg shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncingGoogleSheets ? 'animate-spin' : ''}`} />
              <span>{syncingGoogleSheets ? 'Syncing Sheet...' : 'Sync & Integrate Leads'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Contact' : 'Add New Customer Contact'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (E.164) *</label>
              <input
                type="text"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
              {phoneError && <p className="text-[11px] text-rose-400 mt-1">{phoneError}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="e.g. rajesh@apextech.in"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="e.g. Apex Tech Solutions"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Calling Language</label>
              <select
                value={formLanguage}
                onChange={(e) => setFormLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {languagesList.filter(l => l !== 'All').map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Lead Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {statusList.filter(s => s !== 'All').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Call Instructions</label>
            <textarea
              rows={3}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Interested in appointment reminder AI voice bot."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/30"
            >
              {editingCustomer ? 'Update Contact' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Customer Contacts via CSV"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Paste raw CSV content below or use headers: <code>Name, Phone, Email, Company, Language, Country</code>. Phone numbers will automatically be validated against E.164 standards.
          </p>

          <textarea
            rows={6}
            value={csvRawText}
            onChange={(e) => setCsvRawText(e.target.value)}
            placeholder={`Name,Phone,Email,Company,Language\nRajesh Kumar,+919876543210,rajesh@apextech.in,Apex Tech,Telugu\nPriya Sharma,+919812345678,priya@innovatehub.co,InnovateHub,Hindi`}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          <div className="flex items-center justify-between">
            <button
              onClick={() => setCsvRawText(`Name,Phone,Email,Company,Language\nAnil Verma,+919988776655,anil@verma.in,Verma Logistics,Hindi\nSita Reddy,+919445566778,sita@reddytech.co,Reddy Tech,Telugu`)}
              className="text-xs text-indigo-400 hover:underline font-medium"
            >
              Load Sample CSV Data
            </button>

            <button
              onClick={handleProcessCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow"
            >
              Validate & Import Contacts
            </button>
          </div>

          {importResult && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span>Total Rows Processed: {importResult.totalRows}</span>
                <span className="text-emerald-400">Success: {importResult.successful.length}</span>
                <span className="text-rose-400">Errors: {importResult.errors.length}</span>
              </div>
              {importResult.errors.map((e: any, idx: number) => (
                <div key={idx} className="text-rose-400 text-[11px]">
                  • Row {e.row}: {e.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        title="Confirm Delete Contact"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to delete customer <strong>{deletingCustomer?.name}</strong> ({deletingCustomer?.phone})?
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeletingCustomer(null)}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCustomer}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
