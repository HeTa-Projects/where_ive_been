"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function Navbar({
  mekanHref = "/mekanlar/istanbul",
}: {
  mekanHref?: string;
}) {
  const { loading, user } = useAuth();
  const pathname = usePathname();

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
          <span className="nav-icon">🗺️</span> Ana Sayfa
        </Link>
        <Link className={isActive("/mekanlar") ? "active" : ""} href={mekanHref}>
          <span className="nav-icon">🏰</span> Mekan Rehberi
        </Link>
        <Link className={isActive("/topluluk") ? "active" : ""} href="/topluluk">
          <span className="nav-icon">💬</span> Topluluk
        </Link>
        <Link className={isActive("/iletisim") ? "active" : ""} href="/iletisim">
          <span className="nav-icon">✉️</span> İletişim
        </Link>
        {user ? (
          <Link className="nav-strong" href="/profil">
            <span className="nav-icon">👤</span> Profil
          </Link>
        ) : (
          !loading && (
            <Link className="nav-strong" href="/giris">
              <span className="nav-icon">✨</span> Giriş Yap
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
