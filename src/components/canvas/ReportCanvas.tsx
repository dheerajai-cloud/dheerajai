import React, { useState } from 'react';
import { ReportDocument, ThemeId } from '../../types/report';
import { Scorecard } from '../widgets/Scorecard';
import { WidgetRenderer } from '../widgets/WidgetRenderer';
import {
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Download,
  Plus,
  Trash2,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';

interface ReportCanvasProps {
  report: ReportDocument;
  onUpdateReport: (updated: ReportDocument) => void;
  activePageId: string;
  setActivePageId: (pageId: string) => void;
  isEditMode: boolean;
  isPresentMode: boolean;
  setIsPresentMode: (val: boolean) => void;
}

export const ReportCanvas: React.FC<ReportCanvasProps> = ({
  report,
  onUpdateReport,
  activePageId,
  setActivePageId,
  isEditMode,
  isPresentMode,
  setIsPresentMode,
}) => {
  const [activePageIndex, setActivePageIndex] = useState(0);

  const pages = report.pages || [];
  const currentPage = pages[activePageIndex] || pages[0];

  // Theme container classes
  const getThemeClasses = (theme: ThemeId) => {
    switch (theme) {
      case 'dark-slate':
        return 'bg-slate-950 text-slate-100 dark-theme';
      case 'emerald-growth':
        return 'bg-emerald-950/20 text-slate-900 emerald-theme';
      case 'royal-indigo':
        return 'bg-indigo-950/20 text-slate-900 indigo-theme';
      case 'sunset-amber':
        return 'bg-amber-950/15 text-slate-900 amber-theme';
      default:
        return 'bg-slate-100/70 text-slate-900 looker-classic';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Target Exceeded
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Action Required
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> On Track
          </span>
        );
    }
  };

  const getChipColor = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Editable title helper
  const handleTitleChange = (newTitle: string) => {
    onUpdateReport({ ...report, title: newTitle });
  };

  const handleSubtitleChange = (newSub: string) => {
    onUpdateReport({ ...report, subtitle: newSub });
  };

  return (
    <div
      className={`w-full rounded-2xl shadow-xl border border-slate-200 transition-colors duration-300 print:shadow-none print:border-none print:bg-white print:p-0 ${getThemeClasses(
        report.theme
      )} ${isPresentMode ? 'fixed inset-0 z-50 overflow-y-auto p-6 bg-slate-900 rounded-none' : 'p-4 sm:p-7'}`}
    >
      {/* Presentation exit button */}
      {isPresentMode && (
        <button
          onClick={() => setIsPresentMode(false)}
          className="fixed top-4 right-4 z-50 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur cursor-pointer"
        >
          <Minimize2 className="w-4 h-4" /> Exit Present Mode
        </button>
      )}

      {/* Report Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wide">
                {report.reportType}
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.clientInfo?.name || 'Client Report'}</span>
                {report.clientInfo?.industry && (
                  <span className="text-slate-400">({report.clientInfo.industry})</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium ml-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{report.dateRange?.label || 'Last 30 Days'}</span>
              </div>
            </div>

            {isEditMode ? (
              <input
                type="text"
                value={report.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:bg-white focus:outline-none"
              />
            ) : (
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {report.title}
              </h1>
            )}

            {isEditMode ? (
              <input
                type="text"
                value={report.subtitle}
                onChange={(e) => handleSubtitleChange(e.target.value)}
                className="text-xs sm:text-sm text-slate-500 w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:bg-white focus:outline-none"
              />
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 font-medium">{report.subtitle}</p>
            )}
          </div>

          {/* Right badges & Connected Source Pills */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            {getStatusBadge(report.executiveSummary?.status)}
            {report.connectedSources && report.connectedSources.length > 0 && (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span className="font-semibold text-slate-400">Sources:</span>
                {report.connectedSources.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-medium text-slate-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary Section */}
        {report.executiveSummary && (
          <div className="mt-5 pt-5 border-t border-slate-100 bg-slate-50/70 -mx-6 -mb-6 p-6 rounded-b-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Executive Takeaways & Strategic Summary
              </h3>
            </div>
            <p className="text-sm font-semibold text-slate-900 mb-2">
              {report.executiveSummary.headline}
            </p>
            <div className="space-y-1.5 mb-4">
              {report.executiveSummary.paragraphs.map((p, idx) => (
                <p key={idx} className="text-xs text-slate-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            {/* Metric Chips */}
            {report.executiveSummary.highlightChips && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {report.executiveSummary.highlightChips.map((chip, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold ${getChipColor(
                      chip.color
                    )}`}
                  >
                    <span className="font-normal opacity-75">{chip.label}:</span>
                    <span className="font-mono">{chip.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* KPI Scorecards Grid */}
      {report.scorecards && report.scorecards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {report.scorecards.map((metric) => (
            <Scorecard key={metric.id} metric={metric} theme={report.theme} />
          ))}
        </div>
      )}

      {/* Looker Studio Multi-Page Tabs Header */}
      {pages.length > 1 && (
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200/90 pb-2 overflow-x-auto print:hidden">
          <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">
            Report Pages:
          </span>
          {pages.map((p, idx) => (
            <button
              key={p.pageId}
              onClick={() => setActivePageIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activePageIndex === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>
                Page {idx + 1}: {p.pageTitle}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Current Page Sections & Widgets */}
      {currentPage ? (
        <div className="space-y-6">
          {currentPage.sections.map((section) => (
            <div key={section.id} className="space-y-4">
              {section.title && (
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                  <div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Responsive Grid for Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {section.widgets.map((widget) => {
                  const isFullWidth =
                    widget.type === 'caseStudyBlock' ||
                    widget.type === 'dataTable' ||
                    widget.type === 'clarityFriction' ||
                    widget.type === 'recommendations';
                  return (
                    <div
                      key={widget.id}
                      className={isFullWidth ? 'col-span-1 lg:col-span-2' : 'col-span-1'}
                    >
                      <WidgetRenderer widget={widget} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
          No sections available on this page.
        </div>
      )}

      {/* Looker Studio Report Footer watermark */}
      <div className="mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-400 print:mt-12">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Built with PromptStudio • Google Looker Studio Engine</span>
        </div>
        <span>Client Presentation Ready • Confirmed Grounded Data</span>
      </div>
    </div>
  );
};
