import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Globe, 
  Tv, 
  Music, 
  Mic2, 
  Disc, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TCWSongSummary, Song } from '../types';
import { tcwApiService, TCWFilters } from '../services/tcwApiService';
import { ExternalSongDetailModal } from './ExternalSongDetailModal';

interface DiscoverSongsProps {
  onPresentSong: (song: Song) => void;
  isDarkMode?: boolean;
}

const TAMIL_LETTERS = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'க', 'ச', 'த', 'ந', 'ப', 'ம', 'ய', 'வ'];

const SUGGESTIONS = [
  'இயேசு',
  'உம்மைத்தான்',
  'அகில உலகம்',
  'Berchmans',
  'Paul Thangiah',
  'worship',
  'Aaradhanai'
];

export const DiscoverSongs: React.FC<DiscoverSongsProps> = ({
  onPresentSong,
  isDarkMode = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMediaFilter, setHasMediaFilter] = useState(false);
  const [hasChordsFilter, setHasChordsFilter] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [songs, setSongs] = useState<TCWSongSummary[]>([]);
  const [totalSongs, setTotalSongs] = useState<number | undefined>(undefined);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);

  // Selected song for details modal
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // reset to page 1 on query change
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: TCWFilters = {
        hasMedia: hasMediaFilter,
        hasChords: hasChordsFilter,
        letter: selectedLetter || undefined,
      };

      const res = await tcwApiService.searchSongs(debouncedQuery, page, 50, filters);
      setSongs(res.songs || []);
      setTotalSongs(res.total ?? (res.count ? res.count : undefined));
      setTotalPages(res.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load songs from Tamil Christian World');
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, hasMediaFilter, hasChordsFilter, selectedLetter]);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  const handleSelectLetter = (letter: string) => {
    if (selectedLetter === letter) {
      setSelectedLetter(null);
    } else {
      setSelectedLetter(letter);
      setSearchQuery('');
      setPage(1);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setHasMediaFilter(false);
    setHasChordsFilter(false);
    setSelectedLetter(null);
    setPage(1);
  };

  const handleQuickPresent = async (slug: string) => {
    try {
      setLoading(true);
      const detail = await tcwApiService.getSongDetail(slug);
      const normalized = tcwApiService.normalizeTCWSong(detail);
      onPresentSong(normalized);
    } catch (e: any) {
      alert(`Could not load lyrics for presentation: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/15">
            <Globe className="w-3.5 h-3.5 text-purple-300" />
            <span>Tamil Christian World Live Catalogue</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Discover Over 16,000+ Tamil Christian Songs
          </h1>

          <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed">
            Search songs across Tamil script and English transliteration. Preview lyrics, chords, and instantly present them live on your church display without cluttering your private songbook.
          </p>

          {/* Quick Search Suggestions */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-purple-200/80">
            <span className="font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Suggestions:
            </span>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => {
                  setSearchQuery(s);
                  setSelectedLetter(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Search Bar & Filters Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by song title or lyrics in Tamil (இயேசு) or English (jesus)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Toggle Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setHasMediaFilter(!hasMediaFilter);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                hasMediaFilter
                  ? 'bg-red-500 text-white border-red-500 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>With Video</span>
            </button>

            <button
              onClick={() => {
                setHasChordsFilter(!hasChordsFilter);
                setPage(1);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                hasChordsFilter
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>With Chords</span>
            </button>

            {(searchQuery || hasMediaFilter || hasChordsFilter || selectedLetter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-9 px-2.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Tamil Alphabet Quick Filter Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 font-medium whitespace-nowrap mr-1">Alphabet:</span>
          {TAMIL_LETTERS.map(letter => (
            <button
              key={letter}
              onClick={() => handleSelectLetter(letter)}
              className={`px-2.5 py-1 rounded-lg font-tamil font-semibold transition-colors shrink-0 ${
                selectedLetter === letter
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header / Stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div>
          {loading ? (
            <span>Searching catalogue...</span>
          ) : (
            <span>
              Found {songs.length} song{songs.length !== 1 ? 's' : ''} 
              {totalSongs ? ` (out of ${totalSongs.toLocaleString()} total)` : ''}
              {debouncedQuery && <span> for "<strong className="text-slate-700 dark:text-slate-200">{debouncedQuery}</strong>"</span>}
            </span>
          )}
        </div>

        {totalPages && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Searching Tamil Christian World songs...
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 text-center space-y-3 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <Button variant="outline" size="sm" onClick={loadSongs}>
            Retry Search
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && songs.length === 0 && (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No matching songs found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try searching with fewer keywords, check the spelling, or click one of the suggested tags above.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters} className="rounded-xl">
            Reset Filters
          </Button>
        </div>
      )}

      {/* Song Cards Grid */}
      {!loading && !error && songs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map(song => (
            <div
              key={song.slug}
              onClick={() => setSelectedSlug(song.slug)}
              className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      TCW
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-tamil group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                      {song.title_ta}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize line-clamp-1">
                      {song.title_en}
                    </p>
                  </div>

                  {song.has_media && (
                    <span 
                      className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 shrink-0"
                      title="Video available"
                    >
                      <Tv className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* Artist & Album */}
                {(song.artist || song.album) && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {song.artist && (
                      <span className="flex items-center gap-1">
                        <Mic2 className="w-3 h-3 text-purple-500" />
                        <span className="line-clamp-1">{song.artist}</span>
                      </span>
                    )}
                    {song.album && (
                      <span className="flex items-center gap-1">
                        <Disc className="w-3 h-3 text-purple-500" />
                        <span className="line-clamp-1">{song.album}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedSlug(song.slug);
                  }}
                  className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
                >
                  View Details & Chords
                </button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={e => {
                    e.stopPropagation();
                    handleQuickPresent(song.slug);
                  }}
                  className="rounded-xl h-8 px-3 text-xs gap-1 border-purple-200 dark:border-purple-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300"
                >
                  <Tv className="w-3 h-3" />
                  <span>Present</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls at Bottom */}
      {!loading && !error && totalPages && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              setPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-xl gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              setPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-xl gap-1 text-xs"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Mandatory Attribution Footer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-500 shrink-0" />
          <span>
            External songs provided via public read-only access from <a href="https://tamilchristianworld.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">Tamil Christian World</a> for church worship service preparation.
          </span>
        </div>
        <a 
          href="https://tamilchristianworld.com/rights" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-slate-600 dark:text-slate-300 hover:underline shrink-0 font-medium flex items-center gap-1"
        >
          <span>Rights & Licensing Info</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Song Details Modal */}
      {selectedSlug && (
        <ExternalSongDetailModal
          slug={selectedSlug}
          onClose={() => setSelectedSlug(null)}
          onPresent={song => {
            setSelectedSlug(null);
            onPresentSong(song);
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
