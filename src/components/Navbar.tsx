import { Music, Plus, LogIn, LogOut, Settings, Loader2, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { presenterManager } from '../services/presenterManager';

interface NavbarProps {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  onAddSong: () => void;
  onOpenSettings: () => void;
  onOpenStudio?: () => void;
  canSubmit: boolean;
  isLoggingIn?: boolean;
}

export function Navbar({ 
  user, 
  onLogin, 
  onLogout, 
  onAddSong, 
  onOpenSettings, 
  onOpenStudio,
  canSubmit, 
  isLoggingIn 
}: NavbarProps) {

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
            <Music className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ECI Song Book</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct "Control Center" Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenStudio || (() => presenterManager.openPresenterControlTab())}
            className="flex items-center gap-1.5 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
            title="Open Presenter Control Center"
          >
            <Sliders className="h-4 w-4 text-purple-500" />
            <span className="font-medium hidden sm:inline">Control Center</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddSong} 
            className="flex gap-1.5 rounded-xl border-brand-200 dark:border-slate-800 hover:bg-brand-50 dark:hover:bg-slate-900 hidden sm:inline-flex"
          >
            <Plus className="h-4 w-4 text-brand-600" /> 
            <span className="dark:text-slate-200">Submit</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={onOpenSettings} className="rounded-full hidden sm:inline-flex">
            <Settings className="h-5 w-5 text-slate-500" />
          </Button>
          
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-medium dark:text-slate-200">{user.displayName}</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full">
                <LogOut className="h-5 w-5 text-slate-500" />
              </Button>
            </div>
          ) : (
            <Button 
              onClick={onLogin} 
              disabled={isLoggingIn}
              className="gap-2 bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Sign In
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
