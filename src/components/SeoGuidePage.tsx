import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Tv,
  Music2,
  Globe,
  CheckCircle2,
  Copyright,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PUBLIC_SEO_PATHS, SEO_ROUTES, SeoRouteDefinition, SeoRoutePath } from '../config/seo';
import { CopyrightNoticeContent } from './CopyrightNotice';

interface SeoGuidePageProps {
  route: SeoRouteDefinition;
  onNavigatePath: (path: SeoRoutePath) => void;
  onLaunchAction: (target: 'songs' | 'discover' | 'studio') => void;
}

export const SeoGuidePage: React.FC<SeoGuidePageProps> = ({
  route,
  onNavigatePath,
  onLaunchAction,
}) => {
  const relatedPaths = PUBLIC_SEO_PATHS.filter((p) => p !== '/' && p !== route.path);

  return (
    <article className="max-w-5xl mx-auto py-8 sm:py-12 space-y-12">
      {/* Breadcrumb Back Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigatePath('/');
          }}
          className="inline-flex items-center gap-1.5 font-medium text-brand-600 dark:text-brand-400 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Tamil Worship Lyrics Workspace</span>
        </a>
        <span aria-hidden="true">/</span>
        <span className="truncate text-slate-700 dark:text-slate-200">{route.navLabel}</span>
      </nav>

      {/* Hero Header */}
      <header className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/75 p-7 sm:p-10 space-y-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          Tamil Worship Lyrics · {route.category}
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight [text-wrap:balance]">
          {route.h1}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          {route.heroSubtitle}
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            onClick={() => onLaunchAction(route.ctaPrimaryTarget)}
            className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white px-5 h-11 font-semibold gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {route.ctaPrimaryTarget === 'studio' ? (
              <Tv className="h-4 w-4" />
            ) : route.ctaPrimaryTarget === 'discover' ? (
              <Globe className="h-4 w-4" />
            ) : (
              <Music2 className="h-4 w-4" />
            )}
            <span>{route.ctaPrimaryLabel}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => onLaunchAction('studio')}
            className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-5 h-11 font-medium gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Open Live Presentation Console</span>
          </Button>
        </div>
      </header>

      {/* Content Sections */}
      <div className="space-y-8">
        {route.sections.map((section) => (
          <section
            key={section.heading}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 space-y-4"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {section.heading}
            </h2>
            <div className="space-y-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {section.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
            {section.bullets && section.bullets.length > 0 && (
              <ul className="pt-2 space-y-2.5">
                {section.bullets.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* Include Full Copyright & Licensing Notice explicitly on /about */}
      {route.path === '/about' && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Copyright className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-bold">Complete Copyright &amp; Licensing Notice</h2>
          </div>
          <CopyrightNoticeContent />
        </section>
      )}

      {/* Optional Route FAQs */}
      {route.faqs && route.faqs.length > 0 && (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 space-y-5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {route.faqs.map((faq) => (
              <div
                key={faq.question}
                className="pt-4 first:pt-0 border-t first:border-t-0 border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                  {faq.question}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Guides */}
      <aside className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          More Worship Guides &amp; Resources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {relatedPaths.map((path) => {
            const item = SEO_ROUTES[path];
            return (
              <a
                key={path}
                href={path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigatePath(path);
                }}
                className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-brand-500/60 p-4 flex items-center justify-between gap-2 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400">{item.category}</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {item.navLabel}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 shrink-0" />
              </a>
            );
          })}
        </div>
      </aside>
    </article>
  );
};
