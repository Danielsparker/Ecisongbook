import { FileText, Presentation, ChevronRight, Music2, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onView: (song: Song) => void;
  onPresent: (song: Song) => void;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
}

export function SongCard({ song, onView, onPresent, onEdit, onDelete }: SongCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800 dark:bg-slate-900/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-1">
          <Badge variant="secondary" className="bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border-brand-100 dark:border-brand-800 font-mono">
            #{song.songNo}
          </Badge>
          {song.genre && (
            <Badge variant="outline" className="text-slate-500 dark:text-slate-400 font-normal dark:border-slate-800">
              {song.genre}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg font-bold group-hover:text-brand-600 transition-colors line-clamp-1 dark:text-white">
          {song.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 font-serif italic">
          {song.lyrics.substring(0, 120)}...
        </p>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Button 
          variant="ghost" 
          className="flex-1 justify-between text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20"
          onClick={() => onView(song)}
        >
          View Lyrics
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          title="Edit Song"
          aria-label={`Edit ${song.title}`}
          className="h-10 w-10 shrink-0 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(song);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          title="Delete Song"
          aria-label={`Delete ${song.title}`}
          className="h-10 w-10 shrink-0 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(song);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          size="icon"
          title="Present Live"
          aria-label={`Present ${song.title} live`}
          className="h-10 w-10 shrink-0 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950"
          onClick={(e) => {
            e.stopPropagation();
            onPresent(song);
          }}
        >
          <Presentation className="h-4.5 w-4.5 text-brand-600 dark:text-brand-400" />
        </Button>
      </CardFooter>
    </Card>
  );
}
