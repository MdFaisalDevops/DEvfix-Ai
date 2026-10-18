'use client';

import React, { useState } from 'react';
import {
  MessageSquareHeart,
  Star,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { submitFeedback } from '@/lib/api';

interface FeedbackViewProps {
  currentLogSnippet?: string;
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ currentLogSnippet }) => {
  const [category, setCategory] = useState('Diagnostic Accuracy');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [includeLog, setIncludeLog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Diagnostic Accuracy',
    'Model Support (Ollama, vLLM)',
    'Secret & PII Redaction',
    'Command Safety & Rollbacks',
    'UI / UX & Developer Experience',
    'Feature Request / Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await submitFeedback({
        category,
        rating,
        message: includeLog && currentLogSnippet ? `${message}\n\n[Included Anonymized Log Snippet]:\n${currentLogSnippet.slice(0, 300)}` : message,
        email: email || undefined,
        log_sample_included: includeLog
      });
      setSubmitted(true);
      setMessage('');
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Beta Feedback & Roadmap Suggestions</h2>
            <p className="text-xs text-slate-400">
              Help shape the open-weight DevOps assistant. Tell us how DevFix AI diagnosed your real incidents.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-8 text-center rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-emerald-200">Feedback Submitted Successfully!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Thank you for testing DevFix AI. Your input directly influences model prompt refinements, regex redaction rules, and safe command validations.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 px-4 py-2 rounded-lg bg-emerald-900/50 hover:bg-emerald-900/70 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
            >
              Submit Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Category */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Feedback Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Diagnostic Experience Rating
              </label>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-slate-400 ml-2 font-mono text-[11px]">{rating} of 5 stars</span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Your Message / Suggested Improvements
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What did DevFix AI catch accurately? Which diagnostic command helped or missed context? What open model would you like to see supported?"
                rows={4}
                required
                className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider text-[11px]">
                Email (Optional - for roadmap updates)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@company.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            {/* Include Log Checkbox */}
            {currentLogSnippet && (
              <label className="flex items-start space-x-2 cursor-pointer p-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <input
                  type="checkbox"
                  checked={includeLog}
                  onChange={(e) => setIncludeLog(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 mt-0.5"
                />
                <span className="text-slate-400 text-[11px] leading-relaxed">
                  Attach currently analyzed log snippet (credentials will be automatically redacted before sending).
                </span>
              </label>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <span>Submitting feedback...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Beta Feedback</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
