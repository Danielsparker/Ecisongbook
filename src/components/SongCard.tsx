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
    <Card className="group overflow-hidden transition-all hover:shadow-md border-slate-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-1">
          <Badge variant="secondary" className="bg-brand-50 text-brand-700 border-brand-100 font-mono">
            #{song.songNo}
          </Badge>
          <Badge variant="outline" className="text-slate-500 font-normal">
            {song.genre}
          </Badge>
        </div>
        <CardTitle className="text-lg font-bold group-hover:text-brand-600 transition-colors line-clamp-1">
          {song.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-slate-500 line-clamp-3 font-serif italic">
          {song.lyrics.substring(0, 120)}...
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="ghost" 
          className="w-full justify-between text-brand-600 hover:text-brand-700 hover:bg-brand-50"
          onClick={() => onView(song)}
        >
          View Lyrics
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
