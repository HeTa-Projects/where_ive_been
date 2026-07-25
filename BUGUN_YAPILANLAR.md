# 📘 Where I've Been — Detaylı Kod İnceleme & Satır Satır Öğrenim Rehberi

Bu rehber, **Where I've Been** projesinde bugün yazdığımız, değiştirdiğimiz ve canlıya aldığımız tüm kodları **birebir kod blokları ve satır satır açıklamalarıyla** sunmaktadır. Amacı, kod okuma yeteneğinizi geliştirmek ve projedeki her bir satırın ne işe yaradığını tam olarak anlamanızı sağlamaktır.

---

## 📂 1. Dosya ve Mimari Özeti

```txt
where_ive_been/
├── app/
│   ├── firebase.ts                       <-- Firebase konfigürasyonu (Auth & Firestore başlatma)
│   ├── AuthProvider.tsx                   <-- Kullanıcı oturum durumunu yöneten Context Provider
│   ├── TravelMap.tsx                      <-- Leaflet haritası & İkon çizim fonksiyonları
│   ├── globals.css                       <-- Cam efekti (Glassmorphism) & Marker CSS stilleri
│   ├── page.tsx                          <-- Ana sayfa (Harita + Firestore Pin senkronizasyonu)
│   ├── profil/
│   │   └── page.tsx                      <-- Profil sayfası (Fotoğraf, rozetler, Firestore senkronu)
│   ├── topluluk/
│   │   └── page.tsx                      <-- Forum (Canlı sohbetler, yorum ekleme, beğeni artırma)
│   ├── mekanlar/[sehirId]/
│   │   └── MekanRehberiClient.tsx        <-- Şehir mekan rehberi & canlı mekan yorumları
│   └── rotalar/
│       └── page.tsx                      <-- Gezgin rotaları yayınlama & beğenme
└── .env.local                            <-- Firebase gizli anahtarlarının tutulduğu dosya
```

---

## 🛠️ 2. Detaylı Kod İncelemeleri (Satır Satır Anlatım)

---

### 1️⃣ HARİTA İKONLARI VE ÇAKIŞMA ENGELLEME
**Dosyalar**: `app/TravelMap.tsx` & `app/globals.css`

#### 🔹 `createCityIcon` Fonksiyonu (Şehir Marker'ı Çizen Kod)
Bu fonksiyon, harita üzerinde her bir şehir için gösterilen HTML kutucuğunu (marker) oluşturur.

```tsx
// app/TravelMap.tsx
function createCityIcon(
  isSelected: boolean,
  cityName: string,
  placesCount: number,
  countryId?: string,
  mark?: "visited" | "wishlist" | "favorite",
) {
  // 1. Ülke bayrağının URL'sini al
  const flagUrl = countryId ? ulkeBayrakUrl(countryId) : "";
  
  // 2. Eğer kullanıcı bu şehri işaretlediyse CSS class'ı ekle (mark-visited, mark-wishlist, mark-favorite)
  const markCls = mark ? ` mark-${mark}` : "";
  const cls = `cpin-city${isSelected ? " active" : ""}${markCls}`;

  // 3. İşaret türüne göre üst çemberde görünecek emoji ikonunu belirle
  const markSymbol =
    mark === "visited"
      ? "✅"
      : mark === "wishlist"
      ? "📌"
      : mark === "favorite"
      ? "❤️"
      : null;

  // 4. Çemberin iç içeriğini oluştur: Eğer pin işaretlendiyse emoji, yoksa bayrak, o da yoksa nokta koy
  const dotContent = markSymbol
    ? `<span class="cpin-mark-emoji">${markSymbol}</span>`
    : flagUrl
    ? `<img src="${flagUrl}" class="cpin-marker-flag" />`
    : `<span class="cpin-marker-dot">●</span>`;

  // 5. Leaflet kütüphanesine HTML olarak döndür
  return L.divIcon({
    className: "custom-city-pin-wrapper",
    html: `
      <div class="${cls}">
        <div class="cpin-marker">
          ${dotContent}
        </div>
        <div class="cpin-city-label">
          <span class="cpin-city-name">${cityName}</span>
          <span class="cpin-city-badge">${placesCount}</span>
        </div>
        <div class="cpin-city-tail"></div>
      </div>
    `,
    iconAnchor: [50, 58], // İğnenin haritaya değdiği tam nokta (X:50, Y:58)
    iconSize: [100, 58],
    popupAnchor: [0, -62],
  });
}
```

