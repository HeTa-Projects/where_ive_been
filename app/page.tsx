"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Navbar } from "./Navbar";
import { sehirler } from "./gezi-verileri";
import type { Sehir } from "./gezi-verileri";
import type { CityMapPoint } from "./TravelMap";

const TravelMap = dynamic(
  () => import("./TravelMap").then((module) => module.TravelMap),
  {
    loading: () => <div className="map-loading">Harita yükleniyor...</div>,
    ssr: false,
  },
);

function sonMekanlar(sehir: Sehir) {
  return sehir.mekanlar.slice(0, 3);
}

export default function Home() {
  const [seciliSehirId, setSeciliSehirId] = useState<string | null>(null);
  const seciliSehir = useMemo(
    () => sehirler.find((sehir) => sehir.id === seciliSehirId) ?? null,
    [seciliSehirId],
  );
  const haritaSehirleri: CityMapPoint[] = sehirler.map((sehir) => ({
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

  return (
    <main className="home-shell">
      <Navbar mekanHref={`/mekanlar/${seciliSehir?.id ?? sehirler[0].id}`} />

      <section className="map-hero" aria-label="Türkiye gezi haritası">
        <TravelMap
          cities={haritaSehirleri}
          onSelectCity={setSeciliSehirId}
          selectedCity={seciliHaritaSehri}
        />

        {!seciliSehir ? (
          <div className="map-hint">Haritadaki pinlerden bir şehir seç</div>
        ) : (
          <aside className="city-drawer" aria-live="polite">
            <button
              aria-label="Şehir kartını kapat"
              className="drawer-close"
              onClick={() => setSeciliSehirId(null)}
              type="button"
            >
              ×
            </button>
            <span className="small-label">Seçili şehir</span>
            <h1>{seciliSehir.ad}</h1>
            <p>{seciliSehir.ozet}</p>

            <div className="tag-row">
              {seciliSehir.etiketler.map((etiket) => (
                <span key={etiket}>{etiket}</span>
              ))}
            </div>

            <div className="quick-stats">
              <div>
                <strong>{seciliSehir.mekanlar.length}</strong>
                <span>mekan</span>
              </div>
              <div>
                <strong>{seciliSehir.ziyaretSayisi}</strong>
                <span>ziyaret</span>
              </div>
              <div>
                <strong>{toplamYorum}</strong>
                <span>yorum</span>
              </div>
            </div>

            <div className="latest-places">
              <span className="small-label">Son yorumlanan mekanlar</span>
              {sonMekanlar(seciliSehir).map((mekan) => (
                <Link
                  className="latest-place"
                  href={`/mekanlar/${seciliSehir.id}?mekan=${mekan.id}`}
                  key={mekan.id}
                >
                  <span>{mekan.ad}</span>
                  <strong>{mekan.puan.toFixed(1)}</strong>
                </Link>
              ))}
            </div>

            <Link className="primary-link" href={`/mekanlar/${seciliSehir.id}`}>
              {seciliSehir.ad} mekan rehberini aç
            </Link>
          </aside>
        )}
      </section>
    </main>
  );
}
