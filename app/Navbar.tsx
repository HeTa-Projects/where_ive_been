"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdminEmail } from "./admin-config";
import { useAuth } from "./AuthProvider";
import { useThemeAndLang } from "./ThemeAndLangProvider";

export function Navbar({
  mekanHref = "/mekanlar/istanbul",
}: {
  mekanHref?: string;
}) {
  const { loading, user } = useAuth();
  const { theme, lang, toggleTheme, toggleLang, t } = useThemeAndLang();
  const pathname = usePathname();
  const isAdmin = isAdminEmail(user?.email);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="site-navbar">
      <Link className="brand" href="/">
        <span className="brand-icon">📍</span>
        <span className="brand-text">
          Where <span className="brand-gradient">I've Been</span>
        </span>
      </Link>

      <nav aria-label="Ana menü">
        <Link className={isActive("/") ? "active" : ""} href="/">
          <span className="nav-icon">🗺️</span> {t.home}
        </Link>
        <Link className={isActive("/rotalar") ? "active" : ""} href="/rotalar">
          <span className="nav-icon">📍</span> {t.routes}
        </Link>
        <Link className={isActive("/mekanlar") ? "active" : ""} href={mekanHref}>
          <span className="nav-icon">🏰</span> {t.guide}
        </Link>
        <Link className={isActive("/topluluk") ? "active" : ""} href="/topluluk">
          <span className="nav-icon">💬</span> {t.community}
        </Link>
        <Link className={isActive("/iletisim") ? "active" : ""} href="/iletisim">
          <span className="nav-icon">✉️</span> {t.contact}
        </Link>
        {isAdmin && (
          <Link className={isActive("/admin") ? "active" : ""} href="/admin">
            <span className="nav-icon">🛡️</span> Admin
          </Link>
        )}
        {user ? (
          <Link className="nav-strong" href="/profil">
            <span className="nav-icon">👤</span> {t.profile}
          </Link>
        ) : (
          !loading && (
            <Link className="nav-strong" href="/giris">
              <span className="nav-icon">✨</span> {t.login}
            </Link>
          )
        )}

        <div className="nav-controls">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Aydınlık Mod" : "Karanlık Mod"}
            type="button"
          >
            {theme === "dark" ? "🌙" : "☀️"}
          </button>
          <button
            className="lang-toggle-btn"
            onClick={toggleLang}
            title="Dil Değiştir / Switch Language"
            type="button"
          >
            {lang === "tr" ? "🇹🇷 TR" : "🇬🇧 EN"}
          </button>
        </div>
      </nav>
    </header>
  );
}
