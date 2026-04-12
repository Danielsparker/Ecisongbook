import { FileText, Presentation, X, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Song } from '../types';
import { downloadAsPDF, downloadAsPPT } from '../services/downloadService';

interface LyricsModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LyricsModal({ song, isOpen, onClose }: LyricsModalProps) {
  if (!song) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl dark:bg-slate-950 dark:border-slate-800">
        <DialogHeader className="p-6 pb-4 border-b shrink-0 bg-white dark:bg-slate-950 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest">#{song.songNo}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{song.genre}</span>
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">{song.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
          <div className="p-6 sm:p-10 max-w-2xl mx-auto">
            <pre className="lyrics-text text-lg sm:text-xl text-slate-800 dark:text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
              {song.lyrics}
            </pre>
          </div>
        </div>

        <div className="p-4 border-t bg-white dark:bg-slate-950 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <span className="text-xs text-slate-400">
            Submitted on {new Date(song.createdAt?.seconds * 1000).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-xl border-slate-200"
              onClick={() => downloadAsPDF(song)}
            >
              <FileText className="h-4 w-4 text-red-500" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 rounded-xl border-slate-200"
              onClick={() => downloadAsPPT(song)}
            >
              <Presentation className="h-4 w-4 text-orange-500" />
              PPT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
