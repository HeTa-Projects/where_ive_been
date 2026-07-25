"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Navbar } from "../../Navbar";
import { useAuth } from "../../AuthProvider";
import { sehirler } from "../../gezi-verileri";
import type { Sehir } from "../../gezi-verileri";

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
  const seciliMekan = useMemo(
    () =>
      sehir.mekanlar.find((mekan) => mekan.id === seciliMekanId) ??
      sehir.mekanlar[0],
    [sehir.mekanlar, seciliMekanId],
  );

  return (
    <main className="guide-shell">
      <Navbar mekanHref={`/mekanlar/${sehir.id}`} />
      <header className="guide-header">
        <div>
          <Link className="back-link" href="/">
            Haritaya dön
          </Link>
          <h1>{sehir.ad} Mekan Rehberi</h1>
          <p>
            Şehirde yorumlanmış mekanları görebilirsin. Detaylı kullanıcı
            yorumları için giriş yapman gerekir.
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
                {item.ad}
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
                <strong>{mekan.ad}</strong>
                <small>{mekan.tur}</small>
              </span>
              <em>{mekan.puan.toFixed(1)}</em>
            </button>
          ))}
        </div>

        <article className="review-panel">
          <div className="review-heading">
            <div>
              <span className="small-label">{seciliMekan.tur}</span>
              <h2>{seciliMekan.ad}</h2>
              <p>{seciliMekan.ozet}</p>
            </div>
            <div className="score-card">
              <strong>{seciliMekan.puan.toFixed(1)}</strong>
              <span>{seciliMekan.yorumSayisi} yorum</span>
            </div>
          </div>

          {loading ? (
            <div className="locked-panel">Kullanıcı bilgisi kontrol ediliyor...</div>
          ) : user ? (
            <div className="comment-list">
              {seciliMekan.yorumlar.map((yorum) => (
                <section className="comment-card" key={yorum.id}>
                  <div>
                    <strong>{yorum.yazar}</strong>
                    <span>{yorum.tarih}</span>
                  </div>
                  <p>{yorum.metin}</p>
                  <small>{yorum.puan}/5 puan</small>
                </section>
              ))}
            </div>
          ) : (
            <div className="locked-panel">
              <span className="small-label">Kısıtlı görünüm</span>
              <h3>Yorumları görmek için giriş yapmalı ya da kayıt olmalısın.</h3>
              <p>
                Giriş yapmadan mekan adını, türünü, puanını ve kısa özetini
                görebilirsin. Kullanıcı yorumları ve yeni yorum yazma alanı
                hesap gerektirir.
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
