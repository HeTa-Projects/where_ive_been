"use client";

import Link from "next/link";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";

type Badge = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
};

const ROZETLER: Badge[] = [
  {
    id: "rozet-1",
    icon: "🧭",
    title: "İlk Adım Gezgini",
    desc: "İlk rotanı ve gezdiğin mekanı işaretledin.",
    unlocked: true,
  },
  {
    id: "rozet-2",
    icon: "🏛️",
    title: "Tarih Keşifçisi",
    desc: "5 veya daha fazla tarihi mekanı ziyaret ettin.",
    unlocked: true,
  },
  {
    id: "rozet-3",
    icon: "🏕️",
    title: "Doğa & Kamp Tutkunu",
    desc: "Doğa parkı ve koy rotalarını rehberine ekledin.",
    unlocked: true,
  },
  {
    id: "rozet-4",
    icon: "📸",
    title: "Sokak Fotoğrafçısı",
    desc: "Şehir içi kültür ve mahalle rotalarını tamamladın.",
    unlocked: false,
  },
  {
    id: "rozet-5",
    icon: "⭐",
    title: "Gurme Keşifçi",
    desc: "Lezzet duraklarına 10 değerlendirme yazdın.",
    unlocked: false,
  },
];

export default function Profil() {
  const { cikisYap, loading, user } = useAuth();

  const userInitial = (user?.displayName || user?.email || "G").charAt(0).toUpperCase();

  return (
    <main className="page-shell">
      <Navbar />
      <section className="profile-layout">
        <div className="profile-card">
          <span className="small-label">Gezgin Profili</span>
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
                  <strong>5</strong>
                  <span>Gezilen Şehir</span>
                </div>
                <div>
                  <strong>12</strong>
                  <span>İşaretli Pin</span>
                </div>
                <div>
                  <strong>%6.1</strong>
                  <span>Türkiye Gezi Oranı</span>
                </div>
              </div>

              {/* Gezgin Rozetleri */}
              <div className="badges-section">
                <span className="small-label">Kazanılan Gezgin Rozetleri</span>
                <div className="badges-grid">
                  {ROZETLER.map((rozet) => (
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
                🚪 Çıkış Yap
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
                  Giriş yap
                </Link>
                <Link className="outline-link" href="/kayit">
                  Kayıt ol
                </Link>
              </div>
            </>
          )}
        </div>

        <aside className="profile-card muted-profile">
          <span className="small-label">Kişisel Harita & Rotalarım</span>
          <h2>Gezilen Rotalar & Favoriler</h2>
          <div className="saved-routes-list">
            <div className="saved-route-card">
              <span>📍 Kapadokya & Nevşehir</span>
              <small>3 Ziyaret Noktası • Favori</small>
            </div>
            <div className="saved-route-card">
              <span>📍 Kaş & Kekova Koyu</span>
              <small>4 Deniz Rotası • Gidildi</small>
            </div>
            <div className="saved-route-card">
              <span>📍 Eskişehir Odunpazarı</span>
              <small>2 Müze Durak • Gidildi</small>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
