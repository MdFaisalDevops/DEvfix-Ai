'use client';

import React from 'react';
import {
  ShieldCheck,
  Radio,
  Cpu,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  inferenceSource: 'local_ollama' | 'remote_ollama' | 'deterministic_demo';
  ollamaOnline: boolean;
  activeModel: string;
  forceDemoMode: boolean;
  setForceDemoMode: (val: boolean) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onResetEditor: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  inferenceSource,
  ollamaOnline,
  activeModel,
  forceDemoMode,
  setForceDemoMode,
  setActiveTab,
  onResetEditor
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
      {/* Title & Context */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-semibold text-slate-100 flex items-center space-x-2">
          <span>DevFix AI</span>
          <span className="text-slate-400 font-normal text-sm">/</span>
          <span className="text-slate-300 font-normal text-sm">Infrastructure Root-Cause Diagnostics</span>
        </h1>
      </div>

      {/* Right Indicators & Actions */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Privacy Indicator */}
        <div className="flex items-center px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 shadow-sm">
          {inferenceSource === 'local_ollama' ? (
            <span className="flex items-center space-x-2 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Local Air-Gapped AI (100% Private)</span>
            </span>
          ) : inferenceSource === 'remote_ollama' ? (
            <span className="flex items-center space-x-2 text-sky-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <Radio className="w-3.5 h-3.5 text-sky-400" />
              <span>Remote Ollama Server (Private VPC)</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2 text-violet-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Deterministic Demo Engine (Offline)</span>
            </span>
          )}
        </div>

        {/* Model Connection Status Pill */}
        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border transition-all ${
            ollamaOnline
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/30'
          }`}
          title="Click to configure Ollama and model endpoints"
        >
          <Cpu className="w-3.5 h-3.5" />
          {ollamaOnline ? (
            <span className="font-mono">{activeModel}</span>
          ) : (
            <span className="flex items-center space-x-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Ollama Offline (Setup)</span>
            </span>
          )}
        </button>

        {/* Force Demo Mode Toggle */}
        <label className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={forceDemoMode}
            onChange={(e) => setForceDemoMode(e.target.checked)}
            className="w-3.5 h-3.5 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
          />
          <span className="text-slate-300 select-none">Demo Mode</span>
        </label>

        {/* Reset / New Log Button */}
        <button
          onClick={onResetEditor}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Clear current log and reset editor"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        {/* Help / About */}
        <button
          onClick={() => setActiveTab('about')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Why Open-Weight AI?"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
