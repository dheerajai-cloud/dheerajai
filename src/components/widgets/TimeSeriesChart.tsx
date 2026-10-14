import React, { useState } from 'react';
import { TimeSeriesWidget } from '../../types/report';

interface TimeSeriesChartProps {
  widget: TimeSeriesWidget;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ widget }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  const activeSeries = widget.series.filter((s) => !hiddenSeries[s.name]);
  if (!activeSeries.length || !activeSeries[0]?.data?.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400">
        No time-series data available.
      </div>
    );
  }

  const firstSeries = activeSeries[0].data;
  const dates = firstSeries.map((d) => d.date);

  // Compute overall min/max
  let allValues: number[] = [];
  activeSeries.forEach((s) => {
    s.data.forEach((d) => allValues.push(d.value));
  });

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const minVal = Math.min(0, rawMin);
  const maxVal = rawMax * 1.15 || 10;
  const valueRange = maxVal - minVal;

  const width = 640;
  const height = 260;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const getX = (index: number) => {
    if (dates.length <= 1) return padLeft + chartW / 2;
    return padLeft + (index / (dates.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padTop + chartH - ((val - minVal) / valueRange) * chartH;
  };

  // Generate Y-axis grid ticks (4 intervals)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const val = minVal + ratio * valueRange;
    const y = padTop + chartH - ratio * chartH;
    return { val, y };
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const toggleSeries = (name: string) => {
    setHiddenSeries((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">{widget.title}</h3>
          {widget.description && <p className="text-xs text-slate-500 mt-0.5">{widget.description}</p>}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap text-xs">
          {widget.series.map((s) => {
            const isHidden = hiddenSeries[s.name];
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => toggleSeries(s.name)}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md transition-all cursor-pointer font-medium ${
                  isHidden ? 'opacity-40 line-through bg-slate-100 text-slate-500' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                title="Click to show/hide series"
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none font-sans"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {activeSeries.map((s) => (
              <linearGradient key={`grad-${s.name}`} id={`area-grad-${s.name}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0.0" />
              </linearGradient>
            ))}
          </defs>

          {/* Grid lines and Y axis labels */}
          {ticks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={t.y}
                x2={width - padRight}
                y2={t.y}
                stroke="#e2e8f0"
                strokeDasharray={idx === 0 ? 'none' : '3,3'}
                strokeWidth="1"
              />
              <text x={padLeft - 8} y={t.y + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-mono">
                {formatNumber(Math.round(t.val))}
              </text>
            </g>
          ))}

          {/* X axis labels */}
          {dates.map((date, idx) => {
            // Show every 2nd or 3rd label if many
            const step = Math.max(1, Math.floor(dates.length / 7));
            if (idx % step !== 0 && idx !== dates.length - 1) return null;
            const x = getX(idx);
            return (
              <text key={idx} x={x} y={height - 12} textAnchor="middle" className="fill-slate-400 text-[10px]">
                {date}
              </text>
            );
          })}

          {/* Area Fills and Lines */}
          {activeSeries.map((s) => {
            const points = s.data.map((d, i) => `${getX(i).toFixed(1)},${getY(d.value).toFixed(1)}`);
            const linePath = `M ${points.join(' L ')}`;
            const firstPt = points[0];
            const lastPt = points[points.length - 1];
            const areaPath = `M ${firstPt} L ${points.join(' L ')} L ${getX(s.data.length - 1)},${padTop + chartH} L ${padLeft},${padTop + chartH} Z`;

            return (
              <g key={s.name}>
                <path d={areaPath} fill={`url(#area-grad-${s.name})`} />
                <path d={linePath} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {/* Data point dots */}
                {s.data.map((d, i) => {
                  const x = getX(i);
                  const y = getY(d.value);
                  const isHovered = hoverIndex === i;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={isHovered ? 5.5 : 3}
                      fill={isHovered ? '#ffffff' : s.color}
                      stroke={s.color}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      className="transition-all"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Interactive hover crosshair and listener columns */}
          {dates.map((_, i) => {
            const colWidth = chartW / dates.length;
            const x = getX(i);
            return (
              <rect
                key={i}
                x={x - colWidth / 2}
                y={padTop}
                width={colWidth}
                height={chartH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* Active crosshair vertical line */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={padTop}
              x2={getX(hoverIndex)}
              y2={padTop + chartH}
              stroke="#64748b"
              strokeDasharray="4,4"
              strokeWidth="1.2"
            />
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverIndex !== null && (
          <div
            className="absolute top-4 pointer-events-none bg-slate-900/95 text-white backdrop-blur shadow-xl rounded-lg p-2.5 text-xs z-20 border border-slate-700 min-w-[140px]"
            style={{
              left: `${Math.min(75, Math.max(15, (getX(hoverIndex) / width) * 100))}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-300 border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between">
              <span>{dates[hoverIndex]}</span>
              <span className="text-[10px] text-slate-400">Day {hoverIndex + 1}</span>
            </div>
            {activeSeries.map((s) => {
              const pt = s.data[hoverIndex];
              return (
                <div key={s.name} className="flex items-center justify-between gap-3 py-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 truncate max-w-[100px]">{s.name}:</span>
                  </div>
                  <span className="font-mono font-bold text-white">{pt ? pt.value.toLocaleString() : '-'}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
