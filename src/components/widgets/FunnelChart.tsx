import React from 'react';
import { FunnelWidget } from '../../types/report';
import { ArrowDown, AlertCircle } from 'lucide-react';

interface FunnelChartProps {
  widget: FunnelWidget;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ widget }) => {
  const steps = widget.steps || [];
  if (!steps.length) return null;

  const maxCount = steps[0]?.count || 1;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">{widget.title}</h3>
        {widget.description && <p className="text-xs text-slate-500 mt-0.5">{widget.description}</p>}
      </div>

      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const widthPct = Math.max(15, (step.count / maxCount) * 100);
          const hasDropoff = idx > 0 && step.dropoffRate && step.dropoffRate !== '0%';

          return (
            <div key={step.stepName} className="group">
              {/* Drop-off indicator between steps */}
              {hasDropoff && (
                <div className="flex items-center gap-2 my-1 pl-4 text-[11px] text-rose-500 font-medium">
                  <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  <span>
                    Drop-off: <strong className="font-mono">{step.dropoffRate}</strong> from previous stage
                  </span>
                </div>
              )}

              {/* Funnel Bar Row */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    {step.stepName}
                  </span>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-slate-900 text-sm">{step.count.toLocaleString()}</span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-1.5 py-0.5 rounded text-[11px]">
                      {step.rate}
                    </span>
                  </div>
                </div>

                {/* Progress bar representing funnel volume */}
                <div className="w-full bg-slate-200/70 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: step.color || '#1a73e8',
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
