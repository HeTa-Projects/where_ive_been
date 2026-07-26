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

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  cityName: string;
  content: string;
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  createdAt: string;
  isLiked?: boolean;
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
}
