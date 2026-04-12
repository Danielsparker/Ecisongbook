export interface Song {
  id?: string;
  title: string;
  songNo: number;
  genre: string;
  lyrics: string;
  submittedBy: string;
  createdAt: any; // Firestore Timestamp
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
}
