import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Loader2,
  FileSpreadsheet,
  Image as ImageIcon,
  Zap,
  Palette,
  Layout,
  PlusCircle,
} from 'lucide-react';

interface PromptBarProps {
  onExecutePrompt: (prompt: string, isVoice: boolean) => void;
  isLoading: boolean;
  attachedDataInfo?: { source: string; fileName?: string };
  onOpenConnectors: () => void;
}

export const PromptBar: React.FC<PromptBarProps> = ({
  onExecutePrompt,
  isLoading,
  attachedDataInfo,
  onOpenConnectors,
}) => {
  const [promptText, setPromptText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setPromptText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!promptText.trim() || isLoading) return;
    onExecutePrompt(promptText.trim(), isListening);
    setPromptText('');
  };

  const handleChipClick = (suggestion: string) => {
    setPromptText(suggestion);
    onExecutePrompt(suggestion, false);
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl shadow-lg p-3 sm:p-4 mb-6">
      {/* Attached Data Source Pill (if any) */}
      <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Prompt Studio AI Engine</span>
          </div>

          {attachedDataInfo ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Data Linked: {attachedDataInfo.source}</span>
            </div>
          ) : (
            <button
              onClick={onOpenConnectors}
              className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 underline underline-offset-2 cursor-pointer font-medium"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Connect GA4, GSC, Clarity, or Excel
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
          Type prompt or press mic for voice commands
        </div>
      </div>

      {/* Main Prompt Bar Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice command... speak now'
                : 'Ask AI: "Add an executive summary", "Switch theme to dark", "Add ROAS scorecard", "Create Q3 case study"...'
            }
            className={`w-full pl-4 pr-12 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-medium transition-all ${
              isListening ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/30' : 'border-slate-200'
            }`}
            disabled={isLoading}
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Start voice command'}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md'
                : 'text-slate-400 hover:text-blue-600 hover:bg-slate-200'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!promptText.trim() || isLoading}
          className="px-4 sm:px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <span>Generate / Refine</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Prompt Suggestions */}
      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 overflow-x-auto text-xs pb-1">
        <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          Quick Actions:
        </span>

        <button
          onClick={() => handleChipClick('Add a client case study section with before/after results and testimonial')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium shrink-0 transition-colors cursor-pointer"
        >
          + Client Case Study
        </button>

        <button
          onClick={() => handleChipClick('Add an executive recommendation block for reducing cart abandonment')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium shrink-0 transition-colors cursor-pointer"
        >
          + Strategic Roadmap
        </button>

        <button
          onClick={() => handleChipClick('Switch report theme to dark-slate')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium shrink-0 transition-colors cursor-pointer"
        >
          Switch to Dark Slate
        </button>

        <button
          onClick={() => handleChipClick('Add a scorecard for ROAS with value 4.8x and +32% increase')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium shrink-0 transition-colors cursor-pointer"
        >
          + Add ROAS Scorecard
        </button>

        <button
          onClick={() => handleChipClick('Add a top keywords table from Google Search Console with clicks and CTR')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium shrink-0 transition-colors cursor-pointer"
        >
          + Top GSC Keywords Table
        </button>
      </div>
    </div>
  );
};
