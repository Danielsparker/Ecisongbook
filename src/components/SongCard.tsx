import { FileText, Presentation, ChevronRight, Music2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onView: (song: Song) => void;
}

export function SongCard({ song, onView }: SongCardProps) {
  return (
    <Card className="group overflow-hidden transition-all hover:shadow-md border-slate-200 dark:border-slate-800 dark:bg-slate-900/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-1">
          <Badge variant="secondary" className="bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border-brand-100 dark:border-brand-800 font-mono">
            #{song.songNo}
          </Badge>
          <Badge variant="outline" className="text-slate-500 dark:text-slate-400 font-normal dark:border-slate-800">
            {song.genre}
          </Badge>
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
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          className="w-full justify-between text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20"
          onClick={() => onView(song)}
        >
          View Lyrics
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
