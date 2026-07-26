import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../services/firebase';
import {
  INITIAL_BADGES,
  INITIAL_GALLERY,
  INITIAL_JOURNAL,
  INITIAL_PINS,
  INITIAL_ROUTES,
  INITIAL_USER,
} from '../services/storage';
import { BadgeItem, GalleryItem, JournalEntry, PinItem, TravelRoute, UserProfile } from '../types/travel';

type AuthMode = 'firebase' | 'demo';

interface AppDataContextValue {
  user: User | null;
  profile: UserProfile;
  pins: PinItem[];
  routes: TravelRoute[];
  journal: JournalEntry[];
  gallery: GalleryItem[];
  badges: BadgeItem[];
  loading: boolean;
  authMode: AuthMode;
  firebaseReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  enterDemo: () => void;
  logout: () => Promise<void>;
  addPin: (pin: Omit<PinItem, 'id'>) => Promise<void>;
  deletePin: (id: string) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<void>;
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

const demoUser = {
  uid: 'demo-user',
  email: 'demo@whereivebeen.app',
  displayName: 'Demo Gezgin',
} as User;

function buildBadges(pins: PinItem[], gallery: GalleryItem[]): BadgeItem[] {
  const visitedCountries = new Set(pins.filter((pin) => pin.category === 'Gittim').map((pin) => pin.countryName)).size;
  const visitedCities = new Set(pins.filter((pin) => pin.category === 'Gittim').map((pin) => pin.cityName)).size;

  return INITIAL_BADGES.map((badge) => {
    if (badge.id === 'b1') return { ...badge, unlocked: pins.length > 0, progress: pins.length > 0 ? 100 : 0 };
    if (badge.id === 'b2') {
      const progress = Math.min(100, Math.round((visitedCountries / 3) * 100));
      return { ...badge, unlocked: visitedCountries >= 3, progress };
    }
    if (badge.id === 'b3') {
      const progress = Math.min(100, Math.round((gallery.length / 10) * 100));
      return { ...badge, unlocked: gallery.length >= 10, progress };
    }
    if (badge.id === 'b4') {
      const progress = Math.min(100, Math.round((visitedCountries / 10) * 100));
      return { ...badge, unlocked: visitedCountries >= 10, progress };
    }
    return { ...badge, progress: Math.min(100, visitedCities * 10) };
  });
}

function buildProfile(user: User | null, pins: PinItem[]): UserProfile {
  const totalCities = new Set(pins.map((pin) => pin.cityName)).size;
  const totalCountries = new Set(pins.map((pin) => pin.countryName)).size;
  const level = pins.length >= 20 ? 'Usta Gezgin' : pins.length >= 8 ? 'Kıdemli Gezgin' : 'Yeni Gezgin';

  return {
    ...INITIAL_USER,
    uid: user?.uid,
    name: user?.displayName || INITIAL_USER.name,
    email: user?.email,
    handle: user?.email ? `@${user.email.split('@')[0]}` : INITIAL_USER.handle,
    bio: `${totalCities} şehir, ${totalCountries} ülke ve ${pins.length} pinlik kişisel gezi arşivi.`,
    totalCities,
    totalCountries,
    totalPins: pins.length,
    level,
  };
}

function mapDoc<T extends { id: string }>(id: string, data: Record<string, unknown>): T {
  return { id, ...data } as T;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('firebase');
  const [pins, setPins] = useState<PinItem[]>(INITIAL_PINS);
  const [routes] = useState<TravelRoute[]>(INITIAL_ROUTES);
  const [journal, setJournal] = useState<JournalEntry[]>(INITIAL_JOURNAL);
  const [gallery, setGallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!db || !user || authMode === 'demo') return;

    const uid = user.uid;
    const unsubPins = onSnapshot(query(collection(db, 'users', uid, 'pins'), orderBy('createdAt', 'desc')), (snapshot) => {
      setPins(snapshot.docs.map((item) => mapDoc<PinItem>(item.id, item.data())));
    });
    const unsubJournal = onSnapshot(query(collection(db, 'users', uid, 'journalEntries'), orderBy('createdAt', 'desc')), (snapshot) => {
      setJournal(snapshot.docs.map((item) => mapDoc<JournalEntry>(item.id, item.data())));
    });
    const unsubGallery = onSnapshot(query(collection(db, 'users', uid, 'gallery'), orderBy('createdAt', 'desc')), (snapshot) => {
      setGallery(snapshot.docs.map((item) => mapDoc<GalleryItem>(item.id, item.data())));
    });

    return () => {
      unsubPins();
      unsubJournal();
      unsubGallery();
    };
  }, [authMode, user]);

  const login = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase config eksik.');
    setAuthMode('firebase');
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    if (!auth || !db) throw new Error('Firebase config eksik.');
    setAuthMode('firebase');
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await updateProfile(credential.user, { displayName: name.trim() });
    await setDoc(doc(db, 'users', credential.user.uid), {
      name: name.trim(),
      email: credential.user.email,
      handle: `@${email.split('@')[0]}`,
      createdAt: serverTimestamp(),
    });
  }, []);

  const enterDemo = useCallback(() => {
    setAuthMode('demo');
    setUser(demoUser);
    setPins(INITIAL_PINS);
    setJournal(INITIAL_JOURNAL);
    setGallery(INITIAL_GALLERY);
  }, []);

  const logout = useCallback(async () => {
    if (authMode === 'firebase' && auth) await signOut(auth);
    setUser(null);
    setAuthMode('firebase');
    setPins(INITIAL_PINS);
    setJournal(INITIAL_JOURNAL);
    setGallery(INITIAL_GALLERY);
  }, [authMode]);

  const addPin = useCallback(async (pin: Omit<PinItem, 'id'>) => {
    if (db && user && authMode === 'firebase') {
      await addDoc(collection(db, 'users', user.uid, 'pins'), { ...pin, createdAt: serverTimestamp() });
      if (pin.imageUrl) {
        await addDoc(collection(db, 'users', user.uid, 'gallery'), {
          title: pin.title,
          cityName: pin.cityName,
          imageUrl: pin.imageUrl,
          note: pin.note ?? '',
          createdAt: serverTimestamp(),
        });
      }
      if (pin.journal) {
        await addDoc(collection(db, 'users', user.uid, 'journalEntries'), {
          title: pin.title,
          cityName: pin.cityName,
          body: pin.journal,
          mood: pin.category === 'Favori' ? 'Unutulmaz' : 'Keyifli',
          date: pin.visitedDate ?? new Date().toLocaleDateString('tr-TR'),
          imageUrl: pin.imageUrl,
          createdAt: serverTimestamp(),
        });
      }
      return;
    }

    const id = `pin-${Date.now()}`;
    setPins((current) => [{ id, ...pin }, ...current]);
    if (pin.imageUrl) setGallery((current) => [{ id: `gallery-${id}`, title: pin.title, cityName: pin.cityName, imageUrl: pin.imageUrl ?? '', note: pin.note }, ...current]);
    if (pin.journal) setJournal((current) => [{ id: `journal-${id}`, title: pin.title, cityName: pin.cityName, body: pin.journal ?? '', mood: 'Keyifli', date: pin.visitedDate ?? 'Bugün', imageUrl: pin.imageUrl }, ...current]);
  }, [authMode, user]);

  const deletePin = useCallback(async (id: string) => {
    if (db && user && authMode === 'firebase') {
      await deleteDoc(doc(db, 'users', user.uid, 'pins', id));
      return;
    }
    setPins((current) => current.filter((pin) => pin.id !== id));
  }, [authMode, user]);

  const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id'>) => {
    if (db && user && authMode === 'firebase') {
      await addDoc(collection(db, 'users', user.uid, 'journalEntries'), { ...entry, createdAt: serverTimestamp() });
      return;
    }
    setJournal((current) => [{ id: `journal-${Date.now()}`, ...entry }, ...current]);
  }, [authMode, user]);

  const addGalleryItem = useCallback(async (item: Omit<GalleryItem, 'id'>) => {
    if (db && user && authMode === 'firebase') {
      await addDoc(collection(db, 'users', user.uid, 'gallery'), { ...item, createdAt: serverTimestamp() });
      return;
    }
    setGallery((current) => [{ id: `gallery-${Date.now()}`, ...item }, ...current]);
  }, [authMode, user]);

  const profile = useMemo(() => buildProfile(user, pins), [pins, user]);
  const badges = useMemo(() => buildBadges(pins, gallery), [gallery, pins]);

  const value = useMemo<AppDataContextValue>(() => ({
    user,
    profile,
    pins,
    routes,
    journal,
    gallery,
    badges,
    loading,
    authMode,
    firebaseReady: isFirebaseConfigured,
    login,
    register,
    enterDemo,
    logout,
    addPin,
    deletePin,
    addJournalEntry,
    addGalleryItem,
  }), [addGalleryItem, addJournalEntry, addPin, authMode, badges, deletePin, enterDemo, gallery, journal, loading, login, pins, profile, register, routes, user, logout]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used inside AppDataProvider');
  return context;
}
