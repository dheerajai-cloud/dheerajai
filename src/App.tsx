/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ReportDocument, ThemeId, Widget } from './types/report';
import {
  SAMPLE_GA4_REPORT,
  SAMPLE_CASE_STUDY_REPORT,
  SAMPLE_CLARITY_GSC_REPORT,
} from './data/sampleReports';
import { TopBar } from './components/navigation/TopBar';
import { PromptBar } from './components/prompt/PromptBar';
import { ReportCanvas } from './components/canvas/ReportCanvas';
import { DataSourceModal } from './components/connectors/DataSourceModal';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  BarChart2,
  LineChart,
  PieChart,
  Table,
  Trophy,
  ListOrdered,
  X,
} from 'lucide-react';

export default function App() {
  const [report, setReport] = useState<ReportDocument>(SAMPLE_GA4_REPORT);
  const [activePageId, setActivePageId] = useState<string>('p1');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isPresentMode, setIsPresentMode] = useState<boolean>(false);
  const [isConnectorModalOpen, setIsConnectorModalOpen] = useState<boolean>(false);
  const [connectedSources, setConnectedSources] = useState<string[]>(['GA4', 'Excel']);
  const [attachedData, setAttachedData] = useState<{
    source: string;
    textData?: string;
    extractedReport?: any;
    imageData?: { data: string; mimeType: string };
    fileName?: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState<boolean>(false);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Change report theme
  const handleChangeTheme = (theme: ThemeId) => {
    setReport((prev) => ({ ...prev, theme }));
    showToast(`Switched theme to ${theme}`, 'info');
  };

  // Select predefined report template
  const handleSelectTemplate = (templateKey: string) => {
    if (templateKey === 'ga4') {
      setReport(SAMPLE_GA4_REPORT);
      setConnectedSources(['GA4', 'Excel']);
      showToast('Loaded GA4 E-commerce & Conversion Report');
    } else if (templateKey === 'case-study') {
      setReport(SAMPLE_CASE_STUDY_REPORT);
      setConnectedSources(['GSC', 'Clarity', 'Excel', 'GA4']);
      showToast('Loaded Client Growth Case Study');
    } else if (templateKey === 'audit') {
      setReport(SAMPLE_CLARITY_GSC_REPORT);
      setConnectedSources(['GSC', 'Clarity']);
      showToast('Loaded GSC & Microsoft Clarity Audit');
    }
  };

  // Handle Data loaded from Connector (file upload, screenshot OCR, or live connection)
  const handleDataLoaded = (data: {
    source: string;
    textData?: string;
    extractedReport?: any;
    imageData?: { data: string; mimeType: string };
    fileName?: string;
  }) => {
    setAttachedData(data);

    // If Vision OCR produced a complete report directly, set it immediately!
    if (data.extractedReport && data.extractedReport.title) {
      setReport(data.extractedReport);
      showToast(`Screenshot processed: Generated "${data.extractedReport.title}"`);
      return;
    }

    showToast(`Linked data source: ${data.source}. You can now prompt AI to generate or adjust reports!`);
  };

  // Prompt / Voice command handler
  const handleExecutePrompt = async (promptText: string, isVoice: boolean) => {
    setIsLoading(true);

    try {
      // Determine whether user wants a full new report or a refinement of existing report
      const lower = promptText.toLowerCase();
      const isNewReportIntent =
        lower.includes('create a new') ||
        lower.includes('generate a report') ||
        lower.includes('create report') ||
        lower.includes('new case study') ||
        lower.includes('build a report');

      if (isNewReportIntent) {
        // Call /api/generate-report
        const reportType = lower.includes('case study') ? 'case-study' : 'dashboard';
        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            reportType,
            theme: report.theme,
            dataSources: connectedSources,
            rawTextData: attachedData?.textData || '',
            images: attachedData?.imageData ? [attachedData.imageData] : [],
            clientName: report.clientInfo?.name || 'Client',
          }),
        });

        const resData = await response.json();
        if (resData.success && resData.report) {
          setReport(resData.report);
          showToast(`Report generated: "${resData.report.title}"`);
        } else {
          throw new Error(resData.error || 'Failed to generate report');
        }
      } else {
        // Call /api/refine-report
        const response = await fetch('/api/refine-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentReport: report,
            prompt: promptText,
            voiceCommand: isVoice,
          }),
        });

        const resData = await response.json();
        if (resData.success && resData.updatedReport) {
          setReport(resData.updatedReport);
          showToast(resData.changeSummary || 'Report updated with your instructions!');
        } else {
          throw new Error(resData.error || 'Failed to refine report');
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error executing prompt', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Export PDF: opens browser print dialog which formats as crisp PDF
  const handleExportPdf = () => {
    window.print();
  };

  // Export JSON: downloads report configuration file
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-looker-report.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded Looker Studio JSON report configuration');
  };

  // Add new widget manually in Edit Mode
  const handleAddWidget = (widgetType: string) => {
    const pages = [...(report.pages || [])];
    if (!pages[0]) return;
    const sections = [...pages[0].sections];
    if (!sections[0]) return;

    let newWidget: Widget;

    switch (widgetType) {
      case 'scorecard':
        const updatedScorecards = [
          ...(report.scorecards || []),
          {
            id: `sc-new-${Date.now()}`,
            label: 'New Metric',
            value: '4,850',
            changePercent: 12.5,
            changeType: 'positive' as const,
            comparisonLabel: 'vs prior month',
            sparkline: [10, 12, 14, 18, 22, 25],
            sourceBadge: 'GA4' as const,
          },
        ];
        setReport({ ...report, scorecards: updatedScorecards });
        setIsAddWidgetModalOpen(false);
        showToast('Added new KPI scorecard');
        return;

      case 'timeSeries':
        newWidget = {
          type: 'timeSeries',
          id: `w-ts-${Date.now()}`,
          title: 'Daily Trend Over Time',
          chartStyle: 'line',
          series: [
            {
              name: 'Metric A',
              color: '#1a73e8',
              data: [
                { date: 'Day 1', value: 120 },
                { date: 'Day 5', value: 180 },
                { date: 'Day 10', value: 240 },
                { date: 'Day 15', value: 310 },
                { date: 'Day 20', value: 390 },
              ],
            },
          ],
        };
        break;

      case 'barChart':
        newWidget = {
          type: 'barChart',
          id: `w-bar-${Date.now()}`,
          title: 'Category Comparison',
          orientation: 'horizontal',
          categories: ['Desktop', 'Mobile', 'Tablet'],
          series: [
            {
              name: 'Visitors',
              color: '#1a73e8',
              values: [48000, 72000, 11000],
            },
          ],
        };
        break;

      case 'donutChart':
        newWidget = {
          type: 'donutChart',
          id: `w-donut-${Date.now()}`,
          title: 'Segment Distribution',
          slices: [
            { label: 'Direct', value: 45, color: '#1a73e8', percentage: 45 },
            { label: 'Organic', value: 35, color: '#34a853', percentage: 35 },
            { label: 'Paid', value: 20, color: '#fbbc04', percentage: 20 },
          ],
        };
        break;

      case 'caseStudy':
        newWidget = {
          type: 'caseStudyBlock',
          id: `w-cs-${Date.now()}`,
          title: 'Quarterly Growth Sprint Case Study',
          challenge: 'Customer acquisition cost was rising while conversion stalled.',
          solution: 'Redesigned user onboarding, resolved Clarity dead clicks, and launched target GSC clusters.',
          beforeAfter: [
            { metric: 'Conversion Rate', before: '2.1%', after: '4.8%', lift: '+128%' },
            { metric: 'Revenue Velocity', before: '$42K/mo', after: '$118K/mo', lift: '+180%' },
          ],
          clientQuote: {
            quote: 'This reporting framework completely transformed how our team presents metrics to stakeholders.',
            author: 'Alex Mercer',
            role: 'Head of Marketing',
          },
        };
        break;

      default:
        newWidget = {
          type: 'recommendations',
          id: `w-rec-${Date.now()}`,
          title: 'Strategic Next Steps',
          items: [
            {
              priority: 'high',
              title: 'Optimize high-traffic checkout friction points',
              impact: '+14% CVR',
              effort: 'Low',
              description: 'Streamline mobile fields based on Clarity session recordings.',
            },
          ],
        };
    }

    sections[0].widgets.push(newWidget);
    pages[0].sections = sections;
    setReport({ ...report, pages });
    setIsAddWidgetModalOpen(false);
    showToast(`Added new ${widgetType} chart to report`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <TopBar
        currentTheme={report.theme}
        onChangeTheme={handleChangeTheme}
        onOpenConnectors={() => setIsConnectorModalOpen(true)}
        connectedCount={connectedSources.length}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        isPresentMode={isPresentMode}
        setIsPresentMode={setIsPresentMode}
        onSelectTemplate={handleSelectTemplate}
        onExportPdf={handleExportPdf}
        onExportJson={handleExportJson}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Toast feedback banner */}
        {toastMessage && (
          <div
            className={`mb-4 px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : toastMessage.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* AI Prompt & Voice Command Bar */}
        {!isPresentMode && (
          <PromptBar
            onExecutePrompt={handleExecutePrompt}
            isLoading={isLoading}
            attachedDataInfo={
              attachedData ? { source: attachedData.source, fileName: attachedData.fileName } : undefined
            }
            onOpenConnectors={() => setIsConnectorModalOpen(true)}
          />
        )}

        {/* Edit Mode Toolbar */}
        {isEditMode && !isPresentMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center justify-between text-xs text-amber-900">
            <span className="font-semibold flex items-center gap-1.5">
              <span>✏️ Edit Mode Active:</span> You can edit titles directly or insert Looker Studio components.
            </span>
            <button
              onClick={() => setIsAddWidgetModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Chart or Component
            </button>
          </div>
        )}

        {/* Looker Studio Report Canvas */}
        <ReportCanvas
          report={report}
          onUpdateReport={setReport}
          activePageId={activePageId}
          setActivePageId={setActivePageId}
          isEditMode={isEditMode}
          isPresentMode={isPresentMode}
          setIsPresentMode={setIsPresentMode}
        />
      </main>

      {/* Connect Data Sources Modal */}
      <DataSourceModal
        isOpen={isConnectorModalOpen}
        onClose={() => setIsConnectorModalOpen(false)}
        onDataLoaded={handleDataLoaded}
        connectedSources={connectedSources}
        setConnectedSources={setConnectedSources}
      />

      {/* Add Widget Modal */}
      {isAddWidgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">Add Looker Studio Component</h3>
              <button
                onClick={() => setIsAddWidgetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <button
                onClick={() => handleAddWidget('scorecard')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <BarChart2 className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Scorecard / KPI</span>
                <span className="text-[11px] text-slate-500">Number with delta comparison & sparkline</span>
              </button>

              <button
                onClick={() => handleAddWidget('timeSeries')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <LineChart className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Time Series Chart</span>
                <span className="text-[11px] text-slate-500">Multi-series trend line & area graph</span>
              </button>

              <button
                onClick={() => handleAddWidget('barChart')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <BarChart2 className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-bold text-slate-800">Bar / Column Chart</span>
                <span className="text-[11px] text-slate-500">Horizontal or vertical comparative bars</span>
              </button>

              <button
                onClick={() => handleAddWidget('donutChart')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <PieChart className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">Donut / Pie Chart</span>
                <span className="text-[11px] text-slate-500">Proportional breakdown ring</span>
              </button>

              <button
                onClick={() => handleAddWidget('caseStudy')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <Trophy className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">Case Study Block</span>
                <span className="text-[11px] text-slate-500">Challenge, solution & before/after lift</span>
              </button>

              <button
                onClick={() => handleAddWidget('recommendations')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col gap-1 cursor-pointer"
              >
                <ListOrdered className="w-5 h-5 text-rose-600" />
                <span className="text-xs font-bold text-slate-800">Strategic Roadmap</span>
                <span className="text-[11px] text-slate-500">High-priority recommendations</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
