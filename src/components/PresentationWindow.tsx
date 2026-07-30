import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getPresentationState, PresentationState, DEFAULT_STATE, publishPresentationState } from '../services/presentationService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function PresentationWindow() {
  const [state, setState] = useState<PresentationState>(DEFAULT_STATE);

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

            // If presenter exited (empty slides + blackout), close popup window if applicable
            if (event.data.blackScreen && (!event.data.slides || event.data.slides.length === 0)) {
              if (window.opener && !window.opener.closed) {
                try { window.close(); } catch (e) {}
              }
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
              fontFamily: data.fontFamily || 'font-sans',
              alignment: data.alignment || 'center',
              activeType: data.activeType || 'song'
            };
            setState(nextState);
            try {
              localStorage.setItem('eci_presentation_state', JSON.stringify(nextState));
            } catch (e) {}

            // If presenter exited (empty slides + blackout), close popup window if applicable
            if (nextState.blackScreen && nextState.slides.length === 0) {
              if (window.opener && !window.opener.closed) {
                try { window.close(); } catch (e) {}
              }
            }
          }
        }
      }, (error) => {
        console.warn('Firestore presentation state subscription error:', error);
      });
    } catch (e) {
      console.warn('Error setting up Firestore presentation listener:', e);
    }

    // Listen to updates via LocalStorage as robust cross-origin fallback
    const handleStorageChange = () => {
      const saved = localStorage.getItem('eci_presentation_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed) {
            setState(parsed);
            if (parsed.blackScreen && (!parsed.slides || parsed.slides.length === 0)) {
              if (window.opener && !window.opener.closed) {
                try { window.close(); } catch (e) {}
              }
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

  // Class styling maps
  const alignmentClass = {
    left: 'text-left justify-start items-start',
    center: 'text-center justify-center items-center',
    right: 'text-right justify-end items-end',
  }[state?.alignment || 'center'] || 'text-center justify-center items-center';

  const fontClass = {
    'font-sans': 'font-sans',
    'font-serif': 'font-serif font-medium',
    'font-mono': 'font-mono',
  }[state?.fontFamily || 'font-sans'] || 'font-sans';

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

  return (
    <div
      className="fixed inset-0 w-screen h-screen flex flex-col justify-between p-12 overflow-hidden select-none transition-colors duration-500"
      style={{ 
        backgroundColor: bgColor, 
        color: textColor
      }}
    >
      {/* Header Info (Small metadata to identify active song/chapter subtly) */}
      <div 
        className="w-full flex justify-between items-center opacity-60 text-sm tracking-wider font-mono uppercase shrink-0"
        style={{ fontSize: '14px', color: textColor }}
      >
        <div>{state?.subtitle || ''}</div>
        <div>ECI Presentation Mode</div>
      </div>

      {/* Main Lyric Slide content container */}
      <div className={`flex-1 flex ${alignmentClass} w-full py-8 overflow-hidden`}>
        <AnimatePresence mode="wait">
          {!isBlackScreen && activeSlideContent && (
            <motion.div
              key={`${state?.title}-${currentSlideIndex}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className={`max-w-7xl w-full whitespace-pre-wrap break-words ${fontClass}`}
              style={{ fontSize: `${fontSizeVal}px`, lineHeight: 1.2, color: textColor }}
            >
              {activeSlideContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info / Progress marker */}
      <div 
        className="w-full flex justify-between items-center opacity-60 text-xs tracking-wider font-mono shrink-0"
        style={{ fontSize: '12px', color: textColor }}
      >
        <div className="truncate max-w-md font-sans font-semibold">{state?.title || ''}</div>
        <div>
          {slides.length > 0 ? `${currentSlideIndex + 1} / ${slides.length}` : 'Slide'}
        </div>
      </div>
    </div>
  );
}
