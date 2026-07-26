"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { isAdminEmail } from "../admin-config";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { db } from "../firebase";

type AdminUser = {
  id: string;
  email?: string;
  displayName?: string;
  createdAt?: string;
};

type AdminPin = {
  id: string;
  title: string;
  category: string;
  userEmail?: string;
  userName?: string;
};

type AdminPost = {
  id: string;
  mekan: string;
  metin: string;
  yazar: string;
  userEmail?: string;
};

type AdminReply = {
  id: string;
  postId: string;
  metin: string;
  yazar: string;
  userEmail?: string;
};

function formatDate(value: any) {
  if (value?.toDate) return value.toDate().toLocaleDateString("tr-TR");
  return "";
}

export default function AdminPanel() {
  const { loading, user } = useAuth();
  const isAdmin = isAdminEmail(user?.email);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pins, setPins] = useState<AdminPin[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [replies, setReplies] = useState<AdminReply[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!db || !isAdmin) return;

    const unsubUsers = onSnapshot(query(collection(db, "users")), (snapshot) => {
      setUsers(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            email: data.email,
            displayName: data.displayName,
            createdAt: formatDate(data.createdAt),
          };
        }),
      );
    });

    const unsubPins = onSnapshot(query(collection(db, "public_pins")), (snapshot) => {
      setPins(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || "Harita pini",
            category: data.category || "visited",
            userEmail: data.userEmail,
            userName: data.userName,
          };
        }),
      );
    });

    const unsubPosts = onSnapshot(query(collection(db, "discussions")), (snapshot) => {
      setPosts(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            mekan: data.mekan || "Genel",
            metin: data.metin || "",
            yazar: data.yazar || "Gezgin",
            userEmail: data.userEmail,
          };
        }),
      );
    });

    const unsubReplies = onSnapshot(query(collection(db, "discussion_replies")), (snapshot) => {
      setReplies(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            postId: data.postId || "",
            metin: data.metin || "",
            yazar: data.yazar || "Gezgin",
            userEmail: data.userEmail,
          };
        }),
      );
    });

    return () => {
      unsubUsers();
      unsubPins();
      unsubPosts();
      unsubReplies();
    };
  }, [isAdmin]);

  async function removeDocument(collectionName: string, id: string) {
    if (!db || !isAdmin) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      setMessage("Kayıt silindi.");
    } catch (err) {
      console.error("Admin delete error:", err);
      setMessage("Silme işlemi başarısız oldu. Rules kısmını kontrol et.");
    }
  }

  if (loading) {
    return (
      <main className="page-shell">
        <Navbar />
        <section className="page-hero">
          <h1>Yönetici paneli yükleniyor...</h1>
        </section>
      </main>
    );
  }

  if (!user || !isAdmin) {
    return (
      <main className="page-shell">
        <Navbar />
        <section className="page-hero">
          <div>
            <span className="small-label">Yönetici Paneli</span>
            <h1>Bu alan sadece yöneticiler için.</h1>
            <p>Yetkili admin e-postasıyla giriş yaptıktan sonra paneli kullanabilirsin.</p>
          </div>
          <Link className="primary-link" href="/giris">
            Giriş Yap
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Navbar />

      <section className="page-hero">
        <div>
          <span className="small-label">Yönetici Paneli</span>
          <h1>İçerik ve kullanıcı kontrolü.</h1>
          <p>Topluluk mesajlarını, yanıtları, ortak pinleri ve kayıtlı kullanıcıları buradan izleyebilirsin.</p>
        </div>
        <div className="admin-stat-row">
          <span>{users.length} kullanıcı</span>
          <span>{pins.length} pin</span>
          <span>{posts.length} sohbet</span>
          <span>{replies.length} yanıt</span>
        </div>
      </section>

      {message && <div className="form-alert">{message}</div>}

      <section className="admin-grid">
        <AdminSection title="Kullanıcılar">
          {users.length === 0 ? (
            <p className="empty-replies">Kullanıcı kaydı bulunamadı.</p>
          ) : (
            users.map((item) => (
              <div className="admin-list-row" key={item.id}>
                <div>
                  <strong>{item.displayName || "Gezgin Kullanıcı"}</strong>
                  <span>{item.email || item.id}</span>
                </div>
                <small>{item.createdAt}</small>
              </div>
            ))
          )}
        </AdminSection>

        <AdminSection title="Harita Pinleri">
          {pins.map((item) => (
            <div className="admin-list-row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>{item.userName || item.userEmail || "Gezgin"} • {item.category}</span>
              </div>
              <button onClick={() => removeDocument("public_pins", item.id)} type="button">
                Sil
              </button>
            </div>
          ))}
        </AdminSection>

        <AdminSection title="Topluluk Konuları">
          {posts.map((item) => (
            <div className="admin-list-row" key={item.id}>
              <div>
                <strong>{item.mekan}</strong>
                <span>{item.yazar} • {item.metin}</span>
              </div>
              <button onClick={() => removeDocument("discussions", item.id)} type="button">
                Sil
              </button>
            </div>
          ))}
        </AdminSection>

        <AdminSection title="Yanıtlar">
          {replies.map((item) => (
            <div className="admin-list-row" key={item.id}>
              <div>
                <strong>{item.yazar}</strong>
                <span>{item.metin}</span>
              </div>
              <button onClick={() => removeDocument("discussion_replies", item.id)} type="button">
                Sil
              </button>
            </div>
          ))}
        </AdminSection>
      </section>
    </main>
  );
}

function AdminSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="admin-panel-card">
      <div className="section-title">
        <span className="small-label">{title}</span>
      </div>
      <div className="admin-list">{children}</div>
    </section>
  );
}