#### 🔹 `createUserPinIcon` Fonksiyonu (Bağımsız Kullanıcı Pini)
Kullanıcının haritada rastgele bir noktaya eklediği pinleri çizen fonksiyon:

```tsx
// app/TravelMap.tsx
function createUserPinIcon(type: "visited" | "wishlist" | "favorite") {
  const colors = {
    visited: "#10B981",  // Yeşil
    wishlist: "#F59E0B", // Turuncu/Amber
    favorite: "#F43F5E", // Pembe/Kırmızı
  };
  const icons = {
    visited: "✅",
    wishlist: "📌",
    favorite: "❤️",
  };
  return L.divIcon({
    className: "custom-user-pin",
    html: `
      <div class="user-pin-bubble" style="background: ${colors[type]};">
        <span>${icons[type]}</span>
      </div>
    `,
    iconAnchor: [16, 16], // 32x32 boyutundaki yuvarlağın tam ortasını koordinata hizalar
    iconSize: [32, 32],
    popupAnchor: [0, -20],
  });
}
```

#### 🔹 Üst Üste Binen Çift İkonları Engelleyen Filtreleme Mantığı
Şehir isim etiketinin (örn: `İstanbul [2]`) üzerine ikinci bir baloncuk çakışmasını engelleyen kod:

```tsx
// app/TravelMap.tsx (Satır 548 - 568)

{/* Kullanıcı Pinleri (Yalnızca şehir ve ülkelerle çakışmayan özel konumlar) */}
{userPins
  .filter((pin) => {
    // 1. Şehir koordinatları ile bu pin arasındaki farkı hesapla
    const isCityMatch = cities.some(
      (c) =>
        Math.abs(c.coordinates[0] - pin.lat) < 0.02 &&
        Math.abs(c.coordinates[1] - pin.lng) < 0.02,
    );
    // 2. Ülke koordinatları ile bu pin arasındaki farkı hesapla
    const isCountryMatch = countries.some(
      (c) =>
        Math.abs(c.koordinat[0] - pin.lat) < 0.02 &&
        Math.abs(c.koordinat[1] - pin.lng) < 0.02,
    );
    // 3. Eğer şehir veya ülke ile çakışmıyorsa SADECE O ZAMAN bağımsız pin olarak çiz!
    return !isCityMatch && !isCountryMatch;
  })
  .map((pin) => (
    <Marker
      icon={createUserPinIcon(pin.category)}
      key={pin.id}
      position={[pin.lat, pin.lng]}
    />
  ))
}
```

---

### 2️⃣ HARİTA PINLERİNİN FIRESTORE VE LOCALSTORAGE İLE SENKRONİZASYONU
**Dosya**: `app/page.tsx`

#### 🔹 Firestore'dan Canlı Dinleme ve Yükleme (`useEffect` & `onSnapshot`)

```tsx
// app/page.tsx (Satır 34 - 67)
useEffect(() => {
  // 1. Giriş yapılmamışsa misafir kayıtlarını yükle
  if (!user) {
    const saved = localStorage.getItem("whib_user_pins_guest");
    if (saved) {
      try { setUserPins(JSON.parse(saved)); } catch { setUserPins([]); }
    } else { setUserPins([]); }
    return;
  }

  const storageKey = `whib_user_pins_${user.uid}`;
  
  // 2. Önce yerel cihazdaki veriyi hızlıca yükle (ekran boş kalmasın)
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try { setUserPins(JSON.parse(saved)); } catch { setUserPins([]); }
  }

  // 3. Firestore veritabanına baglan ve CANLI dinle (onSnapshot)
  if (db) {
    try {
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (Array.isArray(data.pins)) {
              // Firestore'dan gelen pinleri state'e ve LocalStorage'a yaz
              setUserPins(data.pins);
              localStorage.setItem(storageKey, JSON.stringify(data.pins));
            }
          }
        },
        (err) => { console.warn("Firestore dinleme hatası:", err); }
      );
      // Ekrandan ayrılınca aboneliği kapat (bellek sızıntısını engeller)
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firestore bağlantı hatası:", err);
    }
  }
}, [user]);
```

#### 🔹 Yeni Pin Ekleme Fonksiyonu (`handleAddNewUserPin`)

