export type PinCategory = 'Gittim' | 'İstek' | 'Favori';

export interface PinItem {
  id: string;
  title: string;
  cityName: string;
  countryName: string;
  category: PinCategory;
  rating: number;
  note?: string;
  journal?: string;
  visitedDate?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  tags?: string[];
  createdAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  cityName: string;
  imageUrl: string;
  note?: string;
  createdAt?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  cityName: string;
  body: string;
  mood?: string;
  date: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface RouteStop {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  estimatedTime?: string;
}

export interface TravelRoute {
  id: string;
  title: string;
  cityName: string;
  duration: string;
  difficulty: 'Kolay' | 'Orta' | 'Yoğun';
  description: string;
  coverImage: string;
  stops: RouteStop[];
  likesCount: number;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  unlockedAt?: string;
}

export interface PinCollection {
  id: string;
  title: string;
  description?: string;
  pinIds: string[];
  coverImage?: string;
  createdAt?: string;
}

export interface CommunityPost {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  cityName: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
  likedBy?: string[];
  isLiked?: boolean;
  hidden?: boolean;
  status?: 'active' | 'hidden';
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId?: string;
  authorName: string;
  text: string;
  createdAt: string;
  hidden?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'like' | 'comment' | 'system';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  postId?: string;
}

export type ReportReason = 'spam' | 'harassment' | 'unsafe' | 'other';

export interface UserSettings {
  darkMode: boolean;
  communityNotifications: boolean;
  syncOnWifiOnly: boolean;
  language: 'tr' | 'en';
}

export interface UserProfile {
  uid?: string;
  name: string;
  email?: string | null;
  handle: string;
  avatar: string;
  bio: string;
  totalCities: number;
  totalCountries: number;
  totalPins: number;
  level: string;
  favoritePlace?: string;
  website?: string;
  isAdmin?: boolean;
  firstDestination?: string;
  onboardingCompleted?: boolean;
  settings?: UserSettings;
}
