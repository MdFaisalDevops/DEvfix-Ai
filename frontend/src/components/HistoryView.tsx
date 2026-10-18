'use client';

import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Trash2,
  Download,
  ExternalLink,
  Clock,
  Layers,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AnalysisResult, Technology } from '@/types';
import { exportHistoryJson } from '@/lib/storage';

interface HistoryViewProps {
  history: AnalysisResult[];
  onSelectAnalysis: (result: AnalysisResult) => void;
  onDeleteAnalysis: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectAnalysis,
  onDeleteAnalysis,
  onClearHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.likely_root_cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.detected_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTech = selectedTech === 'all' || item.detected_technology === selectedTech;
      const matchSev = selectedSeverity === 'all' || item.severity === selectedSeverity;

      return matchSearch && matchTech && matchSev;
    });
  }, [history, searchTerm, selectedTech, selectedSeverity]);

  const severityBadge = (sev: string) => {
    const map: Record<string, string> = {
      critical: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
      high: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
      medium: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      low: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
    };
    return map[sev] || 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Controls */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Analysis Audit History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted locally in your browser storage. Never transmitted to third-party tracking servers.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={exportHistoryJson}
            disabled={history.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export All JSON</span>
          </button>

          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between flex-wrap gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search diagnoses by root cause, category, or ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* Tech Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Tech:</span>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Platforms</option>
            <option value="kubernetes">Kubernetes</option>
            <option value="docker">Docker</option>
            <option value="jenkins">Jenkins</option>
            <option value="linux">Linux</option>
            <option value="terraform">Terraform</option>
            <option value="aws">AWS</option>
          </select>
        </div>

        {/* Severity Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium">Severity:</span>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400">
            <History className="w-6 h-6" />
          </div>
          <p className="text-slate-300 text-sm font-medium">No saved analyses found</p>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            {searchTerm || selectedTech !== 'all' || selectedSeverity !== 'all'
              ? 'Try adjusting your search filters to find what you are looking for.'
              : 'Run an analysis in the Troubleshooter and click "Save to History" to record diagnostic reports here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/90 transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                    {item.detected_technology}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {item.detected_category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${severityBadge(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center space-x-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </span>
                  <button
                    onClick={() => onDeleteAnalysis(item.id)}
                    className="p-1 rounded hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 transition-colors"
                    title="Delete this record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Summary */}
              <p className="text-sm font-medium text-slate-200 line-clamp-2">
                {item.summary}
              </p>

              {/* Footer details */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                  <span>Model: {item.model_used}</span>
                  <span>•</span>
                  <span>{item.safe_diagnostic_commands.length} Safe Commands</span>
                </div>

                <button
                  onClick={() => onSelectAnalysis(item)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-colors"
                >
                  <span>Open Full Diagnosis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
