import React from 'react';
import { ThemeId } from '../../types/report';
import {
  Sparkles,
  Download,
  Share2,
  Tv,
  Edit3,
  Eye,
  Database,
  Palette,
  FileDown,
  Layers,
} from 'lucide-react';

interface TopBarProps {
  currentTheme: ThemeId;
  onChangeTheme: (theme: ThemeId) => void;
  onOpenConnectors: () => void;
  connectedCount: number;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  isPresentMode: boolean;
  setIsPresentMode: (val: boolean) => void;
  onSelectTemplate: (templateKey: string) => void;
  onExportPdf: () => void;
  onExportJson: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTheme,
  onChangeTheme,
  onOpenConnectors,
  connectedCount,
  isEditMode,
  setIsEditMode,
  isPresentMode,
  setIsPresentMode,
  onSelectTemplate,
  onExportPdf,
  onExportJson,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 print:hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            {/* Looker Studio geometric style icon */}
            <div className="flex items-end gap-0.5 h-4">
              <div className="w-1 h-2 bg-white rounded-t-sm" />
              <div className="w-1 h-3.5 bg-white rounded-t-sm" />
              <div className="w-1 h-4 bg-white rounded-t-sm" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                PromptStudio
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 uppercase tracking-wider">
                Looker AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Prompt-to-Report &amp; Case Study Platform
            </p>
          </div>
        </div>

        {/* Templates Dropdown & Connectors */}
        <div className="hidden md:flex items-center gap-2">
          {/* Template Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <span className="text-slate-400 pl-2 pr-1">Reports:</span>
            <button
              onClick={() => onSelectTemplate('ga4')}
              className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs text-slate-700 transition-all cursor-pointer"
            >
              GA4 E-commerce
            </button>
            <button
              onClick={() => onSelectTemplate('case-study')}
              className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs text-slate-700 transition-all cursor-pointer"
            >
              Client Case Study
            </button>
            <button
              onClick={() => onSelectTemplate('audit')}
              className="px-2.5 py-1 rounded-lg hover:bg-white hover:shadow-xs text-slate-700 transition-all cursor-pointer"
            >
              GSC + Clarity Audit
            </button>
          </div>

          {/* Connect Sources Button */}
          <button
            onClick={onOpenConnectors}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Data Sources</span>
            {connectedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                {connectedCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Actions: Theme, Mode Switcher, PDF Export */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="relative group">
            <select
              value={currentTheme}
              onChange={(e) => onChangeTheme(e.target.value as ThemeId)}
              className="appearance-none pl-7 pr-7 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 border-none text-slate-700 cursor-pointer focus:outline-none"
              title="Change Looker Studio theme"
            >
              <option value="looker-classic">Classic Looker</option>
              <option value="dark-slate">Dark Slate</option>
              <option value="emerald-growth">Emerald Growth</option>
              <option value="royal-indigo">Royal Indigo</option>
              <option value="sunset-amber">Sunset Amber</option>
            </select>
            <Palette className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Edit / View Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`p-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isEditMode
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
          >
            {isEditMode ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isEditMode ? 'Done Editing' : 'Edit'}</span>
          </button>

          {/* Presentation Mode */}
          <button
            onClick={() => setIsPresentMode(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            title="Full Screen Presentation Mode"
          >
            <Tv className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Present</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            title="Download client-ready PDF report"
          >
            <FileDown className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
