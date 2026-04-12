import { Music, Search, Plus, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  onAddSong: () => void;
}

export function Navbar({ user, onLogin, onLogout, onAddSong }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
            <Music className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ECI Song Book</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="outline" size="sm" onClick={onAddSong} className="hidden sm:flex gap-2">
                <Plus className="h-4 w-4" /> Submit Lyrics
              </Button>
              <div className="flex items-center gap-3 pl-2 border-l">
                <div className="flex flex-col items-end hidden md:flex">
                  <span className="text-sm font-medium">{user.displayName}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full">
                  <LogOut className="h-5 w-5 text-slate-500" />
                </Button>
              </div>
            </>
          ) : (
            <Button onClick={onLogin} className="gap-2 bg-brand-600 hover:bg-brand-700">
              <LogIn className="h-4 w-4" /> Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
