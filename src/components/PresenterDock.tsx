import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tv, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Palette, 
  Shuffle, 
  Type, 
  Maximize2, 
  X, 
  Sparkles, 
  Layers,
  ExternalLink,
  Sliders,
  Check,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  PresentationState, 
  getPresentationState, 
  publishPresentationState, 
  DEFAULT_STATE 
} from '../services/presentationService';
import { 
  presenterManager, 
  DisplayInfo 
} from '../services/presenterManager';
import { 
  LYRIC_BACKGROUND_THEMES, 
  getBackgroundTheme, 
  getRandomBackgroundTheme,
  LyricBackgroundTheme 
} from '../data/backgroundThemes';

interface PresenterDockProps {
  onOpenStudio?: () => void;
}

export function PresenterDock({ onOpenStudio }: PresenterDockProps) {
  const [presState, setPresState] = useState<PresentationState>(DEFAULT_STATE);
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>(presenterManager.getDisplayInfo());
  const [isWindowOpen, setIsWindowOpen] = useState(presenterManager.isPresenterOpen());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showSlidePicker, setShowSlidePicker] = useState(false);

  useEffect(() => {
    // Initial state
    setPresState(getPresentationState());

    // Subscribe to display changes
    const unsubDisplay = presenterManager.onDisplayChange(setDisplayInfo);
    // Subscribe to window status
    const unsubWin = presenterManager.onWindowStatusChange(setIsWindowOpen);

    // Listen to storage/broadcast updates
    const handleStorageChange = () => {
      setPresState(getPresentationState());
    };

    window.addEventListener('storage', handleStorageChange);

    let channel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel('eci-presentation');
        channel.onmessage = (e) => {
          if (e.data) setPresState(e.data);
        };
      }
    } catch (e) {}

    return () => {
      unsubDisplay();
      unsubWin();
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
    };
  }, []);

  const isActive = (presState.slides && presState.slides.length > 0 && !presState.isExited) || isWindowOpen;

  if (!isActive) {
    return null;
  }

  const currentTheme = getBackgroundTheme(presState.backgroundThemeId);
  const totalSlides = presState.slides?.length || 0;
  const currentIndex = presState.currentSlideIndex || 0;

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      const nextState = {
        ...presState,
        currentSlideIndex: currentIndex + 1,
        blackScreen: false,
      };
      setPresState(nextState);
      publishPresentationState(nextState);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const nextState = {
        ...presState,
        currentSlideIndex: currentIndex - 1,
        blackScreen: false,
      };
      setPresState(nextState);
      publishPresentationState(nextState);
    }
  };

  const handleSelectSlide = (idx: number) => {
    const nextState = {
      ...presState,
      currentSlideIndex: idx,
      blackScreen: false,
    };
    setPresState(nextState);
    publishPresentationState(nextState);
    setShowSlidePicker(false);
  };

  const toggleBlackout = () => {
    const nextState = {
      ...presState,
      blackScreen: !presState.blackScreen,
    };
    setPresState(nextState);
    publishPresentationState(nextState);
  };

  const handleSelectTheme = (themeId: string) => {
    const nextState = {
      ...presState,
      backgroundThemeId: themeId,
    };
    setPresState(nextState);
    publishPresentationState(nextState);
    setShowThemePicker(false);
  };

  const handleRandomTheme = () => {
    const random = getRandomBackgroundTheme(presState.backgroundThemeId);
    const nextState = {
      ...presState,
      backgroundThemeId: random.id,
    };
    setPresState(nextState);
    publishPresentationState(nextState);
  };

  const handleFontSizeDelta = (delta: number) => {
    const currentSize = Number(presState.fontSize) || 48;
    const newSize = Math.max(24, Math.min(120, currentSize + delta));
    const nextState = {
      ...presState,
      fontSize: newSize,
    };
    setPresState(nextState);
    publishPresentationState(nextState);
  };

  const handleFocusPresenter = () => {
    presenterManager.focusPresenterWindow();
  };

  const handleEndPresentation = () => {
    presenterManager.endPresentation(false);
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="pointer-events-auto max-w-4xl w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-700/60 dark:border-slate-800 text-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
      >
        {/* Main Dock Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:px-4">
          {/* Left: Status & Song Details */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleFocusPresenter}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 text-brand-400 text-xs font-medium transition-colors shrink-0 group cursor-pointer"
              title="Click to focus / position Presenter Window"
            >
              <Tv className="w-3.5 h-3.5 animate-pulse text-brand-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">
                {displayInfo.isExtended ? 'Dual-Screen Live' : isWindowOpen ? 'Presenter Window' : 'Presenting'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </button>

            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate drop-shadow-sm max-w-[160px] sm:max-w-[240px]">
                  {presState.title || 'ECI Live Presentation'}
                </span>
                {presState.subtitle && (
                  <Badge variant="outline" className="hidden md:inline-flex text-[10px] py-0 px-1.5 bg-slate-800 border-slate-700 text-slate-300">
                    {presState.subtitle}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                {totalSlides > 0 ? (
                  <span>Slide {currentIndex + 1} of {totalSlides}</span>
                ) : (
                  <span>Standby</span>
                )}
                {currentTheme && (
                  <>
                    <span>•</span>
                    <span className="truncate text-slate-300">{currentTheme.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Center: Slide Controls */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="h-9 w-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-white disabled:opacity-30 cursor-pointer"
              title="Previous Slide (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Slide Index / Selector Popover Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSlidePicker(!showSlidePicker)}
              className="h-9 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-white font-mono text-xs cursor-pointer flex items-center gap-1.5"
              title="Click to select specific slide"
            >
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              <span>{totalSlides > 0 ? `${currentIndex + 1}/${totalSlides}` : '0/0'}</span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex >= totalSlides - 1}
              className="h-9 w-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-white disabled:opacity-30 cursor-pointer"
              title="Next Slide (Right Arrow or Space)"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Blackout Toggle */}
            <Button
              variant={presState.blackScreen ? "default" : "outline"}
              size="sm"
              onClick={toggleBlackout}
              className={`h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 transition-colors cursor-pointer ${
                presState.blackScreen 
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold' 
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Toggle Blackout Screen (Press 'B')"
            >
              {presState.blackScreen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{presState.blackScreen ? 'Blackout ON' : 'Blackout'}</span>
            </Button>
          </div>

          {/* Right: Theme, Studio & Action Tools */}
          <div className="flex items-center gap-1.5">
            {/* Theme Picker Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="h-9 w-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-amber-400 cursor-pointer relative"
              title="Select Lyrics Background Theme"
            >
              <Palette className="w-4 h-4" />
              {currentTheme && (
                <span 
                  className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-slate-900" 
                  style={{ background: currentTheme.previewBg }} 
                />
              )}
            </Button>

            {/* Quick Random Theme */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleRandomTheme}
              className="h-9 w-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-purple-400 cursor-pointer"
              title="Shuffle Random Theme"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </Button>

            {/* Font Size +/- */}
            <div className="hidden lg:flex items-center bg-slate-800/80 border border-slate-700 rounded-xl overflow-hidden h-9">
              <button
                onClick={() => handleFontSizeDelta(-4)}
                className="px-2 h-full hover:bg-slate-700 text-slate-300 text-xs font-mono"
                title="Decrease Font Size"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-2 text-xs font-mono font-bold text-slate-200">
                {presState.fontSize || 48}px
              </span>
              <button
                onClick={() => handleFontSizeDelta(4)}
                className="px-2 h-full hover:bg-slate-700 text-slate-300 text-xs font-mono"
                title="Increase Font Size"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Focus / Reopen Presenter Window */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleFocusPresenter}
              className="h-9 w-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-brand-400 cursor-pointer"
              title="Open or Focus Dedicated Presenter Window"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>

            {/* Studio Remote Modal Opener */}
            {onOpenStudio && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenStudio}
                className="h-9 px-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 border-brand-500 text-white font-medium text-xs gap-1.5 cursor-pointer shadow-md"
                title="Open Studio Control Room"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Studio</span>
              </Button>
            )}

            {/* End Presentation Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEndPresentation}
              className="h-9 w-9 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer"
              title="End Presentation"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Slide Selection Drawer */}
        <AnimatePresence>
          {showSlidePicker && totalSlides > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-800 bg-slate-950/90 p-3 max-h-48 overflow-y-auto"
            >
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Select Slide</span>
                <span className="font-mono text-[10px] text-slate-500">{totalSlides} Total Slides</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {presState.slides.map((slide, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSlide(idx)}
                    className={`p-2 rounded-xl text-left text-xs transition-all border ${
                      currentIndex === idx
                        ? 'bg-brand-600/30 border-brand-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold font-mono text-[10px] text-brand-400 mb-1">
                      #{idx + 1}
                    </div>
                    <div className="line-clamp-2 text-[11px] leading-relaxed">
                      {slide}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Background Theme Selector Drawer */}
        <AnimatePresence>
          {showThemePicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-slate-800 bg-slate-950/90 p-3 max-h-56 overflow-y-auto"
            >
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  10 Lyrics Projection Themes
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRandomTheme}
                  className="h-6 px-2 text-[11px] text-purple-400 hover:text-purple-300"
                >
                  <Shuffle className="w-3 h-3 mr-1" /> Shuffle
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {LYRIC_BACKGROUND_THEMES.map((theme) => {
                  const isSelected = presState.backgroundThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`relative p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between overflow-hidden h-20 ${
                        isSelected 
                          ? 'border-brand-400 ring-2 ring-brand-400/40 shadow-lg' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ background: theme.previewBg }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/50 text-white/90">
                          {theme.tag}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white drop-shadow-md truncate">
                          {theme.name}
                        </div>
                        <div className="text-[10px] text-white/70 truncate font-tamil">
                          {theme.nameTa}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
