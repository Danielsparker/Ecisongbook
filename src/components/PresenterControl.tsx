import { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Play, 
  Square, 
  Tv, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sun, 
  Moon, 
  X, 
  Maximize, 
  Eye, 
  EyeOff,
  Music,
  Settings,
  HelpCircle,
  BookOpen,
  Copy,
  Check,
  Wifi,
  QrCode,
  Layers,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { Song, BibleVerse } from '../types';
import { 
  getPresentationState, 
  publishPresentationState, 
  clearPresentationState,
  splitLyricsToSlides, 
  DEFAULT_STATE, 
  openPresentationWindow,
  PresentationState
} from '../services/presentationService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PresenterControlProps {
  songs: Song[];
  initialActiveSong: Song | null;
  onExit: () => void;
  isDarkMode: boolean;
}

export function PresenterControl({ songs, initialActiveSong, onExit, isDarkMode }: PresenterControlProps) {
  const [activeSong, setActiveSong] = useState<Song | null>(initialActiveSong);
  const [activeTab, setActiveTab] = useState<'songs' | 'bible' | 'promiseVerse'>('songs');
  const [promiseVerses, setPromiseVerses] = useState<any[]>([]);
  const [showPromiseVerseMenu, setShowPromiseVerseMenu] = useState(false);

  // Fetch promise verses for quick presentation in left panel
  useEffect(() => {
    const q = query(collection(db, 'promiseVerses'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPromiseVerses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return () => unsub();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePresentPromiseVerse = (pv: any) => {
    const updated: PresentationState = {
      ...presState,
      title: pv.title || pv.reference || 'Promise Verse',
      subtitle: pv.reference || `Monthly Promise Verse (${pv.month || ''})`,
      slides: [pv.reference || pv.title || 'Promise Verse'],
      currentSlideIndex: 0,
      activeType: 'promiseVerse',
      promiseVerseUrl: pv.imageUrl,
      promiseVerseReference: pv.reference || '',
      blackScreen: false,
      isExited: false,
    };
    setPresState(updated);
    publishPresentationState(updated);
  };
  
  // Local presentation state mimicking the remote projector state
  const [presState, setPresState] = useState<PresentationState>(() => {
    const saved = getPresentationState();
    const baseState = {
      ...saved,
      isExited: false,
      blackScreen: false,
    };
    // If we have an initial active song, load it up!
    if (initialActiveSong) {
      const slides = splitLyricsToSlides(initialActiveSong.lyrics);
      return {
        ...baseState,
        title: initialActiveSong.title,
        subtitle: `Song #${initialActiveSong.songNo}`,
        slides: slides,
        currentSlideIndex: 0,
        activeType: 'song'
      };
    }
    // If saved state has no slides and songs are available, auto-load the first song
    if ((!saved.slides || saved.slides.length === 0) && songs && songs.length > 0) {
      const firstSong = songs[0];
      const slides = splitLyricsToSlides(firstSong.lyrics);
      return {
        ...baseState,
        title: firstSong.title,
        subtitle: `Song #${firstSong.songNo}`,
        slides: slides,
        currentSlideIndex: 0,
        activeType: 'song'
      };
    }
    return baseState;
  });

  const [projectorWindow, setProjectorWindow] = useState<Window | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [instructionsTab, setInstructionsTab] = useState<'cloud' | 'hdmi' | 'multi'>('cloud');

  const isLightCanvas = presState.theme === 'light';

  const alignmentClass = {
    left: 'text-left justify-start items-start',
    center: 'text-center justify-center items-center',
    right: 'text-right justify-end items-end',
  }[presState.alignment || 'center'] || 'text-center justify-center items-center';

  const fontClass = {
    'font-baloo': 'font-baloo',
    'font-anek': 'font-anek',
    'font-tiro': 'font-tiro',
    'font-sans': 'font-sans',
    'font-serif': 'font-serif font-medium',
    'font-mono': 'font-mono',
  }[presState.fontFamily || 'font-baloo'] || 'font-baloo';

  const projectorUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?mode=presentation`;
  }, []);

  // Sync state initially and whenever changes are made
  useEffect(() => {
    publishPresentationState(presState);
  }, [presState]);

  // Load active song slides
  useEffect(() => {
    if (activeSong) {
      if (activeSong.songNo === 0 && presState.activeType === 'promiseVerse') {
        return;
      }
      const slides = splitLyricsToSlides(activeSong.lyrics);
      setPresState(prev => ({
        ...prev,
        title: activeSong.title,
        subtitle: `Song #${activeSong.songNo}`,
        slides: slides,
        currentSlideIndex: 0,
        activeType: 'song'
      }));
    }
  }, [activeSong]);

  // Handle global keydown events for slide controls and blackout
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toLowerCase();

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (key === 'b') {
        e.preventDefault();
        toggleBlackout();
      } else if (key === 'f') {
        e.preventDefault();
        toggleProjectorFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presState]);

  // Filter songs
  const filteredSongs = useMemo(() => {
    if (!searchQuery) return songs;
    const lower = searchQuery.toLowerCase();
    return songs.filter(s => 
      s.title.toLowerCase().includes(lower) || 
      s.genre.toLowerCase().includes(lower) || 
      s.songNo.toString().includes(lower)
    );
  }, [songs, searchQuery]);

  // Slide navigation
  const handleSelectSlide = (index: number) => {
    setPresState(prev => ({
      ...prev,
      currentSlideIndex: index,
      // Turn off blackscreen if navigating to a specific slide manually
      blackScreen: false 
    }));
  };

  const handleNext = () => {
    if (presState.currentSlideIndex < presState.slides.length - 1) {
      setPresState(prev => ({
        ...prev,
        currentSlideIndex: prev.currentSlideIndex + 1,
        blackScreen: false
      }));
    }
  };

  const handlePrev = () => {
    if (presState.currentSlideIndex > 0) {
      setPresState(prev => ({
        ...prev,
        currentSlideIndex: prev.currentSlideIndex - 1,
        blackScreen: false
      }));
    }
  };

  const toggleBlackout = () => {
    setPresState(prev => ({
      ...prev,
      blackScreen: !prev.blackScreen
    }));
  };

  const toggleProjectorTheme = () => {
    setPresState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  const handleAlignmentChange = (align: 'left' | 'center' | 'right') => {
    setPresState(prev => ({ ...prev, alignment: align }));
  };

  const handleFontFamilyChange = (family: string) => {
    setPresState(prev => ({ ...prev, fontFamily: family }));
  };

  const handleFontSizeChange = (size: number) => {
    setPresState(prev => ({ ...prev, fontSize: size }));
  };

  const handleLaunchProjector = () => {
    const activeState = { ...presState, isExited: false, blackScreen: false };
    setPresState(activeState);
    publishPresentationState(activeState);
    const win = openPresentationWindow();
    setProjectorWindow(win);
  };

  const handleExit = () => {
    // Instantly clear presentation state in Firebase, BroadcastChannel, and LocalStorage
    clearPresentationState();

    // Close local projector window if opened
    if (projectorWindow && !projectorWindow.closed) {
      try {
        projectorWindow.close();
      } catch (e) {
        console.warn("Could not close projector window:", e);
      }
    }

    onExit();
  };

  const toggleProjectorFullscreen = () => {
    // If window is open, try requesting fullscreen in that window
    if (projectorWindow && !projectorWindow.closed) {
      try {
        projectorWindow.document.documentElement.requestFullscreen();
      } catch (e) {
        console.warn("Fullscreen request on popup window blocked or unsupported", e);
        alert("To make fullscreen, click on the Projector tab/window and press 'F' on your keyboard.");
      }
    } else {
      alert("No active projector screen opened! Click 'Launch Projector Screen' first, move it to your secondary display/projector, and press F to go fullscreen.");
    }
  };

  // Bible search placeholders (for Modular/Future bible implementation!)
  const [bibleBook, setBibleBook] = useState('Genesis');
  const [bibleChapter, setBibleChapter] = useState(1);
  const [bibleVerse, setBibleVerse] = useState(1);
  const [bibleText, setBibleText] = useState('In the beginning God created the heaven and the earth.');

  const handleProjectBible = () => {
    setPresState(prev => ({
      ...prev,
      title: `${bibleBook} ${bibleChapter}:${bibleVerse}`,
      subtitle: 'Holy Bible',
      slides: [bibleText],
      currentSlideIndex: 0,
      activeType: 'bible',
      blackScreen: false
    }));
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 text-slate-100 flex flex-col p-4 font-sans select-none antialiased">
      {/* Header Bar */}
      <header className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <Tv className="h-6 w-6 text-brand-500 animate-pulse" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Presenter Control Center 
              <Badge variant="outline" className="border-brand-500/30 text-brand-400 bg-brand-950/20 text-xs py-0 px-2 rounded-full font-mono">
                Live Console
              </Badge>
            </h1>
            <p className="text-xs text-slate-400">ECI worship slide manager & worship control interface</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          {/* Promise Verse Option Button (In front of Blackout Screen) */}
          <div 
            className="relative"
            onMouseEnter={() => setShowPromiseVerseMenu(true)}
            onMouseLeave={() => setShowPromiseVerseMenu(false)}
          >
            <Button 
              onClick={() => setShowPromiseVerseMenu(!showPromiseVerseMenu)}
              variant="ghost"
              size="sm"
              className={`gap-2 h-9 rounded-xl font-semibold transition-all border ${
                presState.activeType === 'promiseVerse'
                  ? '!bg-amber-600 hover:!bg-amber-500 !text-white border-amber-400 shadow-lg shadow-amber-900/30'
                  : '!bg-slate-800 hover:!bg-slate-700 !text-slate-100 border-slate-700 hover:border-slate-600'
              }`}
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              Promise Verse
              {promiseVerses.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] bg-slate-900/80 text-amber-300 rounded-full border border-amber-500/30 font-mono">
                  {promiseVerses.length}
                </span>
              )}
            </Button>

            {showPromiseVerseMenu && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center pb-2.5 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Promise Verse Wallpapers</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 bg-amber-950/20">
                    {promiseVerses.length} Available
                  </Badge>
                </div>

                {promiseVerses.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {promiseVerses.map((verse) => {
                      const isActive = presState.activeType === 'promiseVerse' && presState.promiseVerseUrl === verse.imageUrl;
                      return (
                        <div
                          key={verse.id || verse.imageUrl}
                          onClick={() => {
                            handlePresentPromiseVerse(verse);
                            setShowPromiseVerseMenu(false);
                          }}
                          className={`group relative flex items-center gap-3 p-2 rounded-xl border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-950/50 ring-1 ring-amber-500/50'
                              : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-amber-500/40'
                          }`}
                        >
                          <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                            <img
                              src={verse.imageUrl}
                              alt={verse.title || 'Promise Verse'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            {isActive ? (
                              <div className="absolute inset-0 bg-amber-950/70 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                                  LIVE
                                </span>
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Play className="w-5 h-5 text-amber-400 fill-amber-400/30" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h5 className="text-xs font-bold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                              {verse.title || 'Promise Verse'}
                            </h5>
                            {verse.reference && (
                              <p className="text-[11px] text-amber-400/90 font-medium truncate">
                                {verse.reference}
                              </p>
                            )}
                            {verse.month && (
                              <p className="text-[10px] text-slate-400 truncate">
                                {verse.month}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">
                            <Button size="sm" className={`h-7 px-2.5 rounded-lg text-xs font-bold ${
                              isActive 
                                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                                : 'bg-slate-800 text-slate-200 hover:bg-amber-500 hover:text-slate-950'
                            }`}>
                              {isActive ? 'Live' : 'Present'}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 px-3 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-2">
                    <Sparkles className="h-8 w-8 text-amber-400/60 mx-auto animate-pulse" />
                    <p className="text-xs text-slate-200 font-semibold">No Promise Verses Uploaded Yet</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Upload your monthly promise verse wallpaper images in the <span className="text-amber-400 font-semibold">Promise Verse</span> manager tab to select and present them here in full screen.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button 
            onClick={toggleBlackout} 
            variant="ghost"
            size="sm"
            className={`gap-2 h-9 rounded-xl font-semibold transition-all border ${
              presState.blackScreen 
                ? '!bg-rose-600 hover:!bg-rose-700 !text-white border-rose-500 animate-pulse shadow-lg shadow-rose-900/30' 
                : '!bg-slate-800 hover:!bg-slate-700 !text-slate-100 border-slate-700 hover:border-slate-600'
            }`}
          >
            {presState.blackScreen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {presState.blackScreen ? "Blackout Active" : "Blackout Screen"}
          </Button>

          <Button 
            onClick={handleLaunchProjector} 
            className="gap-2 h-9 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-lg shadow-brand-900/20"
            size="sm"
          >
            <Tv className="h-4 w-4" />
            Launch Projector Screen
          </Button>

          <Button 
            onClick={() => setShowInstructions(!showInstructions)} 
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          <Button 
            onClick={handleExit} 
            variant="ghost"
            size="sm"
            className="gap-1 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          >
            <X className="h-4 w-4" />
            Exit Presenter
          </Button>
        </div>
      </header>

      {/* Dynamic multi-screen and instructions overlay */}
      {showInstructions && (
        <Card className="mb-6 border-brand-500/30 bg-slate-900/95 text-slate-300 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 p-4 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Tv className="h-5 w-5 text-brand-400 animate-pulse" />
                Church Screen Projection & Multi-TV Setup Hub
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Configure ECI Song Book to display lyrics slides on 1, 2, 3 or more TVs/Projectors simultaneously.
              </CardDescription>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <Button
                onClick={() => {
                  publishPresentationState(presState);
                  openPresentationWindow(true); // Open brand-new independent window!
                }}
                variant="outline"
                size="sm"
                className="text-xs h-8 rounded-lg bg-brand-950/30 border-brand-500/30 text-brand-400 hover:text-white hover:bg-brand-900/30 transition-all"
              >
                <Layers className="h-3.5 w-3.5 mr-1" />
                Launch Extra Projector Window
              </Button>
            </div>
          </div>
          
          <CardContent className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left column: Synced Link & QR Code */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">Live Synced Projector Link</h4>
                  <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                    Open this URL on any device connected to your church TVs (e.g. Smart TVs, phones, laptops) to mirror the lyrics in real time over the cloud!
                  </p>
                  
                  <div className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={projectorUrl}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-brand-400 font-mono select-all focus:outline-none"
                    />
                    <Button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(projectorUrl);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        } catch (e) {}
                      }}
                      variant="secondary"
                      size="sm"
                      className="h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs gap-1 text-slate-200 shrink-0"
                    >
                      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                  <div className="bg-white p-1 rounded-lg shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(projectorUrl)}`} 
                      alt="Projector QR Code" 
                      className="w-20 h-20"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5 text-brand-400" />
                      Scan QR Code on Smart TV
                    </h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Scan with any smartphone, tablet, or Smart TV camera to instantly load the live lyrics slide view.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Right column: Tabs explaining methods */}
              <div className="lg:col-span-7 flex flex-col space-y-3">
                <div className="flex border-b border-slate-800 pb-1 gap-1">
                  <button
                    onClick={() => setInstructionsTab('cloud')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-1.5 ${
                      instructionsTab === 'cloud' 
                        ? 'border-brand-500 text-brand-400 bg-brand-950/10 font-bold' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ☁️ Cloud Sync (Wireless)
                  </button>
                  <button
                    onClick={() => setInstructionsTab('hdmi')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-1.5 ${
                      instructionsTab === 'hdmi' 
                        ? 'border-brand-500 text-brand-400 bg-brand-950/10 font-bold' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🔌 HDMI Splitter Setup
                  </button>
                  <button
                    onClick={() => setInstructionsTab('multi')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 -mb-1.5 ${
                      instructionsTab === 'multi' 
                        ? 'border-brand-500 text-brand-400 bg-brand-950/10 font-bold' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🖥️ Multi-Display Extended
                  </button>
                </div>
                
                <div className="flex-1 bg-slate-950/30 p-4 rounded-xl border border-slate-800 text-xs min-h-[140px] flex flex-col justify-center">
                  {instructionsTab === 'cloud' && (
                    <div className="space-y-2">
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <Wifi className="h-4 w-4 text-brand-400" />
                        Wireless Cloud Synchronization (Best for 3+ TVs)
                      </p>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                        <li><strong>No physical cables or HDMI splitters needed!</strong></li>
                        <li>Simply copy the Projector Link above and open it in the built-in web browser of your Smart TVs, Firesticks, Apple TVs, or secondary laptops connected to each TV.</li>
                        <li>Because this app is backed by a <strong>real-time Firestore database</strong>, all TVs will stay in perfect millisecond synchronization as you change slides on this controller screen!</li>
                      </ul>
                    </div>
                  )}
                  
                  {instructionsTab === 'hdmi' && (
                    <div className="space-y-2">
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <span>🔌</span> HDMI Distribution Splitter (Traditional Setup)
                      </p>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                        <li>Connect your main operator computer to an <strong>HDMI Splitter box (1 input to 3 outputs)</strong> using an HDMI cable.</li>
                        <li>Connect the 3 TVs to the 3 output ports of the HDMI splitter.</li>
                        <li>In your computer's Display settings, choose <strong>"Extend Desktop"</strong>.</li>
                        <li>Click <strong>Launch Projector Screen</strong>, drag that window onto the extended screen, click inside it, and press <strong>F</strong> (or click F11) for full screen. The splitter will automatically mirror it to all 3 TVs!</li>
                      </ul>
                    </div>
                  )}
                  
                  {instructionsTab === 'multi' && (
                    <div className="space-y-2">
                      <p className="font-semibold text-white flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-brand-400" />
                        Independent Extended screens (PowerPoint / Verse View style)
                      </p>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-400">
                        <li>If your computer detects each TV as a separate extended display (e.g., Extended Screen 1, Screen 2, Screen 3):</li>
                        <li>Click the <strong>"Launch Extra Projector Window"</strong> button at the top right of this guide 3 times.</li>
                        <li>You will get 3 separate projector windows. Drag one window onto each of the 3 extended TVs.</li>
                        <li>Click inside each window and press <strong>F</strong> to make them full screen. All of them will instantly sync with your controls!</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 font-mono text-[10px] text-brand-400">
                  <div className="flex items-center gap-1">
                    <span className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">Space / →</span>
                    <span>Next Slide</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">←</span>
                    <span>Prev Slide</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">B</span>
                    <span>Blackout</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="bg-slate-800 px-1 py-0.5 rounded text-slate-300">F</span>
                    <span>Fullscreen</span>
                  </div>
                </div>

              </div>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
        
        {/* Left Side: Playlist / Song list Finder */}
        <aside className="col-span-12 lg:col-span-3 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col overflow-hidden">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter songs by title/no..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <Tabs defaultValue="songs" className="w-full flex-1 flex flex-col overflow-hidden" onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl grid grid-cols-3 mb-3">
              <TabsTrigger value="songs" className="rounded-lg text-xs font-semibold py-1.5 data-[state=active]:bg-brand-600 data-[state=active]:text-white">
                <Music className="h-3 w-3 mr-1" />
                Songs
              </TabsTrigger>
              <TabsTrigger value="bible" className="rounded-lg text-xs font-semibold py-1.5 data-[state=active]:bg-brand-600 data-[state=active]:text-white">
                <BookOpen className="h-3 w-3 mr-1" />
                Bible
              </TabsTrigger>
              <TabsTrigger value="promiseVerse" className="rounded-lg text-xs font-semibold py-1.5 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Promise
              </TabsTrigger>
            </TabsList>

            <TabsContent value="songs" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="space-y-1.5 pr-2">
                  {filteredSongs.map((song) => (
                    <button
                      key={song.id || song.songNo}
                      onClick={() => setActiveSong(song)}
                      className={`w-full text-left p-3 rounded-xl transition-all border ${
                        activeSong?.songNo === song.songNo
                          ? 'bg-brand-950/40 border-brand-500/50 text-white shadow-md'
                          : 'bg-slate-900/50 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-0.5">
                        <span className={`text-xs font-mono font-bold ${activeSong?.songNo === song.songNo ? 'text-brand-400' : 'text-slate-500'}`}>
                          #{song.songNo}
                        </span>
                        {song.genre && <span className="text-[10px] uppercase tracking-wider text-slate-500">{song.genre}</span>}
                      </div>
                      <div className="font-semibold text-sm truncate">{song.title}</div>
                    </button>
                  ))}
                  {filteredSongs.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500">No matching songs found</div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="bible" className="flex-1 overflow-hidden m-0 space-y-4">
              <div className="space-y-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bible Book</label>
                  <select 
                    value={bibleBook}
                    onChange={(e) => setBibleBook(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Genesis">Genesis</option>
                    <option value="Exodus">Exodus</option>
                    <option value="Psalms">Psalms</option>
                    <option value="Proverbs">Proverbs</option>
                    <option value="Matthew">Matthew</option>
                    <option value="John">John</option>
                    <option value="Romans">Romans</option>
                    <option value="Revelation">Revelation</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Chapter</label>
                    <input 
                      type="number" 
                      value={bibleChapter}
                      onChange={(e) => setBibleChapter(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Verse</label>
                    <input 
                      type="number" 
                      value={bibleVerse}
                      onChange={(e) => setBibleVerse(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Verse Text</label>
                  <textarea 
                    value={bibleText}
                    onChange={(e) => setBibleText(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <Button onClick={handleProjectBible} className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs gap-1.5 h-8 font-semibold">
                  <Play className="h-3 w-3 fill-current" />
                  Project Verse Now
                </Button>
              </div>
              <div className="text-[11px] text-slate-500 italic p-1">
                Tip: You can also project live scriptures directly from the main "Bible" tab reader screen!
              </div>
            </TabsContent>

            <TabsContent value="promiseVerse" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full">
                <div className="space-y-2 pr-2">
                  {promiseVerses.map((pv) => (
                    <div
                      key={pv.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                        <img src={pv.imageUrl} alt={pv.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                          <div className="text-xs font-bold text-white truncate">{pv.title}</div>
                          <div className="text-[10px] text-amber-300 font-medium truncate">{pv.reference || pv.month}</div>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          const updated = {
                            ...presState,
                            title: pv.title,
                            subtitle: pv.reference || `Monthly Promise Verse (${pv.month || ''})`,
                            slides: [],
                            currentSlideIndex: 0,
                            activeType: 'promiseVerse' as const,
                            promiseVerseUrl: pv.imageUrl,
                            promiseVerseReference: pv.reference,
                            blackScreen: false,
                            isExited: false,
                          };
                          setPresState(updated);
                          publishPresentationState(updated);
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs h-7 gap-1 cursor-pointer"
                      >
                        <Play className="h-3 w-3 fill-current" /> Project Wallpaper Now
                      </Button>
                    </div>
                  ))}
                  {promiseVerses.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No promise verse wallpapers uploaded yet. Visit the Promise Verse section to add one!
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>

        {/* Center Section: Active Presentation Control Panel */}
        <section className="col-span-12 lg:col-span-6 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col overflow-hidden">
          
          {/* Active Title Indicator */}
          <div className="flex justify-between items-center mb-4 shrink-0 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] font-bold font-mono text-brand-400 uppercase tracking-widest">{presState.subtitle || 'Active'}</span>
              <h2 className="text-base font-bold text-white truncate max-w-sm">{presState.title || 'No song selected'}</h2>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Slide {presState.slides.length > 0 ? presState.currentSlideIndex + 1 : 0} of {presState.slides.length}
            </div>
          </div>

          {/* Current Slide Big Visual Preview Card */}
          <div className={`mb-4 shrink-0 relative aspect-[16/9] border rounded-xl overflow-hidden flex flex-col justify-between p-4 shadow-inner transition-colors duration-300 ${
            isLightCanvas 
              ? 'bg-white border-slate-300 text-slate-900' 
              : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex justify-between items-center text-[10px] uppercase font-mono tracking-wider ${
              isLightCanvas ? 'text-slate-600 font-medium' : 'opacity-40 text-slate-300'
            }`}>
              <span>{presState.subtitle || 'Projection Preview'}</span>
              <span className="font-bold flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isLightCanvas ? 'bg-amber-500' : 'bg-brand-500'} animate-pulse`} />
                LIVE OUTPUT PREVIEW ({isLightCanvas ? 'LIGHT CANVAS' : 'DARK CANVAS'})
              </span>
            </div>
            
            <div 
              className={`flex-1 flex ${alignmentClass} py-2 px-4 ${presState.blackScreen ? 'opacity-0' : 'opacity-100'}`} 
              style={{ transition: 'opacity 0.2s' }}
            >
              {presState.activeType === 'promiseVerse' && presState.promiseVerseUrl ? (
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                  <img 
                    src={presState.promiseVerseUrl} 
                    alt={presState.title || 'Promise Verse Wallpaper'} 
                    className="max-h-full max-w-full object-contain rounded-lg shadow-lg border border-slate-700/50" 
                  />
                </div>
              ) : (
                <p 
                  className={`${fontClass} italic max-w-xl break-words whitespace-pre-wrap leading-snug transition-all duration-200 ${
                    isLightCanvas ? 'text-slate-900 font-semibold' : 'text-white'
                  }`}
                  style={{ fontSize: `${Math.max(14, Math.min(42, Math.round((presState.fontSize || 48) * 0.45)))}px` }}
                >
                  {presState.slides[presState.currentSlideIndex] || '--- Screen Blank ---'}
                </p>
              )}
            </div>

            {presState.blackScreen && (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                <Badge variant="destructive" className="animate-pulse tracking-widest text-xs uppercase rounded-full px-3 py-1 font-mono font-bold">
                  BLACKOUT SCREEN ACTIVE
                </Badge>
              </div>
            )}

            <div className={`flex justify-between items-center text-[10px] font-mono ${
              isLightCanvas ? 'text-slate-600 font-medium' : 'opacity-40 text-slate-300'
            }`}>
              <span className="truncate max-w-xs">{presState.title || 'Ready'}</span>
              <span>{presState.slides.length > 0 ? `${presState.currentSlideIndex + 1} / ${presState.slides.length}` : '0 / 0'}</span>
            </div>
          </div>

          {/* Interactive Slides Grid List */}
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 shrink-0">Click to Select Slide:</h3>
          <ScrollArea className="flex-1 bg-slate-900/30 rounded-xl border border-slate-800/80 p-3 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-2">
              {presState.slides.map((slide, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSlide(idx)}
                  className={`relative p-4 rounded-xl text-left border transition-all h-28 flex flex-col justify-between overflow-hidden group ${
                    presState.currentSlideIndex === idx && !presState.blackScreen
                      ? isLightCanvas
                        ? 'bg-amber-100/90 border-amber-500 text-slate-950 ring-2 ring-amber-400/50 shadow-md font-semibold'
                        : 'bg-brand-950/20 border-brand-500 text-white ring-2 ring-brand-500/30 shadow-md shadow-brand-950/35'
                      : isLightCanvas
                        ? 'bg-slate-100 border-slate-300 hover:border-slate-400 text-slate-900'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className={`absolute top-2 right-3 text-[10px] font-bold font-mono ${
                    isLightCanvas ? 'text-slate-500' : 'text-slate-500 group-hover:text-slate-400'
                  }`}>
                    Slide {idx + 1}
                  </span>
                  
                  <div className={`text-xs leading-relaxed line-clamp-3 ${fontClass} font-medium mt-3 whitespace-pre-wrap ${
                    isLightCanvas ? 'text-slate-900 font-semibold' : ''
                  }`}>
                    {slide}
                  </div>
                  
                  <div className={`mt-1 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider ${
                    isLightCanvas ? 'text-slate-600' : 'text-slate-500'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isLightCanvas ? 'bg-amber-500' : 'bg-brand-500'}`} />
                    ECI LYRIC BLOCK
                  </div>
                </button>
              ))}
              {presState.slides.length === 0 && (
                <div className="col-span-2 text-center py-12 text-sm text-slate-500 font-medium">
                  Select a song from the list to display slides here
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Slide Switcher Controls Bottom bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center shrink-0">
            <Button
              onClick={handlePrev}
              disabled={presState.currentSlideIndex === 0}
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-xl border border-slate-700 !bg-slate-800 !text-slate-100 hover:!bg-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" /> Prev Slide
            </Button>
            
            <span className="text-xs font-mono font-bold text-slate-400">
              SLIDE {presState.slides.length > 0 ? presState.currentSlideIndex + 1 : 0} OF {presState.slides.length}
            </span>

            <Button
              onClick={handleNext}
              disabled={presState.currentSlideIndex >= presState.slides.length - 1}
              variant="ghost"
              size="sm"
              className="gap-1.5 rounded-xl border border-slate-700 !bg-slate-800 !text-slate-100 hover:!bg-slate-700 disabled:opacity-30"
            >
              Next Slide <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Right Section: Presentation Controls & Screen adjustments */}
        <section className="col-span-12 lg:col-span-3 space-y-4 overflow-y-auto">
          
          {/* Theme Adjustments */}
          <Card className="bg-slate-950 border-slate-800 rounded-2xl text-slate-200">
            <CardHeader className="py-4">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projector Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setPresState(p => ({ ...p, theme: 'dark' }))}
                  variant="ghost"
                  className={`rounded-xl text-xs gap-2 transition-all border ${
                    presState.theme === 'dark' 
                      ? '!bg-brand-950/80 border-brand-500 !text-brand-400 shadow-inner font-bold' 
                      : '!bg-slate-900 border-slate-800 !text-slate-300 hover:!text-slate-100 hover:!bg-slate-800'
                  }`}
                >
                  <Moon className="h-4 w-4" /> Dark Canvas
                </Button>
                <Button
                  onClick={() => setPresState(p => ({ ...p, theme: 'light' }))}
                  variant="ghost"
                  className={`rounded-xl text-xs gap-2 transition-all border ${
                    presState.theme === 'light' 
                      ? '!bg-amber-400 border-amber-300 !text-slate-950 font-bold shadow-md' 
                      : '!bg-slate-900 border-slate-800 !text-slate-300 hover:!text-slate-100 hover:!bg-slate-800'
                  }`}
                >
                  <Sun className="h-4 w-4" /> Light Canvas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Typography Settings */}
          <Card className="bg-slate-950 border-slate-800 rounded-2xl text-slate-200">
            <CardHeader className="py-4">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projector Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Font Family & Tamil Fonts */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Typography & Tamil Fonts</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
                  <button 
                    onClick={() => handleFontFamilyChange('font-baloo')}
                    className={`py-2 px-2.5 rounded-lg font-baloo text-left transition-all ${presState.fontFamily === 'font-baloo' ? 'bg-brand-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <div className="text-[11px] font-bold">Baloo Thambi</div>
                    <div className="text-[9px] opacity-75 truncate">பாலூ தம்பி</div>
                  </button>
                  <button 
                    onClick={() => handleFontFamilyChange('font-anek')}
                    className={`py-2 px-2.5 rounded-lg font-anek text-left transition-all ${presState.fontFamily === 'font-anek' ? 'bg-brand-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <div className="text-[11px] font-bold">Anek Tamil</div>
                    <div className="text-[9px] opacity-75 truncate">அனேக் தமிழ்</div>
                  </button>
                  <button 
                    onClick={() => handleFontFamilyChange('font-tiro')}
                    className={`py-2 px-2.5 rounded-lg font-tiro text-left transition-all ${presState.fontFamily === 'font-tiro' ? 'bg-brand-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <div className="text-[11px] font-bold">Tiro Tamil</div>
                    <div className="text-[9px] opacity-75 truncate">திரோ தமிழ்</div>
                  </button>
                  <button 
                    onClick={() => handleFontFamilyChange('font-sans')}
                    className={`py-2 px-2.5 rounded-lg font-sans text-left transition-all ${presState.fontFamily === 'font-sans' ? 'bg-brand-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <div className="text-[11px] font-bold">Standard Sans</div>
                    <div className="text-[9px] opacity-75">Clean System</div>
                  </button>
                </div>
              </div>

              {/* Font Weight */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Font Weight (Boldness)</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                  <button 
                    onClick={() => setPresState(prev => ({ ...prev, fontWeight: '800' }))}
                    className={`py-1.5 rounded-lg font-extrabold text-center ${presState.fontWeight === '800' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Extra Bold
                  </button>
                  <button 
                    onClick={() => setPresState(prev => ({ ...prev, fontWeight: '700' }))}
                    className={`py-1.5 rounded-lg font-bold text-center ${presState.fontWeight === '700' || !presState.fontWeight ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Bold
                  </button>
                  <button 
                    onClick={() => setPresState(prev => ({ ...prev, fontWeight: '400' }))}
                    className={`py-1.5 rounded-lg font-normal text-center ${presState.fontWeight === '400' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Regular
                  </button>
                </div>
              </div>

              {/* Alignment */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Alignment</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                  <button 
                    onClick={() => handleAlignmentChange('left')}
                    className={`py-1.5 rounded-lg flex items-center justify-center ${presState.alignment === 'left' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleAlignmentChange('center')}
                    className={`py-1.5 rounded-lg flex items-center justify-center ${presState.alignment === 'center' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleAlignmentChange('right')}
                    className={`py-1.5 rounded-lg flex items-center justify-center ${presState.alignment === 'right' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    <AlignRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Font Size Slider & Quick Presets */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Font Size</label>
                  <span className="text-xs font-bold font-mono text-brand-400">{presState.fontSize || 48}px</span>
                </div>
                
                <div className="px-1 flex items-center gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleFontSizeChange(Math.max(20, (presState.fontSize || 48) - 4))}
                    className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center font-bold text-xs"
                    title="Decrease font size"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>

                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="2"
                    value={presState.fontSize || 48}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="flex-1 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none accent-brand-500"
                  />

                  <button
                    type="button"
                    onClick={() => handleFontSizeChange(Math.min(120, (presState.fontSize || 48) + 4))}
                    className="h-7 w-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center font-bold text-xs"
                    title="Increase font size"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-5 gap-1 text-[10px] font-mono">
                  {[32, 48, 64, 80, 96].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleFontSizeChange(size)}
                      className={`py-1 rounded-lg border text-center transition-all ${
                        presState.fontSize === size
                          ? '!bg-brand-600 border-brand-500 !text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Device Sync Info */}
          <Card className="bg-slate-950 border-slate-800 rounded-2xl text-slate-300">
            <CardHeader className="py-4">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Connection Status
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-3">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Local Channel</span>
                <span className="text-emerald-400 font-semibold font-mono">eci-presentation</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Worship Screen</span>
                <span className="text-brand-400 font-semibold font-mono">Ready to stream</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 pt-1">
                This utilizes a zero-latency modern browser network layer to broadcast changes to any connected display instantly without page refreshes.
              </p>
            </CardContent>
          </Card>

        </section>

      </div>
    </div>
  );
}
