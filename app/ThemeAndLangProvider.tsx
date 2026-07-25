"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { dictionary } from "./i18n";
import type { Language } from "./i18n";

type Theme = "dark" | "light";

type ThemeAndLangContextType = {
  theme: Theme;
  lang: Language;
  toggleTheme: () => void;
  toggleLang: () => void;
  t: typeof dictionary["tr"];
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
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("whib_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    document.body.setAttribute("data-theme", nextTheme);
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
      t: dictionary[lang],
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
