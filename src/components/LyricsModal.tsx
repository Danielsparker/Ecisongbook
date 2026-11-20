import { useState } from 'react';
import { FileText, Presentation, Pencil, Trash2, Copy, Check, ExternalLink, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Song } from '../types';
import { downloadAsPDF, downloadAsPPT } from '../services/downloadService';
import {
  CopyrightNoticeModal,
  CopyrightInfoIconButton,
  ExternalExportReminderDialog,
  SongSourceBadge,
  EXTERNAL_EXPORT_REMINDER_TEXT,
} from './CopyrightNotice';

interface LyricsModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onPresent: (song: Song) => void;
  onEdit?: (song: Song) => void;
  onDelete?: (song: Song) => void;
}

export function LyricsModal({ song, isOpen, onClose, onPresent, onEdit, onDelete }: LyricsModalProps) {
  const [copied, setCopied] = useState(false);
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [pendingExportFormat, setPendingExportFormat] = useState<'PDF' | 'PPT' | null>(null);

  if (!song) return null;

  const performDownload = (format: 'PDF' | 'PPT') => {
    try {
      if (format === 'PDF') {
        downloadAsPDF(song);
      } else {
        downloadAsPPT(song);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : `Failed to export ${format}`);
    }
  };

  const handlePDFDownload = () => {
    if (song.isExternal) {
      setPendingExportFormat('PDF');
      return;
    }
    performDownload('PDF');
  };

  const handlePPTDownload = () => {
    if (song.isExternal) {
      setPendingExportFormat('PPT');
      return;
    }
    performDownload('PPT');
  };

  const handleCopy = () => {
    if (!song.lyrics) return;
    navigator.clipboard.writeText(song.lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSubmittedDate = () => {
    if (song.isExternal) {
      return `Source: ${song.source || 'Tamil Christian World'}`;
    }
    const raw = song.createdAt;
    if (!raw) return 'ECI Songbook';
    let date: Date | null = null;
    if (typeof raw?.toDate === 'function') {
      date = raw.toDate();
    } else if (typeof raw?.seconds === 'number') {
      date = new Date(raw.seconds * 1000);
    } else if (typeof raw === 'string' || typeof raw === 'number') {
      date = new Date(raw);
    }
    if (!date || Number.isNaN(date.getTime())) {
      return 'ECI Songbook';
    }
    return `Submitted on ${date.toLocaleDateString()}`;
  };

  const stanzas = (song.lyrics || '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] max-w-5xl sm:max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl dark:bg-slate-950 dark:border-slate-800">
        <DialogHeader className="px-5 py-4 sm:px-8 sm:py-5 pr-12 border-b shrink-0 bg-white dark:bg-slate-950 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <SongSourceBadge isExternal={song.isExternal} songNo={song.songNo} />
                {song.isExternal && (
                  <CopyrightInfoIconButton onClick={() => setShowCopyrightModal(true)} />
                )}
                {song.genre && (
                  <>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{song.genre}</span>
                  </>
                )}
              </div>
              <DialogTitle className="text-xl sm:text-3xl font-bold tracking-tight dark:text-white leading-snug break-words">
                {song.title}
              </DialogTitle>
              {song.transliteration && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 capitalize">
                  {song.transliteration}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              {!song.isExternal && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40 border-slate-200 dark:border-slate-800"
                  onClick={() => onEdit(song)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
              {!song.isExternal && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 border-slate-200 dark:border-slate-800"
                  onClick={() => onDelete(song)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50/70 dark:bg-slate-900/50 p-4 sm:p-8 space-y-4">
          {copied && song.isExternal && (
            <div className="max-w-5xl mx-auto px-3.5 py-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <span>{EXTERNAL_EXPORT_REMINDER_TEXT}</span>
            </div>
          )}
          {stanzas.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {stanzas.map((stanza, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
                >
                  <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">
                    Stanza {index + 1}
                  </div>
                  <pre className="lyrics-text text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed break-words whitespace-pre-wrap font-sans">
                    {stanza}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-5 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <pre className="lyrics-text text-lg sm:text-xl text-slate-800 dark:text-slate-200 leading-relaxed break-words whitespace-pre-wrap font-sans">
                {song.lyrics}
              </pre>
            </div>
          )}
        </div>

        <div className="px-5 py-4 sm:px-8 border-t bg-white dark:bg-slate-950 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{formatSubmittedDate()}</span>
            {song.isExternal && song.sourceUrl && (
              <a
                href={song.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                <span>Open source</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-xl border-slate-200 dark:border-slate-800"
              onClick={handlePDFDownload}
            >
              <FileText className="h-4 w-4 text-red-500" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-xl border-slate-200 dark:border-slate-800"
              onClick={handlePPTDownload}
            >
              <Presentation className="h-4 w-4 text-orange-500" />
              PPT
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/10"
              onClick={() => {
                onPresent(song);
                onClose();
              }}
            >
              <Presentation className="h-4 w-4 text-white" />
              Present Live
            </Button>
          </div>
        </div>
      </DialogContent>

      <ExternalExportReminderDialog
        isOpen={!!pendingExportFormat}
        songTitle={song.title}
        formatLabel={pendingExportFormat || 'PDF'}
        onConfirm={() => {
          if (pendingExportFormat) {
            performDownload(pendingExportFormat);
          }
          setPendingExportFormat(null);
        }}
        onCancel={() => setPendingExportFormat(null)}
      />

      <CopyrightNoticeModal
        isOpen={showCopyrightModal}
        onClose={() => setShowCopyrightModal(false)}
        sourceName={song.source || 'Tamil Christian World'}
      />
    </Dialog>
  );
}

