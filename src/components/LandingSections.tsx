import React, { useState } from 'react';
import {
  Tv,
  Maximize2,
  AppWindow,
  Sliders,
  Music2,
  Globe,
  BookOpen,
  Sparkles,
  FileText,
  Wifi,
  ArrowRight,
  ChevronDown,
  Sun,
  Moon,
  Palette,
  Users,
  Mic2,
  MonitorPlay,
  HeartHandshake,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LYRIC_BACKGROUND_THEMES } from '../data/backgroundThemes';
import { HOME_FAQS, SeoRoutePath, SEO_ROUTES } from '../config/seo';
import churchMediaBoothImg from '../assets/images/church_media_booth_1795281829370.jpg';

interface LandingSectionsProps {
  onOpenStudio: () => void;
  onNavigateTab: (tab: 'songs' | 'discover' | 'bible' | 'promiseVerse') => void;
  onNavigatePath: (path: SeoRoutePath) => void;
  onAddSong: () => void;
}

const SAMPLE_SLIDES = [
  {
    label: 'Verse 1',
    ta: 'கர்த்தர் என் மேய்ப்பராய் இருக்கிறார்\nஎனக்குக் குறைவு ஒன்றும் இல்லை',
    en: 'The Lord is my shepherd; I shall not want.',
  },
  {
    label: 'Chorus',
    ta: 'ஆராதனை உமக்கே ஆராதனை\nஎன்றென்றும் உமக்கே ஆராதனை',
    en: 'Worship belongs to You, forever and ever.',
  },
  {
    label: 'Scripture Projection',
    ta: 'உம்முடைய வசனம் என் கால்களுக்குத் தீபமும்\nஎன் பாதைக்கு வெளிச்சமுமாய் இருக்கிறது',
    en: 'Psalm 119:105 · Tamil & English Bible Display',
  },
];

const FONT_OPTIONS = [
  { id: 'font-baloo', label: 'Baloo Thambi 2', note: 'Warm & approachable rounded Tamil display' },
  { id: 'font-anek', label: 'Anek Tamil', note: 'Clean contemporary geometric Tamil sans' },
  { id: 'font-tiro', label: 'Tiro Tamil', note: 'Traditional editorial Tamil serif typography' },
] as const;

