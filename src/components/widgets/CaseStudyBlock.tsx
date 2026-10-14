import React from 'react';
import { CaseStudyBlockWidget } from '../../types/report';
import { Target, Lightbulb, Trophy, Quote, ArrowRight, TrendingUp } from 'lucide-react';

interface CaseStudyProps {
  widget: CaseStudyBlockWidget;
}

export const CaseStudyBlock: React.FC<CaseStudyProps> = ({ widget }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-xl p-6 sm:p-8 border border-indigo-800/40 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-indigo-800/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-400/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Client Success Case Study
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{widget.title}</h2>
          {widget.clientName && (
            <p className="text-indigo-200/80 text-xs sm:text-sm mt-1">Client: {widget.clientName}</p>
          )}
        </div>

        {/* Highlight Hero Callout */}
        {widget.highlightMetric && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center shrink-0 min-w-[160px]">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight flex items-center justify-center gap-1">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              {widget.highlightMetric.value}
            </div>
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide mt-1">
              {widget.highlightMetric.label}
            </div>
          </div>
        )}
      </div>

      {/* Challenge & Solution Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* The Challenge */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Target className="w-4 h-4 text-rose-400" />
            The Challenge
          </div>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{widget.challenge}</p>
        </div>

        {/* The Solution */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            The Strategic Solution
          </div>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{widget.solution}</p>
        </div>
      </div>

      {/* Before vs After Impact Table */}
      {widget.beforeAfter && widget.beforeAfter.length > 0 && (
        <div className="relative z-10 my-6 bg-black/30 border border-white/10 rounded-xl p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Before vs. After Optimization Results
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {widget.beforeAfter.map((ba, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <span className="text-xs text-indigo-200 font-medium block truncate mb-1">{ba.metric}</span>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Pre: <strong className="text-slate-300 font-mono">{ba.before}</strong></span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span>Post: <strong className="text-white font-mono">{ba.after}</strong></span>
                </div>
                <div className="mt-2 text-right">
                  <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono px-2 py-0.5 rounded">
                    {ba.lift}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Quote / Testimonial */}
      {widget.clientQuote && (
        <div className="relative z-10 bg-indigo-950/80 border border-indigo-700/50 rounded-xl p-5 flex items-start gap-3.5">
          <Quote className="w-7 h-7 text-indigo-400 shrink-0 opacity-80" />
          <div>
            <p className="text-sm italic text-indigo-100 leading-relaxed font-serif">
              "{widget.clientQuote.quote}"
            </p>
            <div className="mt-2 text-xs font-semibold text-indigo-300">
              — {widget.clientQuote.author},{' '}
              <span className="text-indigo-400 font-normal">{widget.clientQuote.role}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
