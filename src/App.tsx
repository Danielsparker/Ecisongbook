/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Music2, Loader2, Plus, BookOpen, Sparkles, Globe, Tv } from 'lucide-react';

import { auth, db, loginWithGoogle, logout, handleFirestoreError, OperationType } from './lib/firebase';
import { Song } from './types';
import { Navbar } from './components/Navbar';
import { SongSearch } from './components/SongSearch';
import { SongCard } from './components/SongCard';
import { BibleReader } from './components/BibleReader';
import { PromiseVerseManager } from './components/PromiseVerseManager';
import { DiscoverSongs } from './components/DiscoverSongs';
import { LyricsModal } from './components/LyricsModal';
import { SubmitSongDialog, getSuggestedSongNo } from './components/SubmitSongDialog';
import { EditSongDialog } from './components/EditSongDialog';
import { SettingsDialog } from './components/SettingsDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { PresentationWindow } from './components/PresentationWindow';
import { PresenterControl } from './components/PresenterControl';
import { presenterManager } from './services/presenterManager';
import { tcwApiService } from './services/tcwApiService';
import { ExternalCopyrightConsentDialog, hasAcknowledgedExternalCopyright } from './components/CopyrightNotice';
import { Footer } from './components/Footer';
import { LandingSections } from './components/LandingSections';
import { SeoGuidePage } from './components/SeoGuidePage';
import {
  BRAND_HERO_HEADLINE,
  SeoRoutePath,
  isKnownSeoPath,
  normalizePathname,
  resolveSeoRoute,
} from './config/seo';
import { applyRuntimeSeo } from './utils/seo';

const SESSION_EXTERNAL_SONGS_KEY = 'eci_session_external_songs';

const loadSessionExternalSongs = (): Song[] => {
  try {
    const raw = sessionStorage.getItem(SESSION_EXTERNAL_SONGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is Song => Boolean(s && typeof s === 'object')) : [];
  } catch {
    return [];
  }
};

