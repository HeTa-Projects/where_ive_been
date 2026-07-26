import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as Notifications from 'expo-notifications';
import * as Sharing from 'expo-sharing';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import {
  INITIAL_GALLERY,
  INITIAL_JOURNAL,
  INITIAL_PINS,
  INITIAL_POSTS,
  INITIAL_ROUTES,
  INITIAL_USER,
} from '../services/storage';
import {
  BadgeItem,
  CommunityComment,
  CommunityPost,
  GalleryItem,
  JournalEntry,
  NotificationItem,
  PinCollection,
  PinItem,
  ReportReason,
  TravelRoute,
  UserProfile,
  UserSettings,
} from '../types/travel';

type AuthMode = 'firebase' | 'demo';
type PendingAction =
  | { type: 'addPin'; payload: Omit<PinItem, 'id'> }
  | { type: 'addJournalEntry'; payload: Omit<JournalEntry, 'id'> }
  | { type: 'addGalleryItem'; payload: Omit<GalleryItem, 'id'> }
  | { type: 'addCommunityPost'; payload: Omit<CommunityPost, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'likesCount' | 'commentsCount' | 'createdAt' | 'isLiked'> }
  | { type: 'addComment'; payload: { postId: string; text: string } }
  | { type: 'updateProfile'; payload: Partial<UserProfile> };
type CommunityPostInput = Omit<CommunityPost, 'id' | 'authorId' | 'authorName' | 'authorAvatar' | 'likesCount' | 'commentsCount' | 'createdAt' | 'isLiked'>;

interface AppDataContextValue {
  user: User | null;
  profile: UserProfile;
  pins: PinItem[];
  routes: TravelRoute[];
  journal: JournalEntry[];
  gallery: GalleryItem[];
  badges: BadgeItem[];
  collections: PinCollection[];
  communityPosts: CommunityPost[];
  commentsByPost: Record<string, CommunityComment[]>;
  notifications: NotificationItem[];
  followingIds: string[];
  blockedUserIds: string[];
  loading: boolean;
  authMode: AuthMode;
  firebaseReady: boolean;
  pendingSyncCount: number;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  enterDemo: () => void;
  logout: () => Promise<void>;
  addPin: (pin: Omit<PinItem, 'id'>) => Promise<void>;
  deletePin: (id: string) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
  addCommunityPost: (post: CommunityPostInput) => Promise<void>;
  togglePostLike: (post: CommunityPost) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  watchComments: (postId: string) => () => void;
  hideCommunityPost: (postId: string) => Promise<void>;
  reportCommunityPost: (post: CommunityPost, reason: ReportReason) => Promise<void>;
  blockUser: (targetUserId: string) => Promise<void>;
  unblockUser: (targetUserId: string) => Promise<void>;
  createCollection: (title: string, description?: string) => Promise<void>;
  addPinToCollection: (collectionId: string, pinId: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  registerPushToken: () => Promise<void>;
  followUser: (targetUserId: string) => Promise<void>;
  unfollowUser: (targetUserId: string) => Promise<void>;
  exportUserData: () => Promise<string>;
  requestAccountDeletion: () => Promise<void>;
  uploadImage: (uri: string, folder?: string) => Promise<string | undefined>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);
const ADMIN_EMAILS = ['tahaemredogan@hotmail.com', 'helinveysanogluu@gmail.com'];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

const demoUser = {
  uid: 'demo-user',
  email: 'demo@whereivebeen.app',
  displayName: 'Demo Gezgin',
} as User;

const emptyProfile: UserProfile = {
  ...INITIAL_USER,
  name: 'Yeni Gezgin',
  email: null,
  handle: '@gezgin',
  avatar: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&auto=format&fit=crop&q=80',
  bio: 'Henüz bir gezi notu eklenmedi.',
  totalCities: 0,
  totalCountries: 0,
  totalPins: 0,
  level: 'Yeni Gezgin',
  favoritePlace: '',
  website: '',
  firstDestination: '',
  onboardingCompleted: false,
  settings: {
    darkMode: true,
    communityNotifications: true,
    syncOnWifiOnly: false,
    language: 'tr',
  },
};

function pendingKey(uid: string) {
  return `whib_pending_sync_${uid}`;
}

function cacheKey(uid: string) {
  return `whib_cache_${uid}`;
}

function formatDateValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString('tr-TR');
  }
  return new Date().toLocaleDateString('tr-TR');
}

