import React, { useState } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  LineChart,
  Search,
  Zap,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Link2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface DataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (data: {
    source: string;
    textData?: string;
    extractedReport?: any;
    imageData?: { data: string; mimeType: string };
    fileName?: string;
  }) => void;
  connectedSources: string[];
  setConnectedSources: React.Dispatch<React.SetStateAction<string[]>>;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  connectedSources,
  setConnectedSources,
}) => {
  const [activeTab, setActiveTab] = useState<'ga4' | 'gsc' | 'clarity' | 'file' | 'screenshot' | 'drive' | 'manual'>('ga4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [manualText, setManualText] = useState('');
  const [pastedImagePreview, setPastedImagePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Excel or CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const csv = XLSX.utils.sheet_to_csv(worksheet);

        setConnectedSources((prev) => Array.from(new Set([...prev, 'Excel'])));
        onDataLoaded({
          source: 'Excel / CSV',
          textData: csv,
          fileName: file.name,
        });
        setIsProcessing(false);
        onClose();
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMsg('Failed to parse Excel file. Please try a valid CSV or XLSX.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle Screenshot image upload or paste
  const handleScreenshotUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type || 'image/png';
        setPastedImagePreview(reader.result as string);

        // Call backend screenshot OCR endpoint
        const response = await fetch('/api/analyze-screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType,
          }),
        });

        const resData = await response.json();
        if (resData.success && resData.report) {
          setConnectedSources((prev) => Array.from(new Set([...prev, resData.detectedSource || 'Screenshot'])));
          onDataLoaded({
            source: 'Screenshot (' + (resData.detectedSource || 'Dashboard') + ')',
            extractedReport: resData.report,
            imageData: { data: base64Data, mimeType },
          });
          setIsProcessing(false);
          onClose();
        } else {
          throw new Error(resData.error || 'Failed to extract data from screenshot');
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'Error processing screenshot');
    }
  };

  const handleConnectConnector = (sourceKey: 'GA4' | 'GSC' | 'Clarity' | 'Google Drive') => {
    setConnectedSources((prev) => Array.from(new Set([...prev, sourceKey])));
    onDataLoaded({
      source: sourceKey,
      textData: `Connected live data stream from ${sourceKey}. Synced verified metrics for Q3 reporting.`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Connect Data Sources</h2>
              <p className="text-xs text-slate-500">
                Connect GA4, Search Console, Microsoft Clarity, Excel sheets, or upload screenshots
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-60 bg-slate-50/80 border-r border-slate-200 p-3 space-y-1 overflow-y-auto">
            <button
              onClick={() => setActiveTab('ga4')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'ga4'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>Google Analytics 4</span>
              {connectedSources.includes('GA4') && (
                <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-300" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('gsc')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'gsc'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Console (GSC)</span>
              {connectedSources.includes('GSC') && (
                <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-300" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('clarity')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'clarity'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Microsoft Clarity</span>
              {connectedSources.includes('Clarity') && (
                <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-300" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('file')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'file'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel / CSV Sheets</span>
              {connectedSources.includes('Excel') && (
                <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-300" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('screenshot')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'screenshot'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Upload Screenshot</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1 rounded ml-auto">
                AI Vision
              </span>
            </button>

            <button
              onClick={() => setActiveTab('drive')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'drive'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Google Drive</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'manual'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Notes / Brief</span>
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* GA4 TAB */}
            {activeTab === 'ga4' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Google Analytics 4 Connector</h3>
                    <p className="text-xs text-slate-500">
                      Sync sessions, purchase conversions, traffic channels, bounce rates, and AOV
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      GA4 Measurement ID or Property ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. G-9X87K12L or 382941029"
                      defaultValue="G-48192038 (Demo Store Connected)"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Includes: Sessions, Transactions, E-commerce CVR, Funnels</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> API Ready
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnectConnector('GA4')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Connect GA4 Data Stream
                </button>
              </div>
            )}

            {/* GSC TAB */}
            {activeTab === 'gsc' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Google Search Console Connector</h3>
                    <p className="text-xs text-slate-500">
                      Sync organic search clicks, impressions, average CTR, and top keyword rankings
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Verified Domain or URL Prefix
                    </label>
                    <input
                      type="text"
                      placeholder="sc-domain:example.com or https://example.com/"
                      defaultValue="sc-domain:aurastyle.com (Organic Verified)"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Syncs: 1,000+ top queries, average ranking positions, mobile vs desktop clicks
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnectConnector('GSC')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Connect Google Search Console
                </button>
              </div>
            )}

            {/* CLARITY TAB */}
            {activeTab === 'clarity' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Microsoft Clarity Connector</h3>
                    <p className="text-xs text-slate-500">
                      Analyze rage clicks, dead clicks, quick backs, and scroll depth recordings
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Clarity Project ID or Tracking Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. jx9872k"
                      defaultValue="msc-849204 (Production Clarity Project)"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    Extracts UX friction hotspots, dead click elements, and checkout drop-off triggers
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnectConnector('Clarity')}
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Connect Microsoft Clarity
                </button>
              </div>
            )}

            {/* EXCEL / CSV TAB */}
            {activeTab === 'file' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Upload Excel or CSV Sheet</h3>
                    <p className="text-xs text-slate-500">
                      Drag & drop any .xlsx, .xls, or .csv file to turn raw rows into Looker Studio charts
                    </p>
                  </div>
                </div>

                <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/20 group">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-600 mb-2 transition-colors" />
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600">
                    {isProcessing ? 'Processing spreadsheet...' : 'Click to upload or drag Excel / CSV here'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">Supports XLSX, XLS, and CSV files up to 50MB</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>
              </div>
            )}

            {/* SCREENSHOT OCR TAB */}
            {activeTab === 'screenshot' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">AI Screenshot Vision Analyzer</h3>
                    <p className="text-xs text-slate-500">
                      Upload any screenshot of a GA4 chart, GSC graph, Clarity heatmap, or dashboard
                    </p>
                  </div>
                </div>

                <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-indigo-50/30 hover:bg-indigo-50/60 group">
                  <ImageIcon className="w-8 h-8 text-indigo-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600">
                    {isProcessing ? 'Analyzing screenshot with Gemini Vision...' : 'Drop or click to upload dashboard screenshot'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    AI will automatically extract numbers, graphs, and reconstruct the report
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleScreenshotUpload(file);
                    }}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>

                {pastedImagePreview && (
                  <div className="mt-3 border rounded-xl overflow-hidden max-h-40">
                    <img src={pastedImagePreview} alt="Screenshot preview" className="w-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {/* GOOGLE DRIVE TAB */}
            {activeTab === 'drive' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Google Drive Integration</h3>
                    <p className="text-xs text-slate-500">
                      Import Google Sheets or shared quarterly marketing sheets
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Google Sheet Link or ID
                    </label>
                    <input
                      type="text"
                      placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5n..."
                      defaultValue="https://docs.google.com/spreadsheets/d/1Q3-Marketing-Performance-Aura"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnectConnector('Google Drive')}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                  Connect Google Sheet
                </button>
              </div>
            )}

            {/* MANUAL BRIEF / NOTES TAB */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Paste Written Data, Numbers or Meeting Notes</h3>
                    <p className="text-xs text-slate-500">
                      Provide raw text or video/audio briefing notes, and PromptStudio will turn it into a report
                    </p>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste your client notes, conversion figures, ad spend, revenue numbers, or copy from your analytics export..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                />

                <button
                  type="button"
                  onClick={() => {
                    if (!manualText.trim()) return;
                    setConnectedSources((prev) => Array.from(new Set([...prev, 'Notes'])));
                    onDataLoaded({
                      source: 'Manual Notes',
                      textData: manualText,
                    });
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Use These Notes For Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Connected Sources: {connectedSources.length > 0 ? connectedSources.join(', ') : 'None yet'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-200 font-medium text-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
