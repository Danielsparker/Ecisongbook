import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Submit New Lyrics</DialogTitle>
          <DialogDescription>
            Share your favorite song lyrics with the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Song Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Bohemian Rhapsody" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="songNo">Song Number</Label>
                <Input 
                  id="songNo" 
                  type="number" 
                  placeholder="e.g. 101" 
                  value={songNo}
                  onChange={(e) => setSongNo(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input 
                id="genre" 
                placeholder="e.g. Rock, Pop, Jazz" 
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lyrics">Lyrics</Label>
              <Textarea 
                id="lyrics" 
                placeholder="Paste the lyrics here..." 
                className="min-h-[200px] font-serif"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="p-6 pt-4 border-t bg-slate-50/50">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-brand-600 hover:bg-brand-700">Submit Song</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
