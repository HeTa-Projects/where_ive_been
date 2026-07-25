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

type DiscussionReply = {
  id: string;
  postId: string;
  yazar: string;
  metin: string;
  zaman: string;
};

const BASLANGIC_KONUSMALARI: DiscussionPost[] = [
  {
    id: "eskisehir-odunpazari",
    sehirId: "eskisehir",
    mekan: "Odunpazarı Evleri",
    yazar: "Selin G.",
    zaman: "Bugün",
    metin: "Odunpazarı ve OMM aynı güne rahat sığıyor mu? Kahve molası için sakin bir yer arıyorum.",
    cevap: 0,
    likes: 14,
    category: "📍 Rota Tavsiyesi",
  },
  {
    id: "eskisehir-porsuk",
    sehirId: "eskisehir",
    mekan: "Porsuk Çayı",
    yazar: "Yağmur T.",
    zaman: "Dün",
    metin: "Porsuk çevresinde akşam yürüyüşü ve gondol turu için en güzel saat sizce ne zaman?",
    cevap: 0,
    likes: 8,
    category: "💬 Soru",
  },
  {
    id: "istanbul-balat",
    sehirId: "istanbul",
    mekan: "Balat Sokakları",
    yazar: "Ece K.",
    zaman: "2 gün önce",
    metin: "Balat için pazar sabahı mı daha iyi, yoksa hafta içi sakinliği mi? Fotoğraf çekimi için soruyorum.",
    cevap: 0,
    likes: 23,
    category: "📸 Gezi Notu",
  },
  {
    id: "izmir-kemeralti",
    sehirId: "izmir",
    mekan: "Kemeraltı Çarşısı",
    yazar: "Mert B.",
    zaman: "3 gün önce",
    metin: "Kemeraltı'nda dibek kahvesi ve meşhur lezzetler için küçük durak önerisi olan var mı?",
    cevap: 0,
    likes: 11,
    category: "🍰 Gurme & Lezzet",
  },
  {
    id: "antalya-kaleici",
    sehirId: "antalya",
    mekan: "Kaleiçi",
    yazar: "Deniz A.",
    zaman: "1 hafta önce",
    metin: "Kaleiçi rotasında fotoğraflık ama çok kalabalık olmayan dar sokak önerisi arıyorum.",
    cevap: 0,
    likes: 31,
    category: "📍 Rota Tavsiyesi",
  },
];

const BASLANGIC_YANITLARI: DiscussionReply[] = [
  {
    id: "reply-demo-1",
    postId: "eskisehir-odunpazari",
    yazar: "Can B.",
    metin: "Aynı güne sığar. OMM için sabahı, Odunpazarı sokakları için öğleden sonrayı ayırmak güzel oluyor.",
    zaman: "Bugün",
  },
  {
    id: "reply-demo-2",
    postId: "eskisehir-odunpazari",
    yazar: "Derya K.",
    metin: "Kahve için Kurşunlu Külliyesi çevresindeki küçük yerler daha sakin.",
    zaman: "Bugün",
  },
  {
    id: "reply-demo-3",
    postId: "eskisehir-porsuk",
    yazar: "Ali R.",
    metin: "Gün batımından hemen önce çok keyifli, ışık da fotoğraf için güzel oluyor.",
    zaman: "Dün",
  },
];

function formatDate(value: any) {
  if (value?.toDate) {
    return value.toDate().toLocaleDateString("tr-TR");
  }
  return "Şimdi";
}

