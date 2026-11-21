import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {
  BRAND_NAME,
  PUBLIC_SEO_PATHS,
  SEO_ROUTES,
  SeoRouteDefinition,
  buildCanonicalUrl,
  buildStructuredDataJsonLd,
  normalizeSiteUrl,
} from './src/config/seo';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPrerenderMarkup(route: SeoRouteDefinition): string {
  const navLinks = PUBLIC_SEO_PATHS.filter((p) => p !== '/')
    .map((p) => `<a href="${p}">${escapeHtml(SEO_ROUTES[p].navLabel)}</a>`)
    .join(' · ');

  const sectionsHtml = route.sections
    .map(
      (sec) => `
      <section>
        <h2>${escapeHtml(sec.heading)}</h2>
        ${sec.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('\n        ')}
        ${
          sec.bullets && sec.bullets.length > 0
            ? `<ul>${sec.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
            : ''
        }
      </section>`
    )
    .join('\n');

  const faqsHtml =
    route.faqs && route.faqs.length > 0
      ? `
      <section>
        <h2>Frequently Asked Questions</h2>
        ${route.faqs
          .map(
            (faq) => `
          <div>
            <h3>${escapeHtml(faq.question)}</h3>
            <p>${escapeHtml(faq.answer)}</p>
          </div>`
          )
          .join('\n')}
      </section>`
      : '';

  return `<div data-seo-prerender="true">
      <header>
        <a href="/">${escapeHtml(BRAND_NAME)}</a>
        <nav aria-label="Primary">${navLinks}</nav>
      </header>
      <main>
        <h1>${escapeHtml(route.h1)}</h1>
        <p>${escapeHtml(route.heroSubtitle)}</p>
        ${sectionsHtml}
        ${faqsHtml}
      </main>
      <footer>
        <p>${escapeHtml(BRAND_NAME)} — Manage your Tamil worship songs. Present them beautifully.</p>
      </footer>
    </div>`;
}

function seoPrerenderPlugin(env: Record<string, string>): Plugin {
  let outDir = 'dist';

  return {
    name: 'tamil-worship-seo-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir || 'dist';
    },
    closeBundle() {
      const distRoot = path.resolve(__dirname, outDir);
      const baseHtmlPath = path.join(distRoot, 'index.html');
      if (!fs.existsSync(baseHtmlPath)) return;

      const templateHtml = fs.readFileSync(baseHtmlPath, 'utf-8');
      const configuredSiteUrl = normalizeSiteUrl(
        env.VITE_SITE_URL || process.env.VITE_SITE_URL
      );
      const gaId = (env.VITE_GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID || '').trim();
      const gscToken = (env.VITE_GSC_VERIFICATION || process.env.VITE_GSC_VERIFICATION || '').trim();
      const todayIso = new Date().toISOString().split('T')[0];

      for (const routePath of PUBLIC_SEO_PATHS) {
        const route = SEO_ROUTES[routePath];
        const canonical = buildCanonicalUrl(routePath, configuredSiteUrl);
        const ogImage = configuredSiteUrl ? `${configuredSiteUrl}/og-image.jpg` : '/og-image.jpg';
        const schemas = buildStructuredDataJsonLd(route, canonical || undefined);

        const extraHeadTags: string[] = [
          `<meta name="keywords" content="${escapeHtml(route.keywords.join(', '))}" />`,
          ...(canonical
            ? [
                `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
                `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
              ]
            : []),
          ...(gscToken
            ? [`<meta name="google-site-verification" content="${escapeHtml(gscToken)}" />`]
            : []),
          ...(gaId && /^G-[A-Z0-9]+$/i.test(gaId)
            ? [
                `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}"></script>`,
                `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeHtml(gaId)}');</script>`,
              ]
            : []),
          ...schemas.map(
            (schema) =>
              `<script type="application/ld+json" data-twl-seo-jsonld="true">${JSON.stringify(schema)}</script>`
          ),
        ].join('\n    ');

        let html = templateHtml
          .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(route.title)}</title>`)
          .replace(
            /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="description" content="${escapeHtml(route.description)}" />`
          )
          .replace(
            /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:title" content="${escapeHtml(route.title)}" />`
          )
          .replace(
            /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:description" content="${escapeHtml(route.description)}" />`
          )
          .replace(
            /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
            `<meta property="og:image" content="${escapeHtml(ogImage)}" />`
          )
          .replace(
            /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`
          )
          .replace(
            /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`
          )
          .replace(
            /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
            `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />`
          )
          .replace('</head>', `    ${extraHeadTags}\n  </head>`)
          .replace('<div id="root"></div>', `<div id="root">${buildPrerenderMarkup(route)}</div>`);

        if (routePath === '/') {
          fs.writeFileSync(baseHtmlPath, html, 'utf-8');
        } else {
          const slugDir = path.join(distRoot, routePath.replace(/^\/+/, ''));
          fs.mkdirSync(slugDir, {recursive: true});
          fs.writeFileSync(path.join(slugDir, 'index.html'), html, 'utf-8');
        }
      }

      // Update dist/robots.txt and generate dist/sitemap.xml when VITE_SITE_URL is configured
      const robotsLines = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /*?mode=',
        'Disallow: /*?songId=',
      ];
      if (configuredSiteUrl) {
        robotsLines.push(`Sitemap: ${configuredSiteUrl}/sitemap.xml`);
        const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_SEO_PATHS.map((p) => {
  const loc = `${configuredSiteUrl}${p === '/' ? '/' : p}`;
  const priority = p === '/' ? '1.0' : p === '/tamil-church-presentation-software' ? '0.9' : '0.8';
  return `  <url>
    <loc>${escapeHtml(loc)}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>
`;
        fs.writeFileSync(path.join(distRoot, 'sitemap.xml'), sitemapXml, 'utf-8');
      }
      fs.writeFileSync(path.join(distRoot, 'robots.txt'), robotsLines.join('\n') + '\n', 'utf-8');
    },
  };
}

function noImmutableDepsCachePlugin(): Plugin {
  return {
    name: 'no-immutable-deps-cache',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.includes('/deps/')) {
          const origSetHeader = res.setHeader.bind(res);
          res.setHeader = ((name: string, value: number | string | readonly string[]) => {
            if (name.toLowerCase() === 'cache-control') {
              return origSetHeader(name, 'no-cache');
            }
            return origSetHeader(name, value);
          }) as typeof res.setHeader;
        }
        next();
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    cacheDir: 'node_modules/.vite-eci-v2',
    plugins: [react(), tailwindcss(), noImmutableDepsCachePlugin(), seoPrerenderPlugin(env)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          __ECI_DEPS_REV__: '"v2"',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
