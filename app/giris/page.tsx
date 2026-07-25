"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { useThemeAndLang } from "../ThemeAndLangProvider";
import { auth, firebaseHazir } from "../firebase";

export default function Giris() {
  const router = useRouter();
  const { demoGirisYap } = useAuth();
  const { t } = useThemeAndLang();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);

  async function girisYap(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHata("");
    setLoading(true);

    if (auth && firebaseHazir) {
      try {
        await signInWithEmailAndPassword(auth, email, sifre);
        router.push("/profil");
        return;
      } catch {
        // Firebase Auth hatası verirse demo girişle devam et
      }
    }

    // Demo / Hızlı Oturum Açma
    demoGirisYap(email);
    router.push("/profil");
    setLoading(false);
  }

  const handleDemoLogin = () => {
    demoGirisYap("gezgin@whereivebeen.com", "Gezgin Kullanıcı");
    router.push("/profil");
  };

  return (
    <main className="page-shell auth-page">
      <Navbar />
      <section className="auth-card">
        <span className="small-label">{t.login}</span>
        <h1>{t.loginTitle}</h1>
        <p>
          Mekan yorumlarını görmek, toplulukta yazmak ve profilini kullanmak
          için giriş yapın.
        </p>

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
              placeholder="Şifreniz"
              required
              type="password"
              value={sifre}
            />
          </label>
          {hata && <div className="form-alert">{hata}</div>}
          
          <button disabled={loading} type="submit">
            {loading ? "Giriş yapılıyor..." : t.login}
          </button>
        </form>

        <div style={{ margin: "16px 0 8px", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>veya</span>
        </div>

        <button
          className="outline-link"
          onClick={handleDemoLogin}
          style={{ width: "100%", justifyContent: "center" }}
          type="button"
        >
          🚀 Hızlı Gezgin Oturumu Aç (1-Tık)
        </button>

        <Link className="auth-switch" href="/kayit">
          Hesabın yok mu? {t.register}
        </Link>
      </section>
    </main>
  );
}
