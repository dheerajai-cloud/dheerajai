import React from 'react';
import { Widget } from '../../types/report';
import { TimeSeriesChart } from './TimeSeriesChart';
import { BarChart } from './BarChart';
import { DonutChart } from './DonutChart';
import { FunnelChart } from './FunnelChart';
import { ClarityFrictionWidget } from './ClarityFrictionWidget';
import { DataTableWidget } from './DataTableWidget';
import { CaseStudyBlock } from './CaseStudyBlock';
import { RecommendationsWidget } from './RecommendationsWidget';

interface WidgetRendererProps {
  widget: Widget;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  switch (widget.type) {
    case 'timeSeries':
      return <TimeSeriesChart widget={widget} />;
    case 'barChart':
      return <BarChart widget={widget} />;
    case 'donutChart':
      return <DonutChart widget={widget} />;
    case 'funnel':
      return <FunnelChart widget={widget} />;
    case 'clarityFriction':
      return <ClarityFrictionWidget widget={widget} />;
    case 'dataTable':
      return <DataTableWidget widget={widget} />;
    case 'caseStudyBlock':
      return <CaseStudyBlock widget={widget} />;
    case 'recommendations':
      return <RecommendationsWidget widget={widget} />;
    default:
      return (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          Unsupported widget type: {(widget as any)?.type}
        </div>
      );
  }
};
