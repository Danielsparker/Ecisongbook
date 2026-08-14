import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Book, Layers, ArrowLeft, RefreshCw, AlertCircle, Maximize2, Minimize2, Tv } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BibleVerse } from '../types';
import { Button } from '@/components/ui/button';
import { publishPresentationState, openPresentationWindow, getPresentationState } from '../services/presentationService';

export function BibleReader() {
  const [books, setBooks] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [chapters, setChapters] = useState<number[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'books' | 'chapters' | 'verses'>('books');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Default book order for sorting
  const bookOrder = useMemo(() => [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
    "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther",
    "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon",
    "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
    "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
    "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
    "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
    "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
    "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"
  ], []);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your settings.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Robust, future-proof retrieval: To fetch all unique books in the Bible without hitting the 1000-row limit,
      // we query records where verse = 1 in a paginated loop. Since there are only 1,189 chapters in the complete Bible,
      // this needs at most 2 incredibly fast queries and guarantees absolute zero cutoffs.
      const allBooksSet = new Set<string>();
      let hasMore = true;
      let offset = 0;
      const limit = 1000;

      while (hasMore) {
        let { data, error } = await supabase
          .from('eci_songbook')
          .select('book')
          .eq('type', 'bible')
          .eq('verse', 1)
          .range(offset, offset + limit - 1);

        if (error) throw error;

        if (!data || data.length === 0) {
          hasMore = false;
        } else {
          for (const item of data) {
            if (item.book) {
              allBooksSet.add(item.book);
            }
          }
          if (data.length < limit) {
            hasMore = false;
          } else {
            offset += limit;
          }
        }
      }

      // Safe fallback if no records are found under verse = 1 (e.g. initial upload with random verse indexing)
      if (allBooksSet.size === 0) {
        const fallbackRes = await supabase
          .from('eci_songbook')
          .select('book')
          .eq('type', 'bible')
          .limit(1000);
        if (fallbackRes.error) throw fallbackRes.error;
        for (const item of fallbackRes.data || []) {
          if (item.book) {
            allBooksSet.add(item.book);
          }
        }
      }

      if (allBooksSet.size === 0) {
        setBooks([]);
        return;
      }

      const uniqueBooks = Array.from(allBooksSet).sort((a, b) => {
        const indexA = bookOrder.indexOf(a);
        const indexB = bookOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      setBooks(uniqueBooks);
    } catch (err: any) {
      console.error("Supabase fetch books error:", err);
      let detailsMsg = "";
      if (err && typeof err === 'object') {
        detailsMsg = ` [Code: ${err.code || 'unknown'}] ${err.message || ''} ${err.details || ''} ${err.hint || ''}`;
      } else {
        detailsMsg = ` ${String(err)}`;
      }
      setError(`Failed to connect to Bible database:${detailsMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = async (book: string) => {
    setSelectedBook(book);
    setLoading(true);
    try {
      // By selecting only rows where verse = 1, we avoid hitting the 1000-row limits (especially for Psalms,
      // which has up to 2461 rows but only 150 chapters / 150 verses with verse = 1).
      let { data, error } = await supabase
        .from('eci_songbook')
        .select('chapter')
        .eq('type', 'bible')
        .eq('book', book)
        .eq('verse', 1);

      if (error) throw error;

      // Safe fallback if some chapters didn't have verse = 1
      if (!data || data.length === 0) {
        const fallbackRes = await supabase
          .from('eci_songbook')
          .select('chapter')
          .eq('type', 'bible')
          .eq('book', book)
          .limit(1000);
        if (fallbackRes.error) throw fallbackRes.error;
        data = fallbackRes.data;
      }

      const uniqueChapters = Array.from(new Set(data.map(item => item.chapter))).sort((a, b) => a - b);
      setChapters(uniqueChapters);
      setView('chapters');
    } catch (err: any) {
      console.error("Supabase fetch chapters error:", err);
      setError("Failed to load chapters.");
    } finally {
      setLoading(false);
    }
  };

  const handleChapterSelect = async (chapter: number) => {
    setSelectedChapter(chapter);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('eci_songbook')
        .select('*')
        .eq('type', 'bible')
        .eq('book', selectedBook)
        .eq('chapter', chapter);

      if (error) throw error;

      // Sort by verse number numerically
      const sortedVerses = data.sort((a, b) => {
        const vA = parseInt(a.verse.toString().replace(/\D/g, '')) || 0;
        const vB = parseInt(b.verse.toString().replace(/\D/g, '')) || 0;
        return vA - vB;
      });
      
      setVerses(sortedVerses);
      setCurrentVerseIndex(0);
      setView('verses');
    } catch (err: any) {
      console.error("Supabase fetch verses error:", err);
      setError("Failed to load verses.");
    } finally {
      setLoading(false);
    }
  };

  const nextVerse = () => {
    if (currentVerseIndex < verses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
    }
  };

  const prevVerse = () => {
    if (currentVerseIndex > 0) {
      setCurrentVerseIndex(currentVerseIndex - 1);
    }
  };

  const handleProjectVerse = () => {
    const activeVerse = verses[currentVerseIndex];
    if (!activeVerse) return;

    const currentPresState = getPresentationState();

    publishPresentationState({
      ...currentPresState,
      title: `${selectedBook} ${selectedChapter}:${activeVerse.verse}`,
      subtitle: `${activeVerse.version || 'Holy Bible'}`,
      slides: [activeVerse.text],
      currentSlideIndex: 0,
      blackScreen: false,
      activeType: 'bible',
      isExited: false,
    });

    const confirmLaunch = confirm("Verse sent to projector! Would you like to open the separate presentation window now?");
    if (confirmLaunch) {
      openPresentationWindow();
    }
  };

  const resetView = () => {
    setView('books');
    setSelectedBook(null);
    setSelectedChapter(null);
    setVerses([]);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 sm:py-32">
        <div className="relative">
          <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full" />
          <RefreshCw className="h-12 w-12 animate-spin text-brand-600 relative" />
        </div>
        <p className="mt-6 text-slate-500 font-medium animate-pulse tracking-wide">Syncing with Supabase...</p>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 overflow-auto' : 'max-w-5xl px-4'}`}>
      {isFullScreen && (
        <div className="mb-8 flex justify-between items-center">
           <div className="flex items-center gap-3">
            <Book className="h-6 w-6 text-brand-600" />
            <h2 className="text-xl font-bold dark:text-white">Bible Reader</h2>
           </div>
           <Button variant="ghost" onClick={() => setIsFullScreen(false)} className="rounded-full h-10 w-10 p-0 hover:bg-slate-100 dark:hover:bg-slate-900">
             <Minimize2 className="h-5 w-5" />
           </Button>
        </div>
      )}

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl flex items-center gap-4 text-red-600 dark:text-red-400"
        >
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchBooks} className="ml-auto text-red-600 hover:bg-red-100">Retry</Button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {view === 'books' && (
          <motion.div
            key="books"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {books.length > 0 ? (
              books.map((book) => (
                <button
                  key={book}
                  onClick={() => handleBookSelect(book)}
                  className="group relative h-28 flex items-center justify-center rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-brand-500 dark:hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 text-center overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Book className="h-12 w-12 text-brand-600" />
                  </div>
                  <h3 className="relative z-10 font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors uppercase tracking-tight">
                    {book}
                  </h3>
                </button>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-brand-500/10 blur-3xl rounded-full" />
                  <Layers className="h-20 w-20 mx-auto relative opacity-30 text-brand-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Library Empty</h3>
                <p className="max-w-sm mx-auto text-slate-500 text-sm leading-relaxed mb-8">
                  Your Supabase 'eci_songbook' table is empty or disconnected. Ensure environment variables are set in AI Studio.
                </p>
                <Button 
                  onClick={fetchBooks}
                  className="rounded-2xl h-12 px-8 bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Sync Records
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {view === 'chapters' && (
          <motion.div
            key="chapters"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={resetView} className="rounded-full h-12 w-12 p-0 hover:bg-slate-100 dark:hover:bg-slate-900">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{selectedBook}</h2>
                  <p className="text-xs font-bold text-brand-600 tracking-[0.2em] uppercase">Select Chapter</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {chapters.map((ch) => (
                <button
                  key={ch}
                  onClick={() => handleChapterSelect(ch)}
                  className="h-14 w-full flex items-center justify-center rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-brand-600 hover:text-white hover:border-brand-600 transition-all font-black text-lg"
                >
                  {ch}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'verses' && (
          <motion.div
            key="verses"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between mb-10">
              <Button variant="ghost" onClick={() => setView('chapters')} className="rounded-full h-12 w-12 p-0 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                <ArrowLeft className="h-6 w-6" />
              </Button>
              
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">{selectedBook}</h2>
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em]">
                  Chapter {selectedChapter}
                </span>
              </div>

              {!isFullScreen ? (
                <Button variant="ghost" onClick={() => setIsFullScreen(true)} className="rounded-full h-12 w-12 p-0 text-slate-400">
                  <Maximize2 className="h-5 w-5" />
                </Button>
              ) : (
                <div className="w-12" />
              )}
            </div>

            <div className="relative w-full max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentVerseIndex}
                  initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: -90, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="perspective-1000 w-full"
                >
                  <div className="relative min-h-[400px] sm:min-h-[500px] p-10 sm:p-20 rounded-[3.5rem] border-4 border-brand-500/10 dark:border-brand-500/5 bg-white dark:bg-slate-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[20px_50px_100px_-20px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center text-center overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-brand-500/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-44 h-44 bg-brand-500/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
                    
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                       <span className="h-1 w-12 bg-brand-500/20 rounded-full" />
                       <Book className="h-5 w-5 text-brand-600/30" />
                       <span className="h-1 w-12 bg-brand-500/20 rounded-full" />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-10"
                    >
                      <span className="text-sm font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest block mb-1">Verse</span>
                      <span className="text-4xl font-black text-brand-600">{verses[currentVerseIndex]?.verse}</span>
                    </motion.div>
                    
                    <p className="text-2xl sm:text-4xl md:text-5xl font-serif text-slate-900 dark:text-white leading-[1.3] mb-12 relative px-4 tracking-tight drop-shadow-sm italic">
                      "{verses[currentVerseIndex]?.text}"
                    </p>
                    
                    <div className="flex flex-col items-center mt-auto">
                      <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent mb-6" />
                      <p className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">
                        {verses[currentVerseIndex]?.version || 'Holy Bible'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls Overlay */}
              <div className="mt-12 flex items-center justify-center gap-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevVerse}
                  disabled={currentVerseIndex === 0}
                  className="h-16 w-16 rounded-full border-2 border-slate-100 dark:border-slate-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 group transition-all"
                >
                  <ChevronLeft className="h-8 w-8 text-slate-400 group-hover:text-brand-600" />
                </Button>
                
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Verse Progression</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">{currentVerseIndex + 1}</span>
                    <span className="text-sm font-bold text-slate-300">/</span>
                    <span className="text-sm font-bold text-slate-400 tabular-nums">{verses.length}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={nextVerse}
                  disabled={currentVerseIndex === verses.length - 1}
                  className="h-16 w-16 rounded-full border-2 border-slate-100 dark:border-slate-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 group transition-all"
                >
                  <ChevronRight className="h-8 w-8 text-slate-400 group-hover:text-brand-600" />
                </Button>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleProjectVerse}
                  className="gap-2 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-lg shadow-brand-500/10 px-6 py-5 text-sm"
                >
                  <Tv className="h-4 w-4" />
                  Present Verse Live
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
