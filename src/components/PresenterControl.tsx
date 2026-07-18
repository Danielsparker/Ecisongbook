import { useState, useEffect, useMemo, useRef } from 'react';
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
  BookOpen
} from 'lucide-react';
import { Song, BibleVerse } from '../types';
import { 
  getPresentationState, 
  publishPresentationState, 
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
  const [activeTab, setActiveTab] = useState<'songs' | 'bible'>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local presentation state mimicking the remote projector state
  const [presState, setPresState] = useState<PresentationState>(() => {
    const saved = getPresentationState();
    // If we have an initial active song, load it up!
    if (initialActiveSong) {
      const slides = splitLyricsToSlides(initialActiveSong.lyrics);
      return {
        ...saved,
        title: initialActiveSong.title,
        subtitle: `Song #${initialActiveSong.songNo}`,
        slides: slides,
        currentSlideIndex: 0,
        activeType: 'song'
      };
    }
    return saved;
  });

  const [projectorWindow, setProjectorWindow] = useState<Window | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Sync state initially and whenever changes are made
  useEffect(() => {
    publishPresentationState(presState);
  }, [presState]);

  // Load active song slides
  useEffect(() => {
    if (activeSong) {
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
    publishPresentationState(presState);
    const win = openPresentationWindow();
    setProjectorWindow(win);
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
          <Button 
            onClick={toggleBlackout} 
            variant={presState.blackScreen ? "destructive" : "outline"}
            size="sm"
            className={`gap-2 h-9 rounded-xl font-semibold border-slate-700 hover:bg-slate-800 transition-all ${presState.blackScreen ? 'animate-pulse' : ''}`}
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
            onClick={onExit} 
            variant="ghost"
            size="sm"
            className="gap-1 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
          >
            <X className="h-4 w-4" />
            Exit Presenter
          </Button>
        </div>
      </header>

      {/* Dynamic instructions overlay */}
      {showInstructions && (
        <Card className="mb-4 border-brand-500/20 bg-brand-950/20 text-slate-300 rounded-2xl">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-bold text-white">How to Setup Dual Displays:</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p>1. Connect your laptop to your Projector, TV, or HDMI-equipped church display screen.</p>
            <p>2. Set your computer's display settings to <strong>Extend display</strong> (not Mirror/Duplicate).</p>
            <p>3. Click <strong>Launch Projector Screen</strong> above. A separate browser popup/window will open.</p>
            <p>4. Drag that new window to your extended screen/projector and click inside it, then press <strong>F</strong> on your keyboard to make it fullscreen.</p>
            <p>5. Control everything from this primary screen! You can use the keyboard shortcuts below:</p>
            <div className="grid grid-cols-2 gap-2 max-w-lg mt-2 pt-2 border-t border-slate-800 font-mono text-[10px] text-brand-400">
              <div>→ / Space: Next Slide</div>
              <div>←: Previous Slide</div>
              <div>B: Toggle Black Screen</div>
              <div>F: Toggle Fullscreen</div>
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
            <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl grid grid-cols-2 mb-3">
              <TabsTrigger value="songs" className="rounded-lg text-xs font-semibold py-1.5 data-[state=active]:bg-brand-600 data-[state=active]:text-white">
                <Music className="h-3 w-3 mr-1" />
                Song Book
              </TabsTrigger>
              <TabsTrigger value="bible" className="rounded-lg text-xs font-semibold py-1.5 data-[state=active]:bg-brand-600 data-[state=active]:text-white">
                <BookOpen className="h-3 w-3 mr-1" />
                Quick Bible
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
          <div className="mb-4 shrink-0 relative aspect-[16/9] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between p-4 shadow-inner">
            <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider opacity-40">
              <span>{presState.subtitle || 'Projection Preview'}</span>
              <span>LIVE OUTPUT PREVIEW</span>
            </div>
            
            <div className={`flex-1 flex justify-center items-center py-4 px-8 text-center text-white ${presState.blackScreen ? 'opacity-0' : 'opacity-100'}`} style={{ transition: 'opacity 0.2s' }}>
              <p className="text-base sm:text-lg md:text-xl font-serif italic max-w-md break-words whitespace-pre-wrap leading-relaxed">
                {presState.slides[presState.currentSlideIndex] || '--- Screen Blank ---'}
              </p>
            </div>

            {presState.blackScreen && (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <Badge variant="destructive" className="animate-pulse tracking-widest text-xs uppercase rounded-full px-3 py-1 font-mono font-bold">
                  BLACKOUT SCREEN ACTIVE
                </Badge>
              </div>
            )}

            <div className="flex justify-between items-center text-[10px] font-mono opacity-40">
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
                      ? 'bg-brand-950/20 border-brand-500 text-white ring-2 ring-brand-500/30 shadow-md shadow-brand-950/35'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="absolute top-2 right-3 text-[10px] font-bold font-mono text-slate-500 group-hover:text-slate-400">
                    Slide {idx + 1}
                  </span>
                  
                  <div className="text-xs leading-relaxed line-clamp-3 font-serif font-medium mt-3 whitespace-pre-wrap">
                    {slide}
                  </div>
                  
                  <div className="mt-1 flex items-center gap-1.5 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 group-hover:bg-brand-500" />
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
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl border-slate-800 text-slate-300 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" /> Prev Slide
            </Button>
            
            <span className="text-xs font-mono font-bold text-slate-400">
              SLIDE {presState.slides.length > 0 ? presState.currentSlideIndex + 1 : 0} OF {presState.slides.length}
            </span>

            <Button
              onClick={handleNext}
              disabled={presState.currentSlideIndex >= presState.slides.length - 1}
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl border-slate-800 text-slate-300 hover:text-white"
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
                  variant="outline"
                  className={`rounded-xl text-xs gap-2 ${presState.theme === 'dark' ? 'bg-brand-950/20 border-brand-500 text-white' : 'border-slate-800 text-slate-400'}`}
                >
                  <Moon className="h-4 w-4" /> Dark Canvas
                </Button>
                <Button
                  onClick={() => setPresState(p => ({ ...p, theme: 'light' }))}
                  variant="outline"
                  className={`rounded-xl text-xs gap-2 ${presState.theme === 'light' ? 'bg-brand-950/20 border-brand-500 text-white' : 'border-slate-800 text-slate-400'}`}
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
              
              {/* Font Family */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Font Style</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                  <button 
                    onClick={() => handleFontFamilyChange('font-sans')}
                    className={`py-1.5 rounded-lg font-sans font-semibold text-center ${presState.fontFamily === 'font-sans' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Sans
                  </button>
                  <button 
                    onClick={() => handleFontFamilyChange('font-serif')}
                    className={`py-1.5 rounded-lg font-serif font-semibold text-center ${presState.fontFamily === 'font-serif' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Serif
                  </button>
                  <button 
                    onClick={() => handleFontFamilyChange('font-mono')}
                    className={`py-1.5 rounded-lg font-mono text-center text-[10px] ${presState.fontFamily === 'font-mono' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Mono
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

              {/* Font Size Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Font Size</label>
                  <span className="text-xs font-bold font-mono text-brand-400">{presState.fontSize}px</span>
                </div>
                <div className="px-1 flex items-center gap-3">
                  <span className="text-xs text-slate-500">A</span>
                  <input
                    type="range"
                    min="24"
                    max="80"
                    step="2"
                    value={presState.fontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="flex-1 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none accent-brand-500"
                  />
                  <span className="text-lg text-slate-400 font-bold">A</span>
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
