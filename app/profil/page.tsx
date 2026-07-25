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

const PRESET_AVATARS = [
  { id: "av-1", emoji: "🎒", label: "Gezgin Kaşif", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80" },
  { id: "av-2", emoji: "📸", label: "Fotoğrafçı", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80" },
  { id: "av-3", emoji: "🏕️", label: "Doğa Kampçısı", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80" },
  { id: "av-4", emoji: "⛵", label: "Denizci", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80" },
  { id: "av-5", emoji: "🏰", label: "Tarih Avcısı", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80" },
];

export default function Profil() {
  const { cikisYap, loading, user } = useAuth();
  const { t } = useThemeAndLang();
  const [userPins, setUserPins] = useState<UserPin[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setUserPins([]);
      setProfilePhoto(null);
      return;
    }

    // Load User Pins
    const pinsKey = `whib_user_pins_${user.uid}`;
    const savedPins = localStorage.getItem(pinsKey);
    if (savedPins) {
      try {
        setUserPins(JSON.parse(savedPins));
      } catch {
        setUserPins([]);
      }
    }

    // Load Profile Photo
    const photoKey = `whib_user_photo_${user.uid}`;
    const savedPhoto = localStorage.getItem(photoKey);
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, [user]);

  const handleSavePhoto = (photoUrl: string) => {
    setProfilePhoto(photoUrl);
    if (user) {
      localStorage.setItem(`whib_user_photo_${user.uid}`, photoUrl);
    }
    setShowPhotoModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        handleSavePhoto(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePin = (pinId: string) => {
    const updated = userPins.filter((p) => p.id !== pinId);
    setUserPins(updated);
    if (user) {
      localStorage.setItem(`whib_user_pins_${user.uid}`, JSON.stringify(updated));
    }
  };

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
                <div
                  className="profile-avatar-wrapper"
                  onClick={() => setShowPhotoModal(true)}
                  title="Profil Fotoğrafını Güncelle"
                >
                  <div className="profile-avatar-circle">
                    {profilePhoto ? (
                      <img alt="Profil Fotoğrafı" className="avatar-img" src={profilePhoto} />
                    ) : (
                      <span>{userInitial}</span>
                    )}
                  </div>
                  <button className="avatar-badge-btn" type="button">
                    📷
                  </button>
                </div>

                <div className="profile-user-info">
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>📍 {pin.title}</span>
                    <button
                      onClick={() => handleDeletePin(pin.id)}
                      style={{
                        background: "rgba(244, 63, 94, 0.15)",
                        border: "1px solid rgba(244, 63, 94, 0.3)",
                        color: "var(--accent-coral)",
                        borderRadius: "var(--radius-full)",
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                      title="İşareti Kaldır"
                      type="button"
                    >
                      🗑️
                    </button>
                  </div>
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

      {/* Profil Fotoğrafı Değiştirme Modalı */}
      {showPhotoModal && (
        <div className="pin-modal-overlay">
          <div className="pin-modal photo-modal">
            <button
              className="modal-close"
              onClick={() => setShowPhotoModal(false)}
              type="button"
            >
              ✕
            </button>
            <h3>📷 Profil Fotoğrafı Ekle / Değiştir</h3>
            <p className="coords-info">Bilgisayarından resim yükle veya gezgin avatarlarından seç.</p>

            {/* Dosya Yükleme Alanı */}
            <div className="file-upload-box">
              <label className="upload-label">
                <span>📁 Bilgisayarından Fotoğraf Seç</span>
                <input accept="image/*" onChange={handleFileUpload} type="file" />
              </label>
            </div>

            <div style={{ margin: "16px 0 8px", textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
              veya Hazır Gezgin Avatarlarından Seç:
            </div>

            <div className="preset-avatars-grid">
              {PRESET_AVATARS.map((av) => (
                <button
                  className="avatar-preset-btn"
                  key={av.id}
                  onClick={() => handleSavePhoto(av.url)}
                  type="button"
                >
                  <img alt={av.label} src={av.url} />
                  <span>{av.emoji} {av.label}</span>
                </button>
              ))}
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button
                className="cancel-btn"
                onClick={() => setShowPhotoModal(false)}
                type="button"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