```tsx
// app/page.tsx (Satır 90 - 110)
const handleAddNewUserPin = async (pinData: Omit<UserPin, "id">) => {
  if (!user) {
    setShowAuthModal(true); // Giriş yap modalını aç
    return;
  }

  // 1. Yeni pin nesnesi oluştur
  const newPin: UserPin = {
    ...pinData,
    id: `pin-${Date.now()}`,
  };

  // 2. Yeni pini dizinin en başına ekle
  const updated = [newPin, ...userPins];

  // 3. Anlık React State'ini ve LocalStorage'ı güncelle
  setUserPins(updated);
  const storageKey = `whib_user_pins_${user.uid}`;
  localStorage.setItem(storageKey, JSON.stringify(updated));

  // 4. Firestore veritabanına kaydet (merge: true var olan verileri korur)
  if (db) {
    try {
      await setDoc(doc(db, "users", user.uid), { pins: updated }, { merge: true });
    } catch (err) {
      console.error("Firestore pin kaydetme hatası:", err);
    }
  }
};
```

---

### 3️⃣ PROFİL FOTOĞRAFI VE AUTH SENKRONİZASYONU
**Dosya**: `app/profil/page.tsx`

```tsx
// app/profil/page.tsx (Satır 84 - 105)
const handleSavePhoto = async (photoUrl: string) => {
  // 1. Sayfa üzerindeki profil resmini anında değiştir
  setProfilePhoto(photoUrl);

  if (user) {
    // 2. LocalStorage'a kaydet
    localStorage.setItem(`whib_user_photo_${user.uid}`, photoUrl);

    // 3. Firebase Auth üzerindeki oturum profilinde günceller
    if (auth?.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL: photoUrl });
      } catch (err) {
        console.warn("Firebase Auth güncelleme hatası:", err);
      }
    }

    // 4. Firestore 'users' koleksiyonundaki dokümanı günceller
    if (db) {
      try {
        await setDoc(doc(db, "users", user.uid), { photoUrl }, { merge: true });
      } catch (err) {
        console.error("Firestore profil resmi kaydetme hatası:", err);
      }
    }
  }
  setShowPhotoModal(false); // Modalı kapat
};
```

---

### 4️⃣ TOPLULUK FORUM SOHBETLERİ VE CANLI DİNLEME
**Dosya**: `app/topluluk/page.tsx`

#### 🔹 Firestore `discussions` Koleksiyonunu Canlı Dinleme

```tsx
// app/topluluk/page.tsx (Satır 108 - 159)
useEffect(() => {
  if (db) {
    try {
      // discussions koleksiyonunu en yeniden en eskiye (createdAt desc) sorgula
      const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            // Firestore dokümanlarını DiscussionPost tipine dönüştür
            const remotePosts: DiscussionPost[] = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                id: docSnap.id,
                sehirId: data.sehirId || "eskisehir",
                mekan: data.mekan || "",
                yazar: data.yazar || "Gezgin",
                zaman: data.createdAt?.toDate
                  ? data.createdAt.toDate().toLocaleDateString("tr-TR")
                  : "Şimdi",
                metin: data.metin || "",
                cevap: data.cevap || 0,
                likes: data.likes || 0,
                category: data.category || "📍 Rota Tavsiyesi",
              };
            });

            // Gelen konuları başlangıç verileri ile birleştir
            const combined = [...remotePosts];
            BASLANGIC_KONUSMALARI.forEach((b) => {
              if (!combined.some((c) => c.id === b.id)) {
                combined.push(b);
              }
            });
            setKonusmalar(combined);
          }
        },
        (err) => { console.warn("Firestore sohbet dinleme hatası:", err); }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firestore bağlantı hatası:", err);
    }
  }
}, []);
```

#### 🔹 Beğeni Butonuna Basıldığında Firestore `increment` Kullanımı

```tsx
// app/topluluk/page.tsx (Satır 168 - 188)
const handleLike = async (postId: string) => {
  const isLikedNow = !likedPosts[postId];
  setLikedPosts((prev) => ({ ...prev, [postId]: isLikedNow }));

  // 1. Ekran üzerindeki beğeni sayısını anında artır/azalt
  setKonusmalar((prev) =>
    prev.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          likes: isLikedNow ? post.likes + 1 : Math.max(0, post.likes - 1),
        };
      }
      return post;
    }),
  );

  // 2. Firestore veritabanında atomik artırma/azaltma yap (increment)
  if (db && !postId.startsWith("post-") && !BASLANGIC_KONUSMALARI.some((b) => b.id === postId)) {
    try {
      const postRef = doc(db, "discussions", postId);
      await updateDoc(postRef, {
        likes: increment(isLikedNow ? 1 : -1), // Firestore sunucu seviyesinde güvenli işlem!
      });
    } catch (err) {
      console.error("Firestore beğeni hatası:", err);
    }
  }
};
```

