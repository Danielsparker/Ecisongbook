export type SeoRoutePath =
  | '/'
  | '/tamil-christian-songs'
  | '/tamil-worship-songs'
  | '/tamil-christian-song-lyrics'
  | '/tamil-church-presentation-software'
  | '/tamil-worship-presentation'
  | '/about';

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface SeoSectionCopy {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface SeoRouteDefinition {
  path: SeoRoutePath;
  navLabel: string;
  category: string;
  title: string;
  description: string;
  h1: string;
  heroSubtitle: string;
  keywords: string[];
  schemaType: 'WebApplication' | 'WebPage' | 'SoftwareApplication' | 'AboutPage';
  ctaPrimaryLabel: string;
  ctaPrimaryTarget: 'songs' | 'discover' | 'studio';
  sections: SeoSectionCopy[];
  faqs?: FaqEntry[];
}

export const BRAND_NAME = 'Tamil Worship Lyrics';
export const BRAND_TAGLINE = 'Manage your Tamil worship songs. Present them beautifully.';
export const BRAND_HERO_HEADLINE = 'Manage your worship songs. Present them live during church services.';
export const BRAND_DESCRIPTION =
  'A modern, customizable Tamil Christian worship lyrics management and live church presentation platform for churches, worship leaders, and media teams.';

export const HOME_FAQS: FaqEntry[] = [
  {
    question: 'Does Tamil Worship Lyrics work with church projectors and dual HDMI monitors?',
    answer:
      'Yes. Presenter View uses browser window management to open a clean congregation projection window on your extended HDMI monitor or church projector while keeping slide selection, search, font sizing, and blackout controls private on your media desk screen.',
  },
  {
    question: 'Can multiple church TVs display the same Tamil lyrics wirelessly?',
    answer:
      'Yes. Each live presentation session generates a synced projector link and QR code backed by real-time cloud synchronization, so multiple smart TVs or side screens can stay mirrored without extra HDMI splitters.',
  },
  {
    question: 'Which Tamil fonts are supported for large church screens?',
    answer:
      'The live presentation engine includes high-legibility Unicode Tamil typefaces—Baloo Thambi 2, Anek Tamil, and Tiro Tamil—along with adjustable font sizes from 20px to 120px, alignment controls, and Light or Dark canvas themes.',
  },
  {
    question: 'Can we export lyrics for offline Sunday service backup?',
    answer:
      'Yes. You can export individual songs or worship setlists to PDF (with shaped Tamil script rendering) and PowerPoint (.pptx) decks directly from the songbook.',
  },
  {
    question: 'Who is responsible for song copyright and projection licensing?',
    answer:
      'Tamil Worship Lyrics is a worship organization and presentation tool. Externally sourced songs remain the property of their respective authors, composers, and publishers. Churches are responsible for holding appropriate projection or reproduction licences such as CCLI where applicable.',
  },
];

export const SEO_ROUTES: Record<SeoRoutePath, SeoRouteDefinition> = {
  '/': {
    path: '/',
    navLabel: 'Home',
    category: 'Platform',
    title: 'Tamil Worship Lyrics – Tamil Christian Songs & Church Presentation',
    description:
      'Manage Tamil Christian worship song lyrics and present them live during church services. Features dual-screen presenter view, customizable Tamil fonts, themes, and setlist tools.',
    h1: BRAND_HERO_HEADLINE,
    heroSubtitle:
      'Organize Tamil Christian worship lyrics and display them beautifully on church screens with a customizable live presentation experience.',
    keywords: [
      'Tamil Worship Lyrics',
      'Tamil Christian Songs',
      'Tamil Church Presentation Software',
      'Tamil Worship Presentation',
      'Tamil Song Lyrics Projector',
      'Tamil Christian Worship Lyrics',
    ],
    schemaType: 'WebApplication',
    ctaPrimaryLabel: 'Get Started',
    ctaPrimaryTarget: 'songs',
    sections: [
      {
        heading: 'Live Church Presentation Built for Congregations',
        paragraphs: [
          'Present Tamil worship lyrics clearly on church projectors, LED walls, and sanctuary TVs using Presenter View (dual display), direct Full Screen mode, or Windowed Presentation.',
          'Control stanza slides, font weight, alignment, blackout screen, and 10 curated worship backdrop themes in real time without ever showing operator menus to the congregation.',
        ],
      },
      {
        heading: 'Organize Custom Songs, External Discovery, Bible & Promise Verses',
        paragraphs: [
          'Keep your church songbook searchable by title, number, or theme, discover over 16,000 external Tamil Christian songs for preview with clear licensing notices, project Scripture verses, and display monthly Promise Verse wallpapers.',
        ],
      },
    ],
    faqs: HOME_FAQS,
  },
  '/tamil-christian-songs': {
    path: '/tamil-christian-songs',
    navLabel: 'Tamil Christian Songs',
    category: 'Congregation Guide',
    title: 'Tamil Christian Songs – Organize & Project Worship | Tamil Worship Lyrics',
    description:
      'Organize Tamil Christian songs for church worship services, choir practice, and fellowship gatherings with fast bilingual search and live projection.',
    h1: 'Organize and Present Tamil Christian Songs for Church Worship',
    heroSubtitle:
      'Keep your congregation’s trusted Tamil Christian hymns and contemporary choruses structured by song number, theme, and stanza slides.',
    keywords: [
      'Tamil Christian Songs',
      'Tamil Christian Songbook',
      'Church Tamil Songs',
      'Tamil Worship Lyrics',
    ],
    schemaType: 'WebPage',
    ctaPrimaryLabel: 'Browse Songbook',
    ctaPrimaryTarget: 'songs',
    sections: [
      {
        heading: 'Built Around How Tamil Churches Lead Worship',
        paragraphs: [
          'Most Tamil congregations sing from a blend of traditional church hymnals, regional revival choruses, and newer Tamil Christian compositions. Keeping every version consistent between the worship team, choir, and media booth takes dependable preparation.',
          'Tamil Worship Lyrics lets church teams maintain a shared cloud library indexed by song number and title while supporting instant search in both Tamil Unicode script and English transliteration.',
        ],
        bullets: [
          'Numbered song index with quick search by title, song number, or category',
          'Clean stanza-by-stanza splitting so verses never overflow congregation screens',
          'Instant PDF and PowerPoint (.pptx) export for printed bulletins or offline backups',
        ],
      },
      {
        heading: 'Responsible Access to External Tamil Song Catalogues',
        paragraphs: [
          'Alongside your church’s own song library, the Discover workspace connects with Tamil Christian World to help authorized media operators search and preview songs before service.',
          'All third-party songs remain clearly labelled with source attribution and church licensing reminders so your ministry maintains clear CCLI or publisher compliance.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can we add our congregation’s custom Tamil song numbering?',
        answer:
          'Yes. When adding songs to My Songbook, you can assign custom song numbers so worship leaders can call out numbers familiar to the congregation.',
      },
      {
        question: 'Does search work in English transliteration as well as Tamil script?',
        answer:
          'Yes. Search queries match song titles, numbers, genres, and transliterated titles depending on the song record.',
      },
    ],
  },
  '/tamil-worship-songs': {
    path: '/tamil-worship-songs',
    navLabel: 'Tamil Worship Songs',
    category: 'Worship Planning',
    title: 'Tamil Worship Songs – Service Planning & Live Lyrics | Tamil Worship Lyrics',
    description:
      'Plan Sunday worship setlists with Tamil worship songs, bilingual transliteration lookup, customizable backdrop themes, and clean stanza projection.',
    h1: 'Plan and Lead Tamil Worship Songs Without Projection Friction',
    heroSubtitle:
      'Prepare Sunday praise and worship sets with structured stanzas, readable Tamil typography, and rapid slide switching during live ministry.',
    keywords: [
      'Tamil Worship Songs',
      'Tamil Praise Songs',
      'Sunday Worship Tamil Lyrics',
      'Tamil Worship Lyrics',
    ],
    schemaType: 'WebPage',
    ctaPrimaryLabel: 'Search Worship Songs',
    ctaPrimaryTarget: 'discover',
    sections: [
      {
        heading: 'Designed for Spontaneous Flow During Worship',
        paragraphs: [
          'During live worship, leaders frequently repeat a chorus, jump back to an opening refrain, or transition quietly into Scripture reading and prayer.',
          'Our Presenter Control Center arranges every stanza as a clickable visual slide card, making non-linear jumps effortless while a single press of the B key fades cleanly to a Blackout screen.',
        ],
        bullets: [
          'Keyboard shortcuts (Arrow keys, Spacebar, B for Blackout, F for Fullscreen) for media operators',
          'Live switching between Praise songs, Bible verses, and monthly Promise Verse wallpapers',
          'Light Canvas and Dark Canvas modes tailored for bright daytime halls or dimmed sanctuaries',
        ],
      },
      {
        heading: 'Support Choirs and Worship Musicians',
        paragraphs: [
          'Exporting a clean setlist PDF or PowerPoint deck before rehearsal helps choir singers, vocalists, and projection volunteers verify phrasing and stanza order ahead of Sunday morning.',
        ],
      },
    ],
  },
  '/tamil-christian-song-lyrics': {
    path: '/tamil-christian-song-lyrics',
    navLabel: 'Tamil Christian Song Lyrics',
    category: 'Typography & Formatting',
    title: 'Tamil Christian Song Lyrics – Readable Slides & Export | Tamil Worship Lyrics',
    description:
      'Display accurate Tamil Christian song lyrics in Baloo Thambi, Anek Tamil, and Tiro Tamil fonts with stanza formatting, copy tools, PDF and PPT export.',
    h1: 'Clear Tamil Christian Song Lyrics Formatting for Print and Screen',
    heroSubtitle:
      'Preserve Tamil Unicode ligatures cleanly across browser screens, PowerPoint decks, and printed church PDFs.',
    keywords: [
      'Tamil Christian Song Lyrics',
      'Tamil Song Lyrics PDF',
      'Tamil Lyrics PowerPoint Export',
      'Tamil Worship Lyrics',
    ],
    schemaType: 'WebPage',
    ctaPrimaryLabel: 'Open Lyrics Library',
    ctaPrimaryTarget: 'songs',
    sections: [
      {
        heading: 'Proper Tamil Script Rendering Across Every Medium',
        paragraphs: [
          'Tamil script relies on accurate vowel-consonant ligatures that often break in older PDF generators or rigid slide templates.',
          'Tamil Worship Lyrics renders Tamil Unicode through dedicated web fonts—Baloo Thambi 2 for warm congregation readability, Anek Tamil for crisp modern projection, and Tiro Tamil for classic serif legibility—and shapes Tamil glyphs accurately when generating PDF song sheets.',
        ],
        bullets: [
          'Automatic multi-line stanza splitting so dense verses break into comfortable 4-line slides',
          'Independent font size slider (20px to 120px) and font weight selection (Regular to Extra Bold)',
          'Source transparency distinguishing local church songbook entries from externally retrieved lyrics',
        ],
      },
    ],
  },
  '/tamil-church-presentation-software': {
    path: '/tamil-church-presentation-software',
    navLabel: 'Church Presentation Software',
    category: 'Live Presentation',
    title: 'Tamil Church Presentation Software – Dual Screen & TV Sync | Tamil Worship Lyrics',
    description:
      'Browser-based Tamil church presentation software with Dual-Screen Presenter View, HDMI projector output, wireless multi-TV sync, and blackout control.',
    h1: 'Tamil Church Presentation Software Directly in Your Browser',
    heroSubtitle:
      'Project worship lyrics across HDMI projectors, dual displays, and sanctuary smart TVs with zero software installation.',
    keywords: [
      'Tamil Church Presentation Software',
      'Church Lyrics Projection Software',
      'Dual Screen Church Presenter',
      'Tamil Worship Lyrics',
    ],
    schemaType: 'SoftwareApplication',
    ctaPrimaryLabel: 'Launch Control Center',
    ctaPrimaryTarget: 'studio',
    sections: [
      {
        heading: 'Three Projection Modes Built for Real Church Booths',
        paragraphs: [
          'Different church setups call for different projection workflows. Tamil Worship Lyrics adapts to single-laptop sanctuaries, extended HDMI projector booths, and multi-TV auditoriums.',
        ],
        bullets: [
          'Presenter View (Dual Display): Uses browser screen placement to isolate clean lyrics on your extended TV or projector while your laptop keeps the Control Center.',
          'Direct Full Screen Mode: Launches borderless stage slides immediately from your current screen with auto-hiding controls.',
          'Windowed Presentation: Opens a resizable lyrics output window suitable for OBS scenes, livestream overlays, or side-by-side multitasking.',
        ],
      },
      {
        heading: 'Wireless Multi-TV Sync & Quick Setup',
        paragraphs: [
          'Need overflow rooms or stage confidence displays mirrored without running long HDMI splitters? Open the synced projector URL or scan the Control Center QR code from any smart TV browser to mirror slide updates over real-time cloud synchronization.',
        ],
      },
    ],
    faqs: HOME_FAQS.slice(0, 3),
  },
  '/tamil-worship-presentation': {
    path: '/tamil-worship-presentation',
    navLabel: 'Tamil Worship Presentation',
    category: 'Visual Customization',
    title: 'Tamil Worship Presentation – Themes, Fonts & Live Control | Tamil Worship Lyrics',
    description:
      'Customize every detail of your Tamil worship presentation with 10 curated sanctuary backdrop themes, Light and Dark canvas modes, and Scripture projection.',
    h1: 'Craft a Distraction-Free Tamil Worship Presentation Experience',
    heroSubtitle:
      'Balance visual reverence and congregation legibility with curated backdrop themes, typographic precision, and instant Scripture slides.',
    keywords: [
      'Tamil Worship Presentation',
      'Church Lyrics Themes',
      'Tamil Worship Slides',
      'Tamil Worship Lyrics',
    ],
    schemaType: 'WebPage',
    ctaPrimaryLabel: 'Try Live Control Center',
    ctaPrimaryTarget: 'studio',
    sections: [
      {
        heading: '10 Curated Backdrop Themes + Light & Dark Sanctuary Canvas',
        paragraphs: [
          'Bright white slides can overpower a darkened sanctuary, while dark themes may wash out in sunlit chapels. Switch between Dark Canvas and Light Canvas across both the control desk and congregation screen in one click.',
          'Explore 10 purpose-built backdrop themes—from Midnight Sanctuary and Royal Sapphire to Heavenly Dawn and Emerald Grace—with carefully tuned text contrast shadows.',
        ],
        bullets: [
          'High-contrast text shadows tailored for distance readability from the back pew',
          'Left, center, or right slide alignment matching your stage screen placement',
          'Seamless transition between song slides, Bible verses, and monthly Promise Verse wallpapers',
        ],
      },
    ],
  },
  '/about': {
    path: '/about',
    navLabel: 'About & Licensing',
    category: 'About & Legal',
    title: 'About Tamil Worship Lyrics – Mission, Features & Copyright Licensing',
    description:
      'Learn how Tamil Worship Lyrics serves churches, worship leaders, and media teams, and read our complete Copyright & Licensing notice.',
    h1: 'About Tamil Worship Lyrics',
    heroSubtitle:
      'A focused worship lyrics management and live church presentation platform built to serve Tamil Christian congregations.',
    keywords: [
      'About Tamil Worship Lyrics',
      'Church Song Licensing',
      'Tamil Christian Worship Platform',
    ],
    schemaType: 'AboutPage',
    ctaPrimaryLabel: 'Open Workspace',
    ctaPrimaryTarget: 'songs',
    sections: [
      {
        heading: 'Our Purpose & Brand Positioning',
        paragraphs: [
          'Tamil Worship Lyrics is built for Tamil Christian churches, worship leaders, church media operators, pastors, choir teams, and individual worshippers who need a reliable place to organize worship lyrics and project them cleanly during services.',
          'Rather than acting as a passive lyrics archive, the platform centers on live church presentation—connecting organized songbooks, Scripture verses, and Promise Verse wallpapers to real-time dual-display and multi-screen projection.',
        ],
      },
      {
        heading: 'Copyright & Licensing',
        paragraphs: [
          'Tamil Worship Lyrics is a church song search and presentation platform designed to help congregations access and present worship songs conveniently.',
          'Lyrics retrieved from external sources may be protected by copyright and remain the property of their respective authors, composers, publishers or copyright holders.',
          'Tamil Worship Lyrics does not claim ownership of third-party songs and does not grant copyright or reproduction permissions for externally sourced content.',
          'Churches and users are responsible for ensuring that they have the appropriate permissions or licences before reproducing, displaying, projecting, exporting or distributing copyrighted song lyrics. Where applicable, churches should maintain an appropriate reproduction licence, such as CCLI or an equivalent licence, and report song usage according to the relevant licensing requirements.',
        ],
      },
    ],
  },
};

export const PUBLIC_SEO_PATHS: SeoRoutePath[] = [
  '/',
  '/tamil-christian-songs',
  '/tamil-worship-songs',
  '/tamil-christian-song-lyrics',
  '/tamil-church-presentation-software',
  '/tamil-worship-presentation',
  '/about',
];

export function normalizePathname(pathname: string): string {
  if (!pathname) return '/';
  const cleaned = pathname.replace(/\/+$/, '');
  return cleaned === '' ? '/' : cleaned;
}

export function resolveSeoRoute(pathname: string): SeoRouteDefinition {
  const normalized = normalizePathname(pathname) as SeoRoutePath;
  return SEO_ROUTES[normalized] || SEO_ROUTES['/'];
}

export function isKnownSeoPath(pathname: string): pathname is SeoRoutePath {
  return normalizePathname(pathname) in SEO_ROUTES;
}

/**
 * Guards against indexing or canonicalizing local/temporary preview hostnames
 * such as localhost, 127.0.0.1, or AI Studio *.run.app preview URLs.
 */
export function isPublicProductionHostname(hostname: string): boolean {
  if (!hostname) return false;
  const lower = hostname.toLowerCase();
  if (lower === 'localhost' || lower === '127.0.0.1' || lower === '0.0.0.0') {
    return false;
  }
  if (/^ais-(dev|pre)-.*\.run\.app$/.test(lower)) {
    return false;
  }
  return true;
}

export function normalizeSiteUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    if (!isPublicProductionHostname(parsed.hostname)) return '';
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return '';
  }
}

