import {
  BRAND_NAME,
  SeoRoutePath,
  buildCanonicalUrl,
  buildStructuredDataJsonLd,
  resolveSeoRoute,
} from '../config/seo';

function upsertMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMetaTag(attr: 'name' | 'property', key: string): void {
  if (typeof document === 'undefined') return;
  const el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (el) el.remove();
}

function upsertLinkTag(rel: string, href: string): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function removeLinkTag(rel: string): void {
  if (typeof document === 'undefined') return;
  const el = document.head.querySelector(`link[rel="${rel}"]`);
  if (el) el.remove();
}

let analyticsInjected = false;

function maybeInjectAnalytics(gaId?: string, gscToken?: string): void {
  if (typeof document === 'undefined') return;

  if (gscToken && gscToken.trim()) {
    upsertMetaTag('name', 'google-site-verification', gscToken.trim());
  }

  const cleanGaId = gaId?.trim();
  if (cleanGaId && !analyticsInjected && /^G-[A-Z0-9]+$/i.test(cleanGaId)) {
    analyticsInjected = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cleanGaId)}`;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${cleanGaId}');`;
    document.head.appendChild(inline);
  }
}

export interface RuntimeSeoOptions {
  pathname: string;
  isPresentationMode?: boolean;
  isControlMode?: boolean;
}

export function applyRuntimeSeo({
  pathname,
  isPresentationMode = false,
  isControlMode = false,
}: RuntimeSeoOptions): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const siteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
  const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
  const gscVerification = import.meta.env.VITE_GSC_VERIFICATION as string | undefined;

  maybeInjectAnalytics(gaId, gscVerification);

  if (isPresentationMode || isControlMode) {
    const modeTitle = isPresentationMode
      ? `Live Projector Output – ${BRAND_NAME}`
      : `Presenter Control Center – ${BRAND_NAME}`;
    document.title = modeTitle;
    upsertMetaTag('name', 'robots', 'noindex, nofollow');
    removeLinkTag('canonical');
    return;
  }

  const route = resolveSeoRoute(pathname);
  const canonical = buildCanonicalUrl(
    route.path as SeoRoutePath,
    siteUrl,
    window.location.origin,
    window.location.hostname
  );

  document.title = route.title;
  upsertMetaTag('name', 'description', route.description);
  upsertMetaTag('name', 'keywords', route.keywords.join(', '));
  upsertMetaTag('name', 'robots', 'index, follow');

  // OpenGraph tags
  upsertMetaTag('property', 'og:type', 'website');
  upsertMetaTag('property', 'og:site_name', BRAND_NAME);
  upsertMetaTag('property', 'og:title', route.title);
  upsertMetaTag('property', 'og:description', route.description);
  upsertMetaTag('property', 'og:locale', 'en_US');

  // Twitter / X cards
  upsertMetaTag('name', 'twitter:card', 'summary_large_image');
  upsertMetaTag('name', 'twitter:title', route.title);
  upsertMetaTag('name', 'twitter:description', route.description);

  const ogImageUrl = canonical
    ? `${canonical.replace(new RegExp(`${route.path === '/' ? '/$' : route.path + '$'}`), '')}/og-image.jpg`
    : '/og-image.jpg';
  upsertMetaTag('property', 'og:image', ogImageUrl);
  upsertMetaTag('name', 'twitter:image', ogImageUrl);

  if (canonical) {
    upsertLinkTag('canonical', canonical);
    upsertMetaTag('property', 'og:url', canonical);
  } else {
    removeLinkTag('canonical');
    removeMetaTag('property', 'og:url');
  }

  // Schema.org JSON-LD scripts
  document.head
    .querySelectorAll('script[data-twl-seo-jsonld="true"]')
    .forEach((el) => el.remove());

  const schemas = buildStructuredDataJsonLd(route, canonical || undefined);
  for (const schema of schemas) {
    const scriptEl = document.createElement('script');
    scriptEl.type = 'application/ld+json';
    scriptEl.setAttribute('data-twl-seo-jsonld', 'true');
    scriptEl.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptEl);
  }
}
