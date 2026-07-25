"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { sehirler } from "../gezi-verileri";

type DiscussionPost = {
  id: string;
  sehirId: string;
  mekan: string;
  yazar: string;
  zaman: string;
  metin: string;
  cevap: number;
  likes: number;
  category: string;
};

const BASLANGIC_KONUSMALARI: DiscussionPost[] = [
  {
    id: "eskisehir-odunpazari",
    sehirId: "eskisehir",
    mekan: "Odunpazarı Evleri",
    yazar: "Selin G.",
    zaman: "Bugün",
    metin:
      "Odunpazarı ve OMM aynı güne rahat sığıyor mu? Kahve molası için sakin bir yer arıyorum.",
    cevap: 9,
    likes: 14,
    category: "📍 Rota Tavsiyesi",
  },
  {
    id: "eskisehir-porsuk",
    sehirId: "eskisehir",
    mekan: "Porsuk Çayı",
    yazar: "Yağmur T.",
    zaman: "Dün",
    metin:
      "Porsuk çevresinde akşam yürüyüşü ve gondol turu için en güzel saat sizce ne zaman?",
    cevap: 5,
    likes: 8,
    category: "💬 Soru",
  },
  {
    id: "istanbul-balat",
    sehirId: "istanbul",
    mekan: "Balat Sokakları",
    yazar: "Ece K.",
    zaman: "2 gün önce",
    metin:
      "Balat için pazar sabahı mı daha iyi, yoksa hafta içi sakinliği mi? Fotoğraf çekimi için soruyorum.",
    cevap: 12,
    likes: 23,
    category: "📸 Gezi Notu",
  },
  {
    id: "izmir-kemeralti",
    sehirId: "izmir",
    mekan: "Kemeraltı Çarşısı",
    yazar: "Mert B.",
    zaman: "3 gün önce",
    metin:
      "Kemeraltı'nda dibek kahvesi ve meşhur lezzetler için küçük durak önerisi olan var mı?",
    cevap: 7,
    likes: 11,
    category: "🍰 Gurme & Lezzet",
  },
  {
    id: "antalya-kaleici",
    sehirId: "antalya",
    mekan: "Kaleiçi",
    yazar: "Deniz A.",
    zaman: "1 hafta önce",
    metin:
      "Kaleiçi rotasında fotoğraflık ama çok kalabalık olmayan dar sokak önerisi arıyorum.",
    cevap: 18,
    likes: 31,
    category: "📍 Rota Tavsiyesi",
  },
];