export const LandingSections: React.FC<LandingSectionsProps> = ({
  onOpenStudio,
  onNavigateTab,
  onNavigatePath,
  onAddSong,
}) => {
  const [selectedSlideIdx, setSelectedSlideIdx] = useState(0);
  const [selectedThemeId, setSelectedThemeId] = useState('midnight-sanctuary');
  const [selectedFont, setSelectedFont] = useState<'font-baloo' | 'font-anek' | 'font-tiro'>('font-baloo');
  const [previewCanvas, setPreviewCanvas] = useState<'dark' | 'light'>('dark');
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const activeTheme =
    LYRIC_BACKGROUND_THEMES.find((t) => t.id === selectedThemeId) || LYRIC_BACKGROUND_THEMES[0];
  const activeSlide = SAMPLE_SLIDES[selectedSlideIdx] || SAMPLE_SLIDES[0];

  const featuredGuides: SeoRoutePath[] = [
    '/tamil-church-presentation-software',
    '/tamil-christian-songs',
    '/tamil-worship-songs',
    '/tamil-christian-song-lyrics',
    '/tamil-worship-presentation',
    '/about',
  ];

  return (
    <div className="mt-24 space-y-24 sm:space-y-28">
      {/* 2. Live Church Presentation Feature Section */}
      <section
        id="live-presentation"
        aria-labelledby="live-presentation-heading"
        className="scroll-mt-24 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-10 lg:p-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Editorial Summary */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400">
                Core Platform Advantage · Live Church Presentation
              </p>
              <h2
                id="live-presentation-heading"
                className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight [text-wrap:balance]"
              >
                Built for Dual-Display Sanctuaries, Projectors &amp; Church TVs
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Keep operator controls, song queues, font adjustments, and blackout toggles private on your laptop while projecting distraction-free Tamil lyrics on the sanctuary screen.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <Tv className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Presenter View · Extended HDMI Display
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Automatically detects connected external monitors and isolates clean full-screen slides for the congregation.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Maximize2 className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Direct Full Screen &amp; Windowed Output
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Present on single-laptop fellowships in one click, or capture a clean windowed lyrics feed in OBS livestream setups.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wifi className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Real-Time Multi-TV Wireless Sync
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Share the live projector link or scan the QR code inside Control Center to mirror slides across sanctuary smart TVs.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={onOpenStudio}
                className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white gap-2 px-5 h-11 font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sliders className="h-4 w-4" />
                <span>Open Presentation Console</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigatePath('/tamil-church-presentation-software')}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 px-4 h-11 font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Setup Guide</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Visual Stage + Interactive Slide Preview */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 aspect-[16/9]">
              <img
                src={churchMediaBoothImg}
                alt="Church media desk controlling wide sanctuary projection screen"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-35"
              />
              <div
                className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7 transition-colors duration-300"
                style={{
                  background:
                    previewCanvas === 'light'
                      ? 'linear-gradient(135deg, rgba(248,250,252,0.92), rgba(226,232,240,0.88))'
                      : `${activeTheme.backgroundStyle}`,
                  opacity: 0.94,
                }}
              >
                <div
                  className={`flex items-center justify-between text-xs ${
                    previewCanvas === 'light' ? 'text-slate-600' : 'text-white/75'
                  }`}
                >
                  <span className="font-medium">
                    Live Audience Output · {activeTheme.name}
                  </span>
                  <span className="tabular-nums">
                    Slide {selectedSlideIdx + 1} / {SAMPLE_SLIDES.length}
                  </span>
                </div>

                <div className="my-auto text-center px-2 sm:px-6 space-y-2">
                  <p
                    className={`${selectedFont} text-xl sm:text-3xl font-bold leading-relaxed whitespace-pre-line`}
                    style={{
                      color: previewCanvas === 'light' ? '#0f172a' : activeTheme.textColor,
                      textShadow:
                        previewCanvas === 'light'
                          ? 'none'
                          : activeTheme.textShadow || '0 2px 10px rgba(0,0,0,0.65)',
                    }}
                  >
                    {activeSlide.ta}
                  </p>
                  <p
                    className={`text-xs sm:text-sm ${
                      previewCanvas === 'light' ? 'text-slate-600' : 'text-white/75'
                    }`}
                  >
                    {activeSlide.en}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-1.5">
                    {SAMPLE_SLIDES.map((s, idx) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setSelectedSlideIdx(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          selectedSlideIdx === idx
                            ? 'bg-brand-600 text-white'
                            : previewCanvas === 'light'
                              ? 'bg-white/80 text-slate-700 hover:bg-white'
                              : 'bg-white/10 text-white/85 hover:bg-white/20'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewCanvas((c) => (c === 'dark' ? 'light' : 'dark'))}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      previewCanvas === 'light'
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    {previewCanvas === 'dark' ? (
                      <>
                        <Sun className="h-3.5 w-3.5 text-amber-300" />
                        <span>Preview Light Canvas</span>
                      </>
                    ) : (
                      <>
                        <Moon className="h-3.5 w-3.5 text-sky-300" />
                        <span>Preview Dark Canvas</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tamil Worship Song Management Bento Section */}
      <section aria-labelledby="song-management-heading" className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400">
            Worship Library &amp; Preparation
          </p>
          <h2
            id="song-management-heading"
            className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white [text-wrap:balance]"
          >
            One Organized Workspace for Songs, Discovery &amp; Scripture
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Move cleanly from mid-week rehearsal preparation to Sunday morning worship without juggling scattered documents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                <Music2 className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Cloud-Synced Custom Songbook
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Store your church’s numbered Tamil and English worship songs with instant keyword lookup, song numbers, genre labels, and editable stanza structure. Export individual songs or full Sunday setlists to shaped Tamil PDFs and PowerPoint decks.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  onNavigateTab('songs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FileText className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span>Open My Songbook</span>
              </Button>
              <Button
                variant="ghost"
                onClick={onAddSong}
                className="rounded-xl text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Add a Song
              </Button>
            </div>
          </div>

          <div className="md:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                16,000+ External Tamil Catalogue
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Search Tamil script, English transliteration, chords, and tempo via Tamil Christian World. Built-in licensing acknowledgements keep source rights transparent before presentation or export.
              </p>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  onNavigateTab('discover');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Explore Discover Tab</span>
              </Button>
            </div>
          </div>

          <div className="md:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Scripture Reading &amp; Verse Projection
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Browse books, chapters, and verses during sermon readings and send any verse straight to the projector screen with a single click.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  onNavigateTab('bible');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
              >
                <span>Open Bible Reader</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="md:col-span-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-8 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Monthly Promise Verse Wallpapers
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Upload and organize church promise verse graphics so media volunteers can display them before service starts or during benediction.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  onNavigateTab('promiseVerse');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                <span>Manage Promise Verses</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Customizable Presentation Themes & Tamil Typography */}
      <section
        aria-labelledby="themes-typography-heading"
        className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-10 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400">
              Visual Customization · Typography &amp; Themes
            </p>
            <h2
              id="themes-typography-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
            >
              Curated Worship Backdrops &amp; Readable Tamil Fonts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Select a backdrop or Tamil typeface below to preview how your sanctuary projector looks before going live.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => onNavigatePath('/tamil-worship-presentation')}
            className="rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 gap-2 self-start whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Palette className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span>Explore Presentation Design</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Font Options */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tamil Projection Typefaces
            </h3>
            <div className="space-y-2.5">
              {FONT_OPTIONS.map((font) => {
                const isSelected = selectedFont === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setSelectedFont(font.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 dark:bg-brand-950/40 dark:border-brand-500'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {font.label}
                      </span>
                      <span className={`${font.id} text-sm font-semibold text-brand-600 dark:text-brand-400`}>
                        தமிழ் எழுத்துரு
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{font.note}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 10 Themes Grid */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              10 Sanctuary Projection Backdrops
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {LYRIC_BACKGROUND_THEMES.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setSelectedThemeId(theme.id);
                      setPreviewCanvas(theme.category === 'light' ? 'light' : 'dark');
                    }}
                    className={`p-3 rounded-xl border text-left h-24 flex flex-col justify-between transition-transform cursor-pointer ${
                      isSelected
                        ? 'border-brand-500 ring-2 ring-brand-500/40 scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                    style={{ background: theme.previewBg }}
                  >
                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/80">
                      {theme.category}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white drop-shadow truncate">
                        {theme.name}
                      </div>
                      <div className="text-[11px] font-anek text-white/80 truncate">
                        {theme.nameTa}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Simple 3-Step Workflow */}
      <section aria-labelledby="workflow-heading" className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400">
            Sunday Service Workflow
          </p>
          <h2
            id="workflow-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            From Preparation to Live Sanctuary Projection in Three Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Add or Find Songs',
              body: 'Add your congregation’s numbered Tamil hymns and choruses to My Songbook, or search external songs in Discover.',
            },
            {
              step: '02',
              title: 'Organize & Customize',
              body: 'Check stanza slide splits, select readable Tamil fonts and projection backdrop themes, or export PDF/PPT backups.',
            },
            {
              step: '03',
              title: 'Present Live',
              body: 'Launch Dual-Display Presenter View over HDMI or mirror slides wirelessly across church smart TVs via live sync.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-3"
            >
              <span className="text-xs font-mono font-bold tabular-nums text-brand-600 dark:text-brand-400">
                {item.step}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Built for Churches & Worship Teams */}
      <section aria-labelledby="audience-heading" className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400">
            Designed for Every Ministry Role
          </p>
          <h2
            id="audience-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Built for Churches, Media Operators &amp; Worship Teams
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: MonitorPlay,
              role: 'Church Media Teams',
              desc: 'Operate clean dual-screen HDMI output or multi-TV cloud sync with keyboard shortcuts and blackout control.',
            },
            {
              icon: Mic2,
              role: 'Worship Leaders & Choirs',
              desc: 'Keep numbered songs aligned across rehearsals and share exported PDF or PowerPoint lyrics before Sunday.',
            },
            {
              icon: Users,
              role: 'Pastors & Coordinators',
              desc: 'Switch effortlessly between worship lyrics, Bible readings, and monthly Promise Verse displays during service.',
            },
            {
              icon: HeartHandshake,
              role: 'Tamil Christian Worshippers',
              desc: 'Read, study, and sing along to Tamil and transliterated Christian songs clearly on desktop or mobile.',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.role}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 space-y-3"
              >
                <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{card.role}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Dedicated Worship Guides Navigation Grid */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Church Presentation &amp; Tamil Songbook Guides
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredGuides.map((path) => {
              const info = SEO_ROUTES[path];
              return (
                <a
                  key={path}
                  href={path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigatePath(path);
                  }}
                  className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 hover:border-brand-500/60 p-4 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">{info.category}</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {info.navLabel}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24 space-y-6">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400">
            Frequently Asked Questions
          </p>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Common Questions From Church Media Teams
          </h2>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70">
          {HOME_FAQS.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div key={faq.question} className="p-5 sm:p-6">
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-slate-900/90 text-white p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight [text-wrap:balance] max-w-2xl mx-auto">
          Manage your Tamil worship songs. Present them beautifully.
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Start organizing your church songbook or open the live Presenter Control Center to test slides, Tamil fonts, and dual-screen projection right now.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Button
            onClick={onOpenStudio}
            className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-6 h-11 font-semibold gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Tv className="h-4 w-4" />
            <span>Explore Presentation</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onNavigateTab('songs');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="rounded-xl border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white px-6 h-11 font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Browse Songbook
          </Button>
        </div>
      </section>
    </div>
  );
};
