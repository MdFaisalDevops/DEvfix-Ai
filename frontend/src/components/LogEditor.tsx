'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  ClipboardPaste,
  Trash2,
  Play,
  FileCode,
  Eye,
  EyeOff
} from 'lucide-react';
import { Technology, SampleError } from '@/types';
import { redactSensitiveData } from '@/lib/redactor';

interface LogEditorProps {
  log: string;
  setLog: (val: string) => void;
  technology: Technology;
  setTechnology: (tech: Technology) => void;
  redactSecrets: boolean;
  setRedactSecrets: (val: boolean) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  samples: SampleError[];
  onLoadSample: (sample: SampleError) => void;
}

export const LogEditor: React.FC<LogEditorProps> = ({
  log,
  setLog,
  technology,
  setTechnology,
  redactSecrets,
  setRedactSecrets,
  onAnalyze,
  isLoading,
  samples,
  onLoadSample
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const platforms: { id: Technology; label: string }[] = [
    { id: 'auto', label: 'Auto-Detect' },
    { id: 'kubernetes', label: 'Kubernetes' },
    { id: 'docker', label: 'Docker' },
    { id: 'jenkins', label: 'Jenkins' },
    { id: 'linux', label: 'Linux / Systemd' },
    { id: 'terraform', label: 'Terraform' },
    { id: 'aws', label: 'AWS Cloud' }
  ];

  // Compute live redaction stats
  const liveRedaction = useMemo(() => {
    if (!log) return { totalRedactions: 0, redactedText: '', categoriesFound: [] };
    return redactSensitiveData(log);
  }, [log]);

  const lineCount = useMemo(() => {
    if (!log) return 0;
    return log.split('\n').length;
  }, [log]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setLog(text);
    } catch {
      // Clipboard access denied
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (log.trim() && !isLoading) {
        onAnalyze();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Platform & Preset Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 space-y-3">
        {/* Technology Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            <span className="text-xs font-semibold text-slate-400 mr-1 uppercase tracking-wider">
              Platform:
            </span>
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setTechnology(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  technology === p.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Quick Paste & Clear */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Paste from clipboard"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
            {log && (
              <button
                type="button"
                onClick={() => setLog('')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
                title="Clear log text"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Sample Quick Loaders */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 flex items-center space-x-1 shrink-0 font-medium">
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            <span>Try Sample:</span>
          </span>
          {samples.slice(0, 6).map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => onLoadSample(sample)}
              className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-all font-mono text-[11px] cursor-pointer"
            >
              {sample.title.split('(')[0].replace('Kubernetes Pod', 'K8s').replace('AWS S3 / IAM', 'AWS S3').trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative min-h-[320px] flex flex-col bg-slate-950/70">
        {showPreview ? (
          <div className="flex-1 p-4 font-mono text-xs leading-relaxed text-slate-300 overflow-y-auto whitespace-pre-wrap select-text bg-slate-950">
            <div className="mb-2 pb-2 border-b border-slate-800 text-[11px] text-emerald-400 font-sans flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                Redaction Preview: {liveRedaction.totalRedactions} secret(s) masked ({liveRedaction.categoriesFound.join(', ') || 'No secrets detected'})
              </span>
            </div>
            {liveRedaction.redactedText || (
              <span className="text-slate-400 italic">No log text provided.</span>
            )}
          </div>
        ) : (
          <textarea
            value={log}
            onChange={(e) => setLog(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Paste infrastructure logs, stack traces, kubelet events, docker crash logs, or systemd failures here...

Example formats supported:
- Kubernetes CrashLoopBackOff & ExitCode 137
- Docker container port collision & daemon errors
- Jenkins CI pipeline heap exhaustion
- Linux systemd/nginx permission failures
- Terraform AWS DynamoDB state locks
- AWS S3 403 AccessDenied & KMS errors

Tip: Press Ctrl + Enter to analyze immediately.`}
            className="w-full flex-1 p-4 bg-transparent font-mono text-xs leading-relaxed text-slate-200 placeholder:text-slate-400 focus:outline-none resize-none selection:bg-cyan-500/30"
            spellCheck={false}
          />
        )}
      </div>

      {/* Footer Controls & Analyze Button */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between flex-wrap gap-3">
        {/* Redaction Controls */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer group select-none">
            <input
              type="checkbox"
              checked={redactSecrets}
              onChange={(e) => setRedactSecrets(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center space-x-1.5 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
              {redactSecrets ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              )}
              <span>Auto-Redact Secrets & PII</span>
            </span>
          </label>

          {/* Redaction Badge & Preview Toggle */}
          {redactSecrets && liveRedaction.totalRedactions > 0 && (
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                {liveRedaction.totalRedactions} sensitive items masked
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1 underline underline-offset-2"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Hide Masked View</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Preview Redaction</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Counts & Submit */}
        <div className="flex items-center space-x-4">
          <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
            <span>{lineCount} lines</span>
            <span className="mx-1.5">•</span>
            <span>{log.length} chars</span>
          </div>

          <button
            onClick={onAnalyze}
            disabled={isLoading || !log.trim()}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-lg ${
              isLoading || !log.trim()
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700/50'
                : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20 hover:shadow-cyan-500/30 ring-1 ring-white/20 active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Diagnosing Log...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Analyze Infrastructure Log</span>
                <span className="text-[10px] opacity-75 font-mono ml-1 hidden md:inline">Ctrl+Enter</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
