import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PresentationState {
  title: string;
  subtitle?: string; // e.g. "Song #12" or "John 3:16"
  slides: string[];
  currentSlideIndex: number;
  theme: 'dark' | 'light';
  blackScreen: boolean;
  fontSize: number; // in pixels
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
  activeType: 'song' | 'bible' | 'custom';
}

export const DEFAULT_STATE: PresentationState = {
  title: '',
  subtitle: '',
  slides: [],
  currentSlideIndex: 0,
  theme: 'dark',
  blackScreen: false,
  fontSize: 48,
  fontFamily: 'font-sans',
  alignment: 'center',
  activeType: 'song',
};

// Create a BroadcastChannel for modern browsers (with fallback to localStorage for iframe support)
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('eci-presentation');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported or restricted in this environment', e);
}

/**
 * Splits song lyrics dynamically and intelligently into stanzas/slides.
 * If a stanza contains more than 5 lines, it's divided into smaller slides of 4 lines each
 * so they always fit standard screen proportions comfortably.
 */
export function splitLyricsToSlides(lyrics: string): string[] {
  if (!lyrics) return [];
  
  // Standardise newlines and split by double newlines (stanzas)
  const normalized = lyrics.replace(/\r\n/g, '\n');
  const stanzas = normalized.split(/\n\s*\n/);
  const slides: string[] = [];

  for (const stanza of stanzas) {
    const trimmed = stanza.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n');
    // If a stanza is excessively long, split into chunks of 4 lines
    if (lines.length > 5) {
      for (let i = 0; i < lines.length; i += 4) {
        const chunk = lines.slice(i, i + 4).join('\n').trim();
        if (chunk) slides.push(chunk);
      }
    } else {
      slides.push(trimmed);
    }
  }

  return slides;
}

/**
 * Publishes presentation state to Firestore for cross-device/HDMI synchronization.
 */
export async function publishPresentationStateToFirestore(state: PresentationState) {
  try {
    const docRef = doc(db, 'presentation', 'active');
    await setDoc(docRef, {
      title: state.title || '',
      subtitle: state.subtitle || '',
      slides: state.slides || [],
      currentSlideIndex: state.currentSlideIndex ?? 0,
      theme: state.theme || 'dark',
      blackScreen: !!state.blackScreen,
      fontSize: state.fontSize || 48,
      fontFamily: state.fontFamily || 'font-sans',
      alignment: state.alignment || 'center',
      activeType: state.activeType || 'song',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn('Failed to publish presentation state to Firestore:', error);
  }
}

/**
 * Publishes the presentation state to both BroadcastChannel and localStorage
 */
export function publishPresentationState(state: PresentationState) {
  if (typeof window === 'undefined') return;

  // Save to localStorage so if the presentation window is refreshed, it recovers state
  localStorage.setItem('eci_presentation_state', JSON.stringify(state));

  // Send via BroadcastChannel for real-time performance
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(state);
    } catch (e) {
      console.error('Error posting presentation state to channel:', e);
    }
  }

  // Dispatch a storage event manually in case on the same page/window context
  try {
    const event = new Event('storage');
    window.dispatchEvent(event);
  } catch (e) {}

  // Publish to Firestore in the background for remote/external TV presentation sync
  publishPresentationStateToFirestore(state);
}

/**
 * Retrieves the current persisted state
 */
export function getPresentationState(): PresentationState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  const raw = localStorage.getItem('eci_presentation_state');
  if (!raw) return DEFAULT_STATE;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed };
  } catch (e) {
    return DEFAULT_STATE;
  }
}

/**
 * Open the presentation window in fullscreen/popup configuration
 */
export function openPresentationWindow(): Window | null {
  if (typeof window === 'undefined') return null;
  
  const url = `${window.location.origin}${window.location.pathname}?mode=presentation`;
  const name = 'eci-presentation-window';
  const features = 'width=1024,height=768,menubar=no,toolbar=no,location=no,status=no,personalbar=no';
  
  const win = window.open(url, name, features);
  if (win) {
    win.focus();
  }
  return win;
}
