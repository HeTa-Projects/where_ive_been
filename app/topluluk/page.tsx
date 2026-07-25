"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

  // Firebase & LocalStorage Sync
  useEffect(() => {
    let localPosts: DiscussionPost[] = [];
    try {
      const savedLocal = localStorage.getItem("whib_community_posts");
      if (savedLocal) {
        localPosts = JSON.parse(savedLocal);
      }
    } catch (e) {
      console.error(e);
    }

    if (db) {
      try {
        const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const remotePosts: DiscussionPost[] = snapshot.docs.map((docSnap) => {
                const data = docSnap.data();
                return {
                  id: docSnap.id,
                  sehirId: data.sehirId || "eskisehir",
                  mekan: data.mekan || "",
                  yazar: data.yazar || "Gezgin",
                  zaman: data.createdAt?.toDate
                    ? data.createdAt.toDate().toLocaleDateString("tr-TR")
                    : "Şimdi",
                  metin: data.metin || "",
                  cevap: data.cevap || 0,
                  likes: data.likes || 0,
                  category: data.category || "📍 Rota Tavsiyesi",
                };
              });

              const combined = [...remotePosts];
              BASLANGIC_KONUSMALARI.forEach((b) => {
                if (!combined.some((c) => c.id === b.id)) {
                  combined.push(b);
                }
              });
              setKonusmalar(combined);
            }
          },
          (err) => {
            console.warn("Firestore snapshot error:", err);
          },
        );
        return () => unsubscribe();
      } catch (err) {
        console.warn("Firestore connection error:", err);
      }
    }

    if (localPosts.length > 0) {
      const combined = [...localPosts];
      BASLANGIC_KONUSMALARI.forEach((b) => {
        if (!combined.some((c) => c.id === b.id)) {
          combined.push(b);
        }
      });
      setKonusmalar(combined);
    }
  }, []);

  const sehirKonusmalari = useMemo(() => {
    return konusmalar.filter((konusma) => {
      const matchCity = konusma.sehirId === sehirId;
      const matchCat = selectedCategory === "all" || konusma.category === selectedCategory;
      return matchCity && matchCat;
    });
  }, [konusmalar, sehirId, selectedCategory]);

  const handleLike = async (postId: string) => {
    const isLikedNow = !likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: isLikedNow }));

    setKonusmalar((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: isLikedNow ? post.likes + 1 : Math.max(0, post.likes - 1),
          };
        }
        return post;
      }),
    );

    if (db && !postId.startsWith("post-") && !BASLANGIC_KONUSMALARI.some((b) => b.id === postId)) {
      try {
        const postRef = doc(db, "discussions", postId);
        await updateDoc(postRef, {
          likes: increment(isLikedNow ? 1 : -1),
        });
      } catch (err) {
        console.error("Firestore like error:", err);
      }
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeniMetin.trim()) return;

    const yazarAd = user?.displayName || user?.email?.split("@")[0] || "Gezgin Kullanıcı";
    const mekanAd = yeniMekan.trim() || seciliSehir.ad;

    const newPostState: DiscussionPost = {
      id: `post-${Date.now()}`,
      sehirId: sehirId,
      mekan: mekanAd,
      yazar: yazarAd,
      zaman: "Şimdi",
      metin: yeniMetin.trim(),
      cevap: 0,
      likes: 1,
      category: yeniCategory,
    };

    setKonusmalar((prev) => [newPostState, ...prev]);

    try {
      const existing = JSON.parse(localStorage.getItem("whib_community_posts") || "[]");
      localStorage.setItem("whib_community_posts", JSON.stringify([newPostState, ...existing]));
    } catch (err) {
      console.error(err);
    }

    if (db) {
      try {
        await addDoc(collection(db, "discussions"), {
          sehirId: sehirId,
          mekan: mekanAd,
          yazar: yazarAd,
          metin: yeniMetin.trim(),
          cevap: 0,
          likes: 1,
          category: yeniCategory,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Firestore post creation error:", err);
      }
    }

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
