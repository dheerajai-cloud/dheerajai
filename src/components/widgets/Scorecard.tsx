import React from 'react';
import { ScorecardMetric } from '../../types/report';
import { ArrowUpRight, ArrowDownRight, Minus, Sparkles } from 'lucide-react';

interface ScorecardProps {
  metric: ScorecardMetric;
  theme?: string;
}

export const Scorecard: React.FC<ScorecardProps> = ({ metric, theme }) => {
  const isPositive = (metric.changePercent ?? 0) > 0;
  const isNegative = (metric.changePercent ?? 0) < 0;
  const isNeutral = metric.changePercent === 0 || metric.changePercent === undefined;

  // Render SVG Sparkline
  const renderSparkline = () => {
    if (!metric.sparkline || metric.sparkline.length < 2) return null;
    const values = metric.sparkline;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 110;
    const height = 36;
    const padding = 3;

    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const areaPath = `M ${points[0]} L ${points.join(' L ')} L ${width - padding},${height} L ${padding},${height} Z`;

    const strokeColor = isNegative ? '#ef4444' : '#10b981';
    const fillColor = isNegative ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)';

    return (
      <svg width={width} height={height} className="overflow-visible ml-auto">
        <defs>
          <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${metric.id})`} />
        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        {/* End dot */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r="3.5"
            fill={strokeColor}
            className="animate-pulse"
          />
        )}
      </svg>
    );
  };

  const getSourceBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'GA4':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'GSC':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Clarity':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Excel':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top row: Label & Source Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate" title={metric.label}>
          {metric.label}
        </span>
        {metric.sourceBadge && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide shrink-0 ${getSourceBadgeColor(metric.sourceBadge)}`}>
            {metric.sourceBadge}
          </span>
        )}
      </div>

      {/* Center row: Metric Value & Sparkline */}
      <div className="flex items-baseline justify-between gap-3 my-1">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
          {metric.prefix && <span className="text-slate-500 text-xl font-normal mr-0.5">{metric.prefix}</span>}
          {metric.value}
          {metric.suffix && <span className="text-slate-500 text-xl font-normal ml-0.5">{metric.suffix}</span>}
        </div>
        {renderSparkline()}
      </div>

      {/* Bottom row: Delta comparison badge & label */}
      <div className="mt-2 flex items-center gap-1.5 text-xs flex-wrap">
        {metric.changePercent !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded text-[11px] ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isNegative
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5" />}
            {isNeutral && <Minus className="w-3.5 h-3.5" />}
            {Math.abs(metric.changePercent)}%
          </span>
        )}
        <span className="text-slate-500 text-[11px] truncate">
          {metric.comparisonLabel || 'vs previous period'}
        </span>
      </div>

      {metric.description && (
        <div className="text-[11px] text-slate-400 mt-1 line-clamp-1 border-t border-slate-100 pt-1">
          {metric.description}
        </div>
      )}
    </div>
  );
};
