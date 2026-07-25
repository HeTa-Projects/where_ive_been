"use client";

import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, firebaseHazir } from "./firebase";

export type CustomUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
};

type AuthContextValue = {
  firebaseHazir: boolean;
  loading: boolean;
  user: CustomUser | null;
  cikisYap: () => Promise<void>;
  demoGirisYap: (email: string, displayName?: string) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Firebase Auth mevcut ise dinle
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || "gezgin@whereivebeen.com",
            displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Gezgin Kullanıcı",
            photoURL: fbUser.photoURL || undefined,
          });
        } else {
          localStorage.removeItem("whib_demo_user");
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // 2. Demo Auth kontrol et
      const savedDemo = localStorage.getItem("whib_demo_user");
      if (savedDemo) {
        try {
          setUser(JSON.parse(savedDemo));
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    }
  }, []);

  const demoGirisYap = (email: string, displayName?: string) => {
    const newUser: CustomUser = {
      uid: `demo-${Date.now()}`,
      email: email.trim() || "gezgin@whereivebeen.com",
      displayName: displayName || email.split("@")[0] || "Gezgin Kullanıcı",
    };
    setUser(newUser);
    localStorage.setItem("whib_demo_user", JSON.stringify(newUser));
  };

  const cikisYap = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
    localStorage.removeItem("whib_demo_user");
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseHazir,
      loading,
      user,
      cikisYap,
      demoGirisYap,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth AuthProvider içinde kullanılmalı.");
  }
  return context;
}
