"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { sehirler } from "../gezi-verileri";

const konusmalar = [
  {
    id: "eskisehir-odunpazari",
    sehirId: "eskisehir",
    mekan: "Odunpazarı Evleri",
    yazar: "Selin",
    zaman: "Bugün",
    metin:
      "Odunpazarı ve OMM aynı güne rahat sığıyor mu? Kahve molası için sakin bir yer arıyorum.",
    cevap: 9,
  },
  {
    id: "eskisehir-porsuk",
    sehirId: "eskisehir",
    mekan: "Porsuk Çayı",
    yazar: "Yağmur",
    zaman: "Dün",
    metin:
      "Porsuk çevresinde akşam yürüyüşü için en güzel saat sizce ne zaman?",
    cevap: 5,
  },
  {
    id: "istanbul-balat",
    sehirId: "istanbul",
    mekan: "Balat Sokakları",
    yazar: "Ece",
    zaman: "2 gün önce",
    metin:
      "Balat için pazar sabahı mı daha iyi, yoksa hafta içi sakinliği mi?",
    cevap: 12,
  },
  {
    id: "izmir-kemeralti",
    sehirId: "izmir",
    mekan: "Kemeraltı Çarşısı",
    yazar: "Mert",
    zaman: "3 gün önce",
    metin:
      "Kemeraltı'nda kahve ve tatlı için küçük durak önerisi olan var mı?",
    cevap: 7,
  },
  {
    id: "antalya-kaleici",
    sehirId: "antalya",
    mekan: "Kaleiçi",
    yazar: "Deniz",
    zaman: "1 hafta önce",
    metin:
      "Kaleiçi rotasında fotoğraflık ama çok kalabalık olmayan sokak önerisi arıyorum.",
    cevap: 18,
  },
];

export default function Topluluk() {
  const { user } = useAuth();
  const [sehirId, setSehirId] = useState("eskisehir");
  const seciliSehir = sehirler.find((sehir) => sehir.id === sehirId) ?? sehirler[0];
  const sehirKonusmalari = useMemo(
    () => konusmalar.filter((konusma) => konusma.sehirId === sehirId),
    [sehirId],
  );

  return (
    <main className="page-shell">
      <Navbar mekanHref={`/mekanlar/${sehirId}`} />

      <section className="page-hero">
        <div>
          <span className="small-label">Topluluk</span>
          <h1>Şehir seç, gezi sohbetine katıl.</h1>
          <p>
            Kullanıcılar burada şehir veya mekan hakkında soru sorabilir,
            deneyim paylaşabilir ve güncel öneriler alabilir.
          </p>
        </div>
        <label className="city-select">
          <span>Şehir seç</span>
          <select onChange={(event) => setSehirId(event.target.value)} value={sehirId}>
            {sehirler.map((sehir) => (
              <option key={sehir.id} value={sehir.id}>
                {sehir.ad}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="community-layout">
        <div className="discussion-list">
          <div className="section-title">
            <span className="small-label">{seciliSehir.ad} sohbetleri</span>
            <strong>{sehirKonusmalari.length} başlık</strong>
          </div>

          {sehirKonusmalari.map((konusma) => (
            <article className="discussion-card" key={konusma.id}>
              <div className="discussion-meta">
                <strong>{konusma.yazar}</strong>
                <span>{konusma.zaman}</span>
              </div>
              <span className="place-pill">{konusma.mekan}</span>
              <p>{konusma.metin}</p>
              <small>{konusma.cevap} cevap</small>
            </article>
          ))}
        </div>

        <aside className="composer-panel">
          <span className="small-label">Yeni sohbet</span>
          <h2>{seciliSehir.ad} hakkında sor</h2>
          {user ? (
            <>
              <input placeholder="Mekan adı veya genel şehir sorusu" />
              <textarea placeholder="Sorunu ya da önerini yaz..." />
              <button type="button">Paylaş</button>
            </>
          ) : (
            <div className="locked-panel compact-lock">
              <h3>Sohbet başlatmak için giriş yapmalısın.</h3>
              <p>Mevcut başlıkları okuyabilirsin; yazmak için hesap gerekiyor.</p>
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
        </aside>
      </section>
    </main>
  );
}
