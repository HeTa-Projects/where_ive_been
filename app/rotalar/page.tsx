"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { db } from "../firebase";
import { useThemeAndLang } from "../ThemeAndLangProvider";
import { sehirler } from "../gezi-verileri";

type Rota = {
  id: string;
  baslik: string;
  sehirAd: string;
  sure: string;
  kategori: string;
  yazar: string;
  duraklar: string[];
  ozet: string;
  likes: number;
};

const HAZIR_ROTALAR: Rota[] = [
  {
    id: "rota-1",
    baslik: "2 Günlük İstanbul Tarih & Kahve Ruhu",
    sehirAd: "İstanbul",
    sure: "2 Gün",
    kategori: "🏛️ Tarih & Kültür",
    yazar: "Ece K.",
    duraklar: ["Balat Sokakları", "İstanbul Arkeoloji Müzeleri", "Moda Sahili Sunset"],
    ozet: "Tarihi sokaklarda yürüyüş, butik kahveciler ve Moda sahilinde gün batımı mola rotası.",
    likes: 42,
  },
  {
    id: "rota-2",
    baslik: "Eskişehir Kompakt Hafta Sonu Turu",
    sehirAd: "Eskişehir",
    sure: "1 Gün",
    kategori: "☕ Şehir & Kafe",
    yazar: "Selin G.",
    duraklar: ["Odunpazarı Evleri", "OMM Modern Müze", "Porsuk Çayı Gondol"],
    ozet: "Günün ilk yarısında renkli evler ve müze gezisi, akşamüstü Porsuk kenarında yürüyüş.",
    likes: 29,
  },
  {
    id: "rota-3",
    baslik: "Antalya Kaleiçi & Düden Kaçamağı",
    sehirAd: "Antalya",
    sure: "1-2 Gün",
    kategori: "🏖️ Sahil & Doğa",
    yazar: "Deniz A.",
    duraklar: ["Kaleiçi Dar Sokakları", "Yat Limanı", "Düden Şelalesi Rota Parkı"],
    ozet: "Deniz kokulu dar sokak yürüyüşleri ve ferahlatıcı Düden Şelalesi mola noktaları.",
    likes: 38,
  },
];

