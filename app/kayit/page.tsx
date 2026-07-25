"use client";

import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { useThemeAndLang } from "../ThemeAndLangProvider";
import { auth, db, firebaseHazir } from "../firebase";

export default function Kayit() {
  const router = useRouter();
  const { demoGirisYap } = useAuth();
  const { t } = useThemeAndLang();
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);

  async function kayitOl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHata("");
    setLoading(true);

    if (auth && firebaseHazir) {
      try {
        const credential = await createUserWithEmailAndPassword(auth, email, sifre);
        const displayName = ad.trim() || email.split("@")[0] || "Gezgin Kullanıcı";
        await updateProfile(credential.user, { displayName });
        if (db) {
          try {
            await setDoc(
            doc(db, "users", credential.user.uid),
            {
              userId: credential.user.uid,
              email: credential.user.email || email,
              displayName,
              photoUrl: credential.user.photoURL || null,
              pins: [],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true },
            );
          } catch (profileError) {
            console.warn("Firestore user profile creation error:", profileError);
          }
        }
        await signOut(auth);
        router.push(`/giris?kayit=basarili&email=${encodeURIComponent(email)}`);
        return;
      } catch (error) {
        console.error("Firebase register error:", error);
        setHata("Kayıt oluşturulamadı. E-posta kullanılıyor olabilir veya şifre en az 6 karakter olmalı.");
        setLoading(false);
        return;
      }
    }

    demoGirisYap(email, ad.trim() || email.split("@")[0]);
    router.push("/profil");
    setLoading(false);
  }

  return (
    <main className="page-shell auth-page">
      <Navbar />
      <section className="auth-card">
        <span className="small-label">{t.register}</span>
        <h1>{t.registerTitle}</h1>
        <p>
          Hesap oluşturduktan sonra yorumları görebilir, toplulukta yazabilir
          ve kendi gezi profilini kullanabilirsin.
        </p>

        <form className="auth-form" onSubmit={kayitOl}>
          <label>
            Ad Soyad
            <input
              autoComplete="name"
              onChange={(event) => setAd(event.target.value)}
              placeholder="Adınız"
              value={ad}
            />
          </label>
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
              autoComplete="new-password"
              onChange={(event) => setSifre(event.target.value)}
              placeholder="En az 6 karakter"
              required
              type="password"
              value={sifre}
            />
          </label>
          {hata && <div className="form-alert">{hata}</div>}
          <button disabled={loading} type="submit">
            {loading ? "Kayıt oluşturuluyor..." : t.register}
          </button>
        </form>

        <Link className="auth-switch" href="/giris">
          Zaten hesabın var mı? {t.login}
        </Link>
      </section>
    </main>
  );
}