export function buildCanonicalUrl(routePath: SeoRoutePath, siteUrl?: string, runtimeOrigin?: string, runtimeHostname?: string): string {
  const normalizedSite = normalizeSiteUrl(siteUrl);
  const pathSuffix = routePath === '/' ? '/' : routePath;
  if (normalizedSite) {
    return `${normalizedSite}${pathSuffix}`;
  }
  if (runtimeOrigin && runtimeHostname && isPublicProductionHostname(runtimeHostname)) {
    const cleanOrigin = runtimeOrigin.replace(/\/+$/, '');
    return `${cleanOrigin}${pathSuffix}`;
  }
  return '';
}

export function buildStructuredDataJsonLd(route: SeoRouteDefinition, canonicalUrl?: string): Record<string, unknown>[] {
  const baseUrl = canonicalUrl
    ? canonicalUrl.replace(new RegExp(`${route.path === '/' ? '/$' : route.path + '$'}`), '')
    : undefined;

  const organization: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND_NAME,
    description: BRAND_DESCRIPTION,
    ...(baseUrl ? { url: baseUrl, logo: `${baseUrl}/favicon.svg` } : {}),
  };

  const website: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND_NAME,
    description: route.description,
    inLanguage: ['en', 'ta'],
    ...(baseUrl ? { url: baseUrl } : {}),
  };

  const primaryEntity: Record<string, unknown> =
    route.schemaType === 'WebApplication' || route.schemaType === 'SoftwareApplication'
      ? {
          '@context': 'https://schema.org',
          '@type': route.schemaType,
          name: BRAND_NAME,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web Browser',
          description: route.description,
          inLanguage: ['ta', 'en'],
          featureList: [
            'Live dual-screen church lyrics presentation',
            'Tamil Unicode font selection (Baloo Thambi 2, Anek Tamil, Tiro Tamil)',
            '10 curated worship projection themes with Light and Dark canvas modes',
            'Wireless multi-TV presentation synchronization with QR code',
            'PDF and PowerPoint (.pptx) lyrics export',
            'Bible verse and Promise Verse wallpaper projection',
          ],
          ...(canonicalUrl ? { url: canonicalUrl } : {}),
        }
      : {
          '@context': 'https://schema.org',
          '@type': route.schemaType,
          name: route.title,
          description: route.description,
          inLanguage: ['en', 'ta'],
          ...(canonicalUrl ? { url: canonicalUrl } : {}),
        };

  const schemas: Record<string, unknown>[] = [organization, website, primaryEntity];

  if (route.faqs && route.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: route.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return schemas;
}