---

### 5️⃣ MEKAN YORUMLARI VE YILDIZLI PUANLAMA
**Dosya**: `app/mekanlar/[sehirId]/MekanRehberiClient.tsx`

```tsx
// app/mekanlar/[sehirId]/MekanRehberiClient.tsx (Satır 41 - 83)

// 1. Seçilen mekanın (seciliMekan.id) yorumlarını Firestore 'place_reviews' koleksiyonundan süz
useEffect(() => {
  if (!db || !seciliMekan.id) return;

  try {
    const q = query(
      collection(db, "place_reviews"),
      where("placeId", "==", seciliMekan.id),
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remoteYorumlar: Yorum[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            yazar: data.yazar || "Gezgin Kullanıcı",
            puan: Number(data.puan) || 5,
            metin: data.metin || "",
            tarih: data.createdAt?.toDate
              ? data.createdAt.toDate().toLocaleDateString("tr-TR")
              : "Şimdi",
          };
        });

        setYorumlarMap((prev) => ({
          ...prev,
          [seciliMekan.id]: remoteYorumlar,
        }));
      }
    });
    return () => unsubscribe();
  } catch (err) {
    console.warn("Firestore mekan yorumları dinleme hatası:", err);
  }
}, [seciliMekan.id]);

// 2. Yeni Yorum Ekleme
const handleAddYorum = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!yeniMetin.trim()) return;

  const yazarAd = user?.displayName || user?.email?.split("@")[0] || "Gezgin Kullanıcı";
  
  if (db) {
    try {
      await addDoc(collection(db, "place_reviews"), {
        placeId: seciliMekan.id,
        yazar: yazarAd,
        puan: yeniPuan,
        metin: yeniMetin.trim(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Firestore yorum ekleme hatası:", err);
    }
  }

  setYeniMetin("");
  setYeniPuan(5);
};
```

---

### 6️⃣ GEZGİN ROTALARI VE YAYINLAMA
**Dosya**: `app/rotalar/page.tsx`

```tsx
// app/rotalar/page.tsx (Satır 72 - 138)

// 1. Canlı Rotaları Firestore 'routes' koleksiyonundan çekme
useEffect(() => {
  if (!db) return;

  try {
    const q = query(collection(db, "routes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remoteRoutes: Rota[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            baslik: data.baslik || "Gezi Rotası",
            sehirAd: data.sehirAd || "İstanbul",
            sure: data.sure || "1 Gün",
            kategori: data.kategori || "🏛️ Tarih & Kültür",
            yazar: data.yazar || "Gezgin Kullanıcı",
            duraklar: Array.isArray(data.duraklar) ? data.duraklar : ["Merkez"],
            ozet: data.ozet || "",
            likes: Number(data.likes) || 1,
          };
        });
        setRotalar(remoteRoutes);
      }
    });
    return () => unsubscribe();
  } catch (err) {
    console.warn("Firestore rotalar bağlantı hatası:", err);
  }
}, []);

// 2. Yeni Rota Oluşturma ve Firestore'a Kaydetme
const handleCreateRota = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!yeniBaslik.trim()) return;

  const yazarAd = user?.displayName || user?.email?.split("@")[0] || "Gezgin Kullanıcı";
  
  if (db) {
    try {
      await addDoc(collection(db, "routes"), {
        baslik: yeniBaslik.trim(),
        sehirAd: yeniSehir,
        sure: yeniSure,
        kategori: yeniKategori,
        yazar: yazarAd,
        duraklar: yeniDuraklar.split(",").map((d) => d.trim()).filter(Boolean),
        ozet: yeniOzet.trim() || "Özel gezgin rotası.",
        likes: 1,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Firestore rota ekleme hatası:", err);
    }
  }

  setShowModal(false); // Modalı kapat
};
```

---

## 🧠 3. Kod Okuma Becerisini Geliştirecek Anahtar İpuçları

1. **`onSnapshot` (Canlı Veri Dinleyici)**:
   Sayfayı yenilemeye gerek kalmadan veritabanında bir şey değiştiğinde ekrana yansımasını sağlar.
2. **`serverTimestamp()`**:
   Cihazın saatine güvenmek yerine veritabanı sunucusunun tam doğru saatini kaydeder.
