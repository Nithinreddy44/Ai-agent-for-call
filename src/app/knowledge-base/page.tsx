'use client';

import React, { useState, useEffect } from 'react';
import { KnowledgeArticle, KBCategory } from '@/lib/types';
import Modal from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { BookOpen, Plus, AlertTriangle, CheckCircle2, ShieldAlert, Tag, Edit2 } from 'lucide-react';

export default function KnowledgeBasePage() {
  const { showToast } = useToast();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<KBCategory>('Company Info');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const categories: KBCategory[] = [
    'Company Info', 'Services', 'Products', 'FAQs', 'Pricing', 'Policies', 'Sales Info'
  ];

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/knowledge');
      const data = await res.json();
      if (data.success) setArticles(data.articles);
    } catch (e) {
      showToast('Error loading Knowledge Base.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, title, content })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Knowledge article saved and approved for AI lookup!', 'success');
        setIsModalOpen(false);
        fetchKnowledge();
      }
    } catch (e) {
      showToast('Error saving article', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Company Knowledge Base & AI Grounding Rules
          </h1>
          <p className="text-xs text-slate-400">
            Admin-controlled repository of approved company facts, products, FAQs, pricing limits, and legal policies.
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setContent('');
            setCategory('Company Info');
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Article</span>
        </button>
      </div>

      {/* Mandatory Accuracy Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3 shadow-lg">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold uppercase tracking-wider text-amber-200">Mandatory AI Accuracy Requirement:</strong>
          <p className="mt-1 leading-relaxed text-amber-300/90 font-medium">
            "AI-generated responses must be reviewed and approved for accuracy before being used in production." The Sennova AI voice engine will strictly answer customer queries using only approved knowledge base articles below to prevent hallucinations.
          </p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {articles.map((art) => (
          <div
            key={art.id}
            className="p-5 bg-slate-900 border border-slate-800 rounded-xl shadow-lg space-y-3 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase tracking-wider">
                  {art.category}
                </span>

                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Approved Grounding
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mb-2">{art.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{art.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Updated by {art.updatedBy}</span>
              <span>{new Date(art.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Approved Company Knowledge Article"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveArticle} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Article Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as KBCategory)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Article Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sennova Enterprise Multi-lingual SLA"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Approved Knowledge Content *</label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed fact content used for grounding AI voice responses..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Articles created by Admins are automatically verified & approved for live AI grounding.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg shadow"
            >
              Save & Approve Knowledge
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