export default function Topluluk() {
  const { user } = useAuth();
  const [sehirId, setSehirId] = useState("eskisehir");
  const [konusmalar, setKonusmalar] = useState<DiscussionPost[]>(BASLANGIC_KONUSMALARI);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Form State
  const [yeniMekan, setYeniMekan] = useState("");
  const [yeniMetin, setYeniMetin] = useState("");
  const [yeniCategory, setYeniCategory] = useState("📍 Rota Tavsiyesi");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const seciliSehir = sehirler.find((sehir) => sehir.id === sehirId) ?? sehirler[0];
  
  const sehirKonusmalari = useMemo(() => {
    return konusmalar.filter((konusma) => {
      const matchCity = konusma.sehirId === sehirId;
      const matchCat = selectedCategory === "all" || konusma.category === selectedCategory;
      return matchCity && matchCat;
    });
  }, [konusmalar, sehirId, selectedCategory]);

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const isAlreadyLiked = prev[postId];
      return { ...prev, [postId]: !isAlreadyLiked };
    });

    setKonusmalar((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = likedPosts[postId];
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      }),
    );
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniMetin.trim()) return;

    const newPost: DiscussionPost = {
      id: `post-${Date.now()}`,
      sehirId: sehirId,
      mekan: yeniMekan.trim() || seciliSehir.ad,
      yazar: user?.displayName || user?.email?.split("@")[0] || "Gezgin Kullanıcı",
      zaman: "Şimdi",
      metin: yeniMetin.trim(),
      cevap: 0,
      likes: 1,
      category: yeniCategory,
    };

    setKonusmalar((prev) => [newPost, ...prev]);
    setYeniMekan("");
    setYeniMetin("");
  };

  return (
    <main className="page-shell">
      <Navbar mekanHref={`/mekanlar/${sehirId}`} />

      <section className="page-hero">
        <div>
          <span className="small-label">Gezgin Forumu & Topluluk</span>
          <h1>Şehir seç, gezi sohbetine katıl.</h1>
          <p>
            Kullanıcılar burada şehir veya mekan hakkında soru sorabilir,
            deneyim paylaşabilir ve güncel öneriler alabilir.
          </p>
        </div>
        <label className="city-select">
          <span>Şehir Seçin</span>
          <select onChange={(event) => setSehirId(event.target.value)} value={sehirId}>
            {sehirler.map((sehir) => (
              <option key={sehir.id} value={sehir.id}>
                📍 {sehir.ad}
              </option>
            ))}
          </select>
        </label>
      </section>

      {/* Kategori Filtre Çubuğu */}
      <div className="community-filters">
        <button
          className={`filter-chip ${selectedCategory === "all" ? "active" : ""}`}
          onClick={() => setSelectedCategory("all")}
          type="button"
        >
          🌟 Tüm Başlıklar
        </button>
        <button
          className={`filter-chip ${selectedCategory === "📍 Rota Tavsiyesi" ? "active" : ""}`}
          onClick={() => setSelectedCategory("📍 Rota Tavsiyesi")}
          type="button"
        >
          📍 Rota Tavsiyeleri
        </button>
        <button
          className={`filter-chip ${selectedCategory === "💬 Soru" ? "active" : ""}`}
          onClick={() => setSelectedCategory("💬 Soru")}
          type="button"
        >
          💬 Sorular & Cevaplar
        </button>
        <button
          className={`filter-chip ${selectedCategory === "📸 Gezi Notu" ? "active" : ""}`}
          onClick={() => setSelectedCategory("📸 Gezi Notu")}
          type="button"
        >
          📸 Gezi Fotoğrafları & Notlar
        </button>
        <button
          className={`filter-chip ${selectedCategory === "🍰 Gurme & Lezzet" ? "active" : ""}`}
          onClick={() => setSelectedCategory("🍰 Gurme & Lezzet")}
          type="button"
        >
          🍰 Gurme & Lezzet
        </button>
      </div>

      <section className="community-layout">
        <div className="discussion-list">
          <div className="section-title">
            <span className="small-label">{seciliSehir.ad} sohbetleri</span>
            <strong>{sehirKonusmalari.length} Konu Başlığı</strong>
          </div>

          {sehirKonusmalari.length === 0 ? (
            <div className="discussion-card">
              <p>Bu şehir için henüz başlık açılmamış. İlk sohbeti sen başlat!</p>
            </div>
          ) : (
            sehirKonusmalari.map((konusma) => (
              <article className="discussion-card" key={konusma.id}>
                <div className="discussion-meta">
                  <div className="author-info">
                    <span className="author-avatar">👤</span>
                    <strong>{konusma.yazar}</strong>
                  </div>
                  <span>{konusma.zaman}</span>
                </div>
                
                <div className="discussion-pills">
                  <span className="place-pill">📍 {konusma.mekan}</span>
                  <span className="category-pill">{konusma.category}</span>
                </div>

                <p>{konusma.metin}</p>

                <div className="discussion-actions">
                  <button
                    className={`like-btn ${likedPosts[konusma.id] ? "liked" : ""}`}
                    onClick={() => handleLike(konusma.id)}
                    type="button"
                  >
                    {likedPosts[konusma.id] ? "❤️" : "🤍"} {konusma.likes} Beğeni
                  </button>
                  <span className="reply-count">💬 {konusma.cevap} Yanıt</span>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="composer-panel">
          <span className="small-label">Yeni sohbet</span>
          <h2>{seciliSehir.ad} hakkında sor veya paylaş</h2>
          {user ? (
            <form onSubmit={handleCreatePost}>
              <label>
                <span>Mekan veya Konu Başlığı</span>
                <input
                  onChange={(e) => setYeniMekan(e.target.value)}
                  placeholder="Örn: Balat Sahil Yürüyüş Rotaları"
                  value={yeniMekan}
                />
              </label>

              <label>
                <span>Kategori</span>
                <select
                  onChange={(e) => setYeniCategory(e.target.value)}
                  value={yeniCategory}
                >
                  <option value="📍 Rota Tavsiyesi">📍 Rota Tavsiyesi</option>
                  <option value="💬 Soru">💬 Soru</option>
                  <option value="📸 Gezi Notu">📸 Gezi Notu</option>
                  <option value="🍰 Gurme & Lezzet">🍰 Gurme & Lezzet</option>
                </select>
              </label>

              <label>
                <span>Mesajın</span>
                <textarea
                  onChange={(e) => setYeniMetin(e.target.value)}
                  placeholder="Sorunu, önerini veya deneyimlerini buraya yaz..."
                  required
                  rows={4}
                  value={yeniMetin}
                />
              </label>

              <button type="submit">✨ Sohbeti Başlat</button>
            </form>
          ) : (
            <div className="locked-panel compact-lock">
              <h3>Sohbet başlatmak için giriş yapmalısın.</h3>
              <p>Mevcut başlıkları okuyabilir ve beğenebilirsin; yazmak için hesap gerekiyor.</p>
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