export default function App() {
  const getUrlModeParams = () => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    return {
      isPresentation: mode === 'presentation',
      isControl: mode === 'control' || mode === 'presenter' || mode === 'studio',
      songId: params.get('songId'),
    };
  };

  const initialUrlState = useMemo(getUrlModeParams, []);
  const isPresentationMode = initialUrlState.isPresentation;
  const [isPresenterControlMode, setIsPresenterControlMode] = useState(initialUrlState.isControl);
  const [urlSongId, setUrlSongId] = useState<string | null>(initialUrlState.songId);
  const [currentPath, setCurrentPath] = useState<string>(() => normalizePathname(window.location.pathname));

  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>(() => {
    try {
      const cached = localStorage.getItem('eci_cached_songs');
      if (!cached) return [];
      const parsed = JSON.parse(cached);
      return Array.isArray(parsed) ? parsed.filter((s): s is Song => Boolean(s && typeof s === 'object')) : [];
    } catch {
      return [];
    }
  });
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [externalSongs, setExternalSongs] = useState<Song[]>(loadSessionExternalSongs);
  const [presenterSong, setPresenterSong] = useState<Song | null>(null);
  const [activeTab, setActiveTab] = useState<'songs' | 'discover' | 'bible' | 'promiseVerse'>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialView, setSettingsInitialView] = useState<'main' | 'contributors' | 'copyright'>('main');
  const [pendingExternalSong, setPendingExternalSong] = useState<Song | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    try {
      return !localStorage.getItem('eci_cached_songs');
    } catch {
      return true;
    }
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch {
      return false;
    }
  });
  const [canvasTheme, setCanvasTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('eci_canvas_theme') as 'light' | 'dark') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [publicSubmissions, setPublicSubmissions] = useState(true);

  const isAdmin = useMemo(() => {
    return userRole === 'admin';
  }, [userRole]);

  const canSubmit = useMemo(() => {
    if (publicSubmissions) return true;
    if (!user) return false;
    return isAdmin || userRole === 'contributor' || userRole === 'viewer';
  }, [publicSubmissions, isAdmin, userRole, user]);

  // Keep SEO document head, canonicals, and Schema.org JSON-LD synced with route & presentation modes
  useEffect(() => {
    applyRuntimeSeo({
      pathname: currentPath,
      isPresentationMode,
      isControlMode: isPresenterControlMode || isStudioOpen,
    });
  }, [currentPath, isPresentationMode, isPresenterControlMode, isStudioOpen]);

  const handleAddClick = () => {
    if (!canSubmit) {
      alert("Submissions are currently restricted to authorized contributors. Please contact the administrator for access.");
      return;
    }
    setIsSubmitOpen(true);
  };

  const addExternalSongToSession = (song: Song) => {
    setExternalSongs(prev => {
      const filtered = prev.filter(s => (song.id ? s.id !== song.id : s.title !== song.title));
      const next = [song, ...filtered].slice(0, 20);
      try {
        sessionStorage.setItem(SESSION_EXTERNAL_SONGS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const launchSongInControlCenter = (song: Song) => {
    if (song.isExternal) {
      addExternalSongToSession(song);
    }
    setSelectedSong(null);
    setPresenterSong(song);
    presenterManager.presentSong(song, true);
    setIsStudioOpen(true);
    setIsPresenterControlMode(true);
    if (song.id) {
      setUrlSongId(song.id);
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'control');
      if (song.id) {
        url.searchParams.set('songId', song.id);
      }
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  const handlePresentSong = (song: Song) => {
    if (song.isExternal && !hasAcknowledgedExternalCopyright()) {
      setPendingExternalSong(song);
      return;
    }
    launchSongInControlCenter(song);
  };

  const handlePresentExternalSong = (extSong: Song) => {
    if (!hasAcknowledgedExternalCopyright()) {
      setPendingExternalSong(extSong);
      return;
    }
    launchSongInControlCenter(extSong);
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
      const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      });
      return () => unsubscribeUser();
    } else {
      setUserRole(null);
    }
  }, [user]);

  useEffect(() => {
    const qSongs = query(collection(db, 'songs'), orderBy('createdAt', 'desc'));
    const unsubscribeSongs = onSnapshot(qSongs, (snapshot) => {
      const songsData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Song[];
      setSongs(songsData);
      try {
        localStorage.setItem('eci_cached_songs', JSON.stringify(songsData));
      } catch {}
      setIsInitialLoading(false);
    }, (err) => {
      console.error("Firestore songs fetch error:", err);
      setIsInitialLoading(false);
      try {
        handleFirestoreError(err, OperationType.LIST, 'songs');
      } catch {
        // Logged structured Firestore error without crashing the UI listener
      }
    });

    const settingsUnsubscribe = onSnapshot(doc(db, 'config', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setPublicSubmissions(docSnap.data().publicSubmissions ?? true);
      }
    });

    return () => {
      unsubscribeSongs();
      settingsUnsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch {
      // Ignore storage access errors in restricted iframes
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

  const suggestedSongNo = useMemo(() => {
    return getSuggestedSongNo(songs);
  }, [songs]);

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
    } catch {
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Listen to popstate so browser Back/Forward smoothly syncs Control Center & SEO routes
  useEffect(() => {
    const handlePopState = () => {
      const next = getUrlModeParams();
      setIsPresenterControlMode(next.isControl);
      setIsStudioOpen(next.isControl);
      setUrlSongId(next.songId);
      setCurrentPath(normalizePathname(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Resolve external song if Control Center loads directly with ?songId=tcw-...
  useEffect(() => {
    if (!(isPresenterControlMode || isStudioOpen)) return;
    if (!urlSongId || !urlSongId.startsWith('tcw-')) return;
    const alreadyLoaded =
      (presenterSong && presenterSong.id === urlSongId) ||
      externalSongs.some(s => s.id === urlSongId);
    if (alreadyLoaded) return;

    const slug = urlSongId.slice(4);
    if (!slug) return;
    tcwApiService.getSongDetail(slug)
      .then(detail => {
        const normalized = tcwApiService.normalizeTCWSong(detail);
        addExternalSongToSession(normalized);
        setPresenterSong(normalized);
      })
      .catch(() => {});
  }, [isPresenterControlMode, isStudioOpen, urlSongId]);

  const navigateToPath = (path: SeoRoutePath) => {
    setIsStudioOpen(false);
    setIsPresenterControlMode(false);
    setPresenterSong(null);
    setUrlSongId(null);
    setCurrentPath(path);
    try {
      window.history.pushState({}, '', path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const navigateToHome = () => {
    setIsStudioOpen(false);
    setIsPresenterControlMode(false);
    setPresenterSong(null);
    setUrlSongId(null);
    setCurrentPath('/');
    try {
      window.history.pushState({}, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  if (isPresentationMode) {
    return <PresentationWindow />;
  }

  if (isPresenterControlMode || isStudioOpen) {
    const mergedExternal = presenterSong?.isExternal
      ? [presenterSong, ...externalSongs.filter(s => s.id !== presenterSong.id)]
      : externalSongs;
    const allPresenterSongs = [...mergedExternal, ...songs];
    const initialPresenterSong =
      presenterSong ||
      (urlSongId ? allPresenterSongs.find(s => s.id === urlSongId) : undefined) ||
      selectedSong ||
      allPresenterSongs[0] ||
      null;

    return (
      <PresenterControl
        songs={allPresenterSongs}
        initialActiveSong={initialPresenterSong}
        onGoHome={navigateToHome}
        onExit={() => {
          navigateToHome();
          try {
            window.close();
          } catch {}
        }}
        isDarkMode={isDarkMode}
        canvasTheme={canvasTheme}
        onToggleCanvasTheme={(theme) => {
          setCanvasTheme(theme);
          try {
            localStorage.setItem('eci_canvas_theme', theme);
          } catch {}
        }}
      />
    );
  }

  if (loading && isInitialLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
          <p className="text-sm font-medium text-slate-500">Loading Tamil Worship Lyrics...</p>
        </div>
      </div>
    );
  }

  const handleOpenStudio = (songId?: string) => {
    setIsStudioOpen(true);
    setIsPresenterControlMode(true);
    if (songId) {
      setUrlSongId(songId);
    }
    try {
      const url = new URL(window.location.href);
      url.pathname = '/';
      url.searchParams.set('mode', 'control');
      if (songId) {
        url.searchParams.set('songId', songId);
      }
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  const isGuidePage = currentPath !== '/' && isKnownSeoPath(currentPath);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <Navbar
          user={user}
          onLogin={handleLogin}
          onLogout={logout}
          onAddSong={handleAddClick}
          onOpenSettings={() => {
            setSettingsInitialView('main');
            setIsSettingsOpen(true);
          }}
          onOpenStudio={() => handleOpenStudio(presenterSong?.id || selectedSong?.id)}
          onNavigatePath={navigateToPath}
          currentPath={currentPath}
          canSubmit={canSubmit}
          isLoggingIn={isLoggingIn}
        />

        <main className="container mx-auto px-4 py-10 sm:py-12 flex-1">
          {isGuidePage ? (
            <SeoGuidePage
              route={resolveSeoRoute(currentPath)}
              onNavigatePath={navigateToPath}
              onLaunchAction={(target) => {
                if (target === 'studio') {
                  handleOpenStudio(presenterSong?.id || selectedSong?.id);
                } else {
                  setActiveTab(target);
                  navigateToHome();
                }
              }}
            />
          ) : (
            <>
              {/* 1. Hero Section */}
              <section className="mb-14 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Tamil Christian Worship Songbook · Live Church Presentation
                  </p>
                  <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1] [text-wrap:balance]">
                    {BRAND_HERO_HEADLINE}
                  </h1>
                  <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    {activeTab === 'songs'
                      ? 'Organize Tamil Christian worship lyrics and display them beautifully on church screens with customizable live presentation themes, clear Tamil typography, and seamless slide control.'
                      : activeTab === 'discover'
                        ? 'Discover over 16,000+ Tamil Christian songs from Tamil Christian World, preview lyrics & chords, and present live.'
                        : activeTab === 'bible'
                          ? 'Read, search, and present Tamil and English Scripture verses seamlessly during worship.'
                          : 'Browse and project monthly promise verse wallpapers directly onto your church screen.'}
                  </p>

                  {/* Presentation CTA */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2 pb-4">
                    <Button
                      onClick={() => handleOpenStudio(presenterSong?.id || selectedSong?.id)}
                      className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-6 h-11 font-semibold gap-2 shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Tv className="h-4 w-4" />
                      <span>Explore Presentation</span>
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  id="workspace"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="scroll-mt-24 flex flex-col items-center gap-7 pt-4"
                >
                  {/* Interactive Tab Switcher */}
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex-wrap justify-center gap-1">
                    <button
                      onClick={() => setActiveTab('songs')}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                        activeTab === 'songs' ? 'text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'songs' && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute inset-0 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <Music2 className="relative z-10 h-4 w-4" />
                      <span className="relative z-10">My Songbook</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('discover')}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                        activeTab === 'discover' ? 'text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'discover' && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute inset-0 bg-purple-600 rounded-xl shadow-lg shadow-purple-500/20"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <Globe className="relative z-10 h-4 w-4" />
                      <span className="relative z-10">Discover (16K+)</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('bible')}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                        activeTab === 'bible' ? 'text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'bible' && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute inset-0 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/20"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <BookOpen className="relative z-10 h-4 w-4" />
                      <span className="relative z-10">Bible</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('promiseVerse')}
                      className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                        activeTab === 'promiseVerse' ? 'text-slate-950' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {activeTab === 'promiseVerse' && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute inset-0 bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <Sparkles className="relative z-10 h-4 w-4" />
                      <span className="relative z-10">Promise Verse</span>
                    </button>
                  </div>

                  {activeTab !== 'discover' && (
                    <SongSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder={activeTab === 'songs' ? "Search for Tamil or English songs, numbers, or genre..." : "Browse Bible Chapters..."}
                    />
                  )}
                </motion.div>
              </section>

              {/* Workspace Grid Section */}
              <section>
                {activeTab !== 'discover' && (
                  <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {searchQuery ? 'Search Results' : (activeTab === 'songs' ? 'Worship Songbook' : activeTab === 'bible' ? 'Bible Database' : 'Promise Verse Wallpapers')}
                    </h2>
                    {(activeTab === 'songs' || activeTab === 'promiseVerse') && (
                      <span className="text-sm text-slate-500 tabular-nums">
                        {activeTab === 'songs' ? `${filteredSongs.length} songs` : 'Monthly Wallpapers'}
                      </span>
                    )}
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    {activeTab === 'songs' ? (
                      filteredSongs.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {filteredSongs.map((song) => (
                            <motion.div
                              key={song.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
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
                        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40">
                          <div className="mb-4 rounded-full bg-slate-100 dark:bg-slate-900 p-5">
                            <Music2 className="h-9 w-9 text-slate-400 dark:text-slate-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No songs found</h3>
                          <p className="text-sm text-slate-500 mt-1 max-w-md">
                            Try adjusting your search or add a new song to your Tamil Worship Lyrics library.
                          </p>
                          <Button
                            onClick={handleAddClick}
                            className="mt-5 gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl cursor-pointer"
                          >
                            <Plus className="h-4 w-4" /> Add Song Lyrics
                          </Button>
                        </div>
                      )
                    ) : activeTab === 'discover' ? (
                      <DiscoverSongs
                        onPresentSong={handlePresentExternalSong}
                        isDarkMode={isDarkMode}
                      />
                    ) : activeTab === 'bible' ? (
                      <BibleReader />
                    ) : (
                      <PromiseVerseManager
                        user={user}
                        canvasTheme={isDarkMode ? 'dark' : 'light'}
                        onPresentVerse={(verse) => {
                          presenterManager.presentPromiseVerse(verse, true);
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </section>

              {/* Sections 2-8: Live Presentation Feature, Management Bento, Typography & Themes, Workflow, Audiences, FAQ, Final CTA */}
              <LandingSections
                onOpenStudio={() => handleOpenStudio(presenterSong?.id || selectedSong?.id)}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  const el = document.getElementById('workspace');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                onNavigatePath={navigateToPath}
                onAddSong={handleAddClick}
              />
            </>
          )}
        </main>

        <Footer
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            if (currentPath !== '/') {
              navigateToHome();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onNavigatePath={navigateToPath}
          onOpenStudio={() => handleOpenStudio(presenterSong?.id || selectedSong?.id)}
          onAddSong={handleAddClick}
          onOpenCopyright={() => {
            setSettingsInitialView('copyright');
            setIsSettingsOpen(true);
          }}
          onOpenSettings={() => {
            setSettingsInitialView('main');
            setIsSettingsOpen(true);
          }}
        />

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
          suggestedSongNo={suggestedSongNo}
          songs={songs}
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
          initialView={settingsInitialView}
        />

        <ExternalCopyrightConsentDialog
          song={pendingExternalSong}
          isOpen={!!pendingExternalSong}
          onConfirm={(song) => {
            setPendingExternalSong(null);
            launchSongInControlCenter(song);
          }}
          onCancel={() => setPendingExternalSong(null)}
        />

        {/* Floating Action Button for Mobile */}
        <Button
          onClick={handleAddClick}
          aria-label="Add Song Lyrics"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl sm:hidden bg-brand-600 hover:bg-brand-700 text-white"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </ErrorBoundary>
  );
}
