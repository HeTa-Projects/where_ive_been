"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function Navbar({
  mekanHref = "/mekanlar/istanbul",
}: {
  mekanHref?: string;
}) {
  const { loading, user } = useAuth();

  return (
    <header className="site-navbar">
      <Link className="brand" href="/">
        Where I've Been
      </Link>
      <nav aria-label="Ana menü">
        <Link href="/">Ana Sayfa</Link>
        <Link href={mekanHref}>Mekan Rehberi</Link>
        <Link href="/topluluk">Topluluk</Link>
        <Link href="/iletisim">İletişim</Link>
        {user ? (
          <Link className="nav-strong" href="/profil">
            Profil
          </Link>
        ) : (
          !loading && (
            <Link className="nav-strong" href="/giris">
              Giriş Yap
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
