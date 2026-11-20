import { Song, TCWSongDetail, TCWSongSummary, TCWSearchResponse } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const DIRECT_TCW_BASE = 'https://tamilchristianworld.com/api/v1';

// In-memory cache for fetched song details to ensure instantaneous preview & slide navigation
const songDetailCache = new Map<string, TCWSongDetail>();

export interface TCWFilters {
  hasMedia?: boolean;
  hasChords?: boolean;
  letter?: string;
  key?: string;
}

class TCWApiService {
  /**
   * Discovers and searches songs from Tamil Christian World
   * Supports bilingual queries (Tamil script or English transliteration), pagination, and filters
   */
  async searchSongs(
    query?: string,
    page: number = 1,
    limit: number = 50,
    filters?: TCWFilters
  ): Promise<TCWSearchResponse> {
    const params = new URLSearchParams();

    if (query && query.trim().length > 0) {
      params.set('q', query.trim());
    } else {
      params.set('page', page.toString());
      params.set('limit', limit.toString());
    }

    if (filters?.hasMedia) params.set('has_media', '1');
    if (filters?.hasChords) params.set('has_chords', '1');
    if (filters?.letter) params.set('letter', filters.letter);
    if (filters?.key) params.set('key', filters.key);

    const queryString = params.toString();
    const endpoint = `songs${queryString ? `?${queryString}` : ''}`;

    const data = await this.fetchWithFallback<TCWSearchResponse>(endpoint);

    return {
      query: data.query,
      count: data.count ?? data.songs?.length ?? 0,
      total: data.total,
      page: data.page ?? page,
      per_page: data.per_page ?? limit,
      pages: data.pages,
      songs: data.songs || [],
    };
  }

  /**
   * Fetches full song details and lyrics using the documented slug endpoint
   */
  async getSongDetail(slug: string): Promise<TCWSongDetail> {
    const cached = songDetailCache.get(slug);
    if (cached) {
      return cached;
    }

    const endpoint = `songs/${encodeURIComponent(slug)}`;
    const detail = await this.fetchWithFallback<TCWSongDetail>(endpoint);

    // Cache the detail response
    songDetailCache.set(slug, detail);
    return detail;
  }

  /**
   * Retrieves summary for multiple slugs (setlist)
   */
  async getSetlist(slugs: string[]): Promise<TCWSongSummary[]> {
    if (!slugs.length) return [];
    const endpoint = `setlist?slugs=${encodeURIComponent(slugs.join(','))}`;
    const data = await this.fetchWithFallback<{ songs: TCWSongSummary[] }>(endpoint);
    return data.songs || [];
  }

  /**
   * Normalizes an external TCW song into the internal Song interface.
   * Format matches ECI Songbook's presentation engine perfectly without saving to database.
   */
  normalizeTCWSong(detail: TCWSongDetail): Song {
    const artistName: string = typeof detail.artist === 'object' && detail.artist !== null
      ? detail.artist.name
      : (typeof detail.artist === 'string' ? detail.artist : '');

    const albumTitle: string = typeof detail.album === 'object' && detail.album !== null
      ? detail.album.title
      : (typeof detail.album === 'string' ? detail.album : '');

    // Format lyrics with clean \n\n breaks using structured sections first
    let normalizedLyrics = '';
    if (detail.sections && detail.sections.length > 0) {
      normalizedLyrics = detail.sections
        .map(section => (section.ta || []).join('\n').trim())
        .filter(Boolean)
        .join('\n\n');
    }
    if (!normalizedLyrics && detail.lyrics?.ta) {
      normalizedLyrics = detail.lyrics.ta.trim();
    }

    return {
      id: `tcw-${detail.slug}`,
      title: detail.title_ta || detail.title_en || 'Unknown Title',
      songNo: 0, // TCW songs have distinct badge
      genre: detail.genre || albumTitle || 'Tamil Christian World',
      lyrics: normalizedLyrics,
      submittedBy: 'Tamil Christian World',
      createdAt: new Date().toISOString(),
      isExternal: true,
      source: 'Tamil Christian World',
      sourceUrl: detail.url || `https://tamilchristianworld.com/songs/${detail.slug}`,
      artist: artistName,
      album: albumTitle,
      key: detail.key || undefined,
      tempo: detail.tempo || undefined,
      chords: detail.chords || undefined,
      transliteration: detail.title_en || undefined,
    };
  }

  /**
   * Internal fetcher with priority on Supabase Edge Function proxy and seamless direct fallback
   */
  private async fetchWithFallback<T>(endpoint: string): Promise<T> {
    // 1. Try Supabase Edge Function if Supabase is configured
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.functions.invoke('tcw-proxy', {
          body: {},
          headers: {},
          method: 'GET',
          // Supabase function invoke route
        });

        if (!error && data) {
          return data as T;
        }
      } catch (e) {
        // Fallback to direct client call if Edge function is not deployed yet
      }
    }

    // 2. Direct client fetch to public TCW API (CORS enabled by API)
    const url = `${DIRECT_TCW_BASE}/${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Tamil Christian World API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }
}

export const tcwApiService = new TCWApiService();
