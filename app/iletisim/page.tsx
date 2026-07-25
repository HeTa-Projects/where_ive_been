"use client";

import Link from "next/link";
import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";
import { db } from "../firebase";

export default function Iletisim() {
  const { user } = useAuth();
  const [ad, setAd] = useState("");
  const [konu, setKonu] = useState("oneri");
  const [mesaj, setMesaj] = useState("");
  const [durum, setDurum] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDurum("");

    if (!user) {
      setDurum("Mesaj göndermek için giriş yapmalısın.");
      return;
    }
    if (!mesaj.trim()) {
      setDurum("Mesaj alanı boş kalmamalı.");
      return;
    }
    if (!db) {
      setDurum("Firebase bağlantısı hazır değil. .env.local bilgilerini kontrol et.");
      return;
    }

    setGonderiliyor(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        userId: user.uid,
        userEmail: user.email,
        displayName: ad.trim() || user.displayName || user.email.split("@")[0],
        konu,
        mesaj: mesaj.trim(),
        status: "new",
        createdAt: serverTimestamp(),
      });
      setDurum("Mesajın admin ekibine iletildi.");
      setMesaj("");
    } catch (error) {
      console.error("Firestore contact message error:", error);
      setDurum("Mesaj kaydedilemedi. Rules ve giriş durumunu kontrol et.");
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <main className="page-shell">
      <Navbar />

      <section className="page-hero">
        <div>
          <span className="small-label">İletişim</span>
          <h1>Öneri, şikayet ve destek talepleri.</h1>
          <p>
            Kullanıcılar uygulama hakkındaki önerilerini, hataları veya moderasyon
            taleplerini buradan admin ekibine iletebilir.
          </p>
        </div>
      </section>

      <section className="contact-layout">
        {user ? (
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              Ad Soyad
              <input
                onChange={(event) => setAd(event.target.value)}
                placeholder="Adını yaz"
                value={ad}
              />
            </label>
            <label>
              E-posta
              <input defaultValue={user.email ?? ""} placeholder="ornek@mail.com" readOnly type="email" />
            </label>
            <label>
              Konu
              <select onChange={(event) => setKonu(event.target.value)} value={konu}>
                <option value="oneri">Öneri</option>
                <option value="sikayet">Şikayet</option>
                <option value="hata">Hata bildirimi</option>
                <option value="moderasyon">Moderasyon talebi</option>
              </select>
            </label>
            <label>
              Mesaj
              <textarea
                onChange={(event) => setMesaj(event.target.value)}
                placeholder="Admin ekibine iletmek istediğin mesaj..."
                value={mesaj}
              />
            </label>
            <button disabled={gonderiliyor} type="submit">
              {gonderiliyor ? "Gönderiliyor..." : "Gönder"}
            </button>
            {durum && <div className="form-alert">{durum}</div>}
          </form>
        ) : (
          <section className="contact-form locked-panel">
            <span className="small-label">Giriş gerekli</span>
            <h2>Admin ile iletişime geçmek için giriş yapmalısın.</h2>
            <p>
              Bu sayede gelen mesajı kullanıcı hesabınla eşleştirebilir ve
              gerektiğinde sana dönüş yapabiliriz.
            </p>
            <div className="auth-actions">
              <Link className="primary-link" href="/giris">
                Giriş yap
              </Link>
              <Link className="outline-link" href="/kayit">
                Kayıt ol
              </Link>
            </div>
          </section>
        )}

        <aside className="contact-note">
          <span className="small-label">Admin kutusu</span>
          <h2>Mesajlar Firebase'e kaydediliyor.</h2>
          <p>
            Gönderilen mesajlar Firestore'daki contactMessages koleksiyonuna
            admin panelinde okunacak şekilde düşer.
          </p>
        </aside>
      </section>
    </main>
  );
}
