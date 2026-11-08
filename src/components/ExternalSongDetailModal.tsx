import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Tv, 
  Music2, 
  Disc, 
  Mic2, 
  Clock, 
  Key, 
  PlayCircle, 
  FileText, 
  Sliders,
  Check,
  Copy,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TCWSongDetail, Song } from '../types';
import { tcwApiService } from '../services/tcwApiService';

interface ExternalSongDetailModalProps {
  slug: string;
  onClose: () => void;
  onPresent: (song: Song) => void;
  isDarkMode?: boolean;
}

export const ExternalSongDetailModal: React.FC<ExternalSongDetailModalProps> = ({
  slug,
  onClose,
  onPresent,
  isDarkMode = false
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [songDetail, setSongDetail] = useState<TCWSongDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'tamil' | 'english' | 'chords'>('tamil');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    tcwApiService.getSongDetail(slug)
      .then(detail => {
        if (isMounted) {
          setSongDetail(detail);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load song details');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyLyrics = () => {
    if (!songDetail) return;
    const textToCopy = activeTab === 'english' 
      ? songDetail.lyrics.en 
      : activeTab === 'chords' && songDetail.chords 
        ? songDetail.chords 
        : songDetail.lyrics.ta;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePresent = () => {
    if (!songDetail) return;
    const normalized = tcwApiService.normalizeTCWSong(songDetail);
    onPresent(normalized);
  };

  const artistName = typeof songDetail?.artist === 'object' && songDetail?.artist !== null
    ? songDetail.artist.name
    : (songDetail?.artist || null);

  const albumTitle = typeof songDetail?.album === 'object' && songDetail?.album !== null
    ? songDetail.album.title
    : (songDetail?.album || null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Tamil Christian World
              </span>
              {songDetail?.youtube_id && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  <PlayCircle className="w-3 h-3" /> Video
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-tamil">
              {songDetail?.title_ta || 'Loading Song...'}
            </h2>
            {songDetail?.title_en && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">
                {songDetail.title_en}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Fetching lyrics and chords from Tamil Christian World...
              </p>
            </div>
          )}

          {error && (
            <div className="p-6 text-center space-y-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {!loading && songDetail && (
            <>
              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {artistName && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    <Mic2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>{artistName}</span>
                  </div>
                )}
                {albumTitle && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    <Disc className="w-3.5 h-3.5 text-purple-500" />
                    <span>{albumTitle}</span>
                  </div>
                )}
                {songDetail.key && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium border border-amber-200 dark:border-amber-800/60">
                    <Key className="w-3.5 h-3.5" />
                    <span>Key: {songDetail.key}</span>
                  </div>
                )}
                {songDetail.tempo && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200 dark:border-emerald-800/60">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{songDetail.tempo} BPM {songDetail.beat ? `(${songDetail.beat})` : ''}</span>
                  </div>
                )}
                {songDetail.youtube_id && (
                  <a 
                    href={`https://www.youtube.com/watch?v=${songDetail.youtube_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 font-medium border border-red-200 dark:border-red-800 transition-colors"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Watch Video</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                )}
              </div>

              {/* View Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('tamil')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'tamil'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Tamil Lyrics
                  </button>
                  {songDetail.lyrics.en && (
                    <button
                      onClick={() => setActiveTab('english')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'english'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      Transliteration
                    </button>
                  )}
                  {songDetail.chords && (
                    <button
                      onClick={() => setActiveTab('chords')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'chords'
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      Chords
                    </button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLyrics}
                  className="text-xs h-8 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>

              {/* Lyrics Content Display */}
              <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-5 border border-slate-100 dark:border-slate-800/80">
                {activeTab === 'tamil' && (
                  <div className="space-y-4">
                    {songDetail.sections && songDetail.sections.length > 0 ? (
                      songDetail.sections.map((section, idx) => (
                        <div 
                          key={section.index || idx}
                          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm"
                        >
                          {section.number && (
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1">
                              Verse {section.number}
                            </span>
                          )}
                          {section.is_refrain && (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                              Chorus / Refrain
                            </span>
                          )}
                          <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-tamil">
                            {section.ta.join('\n')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-line font-tamil">
                        {songDetail.lyrics.ta}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'english' && (
                  <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-sans">
                    {songDetail.lyrics.en}
                  </p>
                )}

                {activeTab === 'chords' && (
                  <pre className="text-sm font-mono leading-relaxed text-amber-700 dark:text-amber-300 whitespace-pre overflow-x-auto">
                    {songDetail.chords}
                  </pre>
                )}
              </div>

              {/* Attribution Notice required by TCW Rights */}
              <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-start gap-3">
                <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-900/80 dark:text-purple-300/90 leading-relaxed space-y-1">
                  <p>
                    <strong>Attribution:</strong> Source: <a href="https://tamilchristianworld.com" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-purple-700 dark:hover:text-purple-200">Tamil Christian World</a>. Provided for service preparation under church licensing.
                  </p>
                  <p className="text-[11px] text-purple-700/70 dark:text-purple-400/70">
                    This song is presented transiently and is not stored in your permanent songbook.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          {songDetail?.url ? (
            <a
              href={songDetail.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium"
            >
              <span>View on tamilchristianworld.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : <div />}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">
              Close
            </Button>
            <Button
              disabled={loading || !songDetail}
              onClick={handlePresent}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md flex items-center gap-1.5"
            >
              <Tv className="w-4 h-4" />
              <span>Present Now</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
