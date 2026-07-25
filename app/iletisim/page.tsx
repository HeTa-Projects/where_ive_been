"use client";

import Link from "next/link";
import { Navbar } from "../Navbar";
import { useAuth } from "../AuthProvider";

export default function Iletisim() {
  const { user } = useAuth();

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
          <form className="contact-form">
            <label>
              Ad Soyad
              <input placeholder="Adını yaz" />
            </label>
            <label>
              E-posta
              <input defaultValue={user.email ?? ""} placeholder="ornek@mail.com" type="email" />
            </label>
            <label>
              Konu
              <select defaultValue="oneri">
                <option value="oneri">Öneri</option>
                <option value="sikayet">Şikayet</option>
                <option value="hata">Hata bildirimi</option>
                <option value="moderasyon">Moderasyon talebi</option>
              </select>
            </label>
            <label>
              Mesaj
              <textarea placeholder="Admin ekibine iletmek istediğin mesaj..." />
            </label>
            <button type="button">Gönder</button>
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
          <h2>Sonraki aşamada Firebase'e bağlanacak.</h2>
          <p>
            Bu form şimdilik arayüz prototipi. Firebase eklendiğinde mesajlar
            admin panelinde okunacak şekilde Firestore'a kaydedilebilir.
          </p>
        </aside>
      </section>
    </main>
  );
}
