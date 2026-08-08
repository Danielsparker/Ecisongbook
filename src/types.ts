export interface Song {
  id?: string;
  title: string;
  songNo: number;
  genre: string;
  lyrics: string;
  submittedBy: string;
  createdAt: any; // Firestore Timestamp
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
