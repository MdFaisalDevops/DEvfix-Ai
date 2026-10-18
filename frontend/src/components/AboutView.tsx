'use client';

import React from 'react';
import {
  ShieldCheck,
  DollarSign,
  WifiOff,
  Sliders,
  CheckCircle2,
  XCircle,
  Cpu,
  Layers,
  Lock,
  Server
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-slate-800/80 backdrop-blur-md shadow-2xl space-y-4">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>The Open-Weight Advantage</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Why Open-Weight AI is the Right Choice for DevOps Troubleshooting
        </h2>

        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Infrastructure logs contain your organization's most sensitive operational footprints: internal private IP subnets, database connection strings, architecture topologies, and stack trace payloads. 
          Sending these to proprietary cloud AI APIs exposes your business to data exfiltration, regulatory penalties, and unpredictable monthly token billing.
        </p>
      </div>

      {/* 4 Pillars of Open-Weight AI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pillar 1 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Zero Data Exfiltration</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            With Ollama running locally or inside your private VPC, log packets never travel outside your firewall. Comply effortlessly with SOC 2, HIPAA, PCI-DSS, and GDPR without needing enterprise business associate agreements (BAAs).
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Zero Per-Token Bills</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Infrastructure logs are notoriously verbose. Analyzing a single 15,000-line crash dump through proprietary APIs can cost multiple dollars per query. Open-weight inference runs on commodity developer hardware at $0 marginal cost.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <WifiOff className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Offline & Air-Gapped Resilience</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When a major network route or DNS provider fails, your troubleshooting tools cannot rely on external SaaS connectivity. DevFix AI and Ollama diagnose critical outages completely offline during total internet blackouts.
          </p>
        </div>

        {/* Pillar 4 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Model Reproducibility</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Proprietary models silently update and introduce regressions into DevOps triage. With open weights (like Qwen 2.5 Coder or Llama 3.2), you pin exact model hashes and retain full control over reasoning behaviors.
          </p>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Architectural Comparison: Open-Weight vs Proprietary APIs</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Evaluation Metric</th>
                <th className="p-3 text-cyan-300">DevFix AI (Ollama Open-Weight)</th>
                <th className="p-3 text-slate-400">Proprietary Cloud APIs (OpenAI / Claude)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="p-3 font-semibold text-slate-200">Log Data Egress</td>
                <td className="p-3 text-emerald-400 font-medium flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>100% On-Device / Private VPC</span>
                </td>
                <td className="p-3 text-rose-400 font-medium">
                  Transmitted to external cloud data centers
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-200">Token Cost</td>
                <td className="p-3 text-emerald-400 font-medium">
                  $0.00 / query (Fixed local compute)
                </td>
                <td className="p-3 text-rose-400 font-medium">
                  $0.01 – $0.15 per verbose crash log
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-200">Air-Gapped Operation</td>
                <td className="p-3 text-emerald-400 font-medium flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Full offline capability</span>
                </td>
                <td className="p-3 text-rose-400 font-medium">
                  Impossible (Requires public WAN egress)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-200">Execution Safety</td>
                <td className="p-3 text-emerald-400 font-medium">
                  Human-in-the-loop validation enforced
                </td>
                <td className="p-3 text-slate-400">
                  Varies by custom wrapper
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-200">Model Autonomy</td>
                <td className="p-3 text-emerald-400 font-medium">
                  Swap between Llama, Qwen, Mistral freely
                </td>
                <td className="p-3 text-slate-400">
                  Locked to vendor proprietary API terms
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