function buildBadges(pins: PinItem[], gallery: GalleryItem[], journal: JournalEntry[], posts: CommunityPost[]): BadgeItem[] {
  const visitedPins = pins.filter((pin) => pin.category === 'Gittim' || pin.category === 'Favori');
  const visitedCountries = new Set(visitedPins.map((pin) => pin.countryName)).size;
  const visitedCities = new Set(visitedPins.map((pin) => pin.cityName)).size;

  const dynamicBadges: BadgeItem[] = [
    { id: 'b1', title: 'İlk Pin', description: 'İlk gezilecek yeri kaydet.', icon: 'location', unlocked: pins.length > 0, progress: pins.length > 0 ? 100 : 0 },
    { id: 'b2', title: 'Şehir Kaşifi', description: '5 farklı şehir ekle.', icon: 'map', unlocked: visitedCities >= 5, progress: Math.min(100, Math.round((visitedCities / 5) * 100)) },
    { id: 'b3', title: 'Fotoğrafçı Gezgin', description: 'Galeriye 10 fotoğraf ekle.', icon: 'camera', unlocked: gallery.length >= 10, progress: Math.min(100, Math.round((gallery.length / 10) * 100)) },
    { id: 'b4', title: 'Dünya Vatandaşı', description: '10 farklı ülke ekle.', icon: 'earth', unlocked: visitedCountries >= 10, progress: Math.min(100, Math.round((visitedCountries / 10) * 100)) },
    { id: 'b5', title: 'Günlük Yazarı', description: '5 gezi günlüğü yaz.', icon: 'book', unlocked: journal.length >= 5, progress: Math.min(100, Math.round((journal.length / 5) * 100)) },
    { id: 'b6', title: 'Topluluk Sesi', description: '3 topluluk paylaşımı yap.', icon: 'chatbubbles', unlocked: posts.length >= 3, progress: Math.min(100, Math.round((posts.length / 3) * 100)) },
  ];

  return dynamicBadges.map((badge) => ({
    ...badge,
    unlockedAt: badge.unlocked ? 'Bugün' : undefined,
  }));
}

function buildProfile(user: User | null, pins: PinItem[], base: Partial<UserProfile>): UserProfile {
  const totalCities = new Set(pins.map((pin) => pin.cityName)).size;
  const totalCountries = new Set(pins.map((pin) => pin.countryName)).size;
  const level = pins.length >= 20 ? 'Usta Gezgin' : pins.length >= 8 ? 'Kıdemli Gezgin' : 'Yeni Gezgin';
  const email = user?.email ?? base.email ?? null;

  return {
    ...emptyProfile,
    ...base,
    uid: user?.uid ?? base.uid,
    name: base.name || user?.displayName || emptyProfile.name,
    email,
    handle: base.handle || (email ? `@${email.split('@')[0]}` : emptyProfile.handle),
    bio: base.bio || (pins.length ? `${totalCities} şehir, ${totalCountries} ülke ve ${pins.length} pinlik kişisel gezi arşivi.` : emptyProfile.bio),
    totalCities,
    totalCountries,
    totalPins: pins.length,
    level,
    isAdmin: Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase())),
  };
}

