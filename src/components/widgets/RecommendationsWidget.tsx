import React from 'react';
import { RecommendationsWidget as IRecommendationsWidget } from '../../types/report';
import { CheckCircle2, AlertCircle, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface RecProps {
  widget: IRecommendationsWidget;
}

export const RecommendationsWidget: React.FC<RecProps> = ({ widget }) => {
  const items = widget.items || [];

  const getPriorityBadge = (p: string) => {
    switch (p.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3 h-3" /> High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Medium Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" /> Quick Win
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">{widget.title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Data-backed strategic initiatives and implementation roadmap
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {getPriorityBadge(item.priority)}
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono">
                  Impact: {item.impact}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                  Effort: {item.effort}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
