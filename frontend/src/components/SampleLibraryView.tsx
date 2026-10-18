'use client';

import React from 'react';
import {
  FileCode2,
  ArrowRight,
  ShieldAlert,
  Play,
  Layers,
  Sparkles
} from 'lucide-react';
import { SampleError } from '@/types';

interface SampleLibraryViewProps {
  samples: SampleError[];
  onSelectSample: (sample: SampleError) => void;
}

export const SampleLibraryView: React.FC<SampleLibraryViewProps> = ({
  samples,
  onSelectSample
}) => {
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
      {/* Intro Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <FileCode2 className="w-5 h-5 text-cyan-400" />
            <span>Interactive Sample Error Library</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test DevFix AI immediately with real-world infrastructure failures across Kubernetes, Docker, Jenkins, Linux, Terraform, and AWS.
          </p>
        </div>
      </div>

      {/* Grid of Samples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {samples.map((sample) => (
          <div
            key={sample.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/90 transition-all flex flex-col justify-between space-y-4 group backdrop-blur-sm"
          >
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                    {sample.technology}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {sample.category}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${severityBadge(sample.severity)}`}>
                  {sample.severity}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {sample.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              {/* Log Snippet */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 line-clamp-4 leading-relaxed overflow-hidden">
                {sample.log}
              </div>
            </div>

            {/* Load Button */}
            <button
              onClick={() => onSelectSample(sample)}
              className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load Into Troubleshooter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
