export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: any;
  updatedAt?: any;
}

export interface GameItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  gameUrl: string; // GitHub Pages or external web game URL
  category?: string;
  featured?: boolean;
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  category?: 'Update' | 'Nieuws' | 'Event' | 'Onderhoud' | 'Community' | string;
  isPinned?: boolean;
  authorName?: string;
  authorEmail?: string;
  createdBy: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PlaytimeRecord {
  userId: string;
  gameId: string;
  gameTitle?: string;
  totalSeconds: number;
  lastPlayedAt?: any;
  updatedAt?: any;
}
