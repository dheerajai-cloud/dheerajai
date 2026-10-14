import React from 'react';
import { ClarityFrictionWidget as IClarityFrictionWidget } from '../../types/report';
import { MousePointerClick, Zap, RefreshCw, ScrollText, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface ClarityWidgetProps {
  widget: IClarityFrictionWidget;
}

export const ClarityFrictionWidget: React.FC<ClarityWidgetProps> = ({ widget }) => {
  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('rage')) return <AlertOctagon className="w-4 h-4 text-rose-500" />;
    if (l.includes('dead')) return <MousePointerClick className="w-4 h-4 text-amber-500" />;
    if (l.includes('quick')) return <RefreshCw className="w-4 h-4 text-blue-500" />;
    return <ScrollText className="w-4 h-4 text-emerald-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Healthy
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" /> Needs Attention
          </span>
        );
      case 'negative':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-3 h-3" /> Critical Friction
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-800 tracking-tight">{widget.title}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostic session telemetry from Microsoft Clarity recording heatmaps
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-orange-50 text-orange-900 border border-orange-200 px-2.5 py-1 rounded-lg">
          <Zap className="w-3.5 h-3.5 text-orange-500" />
          <span>
            Analyzed: <strong className="font-mono">{widget.totalSessions?.toLocaleString()}</strong> Sessions
          </span>
        </div>
      </div>

      {/* Grid of 4 clarity friction indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {widget.metrics.map((m) => (
          <div
            key={m.label}
            className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  {getIcon(m.label)}
                  <span>{m.label}</span>
                </div>
                {getStatusBadge(m.status)}
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 my-1">{m.rate}</div>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-white/70 p-2 rounded-lg border border-slate-200/50">
              {m.insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
