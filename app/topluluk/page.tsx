"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
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

type CommunityPost = {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  cityName: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  likedBy?: string[];
  createdAt: string;
  hidden?: boolean;
  status?: "active" | "hidden";
};

type CommunityComment = {
  id: string;
  postId: string;
  authorId?: string;
  authorName: string;
  text: string;
  createdAt: string;
  hidden?: boolean;
};

function formatDate(value: any) {
  if (value?.toDate) return value.toDate().toLocaleDateString("tr-TR");
  if (typeof value === "string") return value;
  return "Şimdi";
}

export default function Topluluk() {
  const { user } = useAuth();
  const isAdmin = isAdminEmail(user?.email);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
  const [openPostId, setOpenPostId] = useState("");
  const [search, setSearch] = useState("");
  const [cityName, setCityName] = useState("");
  const [content, setContent] = useState("");
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "communityPosts"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          authorId: data.authorId,
          authorName: data.authorName || "Gezgin",
          authorAvatar: data.authorAvatar,
          cityName: data.cityName || "Genel",
          content: data.content || "",
          imageUrl: data.imageUrl,
          likesCount: Number(data.likesCount) || 0,
          commentsCount: Number(data.commentsCount) || 0,
          likedBy: data.likedBy || [],
          createdAt: formatDate(data.createdAt),
          hidden: Boolean(data.hidden),
          status: data.status || "active",
        };
      }).filter((post) => !post.hidden && post.status !== "hidden"));
    });
  }, []);

  useEffect(() => {
    if (!db || !openPostId) return;
    const q = query(collection(db, "communityPosts", openPostId, "comments"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      setComments((current) => ({
        ...current,
        [openPostId]: snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            postId: openPostId,
            authorId: data.authorId,
            authorName: data.authorName || "Gezgin",
            text: data.text || "",
            createdAt: formatDate(data.createdAt),
            hidden: Boolean(data.hidden),
          };
        }).filter((comment) => !comment.hidden),
      }));
    });
  }, [openPostId]);

  const filteredPosts = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q) return posts;
    return posts.filter((post) =>
      [post.cityName, post.authorName, post.content].join(" ").toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [posts, search]);

  async function createPost(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!content.trim()) return;
    if (!user || !db) {
      setError("Paylaşım yapmak için giriş yapmalısın.");
      return;
    }

    await addDoc(collection(db, "communityPosts"), {
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Gezgin",
      authorAvatar: "",
      cityName: cityName.trim() || "Genel",
      content: content.trim(),
      likesCount: 0,
      commentsCount: 0,
      likedBy: [],
      hidden: false,
      status: "active",
      createdAt: serverTimestamp(),
    });

    setCityName("");
    setContent("");
  }

  async function likePost(post: CommunityPost) {
    if (!user || !db) return;
    const liked = post.likedBy?.includes(user.uid);
    await updateDoc(doc(db, "communityPosts", post.id), {
      likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      likesCount: increment(liked ? -1 : 1),
      updatedAt: serverTimestamp(),
    });

    if (!liked && post.authorId && post.authorId !== user.uid) {
      await addDoc(collection(db, "users", post.authorId, "notifications"), {
        type: "like",
        title: "Yeni beğeni",
        body: `${user.displayName || user.email?.split("@")[0] || "Bir gezgin"} paylaşımını beğendi.`,
        postId: post.id,
        read: false,
        createdAt: serverTimestamp(),
      });
    }
  }

  async function createReply(post: CommunityPost) {
    const text = (replyText[post.id] || "").trim();
    if (!text || !user || !db) return;

    await addDoc(collection(db, "communityPosts", post.id, "comments"), {
      authorId: user.uid,
      authorName: user.displayName || user.email?.split("@")[0] || "Gezgin",
      text,
      hidden: false,
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "communityPosts", post.id), {
      commentsCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    if (post.authorId && post.authorId !== user.uid) {
      await addDoc(collection(db, "users", post.authorId, "notifications"), {
        type: "comment",
        title: "Yeni yorum",
        body: `${user.displayName || user.email?.split("@")[0] || "Bir gezgin"} paylaşımına yorum yaptı.`,
        postId: post.id,
        read: false,
        createdAt: serverTimestamp(),
      });
    }

    setReplyText((current) => ({ ...current, [post.id]: "" }));
  }

  async function hidePost(postId: string) {
    if (!isAdmin || !db) return;
    await updateDoc(doc(db, "communityPosts", postId), {
      hidden: true,
      status: "hidden",
      updatedAt: serverTimestamp(),
    });
  }

  return (
    <main className="page-shell">
      <Navbar mekanHref="/mekanlar/eskisehir" />

      <section className="page-hero">
        <div>
          <span className="small-label">Gezgin Topluluğu</span>
          <h1>Site ve mobilde ortak gezi sohbetleri.</h1>
          <p>Paylaşımlar, beğeniler ve yorumlar Firebase `communityPosts` koleksiyonundan gelir.</p>
        </div>
        <label className="city-select">
          <span>Toplulukta ara</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Şehir, kişi veya konu ara..." />
        </label>
      </section>

      <section className="community-layout">
        <div className="discussion-list">
          <div className="section-title">
            <span className="small-label">Ortak akış</span>
            <strong>{filteredPosts.length} paylaşım</strong>
          </div>

          {filteredPosts.length === 0 ? (
            <article className="discussion-card">
              <p>Henüz paylaşım yok. İlk gezi tavsiyesini sen bırak.</p>
            </article>
          ) : filteredPosts.map((post) => {
            const isLiked = Boolean(user && post.likedBy?.includes(user.uid));
            const postComments = comments[post.id] || [];
            const isOpen = openPostId === post.id;

            return (
              <article className="discussion-card" key={post.id}>
                <div className="discussion-meta">
                  <div className="author-info">
                    <span className="author-avatar">👤</span>
                    <strong>{post.authorName}</strong>
                  </div>
                  <span>{post.createdAt}</span>
                </div>
                <div className="discussion-pills">
                  <span className="city-pill">📍 {post.cityName}</span>
                  <span className="category-pill">Topluluk</span>
                </div>
                <p>{post.content}</p>
                {post.imageUrl && <img alt={post.cityName} className="discussion-image" src={post.imageUrl} />}
                <div className="discussion-actions">
                  <button className={`like-btn ${isLiked ? "liked" : ""}`} onClick={() => likePost(post)} type="button">
                    {isLiked ? "♥" : "♡"} {post.likesCount} Beğeni
                  </button>
                  <button className="reply-toggle-btn" onClick={() => setOpenPostId(isOpen ? "" : post.id)} type="button">
                    💬 {post.commentsCount} Yorum
                  </button>
                  {isAdmin && <button className="admin-danger-btn" onClick={() => hidePost(post.id)} type="button">Gizle</button>}
                </div>

                {isOpen && (
                  <div className="reply-thread">
                    {postComments.length ? postComments.map((reply) => (
                      <div className="reply-card" key={reply.id}>
                        <div className="reply-meta">
                          <strong>{reply.authorName}</strong>
                          <span>{reply.createdAt}</span>
                        </div>
                        <p>{reply.text}</p>
                      </div>
                    )) : <p className="empty-replies">Henüz yorum yok.</p>}
                    {user ? (
                      <form className="reply-form" onSubmit={(event) => { event.preventDefault(); createReply(post); }}>
                        <textarea value={replyText[post.id] || ""} onChange={(event) => setReplyText((current) => ({ ...current, [post.id]: event.target.value }))} placeholder="Yorum yaz..." rows={2} />
                        <button type="submit">Yorum gönder</button>
                      </form>
                    ) : (
                      <Link className="outline-link compact-link" href="/giris">Yorum yazmak için giriş yap</Link>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="composer-panel">
          <span className="small-label">Yeni paylaşım</span>
          <h2>Topluluğa gezi tavsiyesi bırak</h2>
          {user ? (
            <form onSubmit={createPost}>
              <label>
                <span>Şehir / mekan</span>
                <input value={cityName} onChange={(event) => setCityName(event.target.value)} placeholder="Örn: Roma" />
              </label>
              <label>
                <span>Mesajın</span>
                <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Tavsiyeni veya sorunu yaz..." required rows={4} />
              </label>
              <button type="submit">Paylaş</button>
              {error && <div className="form-alert">{error}</div>}
            </form>
          ) : (
            <div className="locked-panel compact-lock">
              <h3>Paylaşım yapmak için giriş yapmalısın.</h3>
              <div className="auth-actions">
                <Link className="primary-link" href="/giris">Giriş yap</Link>
                <Link className="outline-link" href="/kayit">Kayıt ol</Link>
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
