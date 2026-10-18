'use client';

import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Zap,
  Info,
  Server
} from 'lucide-react';
import { ModelStatus } from '@/types';

interface ModelSetupViewProps {
  modelStatus: ModelStatus;
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  onRefreshStatus: () => void;
  isChecking: boolean;
}

export const ModelSetupView: React.FC<ModelSetupViewProps> = ({
  modelStatus,
  ollamaUrl,
  setOllamaUrl,
  selectedModel,
  setSelectedModel,
  onRefreshStatus,
  isChecking
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Connection Status Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              modelStatus.available
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Ollama Inference Engine</span>
                {modelStatus.available ? (
                  <span className="flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Online & Ready</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/30">
                    <XCircle className="w-3 h-3" />
                    <span>Offline (Demo Mode Active)</span>
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {modelStatus.available
                  ? `Connected to ${ollamaUrl}. Zero cloud API fees and complete air-gapped privacy.`
                  : 'Ollama daemon was not detected at this URL. DevFix AI is operating in deterministic demo mode with realistic sample responses.'}
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshStatus}
            disabled={isChecking}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking...' : 'Test Connection'}</span>
          </button>
        </div>

        {/* URL and Model Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Ollama Host Endpoint
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports localhost or remote Ollama server on LAN/VPC (e.g., http://192.168.1.50:11434).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Active Open-Weight Model
            </label>
            <input
              type="text"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              placeholder="llama3.2:3b or qwen2.5-coder:7b"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500/50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {modelStatus.installed_models.length > 0
                ? `Installed models: ${modelStatus.installed_models.join(', ')}`
                : 'No local models downloaded yet.'}
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Setup Guide */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Quick 3-Step Ollama Setup Guide</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold flex items-center justify-center border border-cyan-500/30">
              1
            </div>
            <h4 className="font-semibold text-slate-200">Download Ollama</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Install the lightweight runtime for your OS from <a href="https://ollama.ai/download" target="_blank" rel="noreferrer" className="text-cyan-400 underline">ollama.ai/download</a>:
            </p>
            <div className="p-2 rounded bg-black/60 border border-slate-800 font-mono text-[11px] text-emerald-300 flex items-center justify-between">
              <span>curl -fsSL https://ollama.ai/install.sh | sh</span>
              <button onClick={() => handleCopy('curl -fsSL https://ollama.ai/install.sh | sh')}>
                {copiedCmd === 'curl -fsSL https://ollama.ai/install.sh | sh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400 hover:text-white" />}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold flex items-center justify-center border border-cyan-500/30">
              2
            </div>
            <h4 className="font-semibold text-slate-200">Pull an Open Model</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Run Meta's ultra-fast 3B model or Alibaba's Qwen Coder in your terminal:
            </p>
            <div className="p-2 rounded bg-black/60 border border-slate-800 font-mono text-[11px] text-emerald-300 flex items-center justify-between">
              <span>ollama run llama3.2:3b</span>
              <button onClick={() => handleCopy('ollama run llama3.2:3b')}>
                {copiedCmd === 'ollama run llama3.2:3b' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400 hover:text-white" />}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold flex items-center justify-center border border-cyan-500/30">
              3
            </div>
            <h4 className="font-semibold text-slate-200">Verify & Diagnose</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Click "Test Connection" above. Once green, all analyses execute 100% locally on your GPU/CPU with zero data transmission.
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Models Comparison */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Recommended Open-Weight Models for DevOps</span>
        </h3>

        <div className="space-y-3">
          {modelStatus.recommended_models.map((m) => (
            <div
              key={m.name}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between flex-wrap gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-100">{m.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    {m.size}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                    RAM: {m.ram_required}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    {m.speed}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{m.description}</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-emerald-400">
                  ollama run {m.name}
                </div>
                <button
                  onClick={() => handleCopy(`ollama run ${m.name}`)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy pull command"
                >
                  {copiedCmd === `ollama run ${m.name}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
