import React, { useState, useEffect } from 'react';
import { Copyright, ShieldCheck, ExternalLink, Info, FileWarning, Tv, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Song } from '../types';

const COPYRIGHT_ACK_STORAGE_KEY = 'eci_external_copyright_acknowledged_v1';

export const EXTERNAL_CONSENT_CHECKBOX_LABEL =
  'I confirm that my church is responsible for obtaining the necessary permissions or licences to display this song.';

export const EXTERNAL_EXPORT_REMINDER_TEXT =
  'Exporting externally sourced lyrics is provided for worship preparation convenience only. Export functionality does not grant copyright, reproduction, or distribution rights. Please ensure your church holds the appropriate licences (such as CCLI or equivalent) before reproducing or distributing these lyrics.';

export const COPYRIGHT_NOTICE_PARAGRAPHS: string[] = [
  'Tamil Worship Lyrics is a church song search and presentation platform designed to help congregations access and present worship songs conveniently.',
  'Lyrics retrieved from external sources may be protected by copyright and remain the property of their respective authors, composers, publishers or copyright holders.',
  'Tamil Worship Lyrics does not claim ownership of third-party songs and does not grant copyright or reproduction permissions for externally sourced content.',
  'Churches and users are responsible for ensuring that they have the appropriate permissions or licences before reproducing, displaying, projecting, exporting or distributing copyrighted song lyrics.',
  'Where applicable, churches should maintain an appropriate reproduction licence, such as CCLI or an equivalent licence, and report song usage according to the relevant licensing requirements.',
  'External song search, export and presentation features are provided for convenience. They are intended to help churches access and present songs they are already authorised to use.',
  'Using Tamil Worship Lyrics or accessing an external song API does not automatically grant permission to use copyrighted content.',
  'For copyright permissions, licensing enquiries or removal requests, users should contact the respective copyright holders or external content providers.',
];

