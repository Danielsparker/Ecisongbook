import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, Save, AlertTriangle } from 'lucide-react';
import { Song } from '../types';

interface EditSongDialogProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (songId: string, updatedData: { title: string; songNo: number; genre: string; lyrics: string }) => Promise<void> | void;
  onDelete: (songId: string) => Promise<void> | void;
}

export function EditSongDialog({ song, isOpen, onClose, onSave, onDelete }: EditSongDialogProps) {
  const [title, setTitle] = useState('');
  const [songNo, setSongNo] = useState('');
  const [genre, setGenre] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (song) {
      setTitle(song.title || '');
      setSongNo(song.songNo ? song.songNo.toString() : '');
      setGenre(song.genre || '');
      setLyrics(song.lyrics || '');
      setShowConfirmDelete(false);
    }
  }, [song, isOpen]);

  if (!song) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    setIsSaving(true);
    try {
      await onSave(song.id, {
        title: cleanTitle,
        songNo: parseInt(songNo, 10) || 0,
        genre: genre.trim().slice(0, 100),
        lyrics: cleanLyrics
      });
      onClose();
    } catch (err) {
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(song.id);
      setShowConfirmDelete(false);
      onClose();
    } catch (err) {
      alert("Failed to delete song. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl max-h-[90vh] flex flex-col dark:bg-slate-950 dark:border-slate-800">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle className="text-2xl font-bold dark:text-white flex items-center justify-between">
            <span>Edit Song Lyrics</span>
            <span className="text-xs font-mono font-normal text-slate-400">ID: #{song.songNo}</span>
          </DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Update song information or lyrics below.
          </DialogDescription>
        </DialogHeader>

        {showConfirmDelete ? (
          <div className="p-6 bg-red-50/80 dark:bg-red-950/40 border-y border-red-200 dark:border-red-900/50 my-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/60 rounded-xl text-red-600 dark:text-red-400 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-red-900 dark:text-red-200 text-base">Delete "{song.title}"?</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Are you sure you want to permanently delete this song? This action cannot be undone.
                </p>
                <div className="flex gap-3 mt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="gap-2 bg-red-600 hover:bg-red-700 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? 'Deleting...' : 'Yes, Delete Song'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmDelete(false)}
                    className="rounded-xl border-slate-300 dark:border-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6">
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="dark:text-slate-300 font-medium">Song Title</Label>
                  <Input 
                    id="edit-title" 
                    placeholder="e.g. Amazing Grace" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="dark:bg-slate-900 dark:border-slate-800 dark:text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-songNo" className="dark:text-slate-300 font-medium">Song Number</Label>
                  <Input 
                    id="edit-songNo" 
                    type="number" 
                    placeholder="e.g. 101" 
                    value={songNo}
                    onChange={(e) => setSongNo(e.target.value)}
                    required
                    className="dark:bg-slate-900 dark:border-slate-800 dark:text-white rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-genre" className="dark:text-slate-300 font-medium">Genre / Category <span className="text-xs text-slate-400 font-normal">(Optional)</span></Label>
                <Input 
                  id="edit-genre" 
                  placeholder="e.g. Worship, Praise, Tamil Hymn" 
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="dark:bg-slate-900 dark:border-slate-800 dark:text-white rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-lyrics" className="dark:text-slate-300 font-medium">Lyrics</Label>
                <Textarea 
                  id="edit-lyrics" 
                  placeholder="Lyrics text..." 
                  className="min-h-[260px] font-serif resize-none dark:bg-slate-900 dark:border-slate-800 dark:text-white rounded-xl leading-relaxed text-base"
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDelete(true)}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/50 rounded-xl"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl dark:text-slate-400 dark:hover:text-white">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
                className="gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/10"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
