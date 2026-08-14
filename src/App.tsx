/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, Loader2, Plus, BookOpen, Sparkles } from 'lucide-react';

import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './lib/firebase';
import { Song } from './types';
import { Navbar } from './components/Navbar';
import { SongSearch } from './components/SongSearch';
import { SongCard } from './components/SongCard';
import { BibleReader } from './components/BibleReader';
import { PromiseVerseManager } from './components/PromiseVerseManager';
import { LyricsModal } from './components/LyricsModal';
import { SubmitSongDialog } from './components/SubmitSongDialog';
import { EditSongDialog } from './components/EditSongDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PresentationWindow } from './components/PresentationWindow';
import { PresenterControl } from './components/PresenterControl';
import { openPresentationWindow } from './services/presentationService';

export default function App() {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const isPresentationMode = useMemo(() => urlParams.get('mode') === 'presentation', [urlParams]);

  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeTab, setActiveTab] = useState<'songs' | 'bible' | 'promiseVerse'>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [presenterActiveSong, setPresenterActiveSong] = useState<Song | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [publicSubmissions, setPublicSubmissions] = useState(true);

  const isAdmin = useMemo(() => {
    return userRole === 'admin';
  }, [userRole]);

  const canSubmit = useMemo(() => {
    if (publicSubmissions) return true;
    if (!user) return false;
    return isAdmin || userRole === 'contributor' || userRole === 'viewer';
  }, [publicSubmissions, isAdmin, userRole, user]);

  const handleAddClick = () => {
    if (!canSubmit) {
      alert("Submissions are currently restricted to authorized contributors. Please contact the administrator for access.");
      return;
    }
    setIsSubmitOpen(true);
  };

  const handlePresentSong = (song: Song) => {
    setPresenterActiveSong(song);
  };

  const handleUpdateSong = async (songId: string, updatedData: { title: string; songNo: number; genre: string; lyrics: string }) => {
    try {
      const songRef = doc(db, 'songs', songId);
      const existingSong = songs.find(s => s.id === songId);
      await updateDoc(songRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
        ...(existingSong?.createdAt ? { createdAt: existingSong.createdAt } : {}),
        ...(existingSong?.submittedBy ? { submittedBy: existingSong.submittedBy } : { submittedBy: user?.uid || "anonymous" })
      });
      if (selectedSong?.id === songId) {
        setSelectedSong(prev => prev ? { ...prev, ...updatedData } : null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `songs/${songId}`);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    try {
      await deleteDoc(doc(db, 'songs', songId));
      if (selectedSong?.id === songId) {
        setSelectedSong(null);
      }
      if (editingSong?.id === songId) {
        setEditingSong(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `songs/${songId}`);
    }
  };

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribeUser = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserRole(doc.data().role);
        }
      });
      return () => unsubscribeUser();
    } else {
      setUserRole(null);
    }
  }, [user]);

  useEffect(() => {
    // Songs Listener
    const qSongs = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const unsubscribeSongs = onSnapshot(qSongs, (snapshot) => {
      console.log(`Received songs snapshot: ${snapshot.size} songs`);
      const songsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Song[];
      setSongs(songsData);
      setIsInitialLoading(false);
    }, (err) => {
      console.error("Firestore songs fetch error:", err);
      handleFirestoreError(err, OperationType.LIST, 'songs');
    });

    // Listen to global settings
    const settingsUnsubscribe = onSnapshot(doc(db, 'config', 'global'), (doc) => {
      if (doc.exists()) {
        setPublicSubmissions(doc.data().publicSubmissions ?? true);
      }
    });

    return () => {
      unsubscribeSongs();
      settingsUnsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const searchLower = searchQuery.toLowerCase();
      const title = (song.title || "").toLowerCase();
      const genre = (song.genre || "").toLowerCase();
      const songNo = (song.songNo !== undefined && song.songNo !== null) ? song.songNo.toString() : "";
      
      return (
        title.includes(searchLower) ||
        genre.includes(searchLower) ||
        songNo.includes(searchLower)
      );
    });
  }, [songs, searchQuery]);

  const handleSubmitSong = async (songData: { title: string; songNo: number; genre: string; lyrics: string }) => {
    if (!canSubmit) {
      alert("Submissions are currently restricted to authorized contributors.");
      return;
    }
    
    try {
      await addDoc(collection(db, 'songs'), {
        ...songData,
        submittedBy: user?.uid || "anonymous",
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'songs');
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isPresentationMode) {
    return <PresentationWindow />;
  }

  if (loading && isInitialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-slate-500">Loading ECI Song Book...</p>
        </div>
      </div>
    );
  }

  if (presenterActiveSong) {
    return (
      <PresenterControl 
        songs={songs} 
        initialActiveSong={presenterActiveSong} 
        onExit={() => setPresenterActiveSong(null)} 
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
        <Navbar 
          user={user} 
          onLogin={handleLogin} 
          onLogout={logout} 
          onAddSong={handleAddClick}
          onOpenSettings={() => setIsSettingsOpen(true)}
          canSubmit={canSubmit}
          isLoggingIn={isLoggingIn}
        />

        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl font-serif">
                Every <span className="text-brand-600 italic">{activeTab === 'songs' ? 'Song' : 'Verse'}</span> Has a Story.
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
                {activeTab === 'songs' 
                  ? 'Explore thousands of lyrics, submit your own favorites, and download them as beautiful PDF or PPT presentations.'
                  : 'Discover inspirational Bible verses and wisdom connected via Supabase.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Tab Switcher */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                <button
                  onClick={() => setActiveTab('songs')}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'songs' ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {activeTab === 'songs' && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Music2 className={`relative z-10 h-4 w-4 ${activeTab === 'songs' ? 'animate-pulse' : ''}`} />
                  <span className="relative z-10">Songs</span>
                </button>

                <button
                  onClick={() => setActiveTab('bible')}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'bible' ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {activeTab === 'bible' && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <BookOpen className={`relative z-10 h-4 w-4 ${activeTab === 'bible' ? 'animate-pulse' : ''}`} />
                  <span className="relative z-10">Bible</span>
                </button>

                <button
                  onClick={() => setActiveTab('promiseVerse')}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    activeTab === 'promiseVerse' ? 'text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  {activeTab === 'promiseVerse' && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Sparkles className={`relative z-10 h-4 w-4 ${activeTab === 'promiseVerse' ? 'animate-pulse text-slate-950' : ''}`} />
                  <span className="relative z-10">Promise Verse</span>
                </button>
              </div>

              <SongSearch 
                value={searchQuery} 
                onChange={setSearchQuery} 
                placeholder={activeTab === 'songs' ? "Search for songs, numbers or genre..." : "Browse Bible Chapters..."}
              />
            </motion.div>
          </section>

          {/* Grid Section */}
          <section>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {searchQuery ? 'Search Results' : (activeTab === 'songs' ? 'Recent Songs' : activeTab === 'bible' ? 'Bible Database' : 'Promise Verse Wallpapers')}
              </h2>
              <span className="text-sm text-slate-500">
                {activeTab === 'songs' ? `${filteredSongs.length} songs` : (activeTab === 'bible' ? 'Supabase Connected' : 'Monthly Wallpapers')}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'songs' ? (
                  filteredSongs.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredSongs.map((song) => (
                        <motion.div
                          key={song.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <SongCard 
                            song={song} 
                            onView={setSelectedSong} 
                            onPresent={handlePresentSong} 
                            onEdit={(s) => setEditingSong(s)}
                            onDelete={(s) => handleDeleteSong(s.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="mb-4 rounded-full bg-slate-100 dark:bg-slate-900 p-6">
                        <Music2 className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No songs found</h3>
                      <p className="text-slate-500">Try adjusting your search or be the first to submit this song!</p>
                      <Button 
                        onClick={handleAddClick} 
                        className="mt-6 gap-2 bg-brand-600"
                      >
                        <Plus className="h-4 w-4" /> Submit Lyrics
                      </Button>
                    </div>
                  )
                ) : activeTab === 'bible' ? (
                  <BibleReader />
                ) : (
                  <PromiseVerseManager 
                    user={user} 
                    canvasTheme={isDarkMode ? 'dark' : 'light'} 
                    onPresentVerse={(verse) => {
                      setPresenterActiveSong({
                        title: verse.title,
                        songNo: 0,
                        genre: verse.month || 'Promise Verse',
                        lyrics: verse.reference || verse.title,
                        submittedBy: verse.submittedBy || 'system',
                        createdAt: new Date(),
                      });
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </section>
        </main>

        {/* Modals */}
        <LyricsModal 
          song={selectedSong} 
          isOpen={!!selectedSong} 
          onClose={() => setSelectedSong(null)} 
          onPresent={handlePresentSong}
          onEdit={(s) => {
            setSelectedSong(null);
            setEditingSong(s);
          }}
          onDelete={(s) => handleDeleteSong(s.id)}
        />
        
        <SubmitSongDialog 
          isOpen={isSubmitOpen} 
          onClose={() => setIsSubmitOpen(false)} 
          onSubmit={handleSubmitSong} 
        />

        <EditSongDialog
          song={editingSong}
          isOpen={!!editingSong}
          onClose={() => setEditingSong(null)}
          onSave={handleUpdateSong}
          onDelete={handleDeleteSong}
        />

        <SettingsDialog 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isAdmin={isAdmin}
        />

        {/* Floating Action Button for Mobile */}
        <Button
          onClick={handleAddClick}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl sm:hidden bg-brand-600"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </ErrorBoundary>
  );
}


