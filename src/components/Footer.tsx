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
import { PUBLIC_SEO_PATHS, SEO_ROUTES, SeoRoutePath } from '../config/seo';

interface FooterProps {
  onNavigateTab: (tab: 'songs' | 'discover' | 'bible' | 'promiseVerse') => void;
  onNavigatePath: (path: SeoRoutePath) => void;
  onOpenStudio: () => void;
  onAddSong: () => void;
  onOpenCopyright: () => void;
  onOpenSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateTab,
  onNavigatePath,
  onOpenStudio,
  onAddSong,
  onOpenCopyright,
  onOpenSettings,
}) => {
  const currentYear = new Date().getFullYear();
  const guidePaths = PUBLIC_SEO_PATHS.filter((p) => p !== '/');

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors pb-20 sm:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-3">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePath('/');
              }}
              className="inline-flex items-center rounded-xl bg-white p-1 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-all"
              aria-label="Tamil Worship Lyrics Home"
            >
              <img
                src="/logo.png"
                alt="Tamil Worship Lyrics"
                className="h-14 w-auto object-contain rounded-lg"
              />
              <span className="sr-only">Tamil Worship Lyrics</span>
            </a>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              A modern, customizable Tamil Christian worship lyrics management and live church presentation platform built for congregations, worship leaders, and media teams.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-500 shrink-0" />
              <span>Respecting authors, composers, and church licensing standards.</span>
            </div>
          </div>

          {/* Important Workspace Links */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform Workspace
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

          {/* Worship & Presentation Guides (SEO Internal Links) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Worship Guides
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {guidePaths.map((path) => (
                <li key={path}>
                  <a
                    href={path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigatePath(path);
                    }}
                    className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    {SEO_ROUTES[path].navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright, Licensing & Legal Info */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Legal &amp; Settings
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenCopyright}
                  className="inline-flex items-center gap-2 font-medium text-purple-600 dark:text-purple-400 hover:underline cursor-pointer text-left"
                >
                  <Copyright className="h-3.5 w-3.5 shrink-0" />
                  <span>Copyright &amp; Licensing</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="inline-flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Settings className="h-3.5 w-3.5 shrink-0" />
                  <span>About &amp; Preferences</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
          <p>
            &copy; {currentYear} Tamil Worship Lyrics. Manage your Tamil worship songs. Present them beautifully.
          </p>
          <p className="max-w-xl md:text-right">
            Third-party song lyrics remain the property of their respective copyright holders. Churches are responsible for obtaining appropriate presentation licences.
          </p>
        </div>
      </div>
    </footer>
  );
};
