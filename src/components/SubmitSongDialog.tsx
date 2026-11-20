import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SubmitSongDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (song: { title: string; songNo: number; genre: string; lyrics: string }) => void;
  suggestedSongNo?: number;
  songs?: Array<any>;
}

export function extractSongNumber(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    const parsed = parseInt(trimmed, 10);
    if (!isNaN(parsed) && Number.isFinite(parsed)) return parsed;
    const match = trimmed.match(/\d+/);
    if (match) {
      const matchParsed = parseInt(match[0], 10);
      if (!isNaN(matchParsed) && Number.isFinite(matchParsed)) return matchParsed;
    }
  }
  return null;
}

export function getSuggestedSongNo(songs?: Array<any>): number {
  if (!songs || songs.length === 0) {
    return 1001;
  }

  const allNumbers: number[] = [];
  for (const s of songs) {
    if (!s) continue;
    const candidates = [
      s.songNo,
      s.song_no,
      s.number,
      s.songNumber,
      s.song_number,
      s.no
    ];
    for (const cand of candidates) {
      const num = extractSongNumber(cand);
      if (num !== null) {
        allNumbers.push(num);
        break;
      }
    }
  }

  if (allNumbers.length === 0) {
    return 1001;
  }

  const maxNo = Math.max(...allNumbers);
  // Default is last song number in book + 1 (e.g. 1023 -> 1024), starting strictly after 1000
  if (maxNo >= 1000) {
    return maxNo + 1;
  }
  return 1001;
}

export function SubmitSongDialog({ isOpen, onClose, onSubmit, suggestedSongNo = 1001, songs }: SubmitSongDialogProps) {
  const [title, setTitle] = useState('');
  const [songNo, setSongNo] = useState('');
  const [genre, setGenre] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // Calculate the effective suggested number
  const effectiveSuggestedNo = React.useMemo(() => {
    if (songs && songs.length > 0) {
      return getSuggestedSongNo(songs);
    }
    return suggestedSongNo && suggestedSongNo >= 1001 ? suggestedSongNo : 1001;
  }, [songs, suggestedSongNo]);

  // Automatically suggest song number when opening
  React.useEffect(() => {
    if (isOpen) {
      setSongNo(String(effectiveSuggestedNo));
    }
  }, [isOpen, effectiveSuggestedNo]);

  const handleCancel = () => {
    setTitle('');
    setSongNo(String(effectiveSuggestedNo));
    setGenre('');
    setLyrics('');
    setHoneypot('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Anti-spam honeypot check
    if (honeypot) {
      onClose();
      return;
    }

    const cleanTitle = title.trim();
    const cleanLyrics = lyrics.trim();

    if (!cleanTitle || cleanTitle.length > 200) {
      alert("Song title must be between 1 and 200 characters.");
      return;
    }

    if (!cleanLyrics || cleanLyrics.length > 10000) {
      alert("Lyrics must be between 1 and 10,000 characters.");
      return;
    }

    const parsedSongNo = parseInt(songNo, 10);
    if (isNaN(parsedSongNo) || parsedSongNo <= 0) {
      alert("Please enter a valid positive song number.");
      return;
    }

    onSubmit({
      title: cleanTitle,
      songNo: parsedSongNo,
      genre: genre.trim().slice(0, 100),
      lyrics: cleanLyrics
    });
    // Reset form
    setTitle('');
    setSongNo(String(effectiveSuggestedNo));
    setGenre('');
    setLyrics('');
    setHoneypot('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl max-h-[90vh] flex flex-col dark:bg-slate-950 dark:border-slate-800">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-2xl font-bold dark:text-white">Submit New Lyrics</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Share your favorite song lyrics with the community.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="py-4 space-y-4">
              {/* Hidden honeypot field for anti-bot protection */}
              <input
                type="text"
                name="website_url"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="dark:text-slate-300">Song Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Bohemian Rhapsody" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="songNo" className="dark:text-slate-300">Song Number</Label>
                    <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full">
                      Editable
                    </span>
                  </div>
                  <Input 
                    id="songNo" 
                    type="number" 
                    min="1"
                    placeholder={`e.g. ${effectiveSuggestedNo}`} 
                    value={songNo}
                    onChange={(e) => setSongNo(e.target.value)}
                    required
                    className="dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                  />
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>Suggested: #{effectiveSuggestedNo} (editable)</span>
                    {songNo !== String(effectiveSuggestedNo) && (
                      <button
                        type="button"
                        onClick={() => setSongNo(String(effectiveSuggestedNo))}
                        className="text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium underline text-[11px]"
                      >
                        Reset to #{effectiveSuggestedNo}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre" className="dark:text-slate-300">Genre <span className="text-xs text-slate-400 font-normal">(Optional)</span></Label>
                <Input 
                  id="genre" 
                  placeholder="e.g. Rock, Pop, Jazz" 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lyrics" className="dark:text-slate-300">Lyrics</Label>
                <Textarea 
                  id="lyrics" 
                  placeholder="Paste the lyrics here..." 
                  className="min-h-[300px] font-serif resize-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="p-6 pt-4 border-t bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 shrink-0">
            <Button type="button" variant="ghost" onClick={handleCancel} className="dark:text-slate-400 dark:hover:text-white">Cancel</Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700">Submit Song</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
