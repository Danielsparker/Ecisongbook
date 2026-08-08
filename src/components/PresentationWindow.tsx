import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tv, Eye, EyeOff, Radio } from 'lucide-react';
import { getPresentationState, PresentationState, DEFAULT_STATE, publishPresentationState } from '../services/presentationService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export function PresentationWindow() {
  const [state, setState] = useState<PresentationState>(DEFAULT_STATE);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  useEffect(() => {
    // Load initial state
    setState(getPresentationState());

    // Listen to updates via BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        broadcastChannel = new BroadcastChannel('eci-presentation');
        broadcastChannel.onmessage = (event) => {
          if (event.data) {
            setState(event.data);
            try {
              localStorage.setItem('eci_presentation_state', JSON.stringify(event.data));
            } catch (e) {}

            // If presenter exited, attempt to close popup window instantly
            if (event.data.isExited || (event.data.activeType === 'none' && (!event.data.slides || event.data.slides.length === 0))) {
              try { window.close(); } catch (e) {}
            }
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }

    // Listen to updates via Firestore for HDMI/TV/Multi-device synchronization
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      const docRef = doc(db, 'presentation', 'active');
      unsubscribeFirestore = onSnapshot(docRef, (snapshot) => {
        setIsFirestoreConnected(true);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data) {
            const nextState: PresentationState = {
              title: data.title || '',
              subtitle: data.subtitle || '',
              slides: Array.isArray(data.slides) ? data.slides : [],
              currentSlideIndex: data.currentSlideIndex ?? 0,
              theme: data.theme || 'dark',
              blackScreen: !!data.blackScreen,
              fontSize: data.fontSize || 48,
              fontFamily: data.fontFamily || 'font-baloo',
              fontWeight: data.fontWeight || '700',
              alignment: data.alignment || 'center',
              activeType: data.activeType || 'song',
              promiseVerseUrl: data.promiseVerseUrl || '',
              promiseVerseReference: data.promiseVerseReference || '',
              isExited: !!data.isExited
            };
            setState(nextState);
            try {
              localStorage.setItem('eci_presentation_state', JSON.stringify(nextState));
            } catch (e) {}

            // If presenter exited, attempt to close popup window instantly
            if (nextState.isExited || (nextState.activeType === 'none' && nextState.slides.length === 0 && !nextState.title)) {
              try { window.close(); } catch (e) {}
            }
          }
        }
      }, (error) => {
        console.warn('Firestore presentation state subscription error:', error);
        setIsFirestoreConnected(false);
        try {
          handleFirestoreError(error, OperationType.GET, 'presentation/active');
        } catch (e) {}
      });
    } catch (e) {
      console.warn('Error setting up Firestore presentation listener:', e);
      setIsFirestoreConnected(false);
    }

    // Listen to updates via LocalStorage as robust cross-origin fallback
    const handleStorageChange = () => {
      const saved = localStorage.getItem('eci_presentation_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed) {
            setState(parsed);
            if (parsed.isExited || (parsed.activeType === 'none' && (!parsed.slides || parsed.slides.length === 0) && !parsed.title)) {
              try { window.close(); } catch (e) {}
            }
          }
        } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Poll state periodically as final fail-safe for restricted sandboxed contexts (100ms for real-time responsiveness)
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Sync document.documentElement's "dark" class with state.theme
  useEffect(() => {
    const isDark = state?.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state?.theme]);

  // Keyboard navigation for projection window itself (if focused)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const slides = state?.slides || [];
      const currentSlideIndex = state?.currentSlideIndex ?? 0;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (currentSlideIndex < slides.length - 1) {
          const newState = { ...state, currentSlideIndex: currentSlideIndex + 1 };
          setState(newState);
          publishPresentationState(newState);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentSlideIndex > 0) {
          const newState = { ...state, currentSlideIndex: currentSlideIndex - 1 };
          setState(newState);
          publishPresentationState(newState);
        }
      } else if (key === 'b') {
        e.preventDefault();
        const newState = { ...state, blackScreen: !state.blackScreen };
        setState(newState);
        publishPresentationState(newState);
      } else if (key === 'f') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.error('Error enabling fullscreen:', err);
          });
        } else {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const slides = state?.slides || [];
  const currentSlideIndex = state?.currentSlideIndex ?? 0;
  const activeSlideContent = slides[currentSlideIndex] || '';

  // Render Presentation Exited screen if exited or activeType is none with no slides
  if (state?.isExited || (state?.activeType === 'none' && slides.length === 0 && !state?.title)) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 select-none font-sans">
        <div className="max-w-md w-full text-center flex flex-col items-center space-y-6 bg-slate-900/80 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center border border-slate-700/50 text-slate-400">
            <Tv className="w-8 h-8 opacity-60" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Presentation Ended</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              The presenter has exited the presentation session. You can close this window or return to the songbook.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <button
              onClick={() => {
                try { window.close(); } catch (e) {}
              }}
              className="flex-1 inline-flex items-center justify-center h-11 px-5 rounded-xl font-medium bg-brand-600 hover:bg-brand-500 text-white transition-colors duration-150 shadow-lg shadow-brand-950/50 cursor-pointer"
            >
              Close Window
            </button>
            <button
              onClick={() => {
                window.location.href = window.location.origin;
              }}
              className="flex-1 inline-flex items-center justify-center h-11 px-5 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors duration-150 cursor-pointer"
            >
              Return to Songbook
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Class styling maps
  const alignmentClass = {
    left: 'text-left justify-start items-start',
    center: 'text-center justify-center items-center',
    right: 'text-right justify-end items-end',
  }[state?.alignment || 'center'] || 'text-center justify-center items-center';

  const fontClass = {
    'font-baloo': 'font-baloo',
    'font-anek': 'font-anek',
    'font-tiro': 'font-tiro',
    'font-sans': 'font-sans',
    'font-serif': 'font-serif',
    'font-mono': 'font-mono',
  }[state?.fontFamily || 'font-baloo'] || 'font-baloo';

  const fontWeightVal = {
    '400': 400,
    'normal': 400,
    '600': 600,
    'semibold': 600,
    '700': 700,
    'bold': 700,
    '800': 800,
    'extrabold': 800,
  }[state?.fontWeight || '700'] || 700;

  // Dynamic Backdrops and Text Colors with robust Inline Overrides
  const isDarkCanvas = state?.theme === 'dark';
  const isBlackScreen = !!state?.blackScreen;

  const bgColor = isBlackScreen 
    ? '#000000' 
    : (isDarkCanvas ? '#020617' : '#ffffff'); // bg-slate-950 is #020617, bg-white is #ffffff
    
  const textColor = isBlackScreen 
    ? 'transparent' 
    : (isDarkCanvas ? '#ffffff' : '#0f172a'); // text-slate-900 is #0f172a

  const fontSizeVal = typeof state?.fontSize === 'number' && !isNaN(state.fontSize) ? state.fontSize : (Number(state?.fontSize) || 48);

  // Promise verse wallpaper full-screen presentation mode
  const isPromiseVerse = state?.activeType === 'promiseVerse' && !!state?.promiseVerseUrl;

  if (isPromiseVerse) {
    return (
      <div 
        className="fixed inset-0 w-screen h-screen flex items-center justify-center overflow-hidden select-none bg-black transition-colors duration-500"
        style={{ backgroundColor: isBlackScreen ? '#000000' : (isDarkCanvas ? '#020617' : '#000000') }}
      >
        {isBlackScreen ? (
          <div className="w-full flex flex-col items-center justify-center space-y-4 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-xl">
              <EyeOff className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-slate-200">Blackout Active</p>
              <p className="text-sm text-slate-400">Promise Verse Display Hidden</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={state.promiseVerseUrl}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full h-full flex items-center justify-center relative p-0"
            >
              <img 
                src={state.promiseVerseUrl} 
                alt={state.title || 'Monthly Promise Verse'} 
                className="w-full h-full object-contain"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    );
  }

  // Standby mode when no slides are loaded yet
  const isStandby = slides.length === 0;

  return (
    <div
      className="fixed inset-0 w-screen h-screen flex flex-col justify-between p-8 md:p-12 overflow-hidden select-none transition-colors duration-500"
      style={{ 
        backgroundColor: bgColor, 
        color: isBlackScreen ? '#ffffff' : textColor
      }}
    >
      {/* Header Info (Small metadata to identify active song/chapter subtly) */}
      <div 
        className="w-full flex justify-between items-center opacity-70 text-sm tracking-wider font-mono uppercase shrink-0"
        style={{ fontSize: '14px', color: isBlackScreen ? 'rgba(255,255,255,0.4)' : textColor }}
      >
        <div>{state?.subtitle || 'ECI Songbook'}</div>
        <div className="flex items-center gap-2">
          {isFirestoreConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
              Live Sync
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Local Mode
            </span>
          )}
          <span>ECI Presentation Mode</span>
        </div>
      </div>

      {/* Main Lyric Slide content container */}
      <div className={`flex-1 flex ${alignmentClass} w-full py-8 overflow-hidden relative`}>
        {/* Blackout Indicator & Toggle */}
        {isBlackScreen ? (
          <div className="w-full flex flex-col items-center justify-center space-y-4 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-xl">
              <EyeOff className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-semibold text-slate-200">Blackout Active</p>
              <p className="text-sm text-slate-400">Display is temporarily hidden by presenter</p>
            </div>
            <button
              onClick={() => {
                const newState = { ...state, blackScreen: false };
                setState(newState);
                publishPresentationState(newState);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-brand-400" />
              Restore Display (Press 'B')
            </button>
          </div>
        ) : isStandby ? (
          <div className="w-full flex flex-col items-center justify-center space-y-5 text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shadow-xl">
              <Tv className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-2 max-w-lg">
              <h2 className="text-2xl font-bold tracking-tight" style={{ color: textColor }}>
                {state?.title || 'Presentation Standby'}
              </h2>
              <p className="text-sm opacity-70 leading-relaxed" style={{ color: textColor }}>
                Waiting for slide selection from Presenter Control. Select any song or Scripture verse to project live.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeSlideContent && (
              <motion.div
                key={`${state?.title}-${currentSlideIndex}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className={`max-w-7xl w-full whitespace-pre-wrap break-words ${fontClass}`}
                style={{ 
                  fontSize: `${fontSizeVal}px`, 
                  fontWeight: fontWeightVal, 
                  lineHeight: 1.3, 
                  color: textColor 
                }}
              >
                {activeSlideContent}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info / Progress marker */}
      <div 
        className="w-full flex justify-between items-center opacity-70 text-xs tracking-wider font-mono shrink-0"
        style={{ fontSize: '12px', color: isBlackScreen ? 'rgba(255,255,255,0.4)' : textColor }}
      >
        <div className="truncate max-w-md font-sans font-semibold">{state?.title || 'ECI Songbook'}</div>
        <div>
          {slides.length > 0 ? `${currentSlideIndex + 1} / ${slides.length}` : 'Standby'}
        </div>
      </div>
    </div>
  );
}

