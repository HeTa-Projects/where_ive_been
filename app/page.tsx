"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { Navbar } from "./Navbar";
import { useAuth } from "./AuthProvider";
import { db } from "./firebase";
import { useThemeAndLang } from "./ThemeAndLangProvider";
import { sehirler, ulkeler } from "./gezi-verileri";
import type { Sehir, Ulke } from "./gezi-verileri";
import type { CityMapPoint, UserPin } from "./TravelMap";

const TravelMap = dynamic(
  () => import("./TravelMap").then((module) => module.TravelMap),
  {
    loading: () => <div className="map-loading">🗺️ İnteraktif Harita Yükleniyor...</div>,
    ssr: false,
  },
);

function sonMekanlar(sehir: Sehir) {
  return sehir.mekanlar.slice(0, 3);
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useThemeAndLang();
  const [selectedCountry, setSelectedCountry] = useState<Ulke>(ulkeler[0]);
  const [seciliSehirId, setSeciliSehirId] = useState<string | null>(null);
  const [userPins, setUserPins] = useState<UserPin[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pinHata, setPinHata] = useState("");

  // Kullanıcının kaydettiği pinleri Firestore & LocalStorage senkronize et
  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem("whib_user_pins_guest");
      if (saved) {
        try {
          setUserPins(JSON.parse(saved));
        } catch {
          setUserPins([]);
        }
      } else {
        setUserPins([]);
      }
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
    }

    if (db) {
      try {
        const userRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(
          userRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (Array.isArray(data.pins)) {
                setUserPins(data.pins);
                localStorage.setItem(storageKey, JSON.stringify(data.pins));
              }
            }
          },
          (err) => {
            console.warn("Firestore pins sync error:", err);
          },
        );
        return () => unsubscribe();
      } catch (err) {
        console.warn("Firestore connection error:", err);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, "public_pins"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pins = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            lat: Number(data.lat),
            lng: Number(data.lng),
            title: data.title || "Harita pini",
            category: data.category || "visited",
            note: data.note || "",
            userId: data.userId || "",
            userName: data.userName || "Gezgin",
          } satisfies UserPin;
        });
        setUserPins(pins);
      },
      (err) => {
        console.warn("Firestore public pins sync error:", err);
        setPinHata("Ortak pinler Firestore'dan okunamadı. Rules kısmını kontrol et.");
      },
    );

    return () => unsubscribe();
  }, []);

  const ulkeSehirleri = useMemo(() => {
    return sehirler.filter((s) => s.ulkeId === selectedCountry.id);
  }, [selectedCountry.id]);

  const filtrelenmisSehirler = useMemo(() => {
    if (activeCategory === "all") return ulkeSehirleri;
    return ulkeSehirleri.filter((s) => s.etiketler.includes(activeCategory));
  }, [ulkeSehirleri, activeCategory]);

  const seciliSehir = useMemo(
    () => sehirler.find((sehir) => sehir.id === seciliSehirId) ?? null,
    [seciliSehirId],
  );

  const haritaSehirleri: CityMapPoint[] = filtrelenmisSehirler.map((sehir) => ({
    coordinates: sehir.koordinat,
    id: sehir.id,
    name: sehir.ad,
    countryId: sehir.ulkeId,
    countryName: sehir.ulke,
    placesCount: sehir.mekanlar.length,
    visits: sehir.ziyaretSayisi,
  }));

  const seciliHaritaSehri =
    haritaSehirleri.find((sehir) => sehir.id === seciliSehir?.id) ??
    haritaSehirleri[0] ?? {
      id: "istanbul",
      name: "İstanbul",
      countryId: "turkiye",
      countryName: "Türkiye",
      coordinates: [41.0082, 28.9784],
      placesCount: 3,
      visits: 128,
    };

  const toplamYorum =
    seciliSehir?.mekanlar.reduce(
      (toplam, mekan) => toplam + mekan.yorumSayisi,
      0,
    ) ?? 0;

  const handleAddNewUserPin = async (pinData: Omit<UserPin, "id">) => {
    setPinHata("");
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const newPin: UserPin = {
      ...pinData,
      id: `pin-${Date.now()}`,
      userId: user.uid,
      userName: user.displayName || user.email.split("@")[0] || "Gezgin",
    };
    const updated = [newPin, ...userPins];
    setUserPins(updated);
    const storageKey = `whib_user_pins_${user.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (!db) {
      setPinHata("Firebase bağlantısı hazır olmadığı için pin kaydedilemedi.");
      setUserPins(userPins);
      localStorage.setItem(storageKey, JSON.stringify(userPins));
      return;
    }

    try {
      await addDoc(collection(db, "public_pins"), {
        lat: newPin.lat,
        lng: newPin.lng,
        title: newPin.title,
        category: newPin.category,
        note: newPin.note || "",
        userId: user.uid,
        userEmail: user.email,
        userName: newPin.userName,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Firestore pin save error:", err);
      setPinHata("Pin Firestore'a kaydedilemedi. Rules kısmını güncellediğinden emin ol.");
      setUserPins(userPins);
      localStorage.setItem(storageKey, JSON.stringify(userPins));
    }
  };

  const handleDeleteUserPin = async (pinId: string) => {
    const updated = userPins.filter((pin) => pin.id !== pinId);
    setUserPins(updated);
    if (user) {
      const storageKey = `whib_user_pins_${user.uid}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));

      if (db) {
        try {
          await deleteDoc(doc(db, "public_pins", pinId));
        } catch (err) {
          console.error("Firestore pin delete error:", err);
        }
      }
    }
  };

  const handleSelectCountry = (country: Ulke) => {
    setSelectedCountry(country);
    setSeciliSehirId(null);
  };

  return (
    <main className="home-shell">
      <Navbar mekanHref={`/mekanlar/${seciliSehir?.id ?? sehirler[0].id}`} />

      <section className="map-hero" aria-label="Harita gezgin ekranı">
        {/* Kategori Filtre Çubuğu */}
        <div className="map-top-bar">
          <div className="category-chips-row">
            <div className="category-filters">
              <button
                className={`filter-chip ${activeCategory === "all" ? "active" : ""}`}
                onClick={() => setActiveCategory("all")}
                type="button"
              >
                🌟 {t.all}
              </button>
              <button
                className={`filter-chip ${activeCategory === "Tarih" ? "active" : ""}`}
                onClick={() => setActiveCategory("Tarih")}
                type="button"
              >
                🏛️ {t.history}
              </button>
              <button
                className={`filter-chip ${activeCategory === "Sahil" ? "active" : ""}`}
                onClick={() => setActiveCategory("Sahil")}
                type="button"
              >
                🏖️ {t.beach}
              </button>
            </div>

            <div className="map-hint-badge">
              {t.mapTip}
            </div>
          </div>
        </div>

        <TravelMap
          cities={haritaSehirleri}
          countries={ulkeler}
          currentUserId={user?.uid}
          isLoggedIn={!!user}
          onAddNewUserPin={handleAddNewUserPin}
          onAuthRequired={() => setShowAuthModal(true)}
          onDeleteUserPin={handleDeleteUserPin}
          onSelectCity={setSeciliSehirId}
          onSelectCountry={handleSelectCountry}
          selectedCity={seciliHaritaSehri}
          selectedCountry={selectedCountry}
          userPins={userPins}
        />

        {pinHata && <div className="map-error-badge">{pinHata}</div>}

        {!seciliSehir ? (
          <div className="map-hint">
            {t.selectCityHint}
          </div>
        ) : (
          <aside className="city-drawer" aria-live="polite">
            <button
              aria-label="Şehir kartını kapat"
              className="drawer-close"
              onClick={() => setSeciliSehirId(null)}
              type="button"
            >
              ✕
            </button>
            <span className="small-label">{seciliSehir.ulke} • {t.selectedCity}</span>
            <h1>{seciliSehir.ad}</h1>
            <p>{seciliSehir.ozet}</p>

            <div className="tag-row">
              {seciliSehir.etiketler.map((etiket) => (
                <span key={etiket}>#{etiket}</span>
              ))}
            </div>

            <div className="quick-stats">
              <div>
                <strong>{seciliSehir.mekanlar.length}</strong>
                <span>{t.places}</span>
              </div>
              <div>
                <strong>{seciliSehir.ziyaretSayisi}</strong>
                <span>{t.visitors}</span>
              </div>
              <div>
                <strong>{toplamYorum}</strong>
                <span>{t.reviews}</span>
              </div>
            </div>

            <div className="latest-places">
              <span className="small-label">{t.popularPlaces}</span>
              {sonMekanlar(seciliSehir).map((mekan) => (
                <Link
                  className="latest-place"
                  href={`/mekanlar/${seciliSehir.id}?mekan=${mekan.id}`}
                  key={mekan.id}
                >
                  <span>📍 {mekan.ad}</span>
                  <strong>★ {mekan.puan.toFixed(1)}</strong>
                </Link>
              ))}
            </div>

            <Link className="primary-link" href={`/mekanlar/${seciliSehir.id}`}>
              {seciliSehir.ad} {t.openGuide}
            </Link>
          </aside>
        )}

        {showAuthModal && (
          <div className="pin-modal-overlay" onClick={() => setShowAuthModal(false)}>
            <div className="pin-modal auth-required-modal" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}>✕</button>
              <div className="auth-modal-header" style={{ textAlign: "center" }}>
                <span style={{ fontSize: "42px", display: "block", marginBottom: "12px" }}>🔒</span>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "20px", color: "var(--accent-emerald)" }}>Giriş Yapmanız Gerekiyor</h3>
                <p style={{ margin: "0 0 20px 0", fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Gittim, Gitmek İstiyorum veya Favorim olarak rotanıza eklemek ve haritanızı kaydetmek için lütfen hesabınıza giriş yapın.
                </p>
              </div>
              <div className="modal-actions" style={{ display: "flex", gap: "10px" }}>
                <Link href="/giris" className="primary-link" style={{ flex: 1, textAlign: "center", textDecoration: "none", display: "inline-block" }}>
                  🔑 Giriş Yap
                </Link>
                <Link href="/kayit" className="outline-link" style={{ flex: 1, textAlign: "center", textDecoration: "none", display: "inline-block" }}>
                  ✨ Ücretsiz Kayıt Ol
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
