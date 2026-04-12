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
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest">#{song.songNo}</span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{song.genre}</span>
              </div>
              <DialogTitle className="text-3xl font-bold tracking-tight">{song.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-8 bg-slate-50/50">
          <div className="max-w-2xl mx-auto">
            <pre className="lyrics-text text-lg text-slate-800 leading-relaxed">
              {song.lyrics}
            </pre>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white flex flex-wrap items-center justify-between gap-4">
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
