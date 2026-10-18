'use client';

import React from 'react';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  Building,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

export const PricingView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Transparent Developer Pricing</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Open-Weight First. Zero Cloud Bill Surprises.
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          DevFix AI runs on your infrastructure using open-weight models. We never charge per-token fees or gate your logs behind proprietary cloud subscriptions.
        </p>

        {/* Honest Disclaimer Banner (Requirement: clearly labeled proposed plans, no fake payments) */}
        <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 inline-flex items-center space-x-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Note on MVP Status:</strong> The current MVP is completely free and open-source. Paid team tiers are proposed designs for future enterprise features. No payment processing is enabled.
          </span>
        </div>
      </div>

      {/* Pricing Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Community Open-Source */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-cyan-500/40 relative shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Active Tier
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                100% Free
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-100">Self-Hosted Community</h3>
              <p className="text-xs text-slate-400 mt-1">
                For solo engineers, homelabs, and indie developers diagnosing infrastructure locally.
              </p>
            </div>

            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-white font-mono">$0</span>
              <span className="text-xs text-slate-400 font-mono">/ forever</span>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited local log diagnoses</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Local Ollama integration (Llama 3, Qwen, Mistral)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Client-side secret & PII redaction</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Local browser audit history (JSON export)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Offline deterministic demo engine</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs text-center font-medium">
            Currently Included in MVP
          </div>
        </div>

        {/* Tier 2: Team Pro (Proposed) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 relative shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 font-mono">
                Proposed Plan
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                Future Beta
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-100">Team Pro</h3>
              <p className="text-xs text-slate-400 mt-1">
                For fast-paced engineering teams needing centralized playbooks and shared post-mortems.
              </p>
            </div>

            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-white font-mono">$19</span>
              <span className="text-xs text-slate-400 font-mono">/ seat / mo (proposed)</span>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Everything in Community Free</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Shared team remediation playbooks</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Automated Post-Mortem Markdown generation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Slack & Discord webhook error alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Centralized self-hosted vLLM / Ollama routing</span>
              </div>
            </div>
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
          >
            Proposed (Roadmap)
          </button>
        </div>

        {/* Tier 3: Enterprise Air-Gapped (Proposed) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 relative shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Enterprise
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                On-Premise
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-100">Air-Gapped Enterprise</h3>
              <p className="text-xs text-slate-400 mt-1">
                For regulated defense, financial, and healthcare systems with strict zero-egress mandates.
              </p>
            </div>

            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-extrabold text-white font-mono">Custom</span>
              <span className="text-xs text-slate-400 font-mono">/ annual contract</span>
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0" />
                <span>100% Offline Air-Gapped appliance image</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Fine-tuned models on company internal infra</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0" />
                <span>SAML 2.0 / Okta / Azure AD SSO</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Immutable audit logs & SIEM export</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Dedicated SLA & 24/7 DevOps support</span>
              </div>
            </div>
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
          >
            Contact for Custom Deployments
          </button>
        </div>
      </div>
    </div>
  );
};