function mapDoc<T extends { id: string }>(id: string, data: Record<string, unknown>): T {
  return { id, ...data, createdAt: formatDateValue(data.createdAt) } as unknown as T;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('firebase');
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [pins, setPins] = useState<PinItem[]>([]);
  const [routes] = useState<TravelRoute[]>(INITIAL_ROUTES);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [collections, setCollections] = useState<PinCollection[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommunityComment[]>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(auth && isFirebaseConfigured));
  const flushingRef = useRef(false);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const cacheReadyRef = useRef(false);
  const persistedBadgeIdsRef = useRef<Set<string>>(new Set());

  const profile = useMemo(() => buildProfile(user, pins, profileData), [pins, profileData, user]);
  const visibleCommunityPosts = useMemo(
    () => communityPosts.filter((post) => !post.authorId || !blockedUserIds.includes(post.authorId)),
    [blockedUserIds, communityPosts],
  );

  const syncPublicProfile = useCallback(async (overrides: Partial<UserProfile> = {}) => {
    if (!db || !user) return;
    const source = { ...profile, ...overrides };
    await setDoc(doc(db, 'publicProfiles', user.uid), {
      uid: user.uid,
      name: source.name,
      handle: source.handle,
      avatar: source.avatar,
      bio: source.bio,
      favoritePlace: source.favoritePlace ?? '',
      firstDestination: source.firstDestination ?? '',
      totalCities: source.totalCities,
      totalCountries: source.totalCountries,
      totalPins: source.totalPins,
      level: source.level,
      hidden: false,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }, [profile, user]);

  const readPending = useCallback(async (uid: string): Promise<PendingAction[]> => {
    const raw = await AsyncStorage.getItem(pendingKey(uid));
    const pending = raw ? JSON.parse(raw) as PendingAction[] : [];
    setPendingSyncCount(pending.length);
    return pending;
  }, []);

  const writePending = useCallback(async (uid: string, pending: PendingAction[]) => {
    await AsyncStorage.setItem(pendingKey(uid), JSON.stringify(pending));
    setPendingSyncCount(pending.length);
  }, []);

  const enqueuePending = useCallback(async (action: PendingAction) => {
    const uid = user?.uid || demoUser.uid;
    const pending = await readPending(uid);
    await writePending(uid, [...pending, action]);
  }, [readPending, user?.uid, writePending]);

  const uploadImage = useCallback(async (uri: string, _folder?: string) => {
    void _folder;
    const cleanUri = uri.trim();
    if (cleanUri.startsWith('https://') || cleanUri.startsWith('http://')) return cleanUri;
    return undefined;
  }, []);

  const executeRemote = useCallback(async (action: PendingAction) => {
    if (!db || !user) throw new Error('Firebase config eksik.');

    if (action.type === 'addPin') {
      await addDoc(collection(db, 'users', user.uid, 'pins'), { ...action.payload, createdAt: serverTimestamp() });
    }

    if (action.type === 'addJournalEntry') {
      await addDoc(collection(db, 'users', user.uid, 'journalEntries'), { ...action.payload, createdAt: serverTimestamp() });
    }

    if (action.type === 'addGalleryItem') {
      const imageUrl = await uploadImage(action.payload.imageUrl, 'gallery');
      if (!imageUrl) throw new Error('Fotoğraf için HTTPS URL gerekli.');
      await addDoc(collection(db, 'users', user.uid, 'gallery'), { ...action.payload, imageUrl, createdAt: serverTimestamp() });
    }

    if (action.type === 'addCommunityPost') {
      const imageUrl = action.payload.imageUrl ? await uploadImage(action.payload.imageUrl, 'community') : undefined;
      const postPayload = imageUrl ? { ...action.payload, imageUrl } : { ...action.payload, imageUrl: undefined };
      delete postPayload.imageUrl;
      if (imageUrl) postPayload.imageUrl = imageUrl;
      await addDoc(collection(db, 'communityPosts'), {
        ...postPayload,
        authorId: user.uid,
        authorName: profile.name,
        authorAvatar: profile.avatar,
        likesCount: 0,
        commentsCount: 0,
        likedBy: [],
        hidden: false,
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }

    if (action.type === 'addComment') {
      await addDoc(collection(db, 'communityPosts', action.payload.postId, 'comments'), {
        authorId: user.uid,
        authorName: profile.name,
        text: action.payload.text,
        hidden: false,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'communityPosts', action.payload.postId), { commentsCount: increment(1), updatedAt: serverTimestamp() });

    }

    if (action.type === 'updateProfile') {
      await setDoc(doc(db, 'users', user.uid), { ...action.payload, updatedAt: serverTimestamp() }, { merge: true });
      await syncPublicProfile(action.payload);
    }
  }, [communityPosts, profile.avatar, profile.name, syncPublicProfile, uploadImage, user]);

  const flushPending = useCallback(async () => {
    if (!user || !db || authMode !== 'firebase' || flushingRef.current) return;
    flushingRef.current = true;
    const pending = await readPending(user.uid);
    const failed: PendingAction[] = [];

    for (const action of pending) {
      try {
        await executeRemote(action);
      } catch {
        failed.push(action);
      }
    }

    await writePending(user.uid, failed);
    flushingRef.current = false;
  }, [authMode, executeRemote, readPending, user, writePending]);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthMode('firebase');
      setLoading(false);
      if (!nextUser) {
        cacheReadyRef.current = false;
        persistedBadgeIdsRef.current = new Set();
        setProfileData({});
        setPins([]);
        setJournal([]);
        setGallery([]);
        setCollections([]);
        setBlockedUserIds([]);
      }
    });
  }, []);

  useEffect(() => {
    if (!db || !user || authMode === 'demo') return;

    const uid = user.uid;
    let receivedLiveData = false;
    cacheReadyRef.current = false;

    void AsyncStorage.getItem(cacheKey(uid)).then((raw) => {
      if (!raw || receivedLiveData) return;
      const cached = JSON.parse(raw) as {
        profileData?: Partial<UserProfile>;
        pins?: PinItem[];
        journal?: JournalEntry[];
        gallery?: GalleryItem[];
        collections?: PinCollection[];
        communityPosts?: CommunityPost[];
        notifications?: NotificationItem[];
        followingIds?: string[];
        blockedUserIds?: string[];
      };
      setProfileData(cached.profileData ?? {});
      setPins(cached.pins ?? []);
      setJournal(cached.journal ?? []);
      setGallery(cached.gallery ?? []);
      setCollections(cached.collections ?? []);
      setCommunityPosts(cached.communityPosts ?? []);
      setNotifications(cached.notifications ?? []);
      setFollowingIds(cached.followingIds ?? []);
      setBlockedUserIds(cached.blockedUserIds ?? []);
      cacheReadyRef.current = true;
    }).catch(() => {
      cacheReadyRef.current = true;
    });

    const unsubProfile = onSnapshot(doc(db, 'users', uid), (snapshot) => {
      receivedLiveData = true;
      cacheReadyRef.current = true;
      setProfileData(snapshot.exists() ? snapshot.data() as Partial<UserProfile> : {});
    });
    const unsubPins = onSnapshot(query(collection(db, 'users', uid, 'pins'), orderBy('createdAt', 'desc')), (snapshot) => {
      receivedLiveData = true;
      setPins(snapshot.docs.map((item) => mapDoc<PinItem>(item.id, item.data())));
    });
    const unsubJournal = onSnapshot(query(collection(db, 'users', uid, 'journalEntries'), orderBy('createdAt', 'desc')), (snapshot) => {
      receivedLiveData = true;
      setJournal(snapshot.docs.map((item) => mapDoc<JournalEntry>(item.id, item.data())));
    });
    const unsubGallery = onSnapshot(query(collection(db, 'users', uid, 'gallery'), orderBy('createdAt', 'desc')), (snapshot) => {
      receivedLiveData = true;
      setGallery(snapshot.docs.map((item) => mapDoc<GalleryItem>(item.id, item.data())));
    });
    const unsubCollections = onSnapshot(query(collection(db, 'users', uid, 'collections'), orderBy('createdAt', 'desc')), (snapshot) => {
      receivedLiveData = true;
      setCollections(snapshot.docs.map((item) => mapDoc<PinCollection>(item.id, item.data())));
    });
    const unsubNotifications = onSnapshot(query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc')), (snapshot) => {
      receivedLiveData = true;
      const nextNotifications = snapshot.docs.map((item) => mapDoc<NotificationItem>(item.id, item.data()));
      nextNotifications.forEach((item) => {
        if (!item.read && !seenNotificationIdsRef.current.has(item.id)) {
          seenNotificationIdsRef.current.add(item.id);
          void Notifications.scheduleNotificationAsync({
            content: { title: item.title, body: item.body },
            trigger: null,
          });
        }
      });
      setNotifications(nextNotifications);
    });
    const unsubFollowing = onSnapshot(query(collection(db, 'users', uid, 'following')), (snapshot) => {
      receivedLiveData = true;
      setFollowingIds(snapshot.docs.map((item) => item.id));
    });
    const unsubBlocked = onSnapshot(query(collection(db, 'users', uid, 'blockedUsers')), (snapshot) => {
      receivedLiveData = true;
      setBlockedUserIds(snapshot.docs.map((item) => item.id));
    });
    const unsubCommunity = onSnapshot(query(collection(db, 'communityPosts'), orderBy('createdAt', 'desc')), (snapshot) => {
      receivedLiveData = true;
      setCommunityPosts(snapshot.docs.map((item) => {
        const post = mapDoc<CommunityPost>(item.id, item.data());
        return { ...post, isLiked: Boolean(post.likedBy?.includes(uid)) };
      }).filter((post) => !post.hidden && post.status !== 'hidden'));
    });

    void readPending(uid);
    void flushPending();

    return () => {
      unsubProfile();
      unsubPins();
      unsubJournal();
      unsubGallery();
      unsubCollections();
      unsubNotifications();
      unsubFollowing();
      unsubBlocked();
      unsubCommunity();
    };
  }, [authMode, flushPending, readPending, user]);

  useEffect(() => {
    if (!user || authMode !== 'firebase' || !cacheReadyRef.current) return;
    const payload = {
      profileData,
      pins,
      journal,
      gallery,
      collections,
      communityPosts,
      notifications,
      followingIds,
      blockedUserIds,
      updatedAt: new Date().toISOString(),
    };
    void AsyncStorage.setItem(cacheKey(user.uid), JSON.stringify(payload));
  }, [authMode, blockedUserIds, collections, communityPosts, followingIds, gallery, journal, notifications, pins, profileData, user]);

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase config eksik.');
    setAuthMode('firebase');
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!auth || !db) throw new Error('Firebase config eksik.');
    const cleanEmail = email.trim();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    setAuthMode('firebase');
    const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await updateProfile(credential.user, { displayName: cleanName });
    await setDoc(doc(db, 'users', credential.user.uid), {
      name: cleanName,
      email: credential.user.email,
      handle: `@${cleanEmail.split('@')[0]}`,
      avatar: emptyProfile.avatar,
      bio: '',
      favoritePlace: '',
      website: '',
      firstDestination: '',
      onboardingCompleted: false,
      settings: emptyProfile.settings,
      createdAt: serverTimestamp(),
    });
    await setDoc(doc(db, 'publicProfiles', credential.user.uid), {
      uid: credential.user.uid,
      name: cleanName,
      handle: `@${cleanEmail.split('@')[0]}`,
      avatar: emptyProfile.avatar,
      bio: '',
      favoritePlace: '',
      firstDestination: '',
      totalCities: 0,
      totalCountries: 0,
      totalPins: 0,
      level: 'Yeni Gezgin',
      hidden: false,
      createdAt: serverTimestamp(),
    });
  }, []);

  const enterDemo = useCallback(() => {
    setAuthMode('demo');
    setUser(demoUser);
    setProfileData({ ...INITIAL_USER, onboardingCompleted: true });
    setPins(INITIAL_PINS);
    setJournal(INITIAL_JOURNAL);
    setGallery(INITIAL_GALLERY);
    setCollections([]);
    setCommunityPosts(INITIAL_POSTS);
    setBlockedUserIds([]);
    setPendingSyncCount(0);
  }, []);

  const logout = useCallback(async () => {
    if (authMode === 'firebase' && auth) await signOut(auth);
    setUser(null);
    setAuthMode('firebase');
    setProfileData({});
    setPins([]);
    setJournal([]);
    setGallery([]);
    setCollections([]);
    setCommunityPosts([]);
    setCommentsByPost({});
    setNotifications([]);
    setFollowingIds([]);
    setBlockedUserIds([]);
    setPendingSyncCount(0);
    cacheReadyRef.current = false;
    persistedBadgeIdsRef.current = new Set();
  }, [authMode]);

  const addPin = useCallback(async (pin: Omit<PinItem, 'id'>) => {
    const localPin = { id: `pin-${Date.now()}`, ...pin };
    if (db && user && authMode === 'firebase') {
      try {
        await executeRemote({ type: 'addPin', payload: pin });
        await syncPublicProfile({ totalPins: profile.totalPins + 1 });
        return;
      } catch {
        await enqueuePending({ type: 'addPin', payload: pin });
      }
    }
    setPins((current) => [localPin, ...current]);
  }, [authMode, enqueuePending, executeRemote, profile.totalPins, syncPublicProfile, user]);

  const deletePin = useCallback(async (id: string) => {
    if (db && user && authMode === 'firebase') {
      await deleteDoc(doc(db, 'users', user.uid, 'pins', id));
      await syncPublicProfile({ totalPins: Math.max(0, profile.totalPins - 1) });
      return;
    }
    setPins((current) => current.filter((pin) => pin.id !== id));
  }, [authMode, profile.totalPins, syncPublicProfile, user]);

  const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id'>) => {
    const localEntry = { id: `journal-${Date.now()}`, ...entry };
    if (db && user && authMode === 'firebase') {
      try {
        await executeRemote({ type: 'addJournalEntry', payload: entry });
        return;
      } catch {
        await enqueuePending({ type: 'addJournalEntry', payload: entry });
      }
    }
    setJournal((current) => [localEntry, ...current]);
  }, [authMode, enqueuePending, executeRemote, user]);

  const addGalleryItem = useCallback(async (item: Omit<GalleryItem, 'id'>) => {
    const localItem = { id: `gallery-${Date.now()}`, ...item };
    if (db && user && authMode === 'firebase') {
      try {
        await executeRemote({ type: 'addGalleryItem', payload: item });
        return;
      } catch {
        await enqueuePending({ type: 'addGalleryItem', payload: item });
      }
    }
    setGallery((current) => [localItem, ...current]);
  }, [authMode, enqueuePending, executeRemote, user]);

  const addCommunityPost = useCallback(async (post: CommunityPostInput) => {
    const localPost: CommunityPost = {
      id: `post-${Date.now()}`,
      ...post,
      authorId: user?.uid,
      authorName: profile.name,
      authorAvatar: profile.avatar,
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      isLiked: false,
      hidden: false,
      status: 'active',
      createdAt: 'Şimdi',
    };

    if (db && user && authMode === 'firebase') {
      try {
        await executeRemote({ type: 'addCommunityPost', payload: post });
        return;
      } catch {
        await enqueuePending({ type: 'addCommunityPost', payload: post });
      }
    }
    setCommunityPosts((current) => [localPost, ...current]);
  }, [authMode, enqueuePending, executeRemote, profile.avatar, profile.name, user]);

  const togglePostLike = useCallback(async (post: CommunityPost) => {
    if (!user) return;
    const alreadyLiked = Boolean(post.likedBy?.includes(user.uid) || post.isLiked);
    setCommunityPosts((current) => current.map((item) => item.id === post.id ? {
      ...item,
      isLiked: !alreadyLiked,
      likedBy: alreadyLiked ? item.likedBy?.filter((uid) => uid !== user.uid) : [...(item.likedBy ?? []), user.uid],
      likesCount: Math.max(0, (item.likesCount ?? 0) + (alreadyLiked ? -1 : 1)),
    } : item));

    if (db && authMode === 'firebase') {
      await updateDoc(doc(db, 'communityPosts', post.id), {
        likedBy: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likesCount: increment(alreadyLiked ? -1 : 1),
        updatedAt: serverTimestamp(),
      });

      if (!alreadyLiked && post.authorId && post.authorId !== user.uid) {
        await addDoc(collection(db, 'users', post.authorId, 'notifications'), {
          type: 'like',
          title: 'Yeni beğeni',
          body: `${profile.name} paylaşımını beğendi.`,
          postId: post.id,
          read: false,
          createdAt: serverTimestamp(),
        });
      }
    }
  }, [authMode, profile.name, user]);

  const addComment = useCallback(async (postId: string, text: string) => {
    const cleanText = text.trim();
    if (!cleanText || !user) return;
    const localComment: CommunityComment = {
      id: `comment-${Date.now()}`,
      postId,
      authorId: user.uid,
      authorName: profile.name,
      text: cleanText,
      createdAt: 'Şimdi',
    };

    if (db && authMode === 'firebase') {
      try {
        await executeRemote({ type: 'addComment', payload: { postId, text: cleanText } });
        return;
      } catch {
        await enqueuePending({ type: 'addComment', payload: { postId, text: cleanText } });
      }
    }

    setCommentsByPost((current) => ({ ...current, [postId]: [...(current[postId] ?? []), localComment] }));
    setCommunityPosts((current) => current.map((post) => post.id === postId ? { ...post, commentsCount: post.commentsCount + 1 } : post));
  }, [authMode, enqueuePending, executeRemote, profile.name, user]);

  const watchComments = useCallback((postId: string) => {
    if (!db || authMode === 'demo') return () => undefined;

    return onSnapshot(query(collection(db, 'communityPosts', postId, 'comments'), orderBy('createdAt', 'asc')), (snapshot) => {
      setCommentsByPost((current) => ({
        ...current,
        [postId]: snapshot.docs.map((item) => ({ ...mapDoc<CommunityComment>(item.id, item.data()), postId })).filter((comment) => !comment.hidden),
      }));
    });
  }, [authMode]);

  const hideCommunityPost = useCallback(async (postId: string) => {
    if (!profile.isAdmin) return;
    setCommunityPosts((current) => current.filter((post) => post.id !== postId));
    if (db && authMode === 'firebase') {
      await updateDoc(doc(db, 'communityPosts', postId), { hidden: true, status: 'hidden', updatedAt: serverTimestamp() });
    }
  }, [authMode, profile.isAdmin]);

  const reportCommunityPost = useCallback(async (post: CommunityPost, reason: ReportReason) => {
    if (!db || !user || authMode !== 'firebase') return;
    await addDoc(collection(db, 'reports'), {
      reporterId: user.uid,
      reporterName: profile.name,
      targetType: 'communityPost',
      targetId: post.id,
      targetAuthorId: post.authorId ?? null,
      targetPreview: post.content.slice(0, 180),
      reason,
      status: 'open',
      createdAt: serverTimestamp(),
    });
  }, [authMode, profile.name, user]);

  const blockUser = useCallback(async (targetUserId: string) => {
    if (!user || targetUserId === user.uid) return;
    setBlockedUserIds((current) => Array.from(new Set([...current, targetUserId])));
    if (db && authMode === 'firebase') {
      await setDoc(doc(db, 'users', user.uid, 'blockedUsers', targetUserId), {
        targetUserId,
        createdAt: serverTimestamp(),
      });
    }
  }, [authMode, user]);

  const unblockUser = useCallback(async (targetUserId: string) => {
    if (!user) return;
    setBlockedUserIds((current) => current.filter((uid) => uid !== targetUserId));
    if (db && authMode === 'firebase') {
      await deleteDoc(doc(db, 'users', user.uid, 'blockedUsers', targetUserId));
    }
  }, [authMode, user]);

  const createCollection = useCallback(async (title: string, description?: string) => {
    const cleanTitle = title.trim();
    if (!cleanTitle || !user) return;
    if (db && authMode === 'firebase') {
      await addDoc(collection(db, 'users', user.uid, 'collections'), {
        title: cleanTitle,
        description: description?.trim() || '',
        pinIds: [],
        createdAt: serverTimestamp(),
      });
      return;
    }

    const localCollection: PinCollection = {
      id: `collection-${Date.now()}`,
      title: cleanTitle,
      description: description?.trim() || undefined,
      pinIds: [],
      createdAt: new Date().toLocaleDateString('tr-TR'),
    };
    setCollections((current) => [localCollection, ...current]);
  }, [authMode, user]);

  const addPinToCollection = useCallback(async (collectionId: string, pinId: string) => {
    if (!user) return;
    setCollections((current) => current.map((item) => item.id === collectionId ? {
      ...item,
      pinIds: Array.from(new Set([...item.pinIds, pinId])),
    } : item));

    if (db && authMode === 'firebase') {
      await updateDoc(doc(db, 'users', user.uid, 'collections', collectionId), {
        pinIds: arrayUnion(pinId),
        updatedAt: serverTimestamp(),
      });
    }
  }, [authMode, user]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfileData((current) => ({ ...current, ...updates }));
    if (auth && user && updates.name && updates.name !== user.displayName) {
      await updateProfile(user, { displayName: updates.name });
    }
    if (db && user && authMode === 'firebase') {
      try {
        await executeRemote({ type: 'updateProfile', payload: updates });
        return;
      } catch {
        await enqueuePending({ type: 'updateProfile', payload: updates });
      }
    }
  }, [authMode, enqueuePending, executeRemote, user]);

  const updateSettings = useCallback(async (settings: Partial<UserSettings>) => {
    const nextSettings = { ...profile.settings, ...settings } as UserSettings;
    await updateUserProfile({ settings: nextSettings });
  }, [profile.settings, updateUserProfile]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, read: true } : item));
    if (db && user && authMode === 'firebase') {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', notificationId), { read: true });
    }
  }, [authMode, user]);

  const registerPushToken = useCallback(async () => {
    if (!db || !user || authMode !== 'firebase') return;
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    const result = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    await setDoc(doc(db, 'users', user.uid, 'devices', result.data), {
      token: result.data,
      platform: 'expo',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }, [authMode, user]);

  const followUser = useCallback(async (targetUserId: string) => {
    if (!db || !user || targetUserId === user.uid) return;
    setFollowingIds((current) => Array.from(new Set([...current, targetUserId])));
    await setDoc(doc(db, 'users', user.uid, 'following', targetUserId), { createdAt: serverTimestamp() });
    await setDoc(doc(db, 'publicProfiles', targetUserId, 'followers', user.uid), {
      uid: user.uid,
      name: profile.name,
      handle: profile.handle,
      avatar: profile.avatar,
      createdAt: serverTimestamp(),
    });
  }, [profile.avatar, profile.handle, profile.name, user]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    if (!db || !user) return;
    setFollowingIds((current) => current.filter((uid) => uid !== targetUserId));
    await deleteDoc(doc(db, 'users', user.uid, 'following', targetUserId));
    await deleteDoc(doc(db, 'publicProfiles', targetUserId, 'followers', user.uid));
  }, [user]);

  const exportUserData = useCallback(async () => {
    const payload = {
      profile,
      pins,
      journal,
      gallery,
      collections,
      communityPosts: communityPosts.filter((post) => post.authorId === user?.uid),
      blockedUserIds,
      exportedAt: new Date().toISOString(),
    };
    const filePath = `${FileSystem.documentDirectory}where-ive-been-export.json`;
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(payload, null, 2));
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(filePath);
    return filePath;
  }, [blockedUserIds, collections, communityPosts, gallery, journal, pins, profile, user?.uid]);

  const requestAccountDeletion = useCallback(async () => {
    if (!db || !user) return;
    await setDoc(doc(db, 'users', user.uid), {
      deletionRequestedAt: serverTimestamp(),
      privacy: { hidden: true },
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(db, 'publicProfiles', user.uid), {
      hidden: true,
      deletionRequestedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await logout();
  }, [logout, user]);

  const badges = useMemo(() => buildBadges(pins, gallery, journal, communityPosts.filter((post) => post.authorId === user?.uid)), [communityPosts, gallery, journal, pins, user?.uid]);

  useEffect(() => {
    if (!db || !user || authMode !== 'firebase') return;
    const firestore = db;
    const uid = user.uid;
    badges.filter((badge) => badge.unlocked && !persistedBadgeIdsRef.current.has(badge.id)).forEach((badge) => {
      persistedBadgeIdsRef.current.add(badge.id);
      void setDoc(doc(firestore, 'users', uid, 'badges', badge.id), {
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        progress: badge.progress,
        unlockedAt: serverTimestamp(),
      }, { merge: true });
    });
  }, [authMode, badges, user]);

  const value = useMemo<AppDataContextValue>(() => ({
    user,
    profile,
    pins,
    routes,
    journal,
    gallery,
    badges,
    collections,
    communityPosts: visibleCommunityPosts,
    commentsByPost,
    notifications,
    followingIds,
    blockedUserIds,
    loading,
    authMode,
    firebaseReady: isFirebaseConfigured,
    pendingSyncCount,
    login,
    register,
    enterDemo,
    logout,
    addPin,
    deletePin,
    addJournalEntry,
    addGalleryItem,
    addCommunityPost,
    togglePostLike,
    addComment,
    watchComments,
    hideCommunityPost,
    reportCommunityPost,
    blockUser,
    unblockUser,
    createCollection,
    addPinToCollection,
    updateUserProfile,
    updateSettings,
    markNotificationRead,
    registerPushToken,
    followUser,
    unfollowUser,
    exportUserData,
    requestAccountDeletion,
    uploadImage,
  }), [addComment, addCommunityPost, addGalleryItem, addJournalEntry, addPin, addPinToCollection, authMode, badges, blockUser, blockedUserIds, collections, commentsByPost, createCollection, deletePin, enterDemo, exportUserData, followUser, followingIds, gallery, hideCommunityPost, journal, loading, login, logout, markNotificationRead, notifications, pendingSyncCount, pins, profile, register, registerPushToken, reportCommunityPost, requestAccountDeletion, routes, togglePostLike, unblockUser, unfollowUser, updateSettings, updateUserProfile, uploadImage, user, visibleCommunityPosts, watchComments]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
}
