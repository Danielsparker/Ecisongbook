import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Eye, 
  EyeOff, 
  Maximize, 
  Minimize, 
  Sun, 
  Moon, 
  Tv, 
  Radio,
  Sparkles,
  Shuffle,
  Palette
} from 'lucide-react';
import { Song, BibleVerse } from '../types';
import { 
  PresentationState, 
  splitLyricsToSlides, 
  publishPresentationState, 
  getPresentationState,
  setGlobalCanvasTheme,
  getStoredCanvasTheme
} from '../services/presentationService';
import { 
  getBackgroundTheme, 
  getRandomBackgroundTheme, 
  LYRIC_BACKGROUND_THEMES,
  LyricBackgroundTheme 
} from '../data/backgroundThemes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FullScreenPresentationProps {
  song?: Song | null;
  bibleVerse?: BibleVerse | null;
  promiseVerse?: { title: string; imageUrl: string; reference?: string; month?: string } | null;
  startSlideIndex?: number;
  canvasTheme: 'light' | 'dark';
  onToggleCanvasTheme: (theme: 'light' | 'dark') => void;
  onExit: () => void;
}

export function FullScreenPresentation({
  song,
  bibleVerse,
  promiseVerse,
  startSlideIndex = 0,
  canvasTheme,
  onToggleCanvasTheme,
  onExit,
}: FullScreenPresentationProps) {
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(startSlideIndex);
  const [blackScreen, setBlackScreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(48);
  const [fontFamily, setFontFamily] = useState<string>('font-baloo');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [isFullscreenActive, setIsFullscreenActive] = useState<boolean>(false);
  const [bgThemeId, setBgThemeId] = useState<string>(() => {
    const saved = getPresentationState();
    return saved.backgroundThemeId || 'midnight-sanctuary';
  });
  const [showThemePicker, setShowThemePicker] = useState<boolean>(false);
  
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeBgTheme = getBackgroundTheme(bgThemeId);

  // Initialize slides and title
  const title = song?.title || (bibleVerse ? `${bibleVerse.book} ${bibleVerse.chapter}:${bibleVerse.verse}` : (promiseVerse?.title || 'ECI Worship'));
  const subtitle = song ? `Song #${song.songNo}` : (bibleVerse ? (bibleVerse.version || 'Holy Bible') : (promiseVerse?.reference || 'Promise Verse'));

  useEffect(() => {
    let generatedSlides: string[] = [];
    if (song) {
      generatedSlides = splitLyricsToSlides(song.lyrics);
    } else if (bibleVerse) {
      generatedSlides = [bibleVerse.text];
    } else if (promiseVerse) {
      generatedSlides = [promiseVerse.reference || promiseVerse.title || 'Promise Verse'];
    }

    setSlides(generatedSlides);
    const validStartIndex = Math.min(Math.max(0, startSlideIndex), Math.max(0, generatedSlides.length - 1));
    setCurrentSlideIndex(validStartIndex);

    // Publish to presentation state for cross-device sync as well
    const state: PresentationState = {
      title,
      subtitle,
      slides: generatedSlides,
      currentSlideIndex: validStartIndex,
      theme: canvasTheme,
      backgroundThemeId: bgThemeId,
      blackScreen: false,
      fontSize: 48,
      fontFamily: 'font-baloo',
      fontWeight: '700',
      alignment: 'center',
      activeType: song ? 'song' : (bibleVerse ? 'bible' : (promiseVerse ? 'promiseVerse' : 'custom')),
      promiseVerseUrl: promiseVerse?.imageUrl || '',
      promiseVerseReference: promiseVerse?.reference || '',
      isExited: false,
    };
    publishPresentationState(state);

    // Attempt browser fullscreen on launch
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  }, [song, bibleVerse, promiseVerse, startSlideIndex]);

  // Sync slide & theme change to external subscribers
  useEffect(() => {
    const current = getPresentationState();
    publishPresentationState({
      ...current,
      currentSlideIndex,
      blackScreen,
      theme: canvasTheme,
      backgroundThemeId: bgThemeId,
    });
  }, [currentSlideIndex, blackScreen, canvasTheme, bgThemeId]);

  const handleRandomTheme = () => {
    const randomTheme = getRandomBackgroundTheme(bgThemeId);
    setBgThemeId(randomTheme.id);
  };

  // Auto-hide controls overlay
  useEffect(() => {
    const handleActivity = () => {
      setShowControls(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    const handleFullscreenChange = () => {
      setIsFullscreenActive(!!document.fullscreenElement);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setBlackScreen(prev => !prev);
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'q') {
        e.preventDefault();
        handleClose();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleBrowserFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, currentSlideIndex]);

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setBlackScreen(false);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setBlackScreen(false);
    }
  };

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleClose = () => {
    if (document.fullscreenElement) {
      try {
        document.exitFullscreen().catch(() => {});
      } catch (e) {}
    }
    onExit();
  };

  const isLight = canvasTheme === 'light';
  const isPromiseVerse = !!promiseVerse?.imageUrl;

  const containerBgStyle = blackScreen 
    ? { backgroundColor: '#000000' } 
    : { background: activeBgTheme.backgroundStyle };

  const textColor = blackScreen 
    ? 'transparent' 
    : (activeBgTheme.textColor || '#ffffff');

  const textShadow = blackScreen
    ? 'none'
    : (activeBgTheme.textShadow || '0 2px 12px rgba(0,0,0,0.85)');

  const alignmentClass = {
    left: 'text-left justify-start items-start',
    center: 'text-center justify-center items-center',
    right: 'text-right justify-end items-end',
  }[alignment] || 'text-center justify-center items-center';

  return (
    <div 
      className="fixed inset-0 w-screen h-screen z-[9999] flex flex-col justify-between overflow-hidden select-none transition-colors duration-500"
      style={containerBgStyle}
    >
      {/* Top Floating Header & Controls (Fades out when resting) */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${
          showControls 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        } ${
          isLight 
            ? 'bg-gradient-to-b from-slate-200/90 via-slate-100/60 to-transparent text-slate-800' 
            : 'bg-gradient-to-b from-black/90 via-slate-950/60 to-transparent text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${isLight ? 'text-brand-600' : 'text-brand-400'}`}>
              {subtitle}
            </span>
            <h1 className="text-base sm:text-lg font-bold truncate max-w-md">
              {title}
            </h1>
          </div>
          <Badge 
            variant="outline" 
            className={`hidden sm:inline-flex text-[10px] uppercase font-mono px-2 py-0.5 ${
              isLight 
                ? 'border-amber-400 bg-amber-50 text-amber-900' 
                : 'border-brand-500/40 bg-brand-950/40 text-brand-300'
            }`}
          >
            Full Screen Mode
          </Badge>
          {!blackScreen && (
            <Badge
              variant="outline"
              className="hidden md:inline-flex text-[10px] font-sans px-2.5 py-0.5 rounded-full border-white/20 bg-white/10 text-white"
            >
              Theme: {activeBgTheme.name}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Random Background Theme Button */}
          {!blackScreen && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRandomTheme();
              }}
              title="Shuffle Background Theme"
              className="h-9 px-3 rounded-xl gap-1.5 text-xs font-semibold backdrop-blur-md transition-all bg-brand-950/60 border-brand-500/40 text-brand-200 hover:bg-brand-900 hover:text-white"
            >
              <Shuffle className="h-3.5 w-3.5 text-brand-400 animate-spin-slow" />
              <span>Random Theme</span>
            </Button>
          )}

          {/* Theme Palette Switcher Toggle */}
          {!blackScreen && (
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowThemePicker(prev => !prev);
                }}
                className="h-9 px-3 rounded-xl gap-1.5 text-xs font-semibold backdrop-blur-md transition-all bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800"
              >
                <Palette className="h-3.5 w-3.5 text-purple-400" />
                <span>10 Themes</span>
              </Button>

              {/* Dropdown theme picker */}
              {showThemePicker && (
                <div 
                  className="absolute right-0 top-11 w-72 p-3 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 grid grid-cols-2 gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex justify-between items-center">
                    <span>Lyrics Backgrounds</span>
                    <button 
                      onClick={() => setShowThemePicker(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {LYRIC_BACKGROUND_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => {
                        setBgThemeId(theme.id);
                        setShowThemePicker(false);
                      }}
                      className={`p-2 rounded-xl border text-left flex flex-col justify-between h-14 transition-all overflow-hidden relative group cursor-pointer ${
                        bgThemeId === theme.id 
                          ? 'border-brand-400 ring-2 ring-brand-500/50 shadow-md' 
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                      style={{ background: theme.previewBg }}
                    >
                      <span className="text-[11px] font-bold text-white drop-shadow-md truncate z-10 leading-tight">
                        {theme.name}
                      </span>
                      <span className="text-[9px] text-white/80 drop-shadow-sm truncate z-10">
                        {theme.nameTa}
                      </span>
                      {bgThemeId === theme.id && (
                        <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-400 shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Canvas Theme Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const newTheme = isLight ? 'dark' : 'light';
              onToggleCanvasTheme(newTheme);
              setGlobalCanvasTheme(newTheme);
            }}
            className={`h-9 px-3 rounded-xl gap-1.5 text-xs font-semibold backdrop-blur-md transition-all ${
              isLight 
                ? 'bg-amber-100/80 border-amber-300 text-slate-900 hover:bg-amber-200' 
                : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isLight ? <Sun className="h-4 w-4 text-amber-600" /> : <Moon className="h-4 w-4 text-brand-400" />}
            <span>{isLight ? 'Light Canvas' : 'Dark Canvas'}</span>
          </Button>

          {/* Blackout Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setBlackScreen(prev => !prev)}
            className={`h-9 px-3 rounded-xl gap-1.5 text-xs font-semibold backdrop-blur-md transition-all ${
              blackScreen
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : isLight
                  ? 'bg-white/80 border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {blackScreen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{blackScreen ? 'Blackout ON' : 'Blackout'}</span>
          </Button>

          {/* Browser Fullscreen Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleBrowserFullscreen}
            className={`h-9 w-9 rounded-xl ${isLight ? 'hover:bg-slate-200 text-slate-700' : 'hover:bg-slate-800 text-slate-300'}`}
            title="Toggle Native Fullscreen"
          >
            {isFullscreenActive ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>

          {/* Exit Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className={`h-9 px-3 rounded-xl gap-1 font-bold border transition-colors ${
              isLight 
                ? 'border-slate-300 bg-white/90 text-slate-800 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                : 'border-slate-700 bg-slate-900/90 text-slate-200 hover:bg-red-950/60 hover:text-red-400 hover:border-red-800'
            }`}
          >
            <X className="h-4 w-4" />
            <span>Exit (Esc)</span>
          </Button>
        </div>
      </div>

      {/* Main Slide Content Center Area */}
      <div 
        className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16 md:p-24 relative overflow-hidden"
        onClick={() => {
          // Clicking anywhere on presentation advances slide
          if (!showThemePicker) {
            handleNext();
          }
        }}
      >
        {blackScreen ? (
          <div className="flex flex-col items-center justify-center gap-3 text-center pointer-events-none">
            <EyeOff className="h-12 w-12 text-slate-700 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-slate-600 uppercase">
              Blackout Active • Press 'B' to restore
            </span>
          </div>
        ) : isPromiseVerse ? (
          <div className="w-full h-full flex items-center justify-center relative">
            <img
              src={promiseVerse?.imageUrl}
              alt={promiseVerse?.title || 'Promise Verse Wallpaper'}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlideIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`w-full max-w-5xl flex flex-col ${alignmentClass}`}
            >
              <p 
                className="font-baloo font-bold italic tracking-wide break-words whitespace-pre-wrap leading-relaxed transition-colors duration-200"
                style={{ 
                  fontSize: 'clamp(28px, 4.5vw, 68px)',
                  color: textColor,
                  textShadow
                }}
              >
                {slides[currentSlideIndex] || '---'}
              </p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Floating Navigation Bar (Auto-hiding) */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${
          showControls 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        } ${
          isLight 
            ? 'bg-gradient-to-t from-slate-200/90 via-slate-100/60 to-transparent text-slate-800' 
            : 'bg-gradient-to-t from-black/90 via-slate-950/60 to-transparent text-white'
        }`}
      >
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            disabled={currentSlideIndex === 0}
            className={`h-10 px-4 rounded-xl gap-2 font-bold backdrop-blur-md disabled:opacity-30 ${
              isLight ? 'bg-white/90 border-slate-300 text-slate-800' : 'bg-slate-900/90 border-slate-700 text-white'
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            disabled={currentSlideIndex >= slides.length - 1}
            className={`h-10 px-4 rounded-xl gap-2 font-bold backdrop-blur-md disabled:opacity-30 ${
              isLight ? 'bg-white/90 border-slate-300 text-slate-800' : 'bg-slate-900/90 border-slate-700 text-white'
            }`}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg backdrop-blur-md border ${
            isLight ? 'bg-white/80 border-slate-300 text-slate-700' : 'bg-slate-900/80 border-slate-700 text-slate-300'
          }`}>
            Slide {slides.length > 0 ? currentSlideIndex + 1 : 0} of {slides.length}
          </span>
          <span className="hidden md:inline text-[11px] font-mono opacity-50">
            Keys: Space/Arrows (Navigate) • B (Blackout) • Esc (Exit)
          </span>
        </div>
      </div>
    </div>
  );
}
