import React, { useState } from 'react';
import { BarChartWidget } from '../../types/report';

interface BarChartProps {
  widget: BarChartWidget;
}

export const BarChart: React.FC<BarChartProps> = ({ widget }) => {
  const [hoverCategory, setHoverCategory] = useState<number | null>(null);

  const isHorizontal = widget.orientation === 'horizontal';
  const categories = widget.categories || [];
  const series = widget.series || [];

  if (!categories.length || !series.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400">
        No bar chart data available.
      </div>
    );
  }

  // Find max value across all series values
  let maxVal = 0;
  series.forEach((s) => {
    s.values.forEach((v) => {
      if (v > maxVal) maxVal = v;
    });
  });
  maxVal = maxVal * 1.15 || 10;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">{widget.title}</h3>
          {widget.description && <p className="text-xs text-slate-500 mt-0.5">{widget.description}</p>}
        </div>
        {series.length > 1 && (
          <div className="flex items-center gap-3 text-xs">
            {series.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isHorizontal ? (
        /* Horizontal Bars */
        <div className="space-y-3 pt-1">
          {categories.map((cat, catIdx) => {
            const isHovered = hoverCategory === catIdx;
            return (
              <div
                key={cat}
                className={`group rounded-lg p-1.5 transition-colors ${isHovered ? 'bg-slate-50' : ''}`}
                onMouseEnter={() => setHoverCategory(catIdx)}
                onMouseLeave={() => setHoverCategory(null)}
              >
                <div className="flex items-center justify-between text-xs mb-1 font-medium">
                  <span className="text-slate-700 truncate max-w-[200px]" title={cat}>
                    {cat}
                  </span>
                  <div className="flex items-center gap-2">
                    {series.map((s) => (
                      <span key={s.name} className="font-mono font-semibold text-slate-900">
                        {formatNumber(s.values[catIdx] ?? 0)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bars */}
                <div className="space-y-1">
                  {series.map((s) => {
                    const val = s.values[catIdx] ?? 0;
                    const pct = Math.min(100, (val / maxVal) * 100);
                    return (
                      <div key={s.name} className="w-full bg-slate-100 rounded-full h-3 overflow-hidden relative">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: s.color || '#1a73e8',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vertical Bars */
        <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-200">
          {categories.map((cat, catIdx) => {
            const isHovered = hoverCategory === catIdx;
            return (
              <div
                key={cat}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoverCategory(catIdx)}
                onMouseLeave={() => setHoverCategory(null)}
              >
                {/* Floating tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-10 bg-slate-900 text-white text-[11px] font-mono px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                    {cat}: {series.map((s) => formatNumber(s.values[catIdx] ?? 0)).join(', ')}
                  </div>
                )}

                {/* Bars in category */}
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  {series.map((s) => {
                    const val = s.values[catIdx] ?? 0;
                    const heightPct = Math.min(100, (val / maxVal) * 100);
                    return (
                      <div
                        key={s.name}
                        className="w-full max-w-[28px] rounded-t-md transition-all duration-300 group-hover:brightness-110"
                        style={{
                          height: `${Math.max(6, heightPct)}%`,
                          backgroundColor: s.color || '#1a73e8',
                        }}
                      />
                    );
                  })}
                </div>
                {/* Label */}
                <span className="text-[11px] text-slate-500 truncate w-full text-center mt-2 group-hover:text-slate-900 group-hover:font-semibold">
                  {cat}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