export function hasAcknowledgedExternalCopyright(): boolean {
  try {
    return localStorage.getItem(COPYRIGHT_ACK_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setExternalCopyrightAcknowledged(): void {
  try {
    localStorage.setItem(COPYRIGHT_ACK_STORAGE_KEY, 'true');
  } catch {
    // Ignore storage quota / private mode failures
  }
}

interface CopyrightNoticeContentProps {
  compact?: boolean;
}

export const CopyrightNoticeContent: React.FC<CopyrightNoticeContentProps> = ({ compact = false }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/70 p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
            <Copyright className="h-4.5 w-4.5" />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Copyright &amp; Licensing
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Third-party lyrics responsibility &amp; church licensing notice
            </p>
          </div>
        </div>

        <div className={`space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>
          {COPYRIGHT_NOTICE_PARAGRAPHS.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-500 dark:text-slate-400">
        <span>External API partner rights information:</span>
        <a
          href="https://tamilchristianworld.com/rights"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400 hover:underline"
        >
          <span>Tamil Christian World Rights</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
};

interface CopyrightNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceName?: string;
}

export const CopyrightNoticeModal: React.FC<CopyrightNoticeModalProps> = ({
  isOpen,
  onClose,
  sourceName = 'Tamil Christian World',
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl sm:max-w-2xl max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-5 pr-12 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Copyright className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>Copyright &amp; Licensing</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Information regarding externally sourced songs ({sourceName}) and church licensing obligations.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6">
          <CopyrightNoticeContent />
        </div>

        <DialogFooter className="mx-0 mb-0 px-5 py-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 rounded-b-3xl shrink-0">
          <Button onClick={onClose} className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-6">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ExternalCopyrightConsentDialogProps {
  song: Song | null;
  isOpen: boolean;
  onConfirm: (song: Song) => void;
  onCancel: () => void;
}

export const ExternalCopyrightConsentDialog: React.FC<ExternalCopyrightConsentDialogProps> = ({
  song,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const [checked, setChecked] = useState(false);
  const [showFullNotice, setShowFullNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setChecked(false);
      setShowFullNotice(false);
    }
  }, [isOpen, song?.id, song?.title]);

  if (!song) return null;

  const handleContinue = () => {
    if (!checked) return;
    setExternalCopyrightAcknowledged();
    onConfirm(song);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-[95vw] max-w-xl sm:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="px-5 py-4 sm:px-6 sm:py-5 pr-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Copyright className="h-3 w-3" />
              External Song Source
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {song.source || 'Tamil Christian World'}
            </span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
            Licensing &amp; Copyright Notice
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Before presenting <strong className="text-slate-700 dark:text-slate-200">{song.title}</strong>, please review your church&apos;s licensing responsibilities.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              This song is retrieved from an external source ({song.source || 'Tamil Christian World'}) and is not owned by Tamil Worship Lyrics. Accessing external lyrics through an API does not grant permission to reproduce, export, or publicly project copyrighted content.
            </p>
            <p>
              Churches are responsible for maintaining appropriate permissions or licences (such as CCLI or an equivalent licence) and reporting song usage where required. Tamil Worship Lyrics does not verify or validate individual church licences.
            </p>
            <button
              type="button"
              onClick={() => setShowFullNotice(prev => !prev)}
              className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline pt-0.5"
            >
              <Info className="h-3.5 w-3.5" />
              <span>{showFullNotice ? 'Hide full Copyright & Licensing notice' : 'View full Copyright & Licensing notice'}</span>
            </button>
          </div>

          {showFullNotice && <CopyrightNoticeContent compact />}

          <label className="flex items-start gap-3 p-4 rounded-2xl border border-purple-200/80 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 cursor-pointer select-none hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 shrink-0 cursor-pointer"
            />
            <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
              {EXTERNAL_CONSENT_CHECKBOX_LABEL}
            </span>
          </label>
        </div>

        <DialogFooter className="mx-0 mb-0 px-5 py-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 rounded-b-3xl flex flex-col-reverse sm:flex-row sm:justify-end gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!checked}
            onClick={handleContinue}
            className="rounded-xl gap-2 bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          >
            <Tv className="h-4 w-4" />
            <span>Continue to Presentation</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface ExternalExportReminderDialogProps {
  isOpen: boolean;
  songTitle?: string;
  formatLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExternalExportReminderDialog: React.FC<ExternalExportReminderDialogProps> = ({
  isOpen,
  songTitle,
  formatLabel,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-md p-0 gap-0 overflow-hidden rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
        <DialogHeader className="px-5 py-4 sm:px-6 pr-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileWarning className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>External Lyrics Export Notice</span>
          </DialogTitle>
          {songTitle && (
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {songTitle} ({formatLabel})
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="p-5 sm:p-6 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>{EXTERNAL_EXPORT_REMINDER_TEXT}</p>
        </div>

        <DialogFooter className="mx-0 mb-0 px-5 py-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 rounded-b-3xl flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl border-slate-200 dark:border-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="rounded-xl gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="h-4 w-4" />
            <span>Export {formatLabel}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CopyrightInfoIconButtonProps {
  onClick: (e: React.MouseEvent) => void;
  title?: string;
  className?: string;
}

export const CopyrightInfoIconButton: React.FC<CopyrightInfoIconButtonProps> = ({
  onClick,
  title = 'External source copyright & licensing information',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`inline-flex items-center justify-center rounded-full p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer ${className}`}
    >
      <Copyright className="w-3.5 h-3.5" />
    </button>
  );
};

export const SongSourceBadge: React.FC<{ isExternal?: boolean; songNo?: number }> = ({
  isExternal,
  songNo,
}) => {
  if (isExternal) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/70">
        <Copyright className="w-2.5 h-2.5" />
        <span>External · TCW</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-800">
      <ShieldCheck className="w-2.5 h-2.5" />
      <span>{songNo ? `Song #${songNo}` : 'Songbook'}</span>
    </span>
  );
};
