"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, query, updateDoc } from "firebase/firestore";
import { isAdminEmail } from "../admin-config";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { db } from "../firebase";

type AdminUser = {
  id: string;
  email?: string;
  name?: string;
  handle?: string;
  deletionRequestedAt?: string;
  hidden?: boolean;
};

type AdminPost = {
  id: string;
  authorName: string;
  cityName: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  hidden?: boolean;
};

type AdminContactMessage = {
  id: string;
  displayName?: string;
  userEmail?: string;
  konu?: string;
  mesaj?: string;
};

type AdminReport = {
  id: string;
  reporterName: string;
  reporterId?: string;
  reason: string;
  status: "open" | "resolved" | string;
  targetId?: string;
  targetAuthorId?: string;
  targetPreview: string;
  createdAt?: string;
};

function formatDate(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString("tr-TR");
  }
  if (typeof value === "string") return value;
  return "";
}

function reportReasonLabel(reason: string) {
  const labels: Record<string, string> = {
    spam: "Spam",
    harassment: "Taciz",
    unsafe: "Güvensiz içerik",
    other: "Diğer",
  };
  return labels[reason] ?? reason;
}

export default function AdminPanel() {
  const { loading, user } = useAuth();
  const isAdmin = isAdminEmail(user?.email);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [contactMessages, setContactMessages] = useState<AdminContactMessage[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [message, setMessage] = useState("");
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    if (!db || !isAdmin) return;

    const unsubUsers = onSnapshot(query(collection(db, "users")), (snapshot) => {
      setUsers(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          email: data.email,
          name: data.name || data.displayName,
          handle: data.handle,
          deletionRequestedAt: formatDate(data.deletionRequestedAt),
          hidden: Boolean(data.privacy?.hidden),
        };
      }));
    });

    const unsubPosts = onSnapshot(query(collection(db, "communityPosts")), (snapshot) => {
      setPosts(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          authorName: data.authorName || "Gezgin",
          cityName: data.cityName || "Genel",
          content: data.content || "",
          likesCount: Number(data.likesCount) || 0,
          commentsCount: Number(data.commentsCount) || 0,
          hidden: Boolean(data.hidden),
        };
      }));
    });

    const unsubContact = onSnapshot(query(collection(db, "contactMessages")), (snapshot) => {
      setContactMessages(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          displayName: data.displayName || "Gezgin",
          userEmail: data.userEmail || "",
          konu: data.konu || "Öneri",
          mesaj: data.mesaj || "",
        };
      }));
    });

    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      setReportError("");
      setReports(snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          reporterName: data.reporterName || "Gezgin",
          reporterId: data.reporterId,
          reason: data.reason || "other",
          status: data.status || "open",
          targetId: data.targetId,
          targetAuthorId: data.targetAuthorId,
          targetPreview: data.targetPreview || "",
          createdAt: formatDate(data.createdAt),
        };
      }));
    }, () => {
      setReportError("Raporlar okunamadı. Firestore rules içinde reports okuma iznini publish etmelisin.");
    });

    return () => {
      unsubUsers();
      unsubPosts();
      unsubContact();
      unsubReports();
    };
  }, [isAdmin]);

  const deletionRequests = useMemo(() => users.filter((item) => item.deletionRequestedAt), [users]);
  const openReports = useMemo(() => reports.filter((item) => item.status !== "resolved"), [reports]);
  const resolvedReports = useMemo(() => reports.filter((item) => item.status === "resolved"), [reports]);

  async function hidePost(postId: string) {
    if (!db || !isAdmin) return;
    await updateDoc(doc(db, "communityPosts", postId), { hidden: true, status: "hidden" });
    setMessage("Paylaşım gizlendi.");
  }

  async function resolveDeletion(userId: string) {
    if (!db || !isAdmin) return;
    await updateDoc(doc(db, "users", userId), { deletionRequestResolvedAt: new Date().toISOString() });
    setMessage("Silme talebi işaretlendi. Auth ve alt koleksiyon temizliği için manuel/Cloud Function adımı gerekir.");
  }

  async function resolveReport(reportId: string) {
    if (!db || !isAdmin) return;
    await updateDoc(doc(db, "reports", reportId), { status: "resolved", resolvedAt: new Date().toISOString() });
    setMessage("Rapor kapatıldı.");
  }

  if (loading) {
    return (
      <main className="page-shell">
        <Navbar />
        <section className="page-hero"><h1>Yönetici paneli yükleniyor...</h1></section>
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
          <Link className="primary-link" href="/giris">Giriş Yap</Link>
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
          <h1>Kullanıcı, topluluk, rapor ve gizlilik yönetimi.</h1>
          <p>Mobil ve site ortak Firestore şemasındaki içerikleri buradan izleyip yönetebilirsin.</p>
        </div>
        <div className="admin-stat-row">
          <span>{users.length} kullanıcı</span>
          <span>{posts.length} paylaşım</span>
          <span>{deletionRequests.length} silme talebi</span>
          <span>{openReports.length} açık rapor</span>
          <span>{resolvedReports.length} kapalı rapor</span>
        </div>
      </section>

      {message && <div className="form-alert success-alert">{message}</div>}
      {reportError && <div className="form-alert">{reportError}</div>}

      <section className="admin-grid">
        <AdminSection title="Raporlananlar">
          {openReports.length === 0 ? <p className="empty-replies">Henüz raporlanan paylaşım yok.</p> : openReports.map((item) => (
            <ReportRow
              key={item.id}
              report={item}
              onHidePost={hidePost}
              onResolve={resolveReport}
            />
          ))}
        </AdminSection>

        <AdminSection title="Hesap Silme Talepleri">
          {deletionRequests.length === 0 ? <p className="empty-replies">Aktif silme talebi yok.</p> : deletionRequests.map((item) => (
            <div className="admin-list-row" key={item.id}>
              <div>
                <strong>{item.name || item.email || item.id}</strong>
                <span>{item.deletionRequestedAt} tarihinde talep oluşturdu.</span>
              </div>
              <button onClick={() => resolveDeletion(item.id)} type="button">İşaretle</button>
            </div>
          ))}
        </AdminSection>

        <AdminSection title="Kullanıcılar">
          {users.map((item) => (
            <div className="admin-list-row" key={item.id}>
              <div>
                <strong>{item.name || "Gezgin Kullanıcı"}</strong>
                <span>{item.email || item.id} {item.hidden ? "· public profil gizli" : ""}</span>
              </div>
              <Link className="outline-link compact-link" href={`/u/${item.id}`}>Profil</Link>
            </div>
          ))}
        </AdminSection>

        <AdminSection title="Topluluk Paylaşımları">
          {posts.map((item) => (
            <div className="admin-list-row" key={item.id}>
              <div>
                <strong>{item.cityName} · {item.authorName}</strong>
                <span>{item.content} · {item.likesCount} beğeni · {item.commentsCount} yorum</span>
              </div>
              <button disabled={item.hidden} onClick={() => hidePost(item.id)} type="button">
                {item.hidden ? "Gizli" : "Gizle"}
              </button>
            </div>
          ))}
        </AdminSection>

        <AdminSection title="Kapalı Raporlar">
          {resolvedReports.length === 0 ? <p className="empty-replies">Kapatılmış rapor yok.</p> : resolvedReports.slice(0, 10).map((item) => (
            <ReportRow key={item.id} report={item} compact />
          ))}
        </AdminSection>

        <AdminSection title="İletişim Mesajları">
          {contactMessages.length === 0 ? <p className="empty-replies">İletişim mesajı yok.</p> : contactMessages.map((item) => (
            <div className="admin-list-row" key={item.id}>
              <div>
                <strong>{item.displayName} ({item.konu})</strong>
                <span>{item.userEmail} · {item.mesaj}</span>
              </div>
            </div>
          ))}
        </AdminSection>
      </section>
    </main>
  );
}

function ReportRow({
  compact,
  onHidePost,
  onResolve,
  report,
}: {
  compact?: boolean;
  onHidePost?: (postId: string) => void;
  onResolve?: (reportId: string) => void;
  report: AdminReport;
}) {
  return (
    <div className="admin-list-row">
      <div>
        <strong>{reportReasonLabel(report.reason)} · {report.reporterName}</strong>
        <span>{report.createdAt || "Tarih yok"} · {report.targetPreview || "Önizleme yok"}</span>
        <small>Rapor ID: {report.id}{report.targetId ? ` · Paylaşım ID: ${report.targetId}` : ""}</small>
      </div>
      {!compact && (
        <div className="admin-row-actions">
          {report.targetId && <button onClick={() => onHidePost?.(report.targetId!)} type="button">Paylaşımı gizle</button>}
          <button onClick={() => onResolve?.(report.id)} type="button">Kapat</button>
        </div>
      )}
    </div>
  );
}

function AdminSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="admin-panel-card">
      <div className="section-title"><span className="small-label">{title}</span></div>
      <div className="admin-list">{children}</div>
    </section>
  );
}
