'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Play, RefreshCw, ShieldCheck, FileCode, Check } from 'lucide-react';
import { useToast } from '@/components/common/Toast';

export default function QATestingPage() {
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [testSuite, setTestSuite] = useState<any>(null);

  const runDiagnostics = async () => {
    try {
      setRunning(true);
      const res = await fetch('/api/qa/test-runner', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTestSuite(data);
        showToast(`QA Test Suite Completed: ${data.summary.passed} / ${data.summary.totalTests} passed cleanly!`, 'success');
      }
    } catch (e) {
      showToast('Error executing QA test suite.', 'error');
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Automated QA & Diagnostic Test Suite
          </h1>
          <p className="text-xs text-slate-400">
            Senior QA Engineer verification panel. Runs automated unit, validation, compliance, and AI state machine tests.
          </p>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={running}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-extrabold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Executing Suite...' : 'Run Automated Test Suite'}</span>
        </button>
      </div>

      {/* Summary Box */}
      {testSuite && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Diagnostics Status</h3>
              <p className="text-xs text-slate-400">
                Executed {testSuite.summary.totalTests} tests in <strong className="text-indigo-300">{testSuite.summary.durationMs}ms</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Passed: {testSuite.summary.passed}
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              Failed: {testSuite.summary.failed}
            </div>
          </div>
        </div>
      )}

      {/* Test Cases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white tracking-wide">Automated Test Assertions Breakdown</h3>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {testSuite?.results ? (
            testSuite.results.map((t: any) => (
              <div key={t.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start gap-3">
                  {t.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{t.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">{t.details}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded text-[11px] font-extrabold uppercase ${t.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                  {t.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">Loading test diagnostics...</div>
          )}
        </div>
      </div>
    </div>
  );
}
