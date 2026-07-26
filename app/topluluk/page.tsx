"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { isAdminEmail } from "../admin-config";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { db } from "../firebase";
import { sehirler, ulkeler } from "../gezi-verileri";

type DiscussionPost = {
  id: string;
  ulkeId?: string;
  sehirId?: string;
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

const CATEGORIES = ["📍 Rota Tavsiyesi", "💬 Soru", "📸 Gezi Notu", "🍰 Gurme & Lezzet"];

const BASLANGIC_KONUSMALARI: DiscussionPost[] = [
  {
    id: "eskisehir-odunpazari",
    ulkeId: "turkiye",
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
    ulkeId: "turkiye",
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
    ulkeId: "turkiye",
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
    ulkeId: "turkiye",
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
    ulkeId: "turkiye",
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

function formatDate(value: any) {
  if (value?.toDate) {
    return value.toDate().toLocaleDateString("tr-TR");
  }
  return "Şimdi";
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

export default function Topluluk() {
  const { user } = useAuth();
  const isAdmin = isAdminEmail(user?.email);
  const [ulkeFilter, setUlkeFilter] = useState("all");
  const [sehirFilter, setSehirFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [yeniUlkeId, setYeniUlkeId] = useState("turkiye");
  const [yeniSehirId, setYeniSehirId] = useState("eskisehir");
  const [yeniMekan, setYeniMekan] = useState("");
  const [yeniMetin, setYeniMetin] = useState("");
  const [yeniCategory, setYeniCategory] = useState(CATEGORIES[0]);
  const [konusmalar, setKonusmalar] = useState<DiscussionPost[]>(BASLANGIC_KONUSMALARI);
  const [yanitlar, setYanitlar] = useState<Record<string, DiscussionReply[]>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [yanitMetinleri, setYanitMetinleri] = useState<Record<string, string>>({});
  const [formHata, setFormHata] = useState("");
  const [yanitHata, setYanitHata] = useState("");

  const filtreSehirleri = useMemo(() => {
    if (ulkeFilter === "all") return sehirler;
    return sehirler.filter((sehir) => sehir.ulkeId === ulkeFilter);
  }, [ulkeFilter]);

  const formSehirleri = useMemo(() => {
    return sehirler.filter((sehir) => sehir.ulkeId === yeniUlkeId);
  }, [yeniUlkeId]);

  useEffect(() => {
    const savedLocal = localStorage.getItem("whib_community_posts");
    const localPosts = savedLocal ? JSON.parse(savedLocal) : [];

    if (!db) {
      setKonusmalar([...localPosts, ...BASLANGIC_KONUSMALARI]);
      return;
    }

    const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const remotePosts: DiscussionPost[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ulkeId: data.ulkeId || "turkiye",
          sehirId: data.sehirId || "eskisehir",
          mekan: data.mekan || "",
          yazar: data.yazar || "Gezgin",
          zaman: formatDate(data.createdAt),
          metin: data.metin || "",
          cevap: Number(data.cevap) || 0,
          likes: Number(data.likes) || 0,
          category: data.category || CATEGORIES[0],
        };
      });

      const combined = [...remotePosts];
      BASLANGIC_KONUSMALARI.forEach((post) => {
        if (!combined.some((item) => item.id === post.id)) combined.push(post);
      });
      setKonusmalar(combined);
    });

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
    const unsubscribe = onSnapshot(q, (snapshot) => {
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
    });

    return () => unsubscribe();
  }, []);

  const suzulenKonusmalar = useMemo(() => {
    return konusmalar.filter((konusma) => {
      const postSehir = sehirler.find((s) => s.id === konusma.sehirId);
      const postUlkeId = konusma.ulkeId || postSehir?.ulkeId || "turkiye";
      return (
        (ulkeFilter === "all" || postUlkeId === ulkeFilter) &&
        (sehirFilter === "all" || konusma.sehirId === sehirFilter) &&
        (selectedCategory === "all" || konusma.category === selectedCategory)
      );
    });
  }, [konusmalar, ulkeFilter, sehirFilter, selectedCategory]);

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
      await updateDoc(doc(db, "discussions", postId), {
        likes: increment(isLikedNow ? 1 : -1),
      });
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
    const seciliSehirObj = sehirler.find((s) => s.id === yeniSehirId);
    const seciliUlkeObj = ulkeler.find((u) => u.id === yeniUlkeId);
    const postData = {
      ulkeId: yeniUlkeId,
      sehirId: yeniSehirId,
      mekan: yeniMekan.trim() || seciliSehirObj?.ad || seciliUlkeObj?.ad || "Genel",
      yazar: yazarAd,
      metin: yeniMetin.trim(),
      cevap: 0,
      likes: 0,
      category: yeniCategory,
    };

    if (db) {
      try {
        await addDoc(collection(db, "discussions"), {
          ...postData,
          userId: user.uid,
          userEmail: user.email,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error("Firestore post creation error:", err);
        setFormHata("Mesaj kaydedilemedi. Rules ve giriş durumunu kontrol et.");
        return;
      }
    } else {
      const newPost = { id: `post-${Date.now()}`, zaman: "Şimdi", ...postData };
      setKonusmalar((prev) => [newPost, ...prev]);
      const existing = JSON.parse(localStorage.getItem("whib_community_posts") || "[]");
      localStorage.setItem("whib_community_posts", JSON.stringify([newPost, ...existing]));
    }

    setYeniMekan("");
    setYeniMetin("");
    setYeniCategory(CATEGORIES[0]);
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
          await updateDoc(doc(db, "discussions", postId), { cevap: increment(1) });
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

    setYanitlar((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), newReply] }));
    setKonusmalar((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, cevap: post.cevap + 1 } : post)),
    );
    setYanitMetinleri((prev) => ({ ...prev, [postId]: "" }));
    setOpenReplies((prev) => ({ ...prev, [postId]: true }));
  }

  async function handleDeletePost(postId: string) {
    if (!isAdmin) return;
    setKonusmalar((prev) => prev.filter((post) => post.id !== postId));
    setYanitlar((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
    if (db && !isBaslangicPost(postId)) {
      await deleteDoc(doc(db, "discussions", postId));
    }
  }

  async function handleDeleteReply(reply: DiscussionReply) {
    if (!isAdmin) return;
    setYanitlar((prev) => ({
      ...prev,
      [reply.postId]: (prev[reply.postId] || []).filter((item) => item.id !== reply.id),
    }));
    if (db) {
      await deleteDoc(doc(db, "discussion_replies", reply.id));
      if (!isBaslangicPost(reply.postId)) {
        await updateDoc(doc(db, "discussions", reply.postId), { cevap: increment(-1) });
      }
    }
  }

  return (
    <main className="page-shell">
      <Navbar mekanHref={sehirFilter !== "all" ? `/mekanlar/${sehirFilter}` : "/mekanlar/eskisehir"} />

      <section className="page-hero">
        <div>
          <span className="small-label">Gezgin Forumu & Topluluk</span>
          <h1>Dünya genelinde gezgin sohbetleri.</h1>
          <p>
            Tüm ülkeler ve şehirlerden gezi soruları, rotalar, mekan önerileri ve deneyim paylaşımları.
          </p>
        </div>

        <div className="hero-filter-group">
          <label className="city-select">
            <span>🌍 Ülke Filtresi</span>
            <select
              onChange={(e) => {
                setUlkeFilter(e.target.value);
                setSehirFilter("all");
              }}
              value={ulkeFilter}
            >
              <option value="all">🌍 Tüm Ülkeler</option>
              {ulkeler.map((ulke) => (
                <option key={ulke.id} value={ulke.id}>
                  {ulke.bayrak} {ulke.ad}
                </option>
              ))}
            </select>
          </label>

          <label className="city-select">
            <span>📍 Şehir Filtresi</span>
            <select onChange={(e) => setSehirFilter(e.target.value)} value={sehirFilter}>
              <option value="all">📍 Tüm Şehirler</option>
              {filtreSehirleri.map((sehir) => (
                <option key={sehir.id} value={sehir.id}>
                  📍 {sehir.ad}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="community-filters">
        {["all", ...CATEGORIES].map((category) => (
          <button
            className={`filter-chip ${selectedCategory === category ? "active" : ""}`}
            key={category}
            onClick={() => setSelectedCategory(category)}
            type="button"
          >
            {category === "all" ? "🌟 Tüm Başlıklar" : category}
          </button>
        ))}
      </div>

      <section className="community-layout">
        <div className="discussion-list">
          <div className="section-title">
            <span className="small-label">
              {ulkeFilter === "all"
                ? "Tüm Dünya Sohbetleri"
                : `${ulkeler.find((u) => u.id === ulkeFilter)?.ad || ""} Sohbetleri`}
            </span>
            <strong>{suzulenKonusmalar.length} konu başlığı</strong>
          </div>

          {suzulenKonusmalar.length === 0 ? (
            <div className="discussion-card">
              <p>Seçtiğiniz filtreye uygun konu başlığı bulunamadı. İlk sohbeti sen başlat!</p>
            </div>
          ) : (
            suzulenKonusmalar.map((konusma) => {
              const postReplies = yanitlar[konusma.id] || [];
              const isOpen = !!openReplies[konusma.id];
              const postSehir = sehirler.find((s) => s.id === konusma.sehirId);
              const postUlkeId = konusma.ulkeId || postSehir?.ulkeId || "turkiye";
              const postUlke = ulkeler.find((u) => u.id === postUlkeId);

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
                    {postUlke && <span className="country-pill">{postUlke.bayrak} {postUlke.ad}</span>}
                    {postSehir && <span className="city-pill">📍 {postSehir.ad}</span>}
                    {konusma.mekan && konusma.mekan !== postSehir?.ad && (
                      <span className="place-pill">🏛️ {konusma.mekan}</span>
                    )}
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
                        setOpenReplies((prev) => ({ ...prev, [konusma.id]: !prev[konusma.id] }))
                      }
                      type="button"
                    >
                      💬 {postReplies.length} Yanıt {isOpen ? "Gizle" : "Göster"}
                    </button>
                    {isAdmin && (
                      <button className="admin-danger-btn" onClick={() => handleDeletePost(konusma.id)} type="button">
                        Sil
                      </button>
                    )}
                  </div>

                  {isOpen && (
                    <div className="reply-thread">
                      {postReplies.length > 0 ? (
                        postReplies.map((yanit) => (
                          <div className="reply-card" key={yanit.id}>
                            <div className="reply-meta">
                              <strong>{yanit.yazar}</strong>
                              <span>{yanit.zaman}</span>
                              {isAdmin && (
                                <button onClick={() => handleDeleteReply(yanit)} type="button">
                                  Sil
                                </button>
                              )}
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
                      {yanitHata && <div className="form-alert">{yanitHata}</div>}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        <aside className="composer-panel">
          <span className="small-label">Yeni sohbet</span>
          <h2>Gezi sorun veya önerin için konu başlat</h2>
          {user ? (
            <form onSubmit={handleCreatePost}>
              <label>
                <span>Ülke</span>
                <select
                  onChange={(e) => {
                    const selUlke = e.target.value;
                    setYeniUlkeId(selUlke);
                    const avCities = sehirler.filter((s) => s.ulkeId === selUlke);
                    setYeniSehirId(avCities[0]?.id || "");
                  }}
                  value={yeniUlkeId}
                >
                  {ulkeler.map((ulke) => (
                    <option key={ulke.id} value={ulke.id}>
                      {ulke.bayrak} {ulke.ad}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Şehir</span>
                <select onChange={(e) => setYeniSehirId(e.target.value)} value={yeniSehirId}>
                  {formSehirleri.map((sehir) => (
                    <option key={sehir.id} value={sehir.id}>
                      📍 {sehir.ad}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Mekan veya detay konu başlığı (Opsiyonel)</span>
                <input
                  onChange={(e) => setYeniMekan(e.target.value)}
                  placeholder="Örn: Balat sahil yürüyüş rotaları"
                  value={yeniMekan}
                />
              </label>

              <label>
                <span>Kategori</span>
                <select onChange={(e) => setYeniCategory(e.target.value)} value={yeniCategory}>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
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
