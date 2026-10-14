export type ThemeId = 'looker-classic' | 'dark-slate' | 'emerald-growth' | 'royal-indigo' | 'sunset-amber';

export type ReportType = 'dashboard' | 'case-study' | 'audit' | 'executive';

export interface ScorecardMetric {
  id: string;
  label: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  changePercent?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  comparisonLabel?: string;
  sparkline?: number[];
  sourceBadge?: 'GA4' | 'GSC' | 'Clarity' | 'Excel' | 'Drive' | 'Custom';
  description?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface TimeSeriesSeries {
  name: string;
  color: string;
  data: TimeSeriesPoint[];
}

export interface TimeSeriesWidget {
  type: 'timeSeries';
  id: string;
  title: string;
  description?: string;
  yAxisLabel?: string;
  chartStyle?: 'line' | 'area';
  series: TimeSeriesSeries[];
}

export interface BarChartSeries {
  name: string;
  color: string;
  values: number[];
}

export interface BarChartWidget {
  type: 'barChart';
  id: string;
  title: string;
  description?: string;
  orientation?: 'vertical' | 'horizontal';
  stacked?: boolean;
  categories: string[];
  series: BarChartSeries[];
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

export interface DonutChartWidget {
  type: 'donutChart';
  id: string;
  title: string;
  description?: string;
  centerText?: string;
  slices: DonutSlice[];
}

export interface FunnelStep {
  stepName: string;
  count: number;
  rate: string;
  dropoffRate: string;
  color?: string;
}

export interface FunnelWidget {
  type: 'funnel';
  id: string;
  title: string;
  description?: string;
  steps: FunnelStep[];
}

export interface ClarityMetric {
  label: string;
  rate: string;
  status: 'positive' | 'warning' | 'negative' | 'neutral';
  insight: string;
}

export interface ClarityFrictionWidget {
  type: 'clarityFriction';
  id: string;
  title: string;
  totalSessions: number;
  metrics: ClarityMetric[];
  deviceBreakdown?: { device: string; share: string; rageClicks: string }[];
}

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  format?: 'number' | 'currency' | 'percent' | 'text';
}

export interface DataTableWidget {
  type: 'dataTable';
  id: string;
  title: string;
  description?: string;
  columns: TableColumn[];
  rows: Record<string, any>[];
}

export interface BeforeAfterMetric {
  metric: string;
  before: string;
  after: string;
  lift: string;
}

export interface CaseStudyBlockWidget {
  type: 'caseStudyBlock';
  id: string;
  title: string;
  clientName?: string;
  challenge: string;
  solution: string;
  clientQuote?: {
    quote: string;
    author: string;
    role: string;
  };
  beforeAfter: BeforeAfterMetric[];
  highlightMetric?: {
    value: string;
    label: string;
  };
}

export interface RecommendationItem {
  priority: 'high' | 'medium' | 'low';
  title: string;
  impact: string;
  effort: string;
  description: string;
}

export interface RecommendationsWidget {
  type: 'recommendations';
  id: string;
  title: string;
  items: RecommendationItem[];
}

export type Widget =
  | TimeSeriesWidget
  | BarChartWidget
  | DonutChartWidget
  | FunnelWidget
  | ClarityFrictionWidget
  | DataTableWidget
  | CaseStudyBlockWidget
  | RecommendationsWidget;

export interface ReportSection {
  id: string;
  title: string;
  description?: string;
  widgets: Widget[];
}

export interface ReportPage {
  pageId: string;
  pageTitle: string;
  sections: ReportSection[];
}

export interface HighlightChip {
  label: string;
  value: string;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'rose';
}

export interface ExecutiveSummary {
  headline: string;
  paragraphs: string[];
  highlightChips?: HighlightChip[];
  status?: 'positive' | 'warning' | 'neutral';
}

export interface ReportDocument {
  id: string;
  title: string;
  subtitle: string;
  reportType: ReportType;
  theme: ThemeId;
  dateRange: {
    start: string;
    end: string;
    label: string;
  };
  clientInfo: {
    name: string;
    logoUrl?: string;
    industry?: string;
  };
  executiveSummary: ExecutiveSummary;
  scorecards: ScorecardMetric[];
  pages: ReportPage[];
  connectedSources?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DataSourceDefinition {
  id: string;
  name: string;
  iconName: string;
  badge: 'GA4' | 'GSC' | 'Clarity' | 'Excel' | 'Drive' | 'Custom';
  description: string;
  status: 'connected' | 'ready' | 'demo';
  metricsSample: string[];
}
