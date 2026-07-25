"use client";

import Link from "next/link";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";

export default function Profil() {
  const { cikisYap, loading, user } = useAuth();

  return (
    <main className="page-shell">
      <Navbar />
      <section className="profile-layout">
        <div className="profile-card">
          <span className="small-label">Profil</span>
          {loading ? (
            <h1>Profil yükleniyor...</h1>
          ) : user ? (
            <>
              <h1>{user.displayName || "Gezgin kullanıcı"}</h1>
              <p>{user.email}</p>
              <div className="profile-stats">
                <div>
                  <strong>0</strong>
                  <span>yorum</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>topluluk mesajı</span>
                </div>
                <div>
                  <strong>0</strong>
                  <span>kaydedilen şehir</span>
                </div>
              </div>
              <button className="secondary-action" onClick={cikisYap} type="button">
                Çıkış yap
              </button>
            </>
          ) : (
            <>
              <h1>Profilini görmek için giriş yapmalısın.</h1>
              <p>
                Giriş yaptıktan sonra yorumların, topluluk mesajların ve gezi
                geçmişin burada görünecek.
              </p>
              <Link className="primary-link" href="/giris">
                Giriş yap
              </Link>
            </>
          )}
        </div>

        <aside className="profile-card muted-profile">
          <span className="small-label">Sonraki aşama</span>
          <h2>Profil verileri Firestore'a bağlanacak.</h2>
          <p>
            Şimdilik Firebase Authentication ile kullanıcı hesabını görüyoruz.
            Sonraki adımda kullanıcının yorumlarını ve favori şehirlerini
            Firestore'dan çekeceğiz.
          </p>
        </aside>
      </section>
    </main>
  );
}
