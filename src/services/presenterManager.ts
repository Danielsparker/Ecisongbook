import { Song } from '../types';
import { 
  PresentationState, 
  DEFAULT_STATE, 
  getPresentationState, 
  publishPresentationState, 
  clearPresentationState,
  splitLyricsToSlides,
  setGlobalCanvasTheme,
  getStoredCanvasTheme
} from './presentationService';

export interface DisplayInfo {
  isExtended: boolean;
  screenCount: number;
  currentScreenLabel: string;
  externalScreenLabel?: string;
  hasPermission: boolean;
}

class PresenterWindowManager {
  private presenterWindow: Window | null = null;
  private screenDetails: any = null;
  private displayInfo: DisplayInfo = {
    isExtended: false,
    screenCount: 1,
    currentScreenLabel: 'Primary Display',
    hasPermission: false,
  };
  private listeners: Set<(info: DisplayInfo) => void> = new Set();
  private windowStatusListeners: Set<(isOpen: boolean) => void> = new Set();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initScreenManagement();
      this.startWindowWatcher();
    }
  }

  /**
   * Subscribe to display changes (connected/disconnected monitors)
   */
  public onDisplayChange(callback: (info: DisplayInfo) => void): () => void {
    this.listeners.add(callback);
    callback(this.displayInfo);
    return () => this.listeners.delete(callback);
  }

  /**
   * Subscribe to presenter window open/close status
   */
  public onWindowStatusChange(callback: (isOpen: boolean) => void): () => void {
    this.windowStatusListeners.add(callback);
    callback(this.isPresenterOpen());
    return () => this.windowStatusListeners.delete(callback);
  }

  private notifyDisplayListeners() {
    for (const cb of this.listeners) {
      try {
        cb(this.displayInfo);
      } catch (e) {
        console.error('Display listener error:', e);
      }
    }
  }

  private notifyWindowStatusListeners() {
    const open = this.isPresenterOpen();
    for (const cb of this.windowStatusListeners) {
      try {
        cb(open);
      } catch (e) {
        console.error('Window status listener error:', e);
      }
    }
  }

  /**
   * Starts a non-intrusive periodic check to update window open status
   */
  private startWindowWatcher() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => {
      if (this.presenterWindow && this.presenterWindow.closed) {
        this.presenterWindow = null;
        this.notifyWindowStatusListeners();
      }
    }, 1000);
  }

  /**
   * Initializes Window Management / Screen Details API
   */
  public async initScreenManagement(): Promise<DisplayInfo> {
    if (typeof window === 'undefined') return this.displayInfo;

    // Check modern Screen Details API (Window Management API)
    if ('getScreenDetails' in window) {
      try {
        // Query permission if available
        if (navigator.permissions && (navigator.permissions as any).query) {
          try {
            const status = await (navigator.permissions as any).query({ name: 'window-management' });
            if (status.state === 'granted') {
              this.screenDetails = await (window as any).getScreenDetails();
              this.setupScreenDetailsListeners();
            }
          } catch (permErr) {
            // Some browsers use 'window-placement' name
            try {
              const status = await (navigator.permissions as any).query({ name: 'window-placement' });
              if (status.state === 'granted') {
                this.screenDetails = await (window as any).getScreenDetails();
                this.setupScreenDetailsListeners();
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Screen details auto-init skipped (requires user gesture or unsupported):', err);
      }
    }

    this.updateDisplayInfoFromState();
    return this.displayInfo;
  }

  /**
   * Explicitly requests screen details permission on user gesture (click Present)
   */
  public async requestScreenDetails(): Promise<any> {
    if (typeof window === 'undefined') return null;

    if ('getScreenDetails' in window) {
      try {
        this.screenDetails = await (window as any).getScreenDetails();
        this.setupScreenDetailsListeners();
        this.updateDisplayInfoFromState();
        return this.screenDetails;
      } catch (err) {
        console.warn('User denied or browser cancelled Screen Details prompt:', err);
      }
    }
    this.updateDisplayInfoFromState();
    return null;
  }

  private setupScreenDetailsListeners() {
    if (!this.screenDetails) return;

    const handleScreensChange = () => {
      this.updateDisplayInfoFromState();
      this.handleMonitorConfigChange();
    };

    try {
      this.screenDetails.addEventListener('screenschange', handleScreensChange);
      this.screenDetails.addEventListener('currentscreenchange', handleScreensChange);
    } catch (e) {
      console.warn('Could not attach screenschange listener:', e);
    }
  }

  private updateDisplayInfoFromState() {
    if (this.screenDetails && this.screenDetails.screens) {
      const screens = this.screenDetails.screens;
      const current = this.screenDetails.currentScreen;
      const external = screens.find((s: any) => s !== current && (!s.isInternal || s.isExtended || !s.isPrimary))
        || screens.find((s: any) => s !== current);

      this.displayInfo = {
        isExtended: screens.length > 1,
        screenCount: screens.length,
        currentScreenLabel: current?.label || `Primary (${window.screen.width}x${window.screen.height})`,
        externalScreenLabel: external ? (external.label || `External (${external.width}x${external.height})`) : undefined,
        hasPermission: true,
      };
    } else {
      const isExtended = !!(window.screen as any).isExtended;
      this.displayInfo = {
        isExtended,
        screenCount: isExtended ? 2 : 1,
        currentScreenLabel: `Display (${window.screen.width}x${window.screen.height})`,
        externalScreenLabel: isExtended ? 'Extended Display' : undefined,
        hasPermission: false,
      };
    }

    this.notifyDisplayListeners();
  }

  /**
   * Gracefully handles monitor disconnect or reconnect while presentation window is open
   */
  private handleMonitorConfigChange() {
    if (!this.presenterWindow || this.presenterWindow.closed) return;

    try {
      // Check if external screen still exists
      const targetScreen = this.getOptimalExternalScreen();
      if (!targetScreen && this.displayInfo.screenCount === 1) {
        // External screen was disconnected! Reposition window to primary screen so it remains visible
        console.log('External monitor disconnected. Moving presenter window to primary display.');
        this.presenterWindow.moveTo(50, 50);
        this.presenterWindow.resizeTo(1024, 768);
        this.presenterWindow.focus();
      }
    } catch (e) {
      console.warn('Could not reposition presenter window after display change:', e);
    }
  }

  /**
   * Finds the best external screen for presentation
   */
  private getOptimalExternalScreen(): any | null {
    if (this.screenDetails && this.screenDetails.screens && this.screenDetails.screens.length > 1) {
      const current = this.screenDetails.currentScreen;
      const screens = this.screenDetails.screens;

      // 1. Prefer screen with isExtended or !isPrimary or !isInternal that is not current
      const external = screens.find((s: any) => s !== current && (!s.isInternal || s.isExtended || !s.isPrimary))
        || screens.find((s: any) => s !== current);

      if (external) return external;
    }
    return null;
  }

  /**
   * Checks whether the Presenter Window is currently open and accessible
   */
  public isPresenterOpen(): boolean {
    return !!(this.presenterWindow && !this.presenterWindow.closed);
  }

  /**
   * Gets current presenter window reference
   */
  public getPresenterWindow(): Window | null {
    if (this.presenterWindow && !this.presenterWindow.closed) {
      return this.presenterWindow;
    }
    return null;
  }

  /**
   * Core Presenter Window Opener:
   * - Enforces SINGLETON (never creates Presenter 1, 2, 3...)
   * - Auto-detects extended monitors
   * - Positions window directly on external monitor bounds
   * - Opens strictly presentation-only interface (?mode=presentation)
   */
  public async openPresenterWindow(options: { forceRecreate?: boolean } = {}): Promise<Window | null> {
    if (typeof window === 'undefined') return null;

    // 1. If window already exists and is open, REUSE and FOCUS IT!
    if (!options.forceRecreate && this.presenterWindow && !this.presenterWindow.closed) {
      try {
        this.presenterWindow.focus();
        this.notifyWindowStatusListeners();
        return this.presenterWindow;
      } catch (e) {
        console.warn('Failed focusing existing window, will recreate:', e);
      }
    }

    // 2. Request / update screen details
    let targetScreen = this.getOptimalExternalScreen();
    if (!targetScreen) {
      try {
        await this.requestScreenDetails();
        targetScreen = this.getOptimalExternalScreen();
      } catch (e) {}
    }

    // 3. Determine positioning coordinates
    let left = 100;
    let top = 100;
    let width = 1024;
    let height = 768;

    if (targetScreen) {
      // Position directly within the external display coordinate system
      left = targetScreen.availLeft ?? targetScreen.left ?? (window.screen.width);
      top = targetScreen.availTop ?? targetScreen.top ?? 0;
      width = targetScreen.width ?? targetScreen.availWidth ?? 1920;
      height = targetScreen.height ?? targetScreen.availHeight ?? 1080;
    } else {
      // If single display, center neatly on primary screen
      width = Math.min(1280, Math.floor(window.screen.availWidth * 0.85));
      height = Math.min(800, Math.floor(window.screen.availHeight * 0.85));
      left = Math.floor((window.screen.availWidth - width) / 2);
      top = Math.floor((window.screen.availHeight - height) / 2);
    }

    const url = `${window.location.origin}${window.location.pathname}?mode=presentation`;
    const windowName = 'eci_presenter_view_window';
    const features = `popup=yes,fullscreen=yes,left=${left},top=${top},width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,directories=no,personalbar=no,resizable=yes,scrollbars=no`;

    try {
      const win = window.open(url, windowName, features);
      if (win) {
        this.presenterWindow = win;
        win.focus();
        this.notifyWindowStatusListeners();

        // If on extended screen, tell window to attempt fullscreen on readiness
        if (targetScreen) {
          try {
            win.addEventListener('load', () => {
              try {
                win.postMessage({ type: 'REQUEST_AUTO_FULLSCREEN' }, '*');
              } catch (e) {}
            });
          } catch (e) {}
        }

        return win;
      }
    } catch (err) {
      console.error('Failed to open presentation window:', err);
    }

    return null;
  }

  /**
   * Closes the Presenter Window only (keeping Dashboard completely intact)
   */
  public closePresenterWindow(): void {
    if (this.presenterWindow && !this.presenterWindow.closed) {
      try {
        this.presenterWindow.close();
      } catch (e) {
        console.warn('Error closing presenter window:', e);
      }
    }
    this.presenterWindow = null;
    this.notifyWindowStatusListeners();
  }

  /**
   * Focuses the existing Presenter Window if open
   */
  public focusPresenterWindow(): void {
    if (this.presenterWindow && !this.presenterWindow.closed) {
      try {
        this.presenterWindow.focus();
      } catch (e) {}
    } else {
      this.openPresenterWindow();
    }
  }

  /**
   * Unified Entry Point for presenting Song Lyrics
   */
  public async presentSong(song: Song, autoOpen: boolean = true): Promise<void> {
    const slides = splitLyricsToSlides(song.lyrics);
    const currentState = getPresentationState();
    const currentTheme = getStoredCanvasTheme();

    const updatedState: PresentationState = {
      ...currentState,
      title: song.title,
      subtitle: song.songNo ? `Song #${song.songNo}` : (song.genre || 'ECI Song'),
      slides: slides,
      currentSlideIndex: 0,
      theme: currentTheme,
      blackScreen: false,
      activeType: 'song',
      isExited: false,
    };

    publishPresentationState(updatedState);

    if (autoOpen) {
      await this.openPresenterWindow();
    }
  }

  /**
   * Unified Entry Point for presenting Scripture Verse
   */
  public async presentVerse(
    reference: string, 
    version: string, 
    text: string, 
    autoOpen: boolean = true
  ): Promise<void> {
    const currentState = getPresentationState();
    const currentTheme = getStoredCanvasTheme();

    const updatedState: PresentationState = {
      ...currentState,
      title: reference,
      subtitle: version || 'Holy Bible',
      slides: [text],
      currentSlideIndex: 0,
      theme: currentTheme,
      blackScreen: false,
      activeType: 'bible',
      isExited: false,
    };

    publishPresentationState(updatedState);

    if (autoOpen) {
      await this.openPresenterWindow();
    }
  }

  /**
   * Unified Entry Point for presenting Promise Verse
   */
  public async presentPromiseVerse(pv: any, autoOpen: boolean = true): Promise<void> {
    const currentState = getPresentationState();
    const currentTheme = getStoredCanvasTheme();

    const updatedState: PresentationState = {
      ...currentState,
      title: pv.title || pv.reference || 'Monthly Promise Verse',
      subtitle: pv.reference || `Promise Verse (${pv.month || ''})`,
      slides: [pv.reference || pv.title || 'Promise Verse'],
      currentSlideIndex: 0,
      theme: currentTheme,
      promiseVerseUrl: pv.imageUrl,
      promiseVerseReference: pv.reference || '',
      blackScreen: false,
      activeType: 'promiseVerse',
      isExited: false,
    };

    publishPresentationState(updatedState);

    if (autoOpen) {
      await this.openPresenterWindow();
    }
  }

  /**
   * Opens / Focuses the full Presenter Control Center in a new Chrome tab
   */
  public openPresenterControlTab(songId?: string): Window | null {
    if (typeof window === 'undefined') return null;
    const searchParams = new URLSearchParams();
    searchParams.set('mode', 'control');
    if (songId) {
      searchParams.set('songId', songId);
    }
    const url = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
    const win = window.open(url, 'eci_presenter_control_tab');
    if (win) {
      try {
        win.focus();
      } catch (e) {}
    }
    return win;
  }

  /**
   * Opens / Focuses Presenter View (from Options menu or Header button)
   */
  public async openPresenterView(): Promise<Window | null> {
    return await this.openPresenterWindow();
  }

  /**
   * Ends presentation and resets state cleanly
   */
  public endPresentation(closeWindow: boolean = false): void {
    clearPresentationState();
    if (closeWindow) {
      this.closePresenterWindow();
    }
  }

  /**
   * Gets cached display information
   */
  public getDisplayInfo(): DisplayInfo {
    return this.displayInfo;
  }
}

export const presenterManager = new PresenterWindowManager();
