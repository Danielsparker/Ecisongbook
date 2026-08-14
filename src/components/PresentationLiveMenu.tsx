import React, { useState, useRef, useEffect } from 'react';
import { 
  Tv, 
  Maximize2, 
  AppWindow, 
  Play, 
  ChevronDown, 
  MonitorPlay, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export type PresentationMode = 'presenter' | 'fullscreen' | 'windowed';

interface PresentationLiveMenuProps {
  onSelectMode: (mode: PresentationMode) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  align?: 'start' | 'center' | 'end';
  label?: string;
  isLiveActive?: boolean;
  currentSlideText?: string;
}

export function PresentationLiveMenu({
  onSelectMode,
  className = '',
  variant = 'default',
  size = 'sm',
  align = 'end',
  label = 'Go Live',
  isLiveActive = false,
  currentSlideText
}: PresentationLiveMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  const handleOptionClick = (mode: PresentationMode) => {
    setIsOpen(false);
    onSelectMode(mode);
  };

  const alignmentClasses = {
    start: 'left-0 origin-top-left',
    center: 'left-1/2 -translate-x-1/2 origin-top',
    end: 'right-0 origin-top-right'
  }[align] || 'right-0 origin-top-right';

  return (
    <div 
      className="relative inline-block text-left" 
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Primary Trigger Button */}
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative gap-2 rounded-xl font-bold tracking-tight transition-all duration-200 shadow-md ${
          isLiveActive 
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/30 ring-2 ring-rose-500/50 animate-pulse'
            : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-900/20 hover:shadow-brand-900/30'
        } ${className}`}
      >
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <Tv className="h-4 w-4" />
          <span>{label}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* 3 Presentation Modes Hover/Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute ${alignmentClasses} top-full mt-2 w-[340px] sm:w-[380px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl`}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MonitorPlay className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Choose Presentation Mode
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800">
              3 Modes
            </Badge>
          </div>

          {currentSlideText && (
            <div className="mx-2 mb-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span className="font-semibold text-brand-600 dark:text-brand-400 shrink-0">Starting from:</span>
              <span className="truncate italic font-serif">"{currentSlideText}"</span>
            </div>
          )}

          {/* Options List */}
          <div className="space-y-1.5">
            {/* 1. Presenter View */}
            <button
              type="button"
              onClick={() => handleOptionClick('presenter')}
              className="w-full text-left p-3 rounded-xl border border-transparent hover:border-brand-500/40 bg-slate-50/60 dark:bg-slate-950/50 hover:bg-brand-50/80 dark:hover:bg-brand-950/30 transition-all duration-150 group cursor-pointer flex items-start gap-3"
            >
              <div className="mt-0.5 p-2 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 group-hover:bg-brand-600 group-hover:text-white transition-colors shrink-0">
                <Tv className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    Presenter View
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-brand-100/80 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
                    Dual Display
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Keep controls & playlist on this screen while projecting clean lyrics to extended TV/projector without exposing controls.
                </p>
              </div>
            </button>

            {/* 2. Full Screen */}
            <button
              type="button"
              onClick={() => handleOptionClick('fullscreen')}
              className="w-full text-left p-3 rounded-xl border border-transparent hover:border-emerald-500/40 bg-slate-50/60 dark:bg-slate-950/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 transition-all duration-150 group cursor-pointer flex items-start gap-3"
            >
              <div className="mt-0.5 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                <Maximize2 className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Full Screen
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-100/80 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                    Direct Stage
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Presents borderless lyrics on this display starting from selected stanza. Hides all app controls for complete immersion.
                </p>
              </div>
            </button>

            {/* 3. Windowed Presentation */}
            <button
              type="button"
              onClick={() => handleOptionClick('windowed')}
              className="w-full text-left p-3 rounded-xl border border-transparent hover:border-amber-500/40 bg-slate-50/60 dark:bg-slate-950/50 hover:bg-amber-50/80 dark:hover:bg-amber-950/30 transition-all duration-150 group cursor-pointer flex items-start gap-3"
            >
              <div className="mt-0.5 p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
                <AppWindow className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Windowed Presentation
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-100/80 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                    Resizable Window
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Opens presentation in an independent resizable window. Perfect for multitasking with streaming software or notes.
                </p>
              </div>
            </button>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 px-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Hover or click any option to launch</span>
            <span className="font-mono">ECI Live Engine</span>
          </div>
        </div>
      )}
    </div>
  );
}