export default function Topluluk() {
  const { user } = useAuth();
  const [sehirId, setSehirId] = useState("eskisehir");
  const [konusmalar, setKonusmalar] = useState<DiscussionPost[]>(BASLANGIC_KONUSMALARI);
  const [yanitlar, setYanitlar] = useState<Record<string, DiscussionReply[]>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [yeniMekan, setYeniMekan] = useState("");
  const [yeniMetin, setYeniMetin] = useState("");
  const [yeniCategory, setYeniCategory] = useState("📍 Rota Tavsiyesi");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [aktifYanitPostId, setAktifYanitPostId] = useState<string | null>(null);
  const [yanitMetinleri, setYanitMetinleri] = useState<Record<string, string>>({});
  const [formHata, setFormHata] = useState("");
  const [yanitHata, setYanitHata] = useState("");

  const seciliSehir = sehirler.find((sehir) => sehir.id === sehirId) ?? sehirler[0];

  useEffect(() => {
    const savedLocal = localStorage.getItem("whib_community_posts");
    const localPosts = savedLocal ? JSON.parse(savedLocal) : [];

    if (!db) {
      setKonusmalar([...localPosts, ...BASLANGIC_KONUSMALARI]);
      return;
    }

    const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remotePosts = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            sehirId: data.sehirId || "eskisehir",
            mekan: data.mekan || "",
            yazar: data.yazar || "Gezgin",
            zaman: formatDate(data.createdAt),
            metin: data.metin || "",
            cevap: Number(data.cevap) || 0,
            likes: Number(data.likes) || 0,
            category: data.category || "📍 Rota Tavsiyesi",
          };
        });

        const combined = [...remotePosts];
        BASLANGIC_KONUSMALARI.forEach((post) => {
          if (!combined.some((item) => item.id === post.id)) {
            combined.push(post);
          }
        });
        setKonusmalar(combined);
      },
      (err) => console.warn("Firestore discussions snapshot error:", err),
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedLocal = localStorage.getItem("whib_community_replies");
    const localReplies: DiscussionReply[] = savedLocal ? JSON.parse(savedLocal) : [];

    if (!db) {
      setYanitlar(groupReplies(localReplies));
      return;
    }

    const q = query(collection(db, "discussion_replies"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteReplies = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            postId: data.postId || "",
            yazar: data.yazar || "Gezgin",
            metin: data.metin || "",
            zaman: formatDate(data.createdAt),
          };
        });
        setYanitlar(groupReplies(remoteReplies));
      },
      (err) => console.warn("Firestore replies snapshot error:", err),
    );

    return () => unsubscribe();
  }, []);

  const sehirKonusmalari = useMemo(() => {
    return konusmalar.filter((konusma) => {
      const matchCity = konusma.sehirId === sehirId;
      const matchCat = selectedCategory === "all" || konusma.category === selectedCategory;
      return matchCity && matchCat;
    });
  }, [konusmalar, sehirId, selectedCategory]);

  async function handleLike(postId: string) {
    const isLikedNow = !likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: isLikedNow }));
    setKonusmalar((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likes: isLikedNow ? post.likes + 1 : Math.max(0, post.likes - 1) }
          : post,
      ),
    );

    if (db && !isBaslangicPost(postId)) {
      try {
        await updateDoc(doc(db, "discussions", postId), {
          likes: increment(isLikedNow ? 1 : -1),
        });
      } catch (err) {
        console.error("Firestore like error:", err);
      }
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    setFormHata("");
    if (!yeniMetin.trim()) return;
    if (!user) {
      setFormHata("Sohbet başlatmak için giriş yapmalısın.");
      return;
    }

    const yazarAd = user.displayName || user.email?.split("@")[0] || "Gezgin Kullanıcı";
    const mekanAd = yeniMekan.trim() || seciliSehir.ad;
    const postData = {
      sehirId,
      mekan: mekanAd,
      yazar: yazarAd,
      metin: yeniMetin.trim(),
      cevap: 0,
      likes: 0,
      category: yeniCategory,
    };

    if (db) {
      try {
        const created = await addDoc(collection(db, "discussions"), {
          ...postData,
          userId: user.uid,
          userEmail: user.email,
          createdAt: serverTimestamp(),
        });
        setKonusmalar((prev) => [
          {
            id: created.id,
            zaman: "Şimdi",
            ...postData,
          },
          ...prev.filter((post) => post.id !== created.id),
        ]);
      } catch (err) {
        console.error("Firestore post creation error:", err);
        setFormHata("Mesaj Firestore'a kaydedilemedi. Rules ve giriş durumunu kontrol et.");
        return;
      }
    } else {
      const newPost = {
        id: `post-${Date.now()}`,
        zaman: "Şimdi",
        ...postData,
      };
      setKonusmalar((prev) => [newPost, ...prev]);
      const existing = JSON.parse(localStorage.getItem("whib_community_posts") || "[]");
      localStorage.setItem("whib_community_posts", JSON.stringify([newPost, ...existing]));
    }

    setYeniMekan("");
    setYeniMetin("");
    setYeniCategory("📍 Rota Tavsiyesi");
  }

  async function handleCreateReply(postId: string) {
    setYanitHata("");
    const metin = (yanitMetinleri[postId] || "").trim();
    if (!metin) return;
    if (!user) {
      setYanitHata("Yanıt yazmak için giriş yapmalısın.");
      return;
    }

    const yazarAd = user.displayName || user.email?.split("@")[0] || "Gezgin Kullanıcı";
    const newReply = {
      id: `reply-${Date.now()}`,
      postId,
      yazar: yazarAd,
      metin,
      zaman: "Şimdi",
    };

    if (db) {
      try {
        const created = await addDoc(collection(db, "discussion_replies"), {
          userId: user.uid,
          userEmail: user.email,
          postId,
          yazar: yazarAd,
          metin,
          createdAt: serverTimestamp(),
        });
        if (!isBaslangicPost(postId)) {
          try {
            await updateDoc(doc(db, "discussions", postId), { cevap: increment(1) });
          } catch (countError) {
            console.warn("Firestore reply count update error:", countError);
          }
        }
        newReply.id = created.id;
      } catch (err) {
        console.error("Firestore reply creation error:", err);
        setYanitHata("Yanıt kaydedilemedi. Rules ve giriş durumunu kontrol et.");
        return;
      }
    } else {
      const existing = JSON.parse(localStorage.getItem("whib_community_replies") || "[]");
      localStorage.setItem("whib_community_replies", JSON.stringify([...existing, newReply]));
    }

    setYanitlar((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newReply],
    }));
    setKonusmalar((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, cevap: post.cevap + 1 } : post)),
    );
    setYanitMetinleri((prev) => ({ ...prev, [postId]: "" }));
    setAktifYanitPostId(postId);
  }

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
          <span>Şehir seçin</span>
          <select onChange={(event) => setSehirId(event.target.value)} value={sehirId}>
            {sehirler.map((sehir) => (
              <option key={sehir.id} value={sehir.id}>
                📍 {sehir.ad}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="community-filters">
        {["all", "📍 Rota Tavsiyesi", "💬 Soru", "📸 Gezi Notu", "🍰 Gurme & Lezzet"].map(
          (category) => (
            <button
              className={`filter-chip ${selectedCategory === category ? "active" : ""}`}
              key={category}
              onClick={() => setSelectedCategory(category)}
              type="button"
            >
              {category === "all" ? "🌟 Tüm Başlıklar" : category}
            </button>
          ),
        )}
      </div>

      <section className="community-layout">
        <div className="discussion-list">
          <div className="section-title">
            <span className="small-label">{seciliSehir.ad} sohbetleri</span>
            <strong>{sehirKonusmalari.length} konu başlığı</strong>
          </div>

          {sehirKonusmalari.length === 0 ? (
            <div className="discussion-card">
              <p>Bu şehir için henüz başlık açılmamış. İlk sohbeti sen başlat!</p>
            </div>
          ) : (
            sehirKonusmalari.map((konusma) => {
              const postReplies = yanitlar[konusma.id] || [];
              return (
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
                    <button
                      className="reply-toggle-btn"
                      onClick={() =>
                        setAktifYanitPostId(
                          aktifYanitPostId === konusma.id ? null : konusma.id,
                        )
                      }
                      type="button"
                    >
                      💬 {postReplies.length} Yanıt
                    </button>
                  </div>

                  {(aktifYanitPostId === konusma.id || postReplies.length > 0) && (
                    <div className="reply-thread">
                      {postReplies.length > 0 ? (
                        postReplies.map((yanit) => (
                          <div className="reply-card" key={yanit.id}>
                            <div className="reply-meta">
                              <strong>{yanit.yazar}</strong>
                              <span>{yanit.zaman}</span>
                            </div>
                            <p>{yanit.metin}</p>
                          </div>
                        ))
                      ) : (
                        <p className="empty-replies">Henüz yanıt yok. İlk cevabı sen yaz.</p>
                      )}

                      {user ? (
                        <form
                          className="reply-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            handleCreateReply(konusma.id);
                          }}
                        >
                          <textarea
                            onChange={(event) =>
                              setYanitMetinleri((prev) => ({
                                ...prev,
                                [konusma.id]: event.target.value,
                              }))
                            }
                            placeholder="Yanıtını yaz..."
                            rows={2}
                            value={yanitMetinleri[konusma.id] || ""}
                          />
                          <button type="submit">Yanıt gönder</button>
                        </form>
                      ) : (
                        <Link className="outline-link compact-link" href="/giris">
                          Yanıt yazmak için giriş yap
                        </Link>
                      )}
                      {yanitHata && aktifYanitPostId === konusma.id && (
                        <div className="form-alert">{yanitHata}</div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        <aside className="composer-panel">
          <span className="small-label">Yeni sohbet</span>
          <h2>{seciliSehir.ad} hakkında sor veya paylaş</h2>
          {user ? (
            <form onSubmit={handleCreatePost}>
              <label>
                <span>Mekan veya konu başlığı</span>
                <input
                  onChange={(e) => setYeniMekan(e.target.value)}
                  placeholder="Örn: Balat sahil yürüyüş rotaları"
                  value={yeniMekan}
                />
              </label>

              <label>
                <span>Kategori</span>
                <select onChange={(e) => setYeniCategory(e.target.value)} value={yeniCategory}>
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
              {formHata && <div className="form-alert">{formHata}</div>}
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

function groupReplies(replies: DiscussionReply[]) {
  return replies.reduce<Record<string, DiscussionReply[]>>((acc, reply) => {
    if (!reply.postId) return acc;
    acc[reply.postId] = [...(acc[reply.postId] || []), reply];
    return acc;
  }, {});
}

function isBaslangicPost(postId: string) {
  return BASLANGIC_KONUSMALARI.some((post) => post.id === postId);
}
