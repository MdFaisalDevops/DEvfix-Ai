'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  Terminal,
  Check,
  Copy,
  AlertTriangle,
  FileCheck2,
  Download,
  Info,
  Clock,
  Zap,
  Bookmark,
  Share2
} from 'lucide-react';
import { AnalysisResult, DiagnosticCommand, RollbackPrecaution } from '@/types';

interface AnalysisViewProps {
  result: AnalysisResult;
  onSaveToHistory: (result: AnalysisResult) => void;
  isSaved?: boolean;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  result,
  onSaveToHistory,
  isSaved = false
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedRootCause, setCopiedRootCause] = useState(false);

  const handleCopyCommand = (command: string, index: number) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyRootCause = () => {
    navigator.clipboard.writeText(result.likely_root_cause);
    setCopiedRootCause(true);
    setTimeout(() => setCopiedRootCause(false), 2000);
  };

  const handleCopyReport = () => {
    const markdown = `# DevFix AI Diagnostic Report
**ID:** ${result.id}
**Timestamp:** ${result.timestamp}
**Platform:** ${result.detected_technology.toUpperCase()}
**Category:** ${result.detected_category}
**Severity:** ${result.severity.toUpperCase()}
**Confidence:** ${Math.round(result.confidence_score * 100)}% (${result.confidence})
**Model/Engine:** ${result.model_used} (${result.inference_source})

## Executive Summary
${result.summary}

## Likely Root Cause
${result.likely_root_cause}

## Evidence from Logs
${result.evidence.map(e => `- \`${e}\``).join('\n')}

## Safe Diagnostic Commands
${result.safe_diagnostic_commands.map((cmd, i) => `### ${i + 1}. \`${cmd.command}\`
- **Purpose:** ${cmd.purpose}
- **Safe Read-Only:** ${cmd.is_safe_read_only ? 'Yes' : 'No'}
- **Expected Output:** ${cmd.expected_output}
`).join('\n')}

## Suggested Remediation
${result.suggested_remediation.map((rem, i) => `${i + 1}. ${rem}`).join('\n')}

## Rollback Precautions
${result.rollback_precautions.map(rb => `- **${rb.action}** (Risk: ${rb.risk_level.toUpperCase()}): ${rb.precaution}`).join('\n')}
`;
    navigator.clipboard.writeText(markdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devfix-analysis-${result.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const severityColor = {
    critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  }[result.severity] || 'bg-slate-800 text-slate-300 border-slate-700';

  const riskBadgeColor = {
    critical: 'bg-rose-950/80 text-rose-300 border-rose-600/50',
    high: 'bg-orange-950/80 text-orange-300 border-orange-600/50',
    medium: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
    low: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
  };

  return (
    <div className="space-y-6">
      {/* Human Review Required Banner (Requirement 10) */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-start space-x-3 text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-semibold text-amber-300 uppercase tracking-wide mr-1.5">
            ⚠️ Safety Review Required:
          </span>
          <span>
            DevFix AI never auto-executes commands. All diagnostic commands and remediations below must be inspected and validated by an engineer before running in production environments.
          </span>
        </div>
      </div>

      {/* Insufficient Logs Alert (If applicable) */}
      {result.insufficient_logs && (
        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/40 flex items-start space-x-3 text-blue-200">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <span className="font-semibold text-blue-300 uppercase tracking-wide">
              Insufficient Log Excerpt Detected:
            </span>
            <p className="text-slate-300">
              {result.missing_information_request || 'The log excerpt provided is too short for definitive root-cause isolation.'}
            </p>
          </div>
        </div>
      )}

      {/* Executive Summary Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2 flex-wrap gap-1.5">
            {/* Technology */}
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono uppercase">
              {result.detected_technology}
            </span>
            {/* Category */}
            <span className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {result.detected_category}
            </span>
            {/* Severity */}
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase border ${severityColor}`}>
              {result.severity} Severity
            </span>
            {/* Confidence */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs bg-slate-800/80 border border-slate-700 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{Math.round(result.confidence_score * 100)}% Confidence</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => onSaveToHistory(result)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                isSaved
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-emerald-400' : ''}`} />
              <span>{isSaved ? 'Saved to History' : 'Save'}</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Copy markdown diagnostic report"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? 'Copied' : 'Copy Report'}</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Download JSON analysis"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
          </div>
        </div>

        {/* Summary text */}
        <div>
          <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            Executive Summary
          </h2>
          <p className="text-slate-100 text-base font-medium leading-relaxed">
            {result.summary}
          </p>
        </div>

        {/* Diagnostic Meta info */}
        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center space-x-3">
            <span>Model: {result.model_used}</span>
            <span>•</span>
            <span>Source: {result.inference_source}</span>
            {result.redacted_items_count > 0 && (
              <>
                <span>•</span>
                <span className="text-emerald-400">{result.redacted_items_count} secrets masked</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-1 text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{result.execution_time_ms}ms</span>
          </div>
        </div>
      </div>

      {/* Likely Root Cause Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Likely Root Cause</span>
          </h3>
          <button
            onClick={handleCopyRootCause}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
          >
            {copiedRootCause ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRootCause ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 font-sans">
          {result.likely_root_cause}
        </p>
      </div>

      {/* Evidence from Logs */}
      {result.evidence && result.evidence.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <span>Diagnostic Evidence Extracted from Log</span>
          </h3>
          <div className="space-y-2">
            {result.evidence.map((line, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300/90 leading-relaxed overflow-x-auto flex items-start space-x-2"
              >
                <span className="text-slate-400 select-none">#</span>
                <span className="break-all">{line}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Diagnostic Commands (Terminal Block) */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Safe Diagnostic Commands (Human Review Required)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy and execute these read-only commands in your terminal to gather live verification data.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {result.safe_diagnostic_commands.map((cmd, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium text-slate-300">{cmd.purpose}</span>
                </div>

                <div className="flex items-center space-x-2">
                  {cmd.is_safe_read_only && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                      Read-Only
                    </span>
                  )}
                  {cmd.requires_sudo && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                      Requires Sudo
                    </span>
                  )}
                  <button
                    onClick={() => handleCopyCommand(cmd.command, idx)}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy command to clipboard"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Code Snippet */}
              <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800/80 font-mono text-xs text-emerald-300 select-all overflow-x-auto">
                <span className="text-slate-400 select-none">$ </span>
                {cmd.command}
              </div>

              {/* Expected Output */}
              {cmd.expected_output && (
                <div className="text-[11px] text-slate-400 flex items-start space-x-1.5 pt-1">
                  <span className="text-slate-400 font-semibold shrink-0">Expected:</span>
                  <span>{cmd.expected_output}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Remediation Steps */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <FileCheck2 className="w-4 h-4 text-indigo-400" />
          <span>Suggested Step-by-Step Remediation</span>
        </h3>

        <div className="space-y-3">
          {result.suggested_remediation.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-sm text-slate-300 leading-relaxed"
            >
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30">
                {idx + 1}
              </div>
              <div className="flex-1 font-sans">{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rollback & Safety Precautions */}
      {result.rollback_precautions && result.rollback_precautions.length > 0 && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Rollback Precautions & Secondary Outage Prevention</span>
          </h3>

          <div className="space-y-3">
            {result.rollback_precautions.map((rb, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{rb.action}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${riskBadgeColor[rb.risk_level] || 'bg-slate-800 text-slate-300'}`}>
                    {rb.risk_level} Risk
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Precaution:</strong> {rb.precaution}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
