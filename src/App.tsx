/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, Loader2, Plus } from 'lucide-react';

import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './lib/firebase';
import { Song } from './types';
import { Navbar } from './components/Navbar';
import { SongSearch } from './components/SongSearch';
import { SongCard } from './components/SongCard';
import { LyricsModal } from './components/LyricsModal';
import { SubmitSongDialog } from './components/SubmitSongDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from '@/components/ui/button';

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [publicSubmissions, setPublicSubmissions] = useState(true);

  const isAdmin = useMemo(() => {
    return user?.email === "danieldec996@gmail.com" || userRole === 'admin';
  }, [user, userRole]);

  const canSubmit = useMemo(() => {
    if (publicSubmissions) return true;
    return isAdmin || userRole === 'contributor';
  }, [publicSubmissions, isAdmin, userRole]);

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
    const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const songsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Song[];
      setSongs(songsData);
      setIsInitialLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'songs');
    });

    // Listen to global settings
    const settingsUnsubscribe = onSnapshot(doc(db, 'config', 'global'), (doc) => {
      if (doc.exists()) {
        setPublicSubmissions(doc.data().publicSubmissions ?? true);
      }
    });

    return () => {
      unsubscribe();
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
      return (
        song.title.toLowerCase().includes(searchLower) ||
        song.genre.toLowerCase().includes(searchLower) ||
        song.songNo.toString().includes(searchLower)
      );
    });
  }, [songs, searchQuery]);

  const handleSubmitSong = async (songData: { title: string; songNo: number; genre: string; lyrics: string }) => {
    if (!user) return;
    if (!canSubmit) {
      alert("Submissions are currently restricted to authorized contributors.");
      return;
    }
    
    try {
      await addDoc(collection(db, 'songs'), {
        ...songData,
        submittedBy: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'songs');
    }
  };

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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
        <Navbar 
          user={user} 
          onLogin={loginWithGoogle} 
          onLogout={logout} 
          onAddSong={() => setIsSubmitOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          canSubmit={canSubmit}
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
                Every Song Has a <span className="text-brand-600 italic">Story</span>.
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
                Explore thousands of lyrics, submit your own favorites, and download them as beautiful PDF or PPT presentations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <SongSearch value={searchQuery} onChange={setSearchQuery} />
            </motion.div>
          </section>

          {/* Songs Grid */}
          <section>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {searchQuery ? 'Search Results' : 'Recent Submissions'}
              </h2>
              <span className="text-sm text-slate-500">{filteredSongs.length} songs found</span>
            </div>

            {filteredSongs.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {filteredSongs.map((song) => (
                    <motion.div
                      key={song.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SongCard song={song} onView={setSelectedSong} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 rounded-full bg-slate-100 dark:bg-slate-900 p-6">
                  <Music2 className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No songs found</h3>
                <p className="text-slate-500">Try adjusting your search or be the first to submit this song!</p>
                {user && canSubmit && (
                  <Button 
                    onClick={() => setIsSubmitOpen(true)} 
                    className="mt-6 gap-2 bg-brand-600"
                  >
                    <Plus className="h-4 w-4" /> Submit Lyrics
                  </Button>
                )}
              </div>
            )}
          </section>
        </main>

        {/* Modals */}
        <LyricsModal 
          song={selectedSong} 
          isOpen={!!selectedSong} 
          onClose={() => setSelectedSong(null)} 
        />
        
        <SubmitSongDialog 
          isOpen={isSubmitOpen} 
          onClose={() => setIsSubmitOpen(false)} 
          onSubmit={handleSubmitSong} 
        />

        <SettingsDialog 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isAdmin={isAdmin}
        />

        {/* Floating Action Button for Mobile */}
        {user && canSubmit && (
          <Button
            onClick={() => setIsSubmitOpen(true)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl sm:hidden bg-brand-600"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>
    </ErrorBoundary>
  );
}

