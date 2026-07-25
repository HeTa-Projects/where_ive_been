"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Navbar } from "./Navbar";
import { sehirler } from "./gezi-verileri";
import type { Sehir } from "./gezi-verileri";
import type { CityMapPoint, UserPin } from "./TravelMap";

const TravelMap = dynamic(
  () => import("./TravelMap").then((module) => module.TravelMap),
  {
    loading: () => <div className="map-loading">🗺️ İnteraktif Harita Yükleniyor...</div>,
    ssr: false,
  },
);

const ORNEK_KULLANICI_PINLERI: UserPin[] = [
  {
    id: "pin-1",
    lat: 37.9137,
    lng: 29.1187,
    title: "Pamukkale Travertenleri",
    category: "visited",
    note: "Göz alıcı traverten terasları ve antik havuz harikaydı!",
  },
  {
    id: "pin-2",
    lat: 36.2004,
    lng: 29.6378,
    title: "Kaş Kekova Batık Şehir",
    category: "favorite",
    note: "Kano turu ile batık kalıntıları izlemek paha biçilemez.",
  },
  {
    id: "pin-3",
    lat: 37.5528,
    lng: 29.6789,
    title: "Salda Gölü (Türkiye'nin Maldivleri)",
    category: "wishlist",
    note: "Bir sonraki doğa kampı rotam burası olacak.",
  },
];

function sonMekanlar(sehir: Sehir) {
  return sehir.mekanlar.slice(0, 3);
}

export default function Home() {
  const [seciliSehirId, setSeciliSehirId] = useState<string | null>(null);
  const [userPins, setUserPins] = useState<UserPin[]>(ORNEK_KULLANICI_PINLERI);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtrelenmisSehirler = useMemo(() => {
    if (activeCategory === "all") return sehirler;
    return sehirler.filter((s) => s.etiketler.includes(activeCategory));
  }, [activeCategory]);

  const seciliSehir = useMemo(
    () => sehirler.find((sehir) => sehir.id === seciliSehirId) ?? null,
    [seciliSehirId],
  );

  const haritaSehirleri: CityMapPoint[] = filtrelenmisSehirler.map((sehir) => ({
    coordinates: sehir.koordinat,
    id: sehir.id,
    name: sehir.ad,
    placesCount: sehir.mekanlar.length,
    visits: sehir.ziyaretSayisi,
  }));

  const seciliHaritaSehri =
    haritaSehirleri.find((sehir) => sehir.id === seciliSehir?.id) ??
    haritaSehirleri[0];

  const toplamYorum =
    seciliSehir?.mekanlar.reduce(
      (toplam, mekan) => toplam + mekan.yorumSayisi,
      0,
    ) ?? 0;

  const handleAddNewUserPin = (pinData: Omit<UserPin, "id">) => {
    const newPin: UserPin = {
      ...pinData,
      id: `pin-${Date.now()}`,
    };
    setUserPins((prev) => [newPin, ...prev]);
  };

  return (
    <main className="home-shell">
      <Navbar mekanHref={`/mekanlar/${seciliSehir?.id ?? sehirler[0].id}`} />

      <section className="map-hero" aria-label="Türkiye gezi haritası">
        {/* Harita Üstü Kategori Filtre Çubuğu */}
        <div className="map-top-bar">
          <div className="category-filters">
            <button
              className={`filter-chip ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => setActiveCategory("all")}
              type="button"
            >
              🌟 Tüm Rotalar ({sehirler.length})
            </button>
            <button
              className={`filter-chip ${activeCategory === "Tarih" ? "active" : ""}`}
              onClick={() => setActiveCategory("Tarih")}
              type="button"
            >
              🏛️ Tarih & Kültür
            </button>

            <button
              className={`filter-chip ${activeCategory === "Deniz" ? "active" : ""}`}
              onClick={() => setActiveCategory("Deniz")}
              type="button"
            >
              🏖️ Sahil & Deniz
            </button>
            <button
              className={`filter-chip ${activeCategory === "Sokak" ? "active" : ""}`}
              onClick={() => setActiveCategory("Sokak")}
              type="button"
            >
              📷 Şehir & Sokağın Ruhu
            </button>
          </div>

          <div className="map-hint-badge">
            💡 Taktik: Haritada istediğin noktaya tıklayarak kendi pinini ekle!
          </div>
        </div>

        <TravelMap
          cities={haritaSehirleri}
          onAddNewUserPin={handleAddNewUserPin}
          onSelectCity={setSeciliSehirId}
          selectedCity={seciliHaritaSehri}
          userPins={userPins}
        />

        {!seciliSehir ? (
          <div className="map-hint">
            📍 Haritadaki pinlerden bir şehir seçin veya herhangi bir noktaya tıklayıp yeni pin ekleyin
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
            <span className="small-label">Seçili Şehir</span>
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
                <span>Mekan</span>
              </div>
              <div>
                <strong>{seciliSehir.ziyaretSayisi}</strong>
                <span>Ziyaretçi</span>
              </div>
              <div>
                <strong>{toplamYorum}</strong>
                <span>İnceleme</span>
              </div>
            </div>

            <div className="latest-places">
              <span className="small-label">Popüler Mekanlar</span>
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
              {seciliSehir.ad} Rehberini Aç →
            </Link>
          </aside>
        )}
      </section>
    </main>
  );
}
