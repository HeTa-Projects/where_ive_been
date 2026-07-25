"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "../Navbar";
import { auth, firebaseHazir } from "../firebase";

export default function Giris() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);

  async function girisYap(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHata("");

    if (!auth || !firebaseHazir) {
      setHata("Firebase ayarları bulunamadı. .env.local dosyasını kontrol et.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, sifre);
      router.push("/profil");
    } catch {
      setHata("Giriş yapılamadı. E-posta ve şifreyi kontrol et.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell auth-page">
      <Navbar />
      <section className="auth-card">
        <span className="small-label">Giriş</span>
        <h1>Hesabına giriş yap.</h1>
        <p>
          Mekan yorumlarını görmek, toplulukta yazmak ve profilini kullanmak
          için giriş yapmalısın.
        </p>

        {!firebaseHazir && (
          <div className="firebase-guide-box">
            <div className="guide-title">
              <span>🔥 Firebase Kurulumu Gerekli</span>
            </div>
            <p>
              Canlı kullanıcı girişi ve veritabanı için Firebase anahtarların henüz <code>.env.local</code> dosyasına eklenmedi.
            </p>
            <ol className="guide-steps">
              <li><a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer">console.firebase.google.com</a> adresinden ücretsiz bir proje aç.</li>
              <li>Authentication &gt; Email/Password giriş yöntemini etkinleştir.</li>
              <li>Web Uygulaması ekle ve verilen anahtarları projedeki <code>.env.local</code> dosyasına yapıştır.</li>
            </ol>
          </div>
        )}

        <form className="auth-form" onSubmit={girisYap}>
          <label>
            E-posta
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ornek@mail.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Şifre
            <input
              autoComplete="current-password"
              onChange={(event) => setSifre(event.target.value)}
              placeholder="Şifren"
              required
              type="password"
              value={sifre}
            />
          </label>
          {hata && <div className="form-alert">{hata}</div>}
          <button disabled={loading} type="submit">
            {loading ? "Giriş yapılıyor..." : "Giriş yap"}
          </button>
        </form>

        <Link className="auth-switch" href="/kayit">
          Hesabın yok mu? Kayıt ol
        </Link>
      </section>
    </main>
  );
}
