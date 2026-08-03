"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { Navbar } from "../../Navbar";
import { db } from "../../firebase";

type PublicProfile = {
  uid: string;
  name: string;
  handle: string;
  avatar?: string;
  bio?: string;
  favoritePlace?: string;
  firstDestination?: string;
  totalCities?: number;
  totalCountries?: number;
  totalPins?: number;
  level?: string;
  hidden?: boolean;
};

type PublicPost = {
  id: string;
  cityName: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
};

function formatDate(value: any) {
  if (value?.toDate) return value.toDate().toLocaleDateString("tr-TR");
  if (typeof value === "string") return value;
  return "";
}

export default function PublicUserProfile() {
  const params = useParams<{ uid: string }>();
  const uid = params.uid;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!db || !uid) return;
    const unsubProfile = onSnapshot(doc(db, "publicProfiles", uid), (snapshot) => {
      if (!snapshot.exists()) {
        setNotFound(true);
        return;
      }
      const data = snapshot.data() as PublicProfile;
      setProfile(data.hidden ? null : data);
      setNotFound(Boolean(data.hidden));
    });

    const postsQuery = query(collection(db, "communityPosts"), where("authorId", "==", uid), orderBy("createdAt", "desc"));
    const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          cityName: data.cityName || "Genel",
          content: data.content || "",
          likesCount: Number(data.likesCount) || 0,
          commentsCount: Number(data.commentsCount) || 0,
          createdAt: formatDate(data.createdAt),
        };
      }).filter((post: any) => !post.hidden));
    });

    return () => {
      unsubProfile();
      unsubPosts();
    };
  }, [uid]);

  if (!db || notFound) {
    return (
      <main className="page-shell">
        <Navbar />
        <section className="page-hero">
          <div>
            <span className="small-label">Public profil</span>
            <h1>Profil bulunamadı.</h1>
            <p>Bu kullanıcı profili gizlenmiş veya henüz public profil oluşturulmamış.</p>
          </div>
          <Link className="primary-link" href="/topluluk">Topluluğa dön</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Navbar />
      <section className="page-hero">
        <div>
          <span className="small-label">Gezgin profili</span>
          <h1>{profile?.name || "Gezgin"}</h1>
          <p>{profile?.bio || "Bu gezgin henüz bio eklemedi."}</p>
        </div>
        <div className="admin-stat-row">
          <span>{profile?.level || "Yeni Gezgin"}</span>
          <span>{profile?.totalCities || 0} şehir</span>
          <span>{profile?.totalCountries || 0} ülke</span>
          <span>{profile?.totalPins || 0} pin</span>
        </div>
      </section>

      <section className="community-layout">
        <div className="discussion-list">
          <div className="section-title">
            <span className="small-label">{profile?.handle}</span>
            <strong>{posts.length} topluluk paylaşımı</strong>
          </div>
          {posts.length ? posts.map((post) => (
            <article className="discussion-card" key={post.id}>
              <div className="discussion-pills">
                <span className="city-pill">📍 {post.cityName}</span>
                <span className="category-pill">{post.createdAt}</span>
              </div>
              <p>{post.content}</p>
              <div className="discussion-actions">
                <span>{post.likesCount} beğeni</span>
                <span>{post.commentsCount} yorum</span>
              </div>
            </article>
          )) : (
            <article className="discussion-card">
              <p>Henüz public topluluk paylaşımı yok.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}
