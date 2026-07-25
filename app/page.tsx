"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Navbar } from "./Navbar";
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
  const { t } = useThemeAndLang();
  const [selectedCountry, setSelectedCountry] = useState<Ulke>(ulkeler[0]);
  const [seciliSehirId, setSeciliSehirId] = useState<string | null>(null);
  const [userPins, setUserPins] = useState<UserPin[]>(ORNEK_KULLANICI_PINLERI);
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  const handleAddNewUserPin = (pinData: Omit<UserPin, "id">) => {
    const newPin: UserPin = {
      ...pinData,
      id: `pin-${Date.now()}`,
    };
    setUserPins((prev) => [newPin, ...prev]);
  };

  const handleSelectCountry = (country: Ulke) => {
    setSelectedCountry(country);
    setSeciliSehirId(null);
  };

  return (
    <main className="home-shell">
      <Navbar mekanHref={`/mekanlar/${seciliSehir?.id ?? sehirler[0].id}`} />

      <section className="map-hero" aria-label="Harita gezgin ekranı">
        {/* Ülke Seçim Butonları & Kategori Filtre Çubuğu */}
        <div className="map-top-bar">
          <div className="category-filters">
            {/* Ülke Seçicileri */}
            <span className="filter-chip-label">{t.countriesLabel}</span>
            {ulkeler.map((u) => (
              <button
                className={`filter-chip ${selectedCountry.id === u.id ? "active" : ""}`}
                key={u.id}
                onClick={() => handleSelectCountry(u)}
                type="button"
              >
                {u.bayrak} {u.ad}
              </button>
            ))}

            <span className="filter-chip-divider">|</span>

            {/* Kategori Filtreleri */}
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

        <TravelMap
          cities={haritaSehirleri}
          countries={ulkeler}
          onAddNewUserPin={handleAddNewUserPin}
          onSelectCity={setSeciliSehirId}
          onSelectCountry={handleSelectCountry}
          selectedCity={seciliHaritaSehri}
          selectedCountry={selectedCountry}
          userPins={userPins}
        />

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
      </section>
    </main>
  );
}
