"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { Navbar } from "../../Navbar";
import { useAuth } from "../../AuthProvider";
import { db } from "../../firebase";
import { sehirler } from "../../gezi-verileri";
import type { Sehir, Yorum } from "../../gezi-verileri";

export function MekanRehberiClient({
  sehir,
  baslangicMekanId,
}: {
  sehir: Sehir;
  baslangicMekanId?: string;
}) {
  const { loading, user } = useAuth();
  const ilkMekanId = baslangicMekanId ?? sehir.mekanlar[0]?.id;
  const [seciliMekanId, setSeciliMekanId] = useState(ilkMekanId);

  // Yorumlar local state
  const [yorumlarMap, setYorumlarMap] = useState<Record<string, Yorum[]>>(() => {
    const initial: Record<string, Yorum[]> = {};
    sehir.mekanlar.forEach((m) => {
      initial[m.id] = m.yorumlar;
    });
    return initial;
  });

  // Yeni Yorum Form State
  const [yeniMetin, setYeniMetin] = useState("");
  const [yeniPuan, setYeniPuan] = useState(5);

  const seciliMekan = useMemo(
    () =>
      sehir.mekanlar.find((mekan) => mekan.id === seciliMekanId) ??
      sehir.mekanlar[0],
    [sehir.mekanlar, seciliMekanId],
  );

  // Firestore Live Reviews Sync
  useEffect(() => {
    if (!db || !seciliMekan.id) return;

    try {
      const q = query(
        collection(db, "place_reviews"),
        where("placeId", "==", seciliMekan.id),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const remoteYorumlar: Yorum[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              yazar: data.yazar || "Gezgin Kullanıcı",
              puan: Number(data.puan) || 5,
              metin: data.metin || "",
              tarih: data.createdAt?.toDate
                ? data.createdAt.toDate().toLocaleDateString("tr-TR")
                : "Şimdi",
            };
          });

          setYorumlarMap((prev) => {
            const initialForPlace = seciliMekan.yorumlar;
            const combined = [...remoteYorumlar];
            initialForPlace.forEach((init) => {
              if (!combined.some((c) => c.id === init.id)) {
                combined.push(init);
              }
            });
            return {
              ...prev,
              [seciliMekan.id]: combined,
            };
          });
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firestore reviews sync error:", err);
    }
  }, [seciliMekan.id, seciliMekan.yorumlar]);

  const mevcutYorumlar = yorumlarMap[seciliMekan.id] ?? seciliMekan.yorumlar;

  const handleAddYorum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniMetin.trim()) return;

    const yazarAd = user?.displayName || user?.email?.split("@")[0] || "Gezgin Kullanıcı";
    const yeniYorum: Yorum = {
      id: `yrm-${Date.now()}`,
      yazar: yazarAd,
      puan: yeniPuan,
      metin: yeniMetin.trim(),
      tarih: "Şimdi",
    };

    setYorumlarMap((prev) => ({
      ...prev,
      [seciliMekan.id]: [yeniYorum, ...(prev[seciliMekan.id] || [])],
    }));

    if (db) {
      try {
        await addDoc(collection(db, "place_reviews"), {
          placeId: seciliMekan.id,
          yazar: yazarAd,
          puan: yeniPuan,
          metin: yeniMetin.trim(),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Firestore comment add error:", err);
      }
    }

    setYeniMetin("");
    setYeniPuan(5);
  };

  return (
    <main className="guide-shell">
      <Navbar mekanHref={`/mekanlar/${sehir.id}`} />
      <header className="guide-header">
        <div>
          <Link className="back-link" href="/">
            ← Haritaya dön
          </Link>
          <h1>{sehir.ad} Mekan Rehberi</h1>
          <p>
            {sehir.ad} şehrinin en sevilen noktalarını, puanlarını ve kullanıcı yorumlarını incele.
          </p>
        </div>
        <label className="city-select">
          <span>Şehir değiştir</span>
          <select
            onChange={(event) => {
              window.location.href = `/mekanlar/${event.target.value}`;
            }}
            value={sehir.id}
          >
            {sehirler.map((item) => (
              <option key={item.id} value={item.id}>
                📍 {item.ad}
              </option>
            ))}
          </select>
        </label>
      </header>

      <section className="guide-layout">
        <div className="place-directory">
          <div className="section-title">
            <span className="small-label">Yorumlanmış mekanlar</span>
            <strong>{sehir.mekanlar.length} mekan</strong>
          </div>

          {sehir.mekanlar.map((mekan) => (
            <button
              className={`directory-item ${
                mekan.id === seciliMekan.id ? "active" : ""
              }`}
              key={mekan.id}
              onClick={() => setSeciliMekanId(mekan.id)}
              type="button"
            >
              <span>
                <strong>📍 {mekan.ad}</strong>
                <small>{mekan.tur}</small>
              </span>
              <em>★ {mekan.puan.toFixed(1)}</em>
            </button>
          ))}
        </div>

        <article className="review-panel">
          <div className="review-heading">
            <div>
              <span className="small-label">📍 {seciliMekan.tur}</span>
              <h2>{seciliMekan.ad}</h2>
              <p>{seciliMekan.ozet}</p>
            </div>
            <div className="score-card">
              <strong>★ {seciliMekan.puan.toFixed(1)}</strong>
              <span>{mevcutYorumlar.length} yorum</span>
            </div>
          </div>

          {loading ? (
            <div className="locked-panel">Kullanıcı bilgisi kontrol ediliyor...</div>
          ) : user ? (
            <div className="reviews-container">
              {/* Yeni Yorum Formu */}
              <form className="add-review-form" onSubmit={handleAddYorum}>
                <h3>✨ Mekanı Değerlendir & Yorum Yap</h3>
                <div className="star-rating-selector">
                  <span>Puanın:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      className={`star-btn ${star <= yeniPuan ? "active" : ""}`}
                      key={star}
                      onClick={() => setYeniPuan(star)}
                      type="button"
                    >
                      ★
                    </button>
                  ))}
                  <strong className="score-label">{yeniPuan} / 5 Yıldız</strong>
                </div>
                <textarea
                  onChange={(e) => setYeniMetin(e.target.value)}
                  placeholder={`${seciliMekan.ad} hakkındaki deneyimini ve önerilerini yaz...`}
                  required
                  rows={3}
                  value={yeniMetin}
                />
                <button type="submit">Yorumu Gönder ✨</button>
              </form>

              {/* Yorum Listesi */}
              <div className="comment-list">
                <span className="small-label">Gezgin Yorumları</span>
                {mevcutYorumlar.map((yorum) => (
                  <section className="comment-card" key={yorum.id}>
                    <div className="comment-meta">
                      <strong>👤 {yorum.yazar}</strong>
                      <span>{yorum.tarih}</span>
                    </div>
                    <p>"{yorum.metin}"</p>
                    <small className="star-display">
                      {"★".repeat(yorum.puan)}{"☆".repeat(5 - yorum.puan)} ({yorum.puan}/5)
                    </small>
                  </section>
                ))}
              </div>
            </div>
          ) : (
            <div className="locked-panel">
              <span className="small-label">Kısıtlı görünüm</span>
              <h3>Yorumları görmek ve değerlendirmek için giriş yapmalısın.</h3>
              <p>
                Giriş yapmadan mekan adını, türünü ve özetini
                görebilirsin. Detaylı kullanıcı yorumları ve puanlama
                için hesabına giriş yap.
              </p>
              <div className="auth-actions">
                <Link className="primary-link" href="/giris">
                  Giriş yap
                </Link>
                <Link className="outline-link" href="/kayit">
                  Kayıt ol
                </Link>
              </div>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