export default function Rotalar() {
  const { user } = useAuth();
  const { t } = useThemeAndLang();
  const [rotalar, setRotalar] = useState<Rota[]>(HAZIR_ROTALAR);
  const [selectedCityFilter, setSelectedCityFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [yeniBaslik, setYeniBaslik] = useState("");
  const [yeniSehir, setYeniSehir] = useState("İstanbul");
  const [yeniSure, setYeniSure] = useState("1 Gün");
  const [yeniKategori, setYeniKategori] = useState("🏛️ Tarih & Kültür");
  const [yeniDuraklar, setYeniDuraklar] = useState("");
  const [yeniOzet, setYeniOzet] = useState("");

  // Firestore Sync for Routes
  useEffect(() => {
    if (!db) return;

    try {
      const q = query(collection(db, "routes"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteRoutes: Rota[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                baslik: data.baslik || "Gezi Rotası",
                sehirAd: data.sehirAd || "İstanbul",
                sure: data.sure || "1 Gün",
                kategori: data.kategori || "🏛️ Tarih & Kültür",
                yazar: data.yazar || "Gezgin Kullanıcı",
                duraklar: Array.isArray(data.duraklar) ? data.duraklar : ["Merkez"],
                ozet: data.ozet || "",
                likes: Number(data.likes) || 1,
              };
            });

            const combined = [...remoteRoutes];
            HAZIR_ROTALAR.forEach((h) => {
              if (!combined.some((c) => c.id === h.id)) {
                combined.push(h);
              }
            });
            setRotalar(combined);
          }
        },
        (err) => {
          console.warn("Firestore routes snapshot error:", err);
        },
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firestore connection error:", err);
    }
  }, []);

  const filtrelenmisRotalar = rotalar.filter((rota) => {
    if (selectedCityFilter === "all") return true;
    return rota.sehirAd === selectedCityFilter;
  });

  const handleCreateRota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniBaslik.trim()) return;

    const durakListesi = yeniDuraklar
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const yazarAd = user?.displayName || user?.email?.split("@")[0] || "Gezgin Kullanıcı";
    const duraklarData = durakListesi.length > 0 ? durakListesi : ["Popüler Merkez Durak"];

    const yeniRotaState: Rota = {
      id: `rota-${Date.now()}`,
      baslik: yeniBaslik.trim(),
      sehirAd: yeniSehir,
      sure: yeniSure,
      kategori: yeniKategori,
      yazar: yazarAd,
      duraklar: duraklarData,
      ozet: yeniOzet.trim() || "Özel gezgin rotası.",
      likes: 1,
    };

    setRotalar((prev) => [yeniRotaState, ...prev]);
    setShowModal(false);

    if (db) {
      try {
        await addDoc(collection(db, "routes"), {
          baslik: yeniBaslik.trim(),
          sehirAd: yeniSehir,
          sure: yeniSure,
          kategori: yeniKategori,
          yazar: yazarAd,
          duraklar: duraklarData,
          ozet: yeniOzet.trim() || "Özel gezgin rotası.",
          likes: 1,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Firestore route creation error:", err);
      }
    }

    setYeniBaslik("");
    setYeniDuraklar("");
    setYeniOzet("");
  };

  const handleLike = async (id: string) => {
    setRotalar((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r)),
    );

    if (db && !id.startsWith("rota-") && !HAZIR_ROTALAR.some((h) => h.id === id)) {
      try {
        const routeRef = doc(db, "routes", id);
        await updateDoc(routeRef, {
          likes: increment(1),
        });
      } catch (err) {
        console.error("Firestore route like error:", err);
      }
    }
  };

  return (
    <main className="page-shell">
      <Navbar />

      <section className="page-hero">
        <div>
          <span className="small-label">{t.routesTitle}</span>
          <h1>{t.routesSubtitle}</h1>
        </div>
        <button
          className="primary-link create-route-btn"
          onClick={() => setShowModal(true)}
          type="button"
        >
          {t.newRouteBtn}
        </button>
      </section>

      {/* Şehir Filtreleri */}
      <div className="community-filters">
        <button
          className={`filter-chip ${selectedCityFilter === "all" ? "active" : ""}`}
          onClick={() => setSelectedCityFilter("all")}
          type="button"
        >
          🌟 Tüm Rotalar ({rotalar.length})
        </button>
        {sehirler.map((s) => (
          <button
            className={`filter-chip ${selectedCityFilter === s.ad ? "active" : ""}`}
            key={s.id}
            onClick={() => setSelectedCityFilter(s.ad)}
            type="button"
          >
            📍 {s.ad} Rotaları
          </button>
        ))}
      </div>

      <section className="routes-grid">
        {filtrelenmisRotalar.map((rota) => (
          <article className="route-card" key={rota.id}>
            <div className="route-card-header">
              <span className="category-pill">{rota.kategori}</span>
              <span className="duration-tag">⏱️ {rota.sure}</span>
            </div>

            <h2>{rota.baslik}</h2>
            <p className="route-author">👤 {rota.yazar} • 📍 {rota.sehirAd}</p>
            <p className="route-summary">{rota.ozet}</p>

            <div className="route-stops">
              <span className="small-label">{t.stops}:</span>
              <ol className="stops-list">
                {rota.duraklar.map((durak, idx) => (
                  <li key={idx}>
                    <span className="stop-num">{idx + 1}</span> {durak}
                  </li>
                ))}
              </ol>
            </div>

            <div className="route-card-footer">
              <button
                className="like-btn"
                onClick={() => handleLike(rota.id)}
                type="button"
              >
                ❤️ {rota.likes} {t.likes}
              </button>
              <Link className="outline-link compact-link" href={`/mekanlar/${rota.sehirAd.toLowerCase()}`}>
                {t.seeOnMap}
              </Link>
            </div>
          </article>
        ))}
      </section>

      {/* Rota Ekleme Modalı */}
      {showModal && (
        <div className="pin-modal-overlay">
          <form className="pin-modal route-form-modal" onSubmit={handleCreateRota}>
            <button
              className="modal-close"
              onClick={() => setShowModal(false)}
              type="button"
            >
              ✕
            </button>

            <h3>{t.createRouteTitle}</h3>

            <label>
              <span>{t.routeTitleLabel}</span>
              <input
                onChange={(e) => setYeniBaslik(e.target.value)}
                placeholder={t.routeTitlePlaceholder}
                required
                type="text"
                value={yeniBaslik}
              />
            </label>

            <div className="form-row-2">
              <label>
                <span>{t.cityLabel}</span>
                <select onChange={(e) => setYeniSehir(e.target.value)} value={yeniSehir}>
                  {sehirler.map((s) => (
                    <option key={s.id} value={s.ad}>
                      {s.ad}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>{t.durationLabel}</span>
                <select onChange={(e) => setYeniSure(e.target.value)} value={yeniSure}>
                  <option value="1 Gün">1 Gün</option>
                  <option value="2 Gün">2 Gün</option>
                  <option value="3+ Gün">3+ Gün</option>
                  <option value="Hafta Sonu">Hafta Sonu</option>
                </select>
              </label>
            </div>

            <label>
              <span>Kategori</span>
              <select onChange={(e) => setYeniKategori(e.target.value)} value={yeniKategori}>
                <option value="🏛️ Tarih & Kültür">🏛️ Tarih & Kültür</option>
                <option value="☕ Şehir & Kafe">☕ Şehir & Kafe</option>
                <option value="🏖️ Sahil & Doğa">🏖️ Sahil & Doğa</option>
                <option value="🏕️ Kamp & Macera">🏕️ Kamp & Macera</option>
              </select>
            </label>

            <label>
              <span>{t.stopsLabel}</span>
              <input
                onChange={(e) => setYeniDuraklar(e.target.value)}
                placeholder={t.stopsPlaceholder}
                type="text"
                value={yeniDuraklar}
              />
            </label>

            <label>
              <span>{t.descriptionLabel}</span>
              <textarea
                onChange={(e) => setYeniOzet(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                rows={3}
                value={yeniOzet}
              />
            </label>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
                type="button"
              >
                {t.cancel}
              </button>
              <button className="save-btn" type="submit">
                {t.publishRoute}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