3. **`increment(1)` / `increment(-1)`**:
   Beğeni sayısını okuyup +1 yapıp geri yazmak yerine veritabanına *"Beğeniyi 1 artır"* emri verir. Eşzamanlı isteklerde çakışmayı önler.
4. **`{ merge: true }`**:
   Mevcut nesnenin (dokümanın) içindeki verileri silmeden sadece yeni gönderilen alanları ekler veya günceller.
5. **`return () => unsubscribe()`**:
   React `useEffect` içindeki bu satır, kullanıcı o sayfadan başka bir sayfaya geçtiğinde arka planda çalışan veritabanı dinleyicisini durdurur ve bilgisayarın hafızasını korur.

---

Bu rehber projenizde `BUGUN_YAPILANLAR.md` dosyası olarak saklanmaktadır ve GitHub'a yüklenmiştir! İstediğiniz zaman dosyayı açıp kod parçalarını detaylıca inceleyebilirsiniz. 🚀

---

## 2026-07-26 Sonrasi Yapilan Ek Duzenlemeler

Bu bolum, GitHub'dan arkadasin ekledigi gelistirmeler cekildikten sonra bu oturumda yapilan ek duzenlemeleri ozetler. Ustteki mevcut notlara dokunulmadan en alta eklenmistir.

### 1. Firebase Auth ve Giris/Kayit Akisi

- Kayit islemi sonrasinda kullanicinin otomatik profilde kalmasi yerine cikis yapip giris sayfasina yonlendirilmesi saglandi.
- Giris sayfasina kayit basarili mesaji eklendi.
- Kullanici zaten girisliyse `/giris` sayfasinda kalmamasi, otomatik olarak `/profil` sayfasina yonlenmesi saglandi.
- Firebase Auth basarili olduktan sonra `users/{uid}` profil dokumani yazimi hata verse bile giris islemini bozmamasi icin Firestore profil senkronizasyonu ayri hata yakalama icine alindi.
- Demo oturumun Firebase aktifken gercek giris gibi davranmasi engellendi.

### 2. Firestore Koleksiyonlari ve Rules Uyumu

- Uygulamanin gercekte kullandigi koleksiyonlara gore yeni `firestore.rules` dosyasi olusturuldu ve guncellendi.
- Rules icine `users`, `discussions`, `discussion_replies`, `place_reviews`, `routes`, `contactMessages` ve `public_pins` koleksiyonlari eklendi.
- Eski koleksiyon adlariyla uyumluluk icin `reviews`, `communityPosts`, `communityComments` kurallari da korundu.
- Pin, topluluk yaniti, mekan yorumu, rota ve iletisim mesajlarinin Firestore tarafinda reddedilmesine neden olan koleksiyon/rules uyumsuzlugu duzeltildi.

### 3. Topluluk Sayfasi

- Topluluk sohbetleri icin gercek yanit sistemi eklendi.
- Yanitlar `discussion_replies` koleksiyonuna kaydedilecek sekilde baglandi.
- Sohbet yanit sayisi sahte/demo sayilar yerine gercek yanit listesinden okunacak hale getirildi.
- Yeni sohbet baslatildiktan sonra form alanlarinin temizlenmesi saglandi.
- Yanit eklerken cevap sayisi guncellemesi hata verse bile yanit kaydinin bozulmamasi icin sayac guncellemesi ayri hata yakalama icine alindi.
- Hata mesajlari daha okunur hale getirildi.

### 4. Profil ve Cikis Akisi

- Profil sayfasinda cikis yapildiginda kullanicinin ayni sayfada "giris yapmalisin" gorunumunde kalmasi yerine direkt `/giris` sayfasina yonlenmesi saglandi.
- Kullanici girisli degilken profil sayfasina giderse yine giris sayfasina yonlendirme eklendi.

### 5. Iletisim Sayfasi

- Iletisim formu sadece arayuz prototipi olmaktan cikarildi.
- Giris yapan kullanicilarin onerilerini veya sikayetlerini `contactMessages` koleksiyonuna kaydetmesi saglandi.

### 6. Test ve Kontrol

- Yapilan duzenlemelerden sonra `npm.cmd test` calistirildi.
- Build ve render testleri basarili gecti.
- Son kontrolde 5 testin 5'i basariliydi.

### Not

Firebase Console'daki Firestore Rules kismi mutlaka guncel `firestore.rules` dosyasindaki icerikle degistirilmelidir. Aksi halde ozellikle `public_pins` ve `discussion_replies` koleksiyonlarina yazma islemleri Firestore tarafindan reddedilir.
