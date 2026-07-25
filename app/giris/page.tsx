"use client";

import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { useThemeAndLang } from "../ThemeAndLangProvider";
import { auth, db, firebaseHazir } from "../firebase";

export default function Giris() {
  const router = useRouter();
  const { demoGirisYap, loading: authLoading, user } = useAuth();
  const { t } = useThemeAndLang();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("kayit") === "basarili") {
      setBilgi("Kayıt oluşturuldu. Şimdi e-posta ve şifrenle giriş yapabilirsin.");
      setEmail(params.get("email") ?? "");
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/profil");
    }
  }, [authLoading, router, user]);

  async function girisYap(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHata("");
    setLoading(true);

    if (auth && firebaseHazir) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, sifre);
        if (db) {
          try {
            await setDoc(
            doc(db, "users", credential.user.uid),
            {
              userId: credential.user.uid,
              email: credential.user.email || email,
              displayName:
                credential.user.displayName ||
                credential.user.email?.split("@")[0] ||
                "Gezgin Kullanıcı",
              photoUrl: credential.user.photoURL || null,
              lastLoginAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true },
            );
          } catch (profileError) {
            console.warn("Firestore login profile sync error:", profileError);
          }
        }
        router.replace("/profil");
        return;
      } catch (error) {
        console.error("Firebase login error:", error);
        setHata("Giriş yapılamadı. E-posta veya şifre hatalı olabilir.");
        setLoading(false);
        return;
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

        {bilgi && <div className="form-alert success-alert">{bilgi}</div>}

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

        {!firebaseHazir && (
          <>
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
          </>
        )}

        <Link className="auth-switch" href="/kayit">
          Hesabın yok mu? {t.register}
        </Link>
      </section>
    </main>
  );
}
