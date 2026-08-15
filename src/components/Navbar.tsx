import { useState, useEffect } from 'react';
import { Music, Search, Plus, LogIn, LogOut, User, Settings, Loader2, Tv, Monitor, ChevronDown, Sparkles, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { presenterManager, DisplayInfo } from '../services/presenterManager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [displayInfo, setDisplayInfo] = useState<DisplayInfo>(presenterManager.getDisplayInfo());
  const [isWindowOpen, setIsWindowOpen] = useState(presenterManager.isPresenterOpen());

  useEffect(() => {
    const unsubDisplay = presenterManager.onDisplayChange(setDisplayInfo);
    const unsubWin = presenterManager.onWindowStatusChange(setIsWindowOpen);
    return () => {
      unsubDisplay();
      unsubWin();
    };
  }, []);

  const handleOpenPresenterView = () => {
    presenterManager.openPresenterView();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white shadow-lg shadow-brand-500/20">
            <Music className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ECI Song Book</span>
            <span className="hidden sm:inline-block ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Dual-Screen
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick "Present Song Lyrics" Direct Button */}
          <Button
            variant="default"
            size="sm"
            onClick={handleOpenPresenterView}
            className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/10 cursor-pointer"
            title={displayInfo.isExtended ? "Launch Presenter View on External Monitor" : "Launch Presenter Window"}
          >
            <Tv className="h-4 w-4" />
            <span className="font-medium hidden sm:inline">Present Song Lyrics</span>
            {displayInfo.isExtended && (
              <span className="hidden md:inline-flex text-[10px] px-1.5 py-0.2 rounded bg-brand-700 font-mono">2nd Display</span>
            )}
          </Button>

          {/* Options Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span>Options</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl dark:bg-slate-950 dark:border-slate-800">
              <DropdownMenuLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5">
                Presentation Layer
              </DropdownMenuLabel>
              
              <DropdownMenuItem 
                onClick={handleOpenPresenterView}
                className="flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-950/40"
              >
                <div className="flex items-center gap-2.5">
                  <Monitor className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">Presenter View</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {displayInfo.isExtended ? 'Auto-detected External Screen' : 'Opens separate presentation screen'}
                    </div>
                  </div>
                </div>
                {isWindowOpen && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </DropdownMenuItem>

              {onOpenStudio && (
                <DropdownMenuItem 
                  onClick={onOpenStudio}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <Sliders className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">Studio Control Room</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Full dashboard remote for lyrics & Bible</div>
                  </div>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="my-1.5 dark:bg-slate-800" />

              <DropdownMenuLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 py-1.5">
                Preferences & System
              </DropdownMenuLabel>

              <DropdownMenuItem 
                onClick={onOpenSettings}
                className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-900 dark:text-white">Settings & Appearance</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
