"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { useThemeAndLang } from "../ThemeAndLangProvider";
import type { UserPin } from "../TravelMap";

type Badge = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
};

export default function Profil() {
  const { cikisYap, loading, user } = useAuth();
  const { t } = useThemeAndLang();
  const [userPins, setUserPins] = useState<UserPin[]>([]);

  useEffect(() => {
    if (!user) {
      setUserPins([]);
      return;
    }
    const storageKey = `whib_user_pins_${user.uid}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setUserPins(JSON.parse(saved));
      } catch {
        setUserPins([]);
      }
    } else {
      setUserPins([]);
    }
  }, [user]);

  const totalPins = userPins.length;
  const visitedPins = userPins.filter((p) => p.category === "visited");
  const wishlistPins = userPins.filter((p) => p.category === "wishlist");
  const favoritePins = userPins.filter((p) => p.category === "favorite");

  // Dynamic Badges
  const badges: Badge[] = [
    {
      id: "rozet-1",
      icon: "🧭",
      title: "İlk Adım Gezgini",
      desc: "İlk rotanı ve gezdiğin mekanı işaretledin.",
      unlocked: totalPins > 0,
    },
    {
      id: "rozet-2",
      icon: "🏛️",
      title: "Tarih Keşifçisi",
      desc: "3 veya daha fazla mekanı ziyaret ettin.",
      unlocked: visitedPins.length >= 3,
    },
    {
      id: "rozet-3",
      icon: "🏕️",
      title: "Doğa & Rota Tutkunu",
      desc: "Rota listene en az 2 mekan ekledin.",
      unlocked: wishlistPins.length >= 2,
    },
    {
      id: "rozet-4",
      icon: "❤️",
      title: "Favori Gezgin",
      desc: "Favorilerine en az 1 mekan ekledin.",
      unlocked: favoritePins.length >= 1,
    },
  ];

  const userInitial = (user?.displayName || user?.email || "G").charAt(0).toUpperCase();
  const travelPercentage = ((visitedPins.length / 81) * 100).toFixed(1);

  return (
    <main className="page-shell">
      <Navbar />
      <section className="profile-layout">
        <div className="profile-card">
          <span className="small-label">{t.travelerProfile}</span>
          {loading ? (
            <h1>Profil yükleniyor...</h1>
          ) : user ? (
            <>
              <div className="profile-header-user">
                <div className="profile-avatar-circle">
                  <span>{userInitial}</span>
                </div>
                <div>
                  <h1>{user.displayName || user.email?.split("@")[0] || "Gezgin Kullanıcı"}</h1>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="profile-stats">
                <div>
                  <strong>{visitedPins.length}</strong>
                  <span>{t.visitedCitiesStat}</span>
                </div>
                <div>
                  <strong>{totalPins}</strong>
                  <span>{t.markedPinsStat}</span>
                </div>
                <div>
                  <strong>%{travelPercentage}</strong>
                  <span>{t.travelRatio}</span>
                </div>
              </div>

              {/* Gezgin Rozetleri */}
              <div className="badges-section">
                <span className="small-label">{t.badgesTitle}</span>
                <div className="badges-grid">
                  {badges.map((rozet) => (
                    <div
                      className={`badge-item ${rozet.unlocked ? "unlocked" : "locked"}`}
                      key={rozet.id}
                    >
                      <span className="badge-icon">{rozet.icon}</span>
                      <div>
                        <strong>{rozet.title}</strong>
                        <p>{rozet.desc}</p>
                      </div>
                      {!rozet.unlocked && <span className="lock-tag">🔒 Kilitli</span>}
                    </div>
                  ))}
                </div>
              </div>

              <button className="secondary-action logout-btn" onClick={cikisYap} type="button">
                🚪 {t.logout}
              </button>
            </>
          ) : (
            <>
              <h1>Profilini görmek için giriş yapmalısın.</h1>
              <p>
                Giriş yaptıktan sonra yorumların, topluluk mesajların, rozetlerin ve gezi
                geçmişin burada görünecek.
              </p>
              <div className="auth-actions">
                <Link className="primary-link" href="/giris">
                  {t.login}
                </Link>
                <Link className="outline-link" href="/kayit">
                  {t.register}
                </Link>
              </div>
            </>
          )}
        </div>

        <aside className="profile-card muted-profile">
          <span className="small-label">{t.savedRoutesTitle}</span>
          <h2>Gezilen Rotalar & Favoriler</h2>
          
          <div className="saved-routes-list">
            {userPins.length === 0 ? (
              <div style={{ padding: "20px 0", color: "var(--text-muted)", fontSize: 14 }}>
                📍 Henüz bir yer işaretlemediniz. Haritadaki noktalara tıklayarak ilk mekanınızı veya rotanızı işaretleyin!
              </div>
            ) : (
              userPins.map((pin) => (
                <div className="saved-route-card" key={pin.id}>
                  <span>📍 {pin.title}</span>
                  <small>
                    {pin.category === "visited"
                      ? "✅ Gidildi"
                      : pin.category === "wishlist"
                      ? "📌 Rota Listemde"
                      : "❤️ Favorim"}
                    {pin.note ? ` • "${pin.note}"` : ""}
                  </small>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
