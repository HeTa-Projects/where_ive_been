"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";
type Language = "tr" | "en";

export const translations = {
  tr: {
    home: "Ana Sayfa",
    routes: "Rotalar",
    guide: "Mekan Rehberi",
    community: "Topluluk",
    contact: "İletişim",
    profile: "Profil",
    login: "Giriş Yap",
    logout: "Çıkış Yap",
    selectCityHint: "📍 Haritadaki pinlerden bir şehir seçin veya herhangi bir noktaya tıklayıp yeni pin ekleyin",
    countriesLabel: "Ülkeler:",
    all: "Tümü",
    history: "Tarih",
    beach: "Sahil",
    street: "Sokak",
    places: "Mekan",
    visitors: "Ziyaretçi",
    reviews: "İnceleme",
    popularPlaces: "Popüler Mekanlar",
    openGuide: "Rehberini Aç →",
    newPinTitle: "📍 Yeni Yer İşaretle",
    visited: "✅ Gittim",
    wishlist: "📌 Rota Listemde",
    favorite: "❤️ Favorim",
    darkTheme: "🌙 Gece",
    lightTheme: "☀️ Gündüz",
    selectedCity: "Seçili Şehir",
  },
  en: {
    home: "Home",
    routes: "Itineraries",
    guide: "Place Guide",
    community: "Community",
    contact: "Contact",
    profile: "Profile",
    login: "Sign In",
    logout: "Sign Out",
    selectCityHint: "📍 Select a city from the map pins or click anywhere to add a new pin",
    countriesLabel: "Countries:",
    all: "All",
    history: "History",
    beach: "Beaches",
    street: "Street Vibe",
    places: "Places",
    visitors: "Visitors",
    reviews: "Reviews",
    popularPlaces: "Popular Places",
    openGuide: "Open Guide →",
    newPinTitle: "📍 Mark New Place",
    visited: "✅ Visited",
    wishlist: "📌 Wishlist",
    favorite: "❤️ Favorite",
    darkTheme: "🌙 Dark",
    lightTheme: "☀️ Light",
    selectedCity: "Selected City",
  },
};

type ThemeAndLangContextType = {
  theme: Theme;
  lang: Language;
  toggleTheme: () => void;
  toggleLang: () => void;
  t: typeof translations["tr"];
};

const ThemeAndLangContext = createContext<ThemeAndLangContextType | null>(null);

export function ThemeAndLangProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [lang, setLang] = useState<Language>("tr");

  useEffect(() => {
    const savedTheme = (localStorage.getItem("whib_theme") as Theme) || "dark";
    const savedLang = (localStorage.getItem("whib_lang") as Language) || "tr";
    setTheme(savedTheme);
    setLang(savedLang);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("whib_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const toggleLang = () => {
    const nextLang: Language = lang === "tr" ? "en" : "tr";
    setLang(nextLang);
    localStorage.setItem("whib_lang", nextLang);
  };

  const value = useMemo(
    () => ({
      theme,
      lang,
      toggleTheme,
      toggleLang,
      t: translations[lang],
    }),
    [theme, lang],
  );

  return (
    <ThemeAndLangContext.Provider value={value}>
      {children}
    </ThemeAndLangContext.Provider>
  );
}

export function useThemeAndLang() {
  const context = useContext(ThemeAndLangContext);
  if (!context) {
    throw new Error("useThemeAndLang must be used within ThemeAndLangProvider");
  }
  return context;
}
