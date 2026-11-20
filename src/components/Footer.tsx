import React from 'react';
import {
  Music,
  BookOpen,
  Globe,
  Sparkles,
  Sliders,
  Plus,
  Copyright,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: 'songs' | 'discover' | 'bible' | 'promiseVerse') => void;
  onOpenStudio: () => void;
  onAddSong: () => void;
  onOpenCopyright: () => void;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onOpenStudio,
  onAddSong,
  onOpenCopyright,
  onOpenSettings,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/90 backdrop-blur-md transition-colors pb-20 sm:pb-0">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-md shadow-brand-500/20">
                <Music className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                ECI Song Book
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              A church worship songbook and lyrics presentation platform designed to help congregations search, prepare, and present Tamil and English worship lyrics seamlessly.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-500 shrink-0" />
              <span>Respecting authors, composers, and church licensing standards.</span>
            </div>
          </div>

          {/* Important Links */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Important Links
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('songs')}
                  className="inline-flex items-center gap-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  <Music className="h-3.5 w-3.5" />
                  <span>My Songbook</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('discover')}
                  className="inline-flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Discover Songs (16K+)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('bible')}
                  className="inline-flex items-center gap-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Bible Reader</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateTab('promiseVerse')}
                  className="inline-flex items-center gap-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Promise Verse</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenStudio}
                  className="inline-flex items-center gap-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Control Center</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onAddSong}
                  className="inline-flex items-center gap-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Submit Lyrics</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Copyright, Licensing & External Resources */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Licensing &amp; Legal Info
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenCopyright}
                  className="inline-flex items-center gap-2 font-medium text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                >
                  <Copyright className="h-3.5 w-3.5 shrink-0" />
                  <span>Copyright &amp; Licensing Notice</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 shrink-0" />
                  <span>About &amp; Preferences</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
          <p>
            &copy; {currentYear} ECI Song Book. Built for church worship preparation and presentation.
          </p>
          <p className="max-w-xl md:text-right">
            Third-party song lyrics remain the property of their respective copyright holders. Churches are responsible for obtaining appropriate presentation licences.
          </p>
        </div>
      </div>
    </footer>
  );
};
