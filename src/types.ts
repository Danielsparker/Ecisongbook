export interface Song {
  id?: string;
  title: string;
  songNo: number;
  genre: string;
  lyrics: string;
  submittedBy: string;
  createdAt: any; // Firestore Timestamp
  isExternal?: boolean;
  source?: string;
  sourceUrl?: string;
  artist?: string;
  album?: string;
  key?: string;
  tempo?: number;
  chords?: string;
  transliteration?: string;
}

export interface TCWSongSummary {
  slug: string;
  title_ta: string;
  title_en: string;
  artist: string | null;
  album: string | null;
  has_media: boolean;
  url: string;
  api_url: string;
}

export interface TCWSection {
  index: number;
  label: string | null;
  number: number | null;
  is_refrain: boolean;
  ta: string[];
  en: string[];
}

export interface TCWSongDetail {
  slug: string;
  title_ta: string;
  title_en: string;
  artist: { name: string; slug: string } | string | null;
  album: { title: string; slug: string } | string | null;
  genre: string | null;
  key: string | null;
  beat: string | null;
  tempo: number | null;
  line_count: number;
  youtube_id: string | null;
  karaoke_id: string | null;
  chords: string | null;
  lyrics: {
    ta: string;
    en: string;
  };
  sections: TCWSection[];
  related?: Array<{ slug: string; title_ta: string; title_en: string }>;
  url: string;
  notes?: string;
}

export interface TCWSearchResponse {
  query?: string;
  count?: number;
  total?: number;
  page?: number;
  per_page?: number;
  pages?: number;
  songs: TCWSongSummary[];
}

export interface BibleVerse {
  id?: string | number;
  book: string;
  chapter: number;
  verse: string | number;
  text: string;
  version: string;
  created_at?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
}

export interface PromiseVerse {
  id?: string;
  title: string;           // e.g. "August 2026 Promise Verse"
  reference: string;       // e.g. "Isaiah 40:31"
  imageUrl: string;        // Data URL or HTTP URL
  month?: string;          // e.g. "August 2026"
  createdAt?: any;         // Firestore Timestamp
  submittedBy?: string;
}
