'use client';

import React from 'react';
import {
  Terminal,
  History,
  FileCode2,
  Cpu,
  CreditCard,
  MessageSquareHeart,
  ShieldCheck,
  ExternalLink,
  Activity,
  Layers
} from 'lucide-react';

export type ActiveTab = 'analyzer' | 'history' | 'samples' | 'models' | 'pricing' | 'feedback' | 'about';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
  backendOnline: boolean;
  ollamaOnline: boolean;
  activeModel: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  backendOnline,
  ollamaOnline,
  activeModel
}) => {
  const navItems = [
    {
      id: 'analyzer' as ActiveTab,
      label: 'Troubleshooter',
      icon: Terminal,
      description: 'Log analysis & root-cause'
    },
    {
      id: 'history' as ActiveTab,
      label: 'Analysis History',
      icon: History,
      badge: historyCount > 0 ? historyCount : undefined,
      description: 'Saved local audits'
    },
    {
      id: 'samples' as ActiveTab,
      label: 'Sample Library',
      icon: FileCode2,
      description: 'K8s, Docker, AWS, Jenkins'
    },
    {
      id: 'models' as ActiveTab,
      label: 'Ollama & Models',
      icon: Cpu,
      description: 'Local open-weight config'
    },
    {
      id: 'pricing' as ActiveTab,
      label: 'Plans & Pricing',
      icon: CreditCard,
      description: 'Proposed developer tiers'
    },
    {
      id: 'feedback' as ActiveTab,
      label: 'Beta Feedback',
      icon: MessageSquareHeart,
      description: 'Shape the roadmap'
    },
    {
      id: 'about' as ActiveTab,
      label: 'Why Open-Weight AI',
      icon: ShieldCheck,
      description: 'Privacy & zero cloud bills'
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-slate-100 text-base tracking-tight">DevFix</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">DevOps Troubleshooting</p>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 truncate">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Infrastructure Status Widget */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs space-y-2.5">
        <div className="flex items-center justify-between text-slate-400 font-medium">
          <span className="flex items-center space-x-1.5 text-[11px]">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>Engine Status</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">v1.0-mvp</span>
        </div>

        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Backend API</span>
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'}`} />
              <span className={backendOnline ? 'text-emerald-400 font-mono text-[10px]' : 'text-amber-400 font-mono text-[10px]'}>
                {backendOnline ? 'Connected' : 'Client Mode'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Ollama Model</span>
            <div className="flex items-center space-x-1.5">
              <span className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-violet-400'}`} />
              <span className={ollamaOnline ? 'text-emerald-400 font-mono text-[10px]' : 'text-violet-400 font-mono text-[10px]'}>
                {ollamaOnline ? activeModel : 'Demo Engine'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('models')}
          className="w-full mt-2 py-1.5 px-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-md text-[11px] font-medium transition-colors flex items-center justify-center space-x-1"
        >
          <span>Configure Inference</span>
          <ExternalLink className="w-3 h-3 ml-1" />
        </button>
      </div>
    </aside>
  );
};
