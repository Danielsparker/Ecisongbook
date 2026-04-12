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
}

export function SubmitSongDialog({ isOpen, onClose, onSubmit }: SubmitSongDialogProps) {
  const [title, setTitle] = useState('');
  const [songNo, setSongNo] = useState('');
  const [genre, setGenre] = useState('');
  const [lyrics, setLyrics] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      songNo: parseInt(songNo),
      genre,
      lyrics
    });
    // Reset form
    setTitle('');
    setSongNo('');
    setGenre('');
    setLyrics('');
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
                  <Label htmlFor="songNo" className="dark:text-slate-300">Song Number</Label>
                  <Input 
                    id="songNo" 
                    type="number" 
                    placeholder="e.g. 101" 
                    value={songNo}
                    onChange={(e) => setSongNo(e.target.value)}
                    required
                    className="dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre" className="dark:text-slate-300">Genre</Label>
                <Input 
                  id="genre" 
                  placeholder="e.g. Rock, Pop, Jazz" 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  required
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
            <Button type="button" variant="ghost" onClick={onClose} className="dark:text-slate-400 dark:hover:text-white">Cancel</Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700">Submit Song</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
