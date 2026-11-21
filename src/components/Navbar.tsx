import type { MouseEvent } from 'react';
import { Plus, LogIn, LogOut, Settings, Loader2, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { presenterManager } from '../services/presenterManager';
import { SeoRoutePath } from '../config/seo';

interface NavbarProps {
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  onAddSong: () => void;
  onOpenSettings: () => void;
  onOpenStudio?: () => void;
  onNavigatePath?: (path: SeoRoutePath) => void;
  currentPath?: string;
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
  onNavigatePath,
  currentPath = '/',
  isLoggingIn,
}: NavbarProps) {
  const handleLinkClick = (e: MouseEvent, path: SeoRoutePath) => {
    if (onNavigatePath) {
      e.preventDefault();
      onNavigatePath(path);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 sm:gap-4 lg:gap-8 px-3 sm:px-4">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="flex items-center gap-2 sm:gap-2.5 min-w-0 group"
          aria-label="Tamil Worship Lyrics Home"
        >
          <img
            src="/favicon.svg"
            alt=""
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg shrink-0"
            width={32}
            height={32}
          />
          <span className="text-[15px] sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate">
            Tamil Worship Lyrics
          </span>
        </a>

        {/* Zone 2: Clean Text Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors ${
              currentPath === '/' ? 'text-brand-600 dark:text-brand-400 font-semibold' : ''
            }`}
          >
            Songbook
          </a>
          <a
            href="/tamil-church-presentation-software"
            onClick={(e) => handleLinkClick(e, '/tamil-church-presentation-software')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors ${
              currentPath === '/tamil-church-presentation-software'
                ? 'text-brand-600 dark:text-brand-400 font-semibold'
                : ''
            }`}
          >
            Presentation
          </a>
          <a
            href="/tamil-christian-songs"
            onClick={(e) => handleLinkClick(e, '/tamil-christian-songs')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors ${
              currentPath === '/tamil-christian-songs'
                ? 'text-brand-600 dark:text-brand-400 font-semibold'
                : ''
            }`}
          >
            Songs Guide
          </a>
          <a
            href="/about"
            onClick={(e) => handleLinkClick(e, '/about')}
            className={`whitespace-nowrap shrink-0 hover:text-slate-900 dark:hover:text-white transition-colors ${
              currentPath === '/about' ? 'text-brand-600 dark:text-brand-400 font-semibold' : ''
            }`}
          >
            About
          </a>
        </nav>

        {/* Zone 3: Workspace Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenStudio || (() => presenterManager.openPresenterControlTab())}
            className="flex items-center justify-center gap-1.5 h-8 w-8 sm:w-auto px-0 sm:px-3 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer whitespace-nowrap shrink-0"
            title="Open Presenter Control Center"
            aria-label="Open Presenter Control Center"
          >
            <Sliders className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="font-medium hidden sm:inline">Control Center</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onAddSong}
            className="hidden md:inline-flex gap-1.5 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="dark:text-slate-200">Add Song</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="rounded-full h-8 w-8 sm:h-9 sm:w-9 shrink-0"
          >
            <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400" />
          </Button>

          {user ? (
            <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden xl:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {user.displayName}
                </span>
                <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                aria-label="Sign Out"
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 shrink-0"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={onLogin}
              disabled={isLoggingIn}
              size="sm"
              className="gap-1 sm:gap-1.5 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm bg-brand-600 hover:bg-brand-700 text-white rounded-xl whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
