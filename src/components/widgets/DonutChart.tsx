import React, { useState } from 'react';
import { DonutChartWidget } from '../../types/report';

interface DonutChartProps {
  widget: DonutChartWidget;
}

export const DonutChart: React.FC<DonutChartProps> = ({ widget }) => {
  const [hoverSlice, setHoverSlice] = useState<number | null>(null);

  const slices = widget.slices || [];
  const total = slices.reduce((acc, curr) => acc + curr.value, 0) || 1;

  const size = 200;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative stroke offsets
  let accumulatedPercent = 0;
  const sliceArcs = slices.map((s, idx) => {
    const pct = s.percentage ? s.percentage / 100 : s.value / total;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += pct;
    return {
      ...s,
      pctDisplay: Math.round(pct * 100),
      strokeDasharray,
      strokeDashoffset,
      idx,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="mb-3">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">{widget.title}</h3>
        {widget.description && <p className="text-xs text-slate-500 mt-0.5">{widget.description}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        {/* Donut SVG */}
        <div className="relative shrink-0 w-[180px] h-[180px]">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
            {/* Background track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {/* Slices */}
            {sliceArcs.map((s) => {
              const isHovered = hoverSlice === s.idx;
              return (
                <circle
                  key={s.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={s.color}
                  strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                  strokeDasharray={s.strokeDasharray}
                  strokeDashoffset={s.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoverSlice(s.idx)}
                  onMouseLeave={() => setHoverSlice(null)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
            {hoverSlice !== null ? (
              <>
                <span className="text-xs font-semibold text-slate-500 truncate max-w-[100px]">
                  {slices[hoverSlice]?.label}
                </span>
                <span className="text-lg font-extrabold text-slate-900 font-mono">
                  {sliceArcs[hoverSlice]?.pctDisplay}%
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-semibold text-slate-400">Total</span>
                <span className="text-sm font-extrabold text-slate-800 font-mono">
                  {widget.centerText || total.toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {sliceArcs.map((s) => {
            const isHovered = hoverSlice === s.idx;
            return (
              <div
                key={s.label}
                className={`flex items-center justify-between p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  isHovered ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                }`}
                onMouseEnter={() => setHoverSlice(s.idx)}
                onMouseLeave={() => setHoverSlice(null)}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="truncate">{s.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono">
                  <span className="text-slate-900 font-medium">{s.value.toLocaleString()}</span>
                  <span className="text-slate-400 text-[11px] w-8 text-right">({s.pctDisplay}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
