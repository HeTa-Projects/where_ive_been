# 📘 Where I've Been — Kod İnceleme & Öğrenim Rehberi

Bu belge, **Where I've Been** projesinde bugün yaptığımız tüm geliştirmeleri, dosya dosya, fonksiyon fonksiyon ve satır satır mantıklarıyla açıklamak üzere hazırlanmıştır. Kod okuma ve mimari anlama yeteneğini geliştirmek için rehber niteliğindedir.

---

## 📂 1. Dosya ve Mimari Haritası

| Dosya Yolu | Görevi ve Sorumluluğu |
| :--- | :--- |
| [app/TravelMap.tsx](file:///c:/Users/Taha%20Emre/Desktop/WHIB/where_ive_been/app/TravelMap.tsx) | Leaflet haritası, ülke/şehir marker'ları, pin ikonlarının çizimi ve pop-up kartları. |
| [app/globals.css](file:///c:/Users/Taha%20Emre/Desktop/WHIB/where_ive_been/app/globals.css) | Tüm uygulamanın karanlık cam (Glassmorphism) stil sistemi, pinlerin renkleri ve konumlandırmaları. |
| [app/page.tsx](file:///c:/Users/Taha%20Emre/Desktop/WHIB/where_ive_been/app/page.tsx) | Ana sayfa. Harita ile kullanıcı pinlerinin Firestore ve LocalStorage arasında senkronize edilmesi. |
| [app/firebase.ts](file:///c:/Users/Taha%20Emre/Desktop/WHIB/where_ive_been/app/firebase.ts) | Firebase App, Auth ve Firestore bağlantısının ilklendirildiği temel konfigürasyon. |
| [app/AuthProvider.tsx](file:///c:/Users/Taha%20Emre/Desktop/WHIB/where_ive_been/app/AuthProvider.tsx) | Kullanıcı oturum durumunu (`user`, `loading`) tüm uygulamaya sağlayan React Context Provider. |
| [app/profil/page.tsx](file:///c:/Users/Taha%20Emre/Desktop/WHIB/where_ive_been/app/profil/page.tsx) | Profil sayfası. Profil resmi güncelleme, rozetler, gezilen yerler istatistikleri ve pin silme. |
| [app/topluluk/page.tsx](file:///c:/Users/Taha%20Emre/Desktop/WHIB/where_ive_been/app/topluluk/page.tsx) | Gezgin forumu. Konu açma, şehir filtresi ve beğeni işlemlerinin Firestore `discussions` koleksiyonu ile senkronizasyonu. |
| [app/mekanlar/[sehirId]/MekanRehberiClient.tsx](file:///c:/Users/Taha%20Emre/Desktop/WHIB/where_ive_been/app/mekanlar/%5BsehirId%5D/MekanRehberiClient.tsx) | Şehir mekan rehberi ve mekan bazlı canlı kullanıcı yorumları (`place_reviews` koleksiyonu). |
| [app/rotalar/page.tsx](file:///c:/Users/Taha%20Emre/Desktop/WHIB/where_ive_been/app/rotalar/page.tsx) | Rota yayınlama, liste filtreleme ve beğeni sistemi (`routes` koleksiyonu). |

---

## 🛠️ 2. Bugün Yapılan Değişiklikler ve Kod Mantıkları

### 📍 A. Harita Pin Tasarımı & Çakışma Engelleme (`TravelMap.tsx` & `globals.css`)

#### Problem:
Kullanıcı bir şehre pin eklediğinde (Örn: İstanbul'a "📌 Rota Listemde"), Leaflet hem şehir etiketini (`cpin-city`) hem de eklenen kullanıcı pinini (`user-pin-bubble`) tam olarak aynı koordinatta çiziyordu. Bu durum, turuncu/pembe çemberlerin şehir adının (örn: `İstanbul [2]`) **tam üstüne binmesine ve metni kapatmasına** yol açıyordu.

#### Çözüm ve Kod Mantığı:
1. **İkonların Yuvarlağın İçine Alınması**:
   `createCityIcon` fonksiyonunda durum sembolü (`markSymbol`) harita marker'ının en üstündeki çember olan `.cpin-marker` içine yerleştirildi.
   ```tsx
   // TravelMap.tsx
   const markSymbol =
     mark === "visited"
       ? "✅"
       : mark === "wishlist"
       ? "📌"
       : mark === "favorite"
       ? "❤️"
       : null;

   const dotContent = markSymbol
     ? `<span class="cpin-mark-emoji">${markSymbol}</span>`
     : flagUrl
     ? `<img src="${flagUrl}" class="cpin-marker-flag" />`
     : `<span class="cpin-marker-dot">●</span>`;
   ```
2. **Çakışan İkinci Pinlerin Filtrelenmesi**:
   Harita üzerinde halihazırda gösterilen bir şehir veya ülke ile aynı koordinata sahip kullanıcı pinlerinin (`userPins`), şehir adının üzerinde ikinci bir balon çizmesi engellendi:
   ```tsx
   // TravelMap.tsx
   {userPins
     .filter((pin) => {
       const isCityMatch = cities.some(
         (c) =>
           Math.abs(c.coordinates[0] - pin.lat) < 0.02 &&
           Math.abs(c.coordinates[1] - pin.lng) < 0.02,
       );
       return !isCityMatch;
     })
     .map((pin) => (
       <Marker icon={createUserPinIcon(pin.category)} position={[pin.lat, pin.lng]} />
     ))
   }
   ```
   *Kod Okuma Notu*: `Math.abs(c.coordinates[0] - pin.lat) < 0.02` ifadesi, iki koordinat arasındaki farkın çok küçük (neredeyse aynı nokta) olup olmadığını kontrol eder.

---

### 🗺️ B. Harita Pinlerinin Firestore Senkronizasyonu (`app/page.tsx`)

#### Yapılan İşlem:
Kullanıcı haritada "✅ Gittim", "📌 Rota Listemde" veya "❤️ Favorim" butonlarına bastığında pini hem anlık React state'ine, hem cihazın `localStorage` depolamasına, hem de Firebase Firestore veritabanına kaydettik.

#### Kod İncelemesi:
```tsx
// app/page.tsx
useEffect(() => {
  if (!user) return;

  const storageKey = `whib_user_pins_${user.uid}`;
  
  if (db) {
    const userRef = doc(db, "users", user.uid);
    // onSnapshot: Firestore verisi değiştikçe (canlı) çalışır!
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.pins)) {
          setUserPins(data.pins);
          localStorage.setItem(storageKey, JSON.stringify(data.pins));
        }
      }
    });
    // Component ekrandan kalkınca (unmount) dinleyiciyi kapat:
    return () => unsubscribe();
  }
}, [user]);
```
*Kod Okuma Notu*: `onSnapshot` fonksiyonu Firestore'dan veriyi **canlı (real-time)** çeker. `return () => unsubscribe()` satırı ise bellek sızıntısını (memory leak) önlemek için aboneliği sonlandırır.

---

### 👤 C. Profil Resmi ve Auth Senkronizasyonu (`app/profil/page.tsx`)

#### Yapılan İşlem:
Profil resmi güncellendiğinde hem Firebase Auth kullanıcı profilinde (`updateProfile`), hem Firestore `users/{uid}` dokümanında (`photoUrl`), hem de yerel hafızada güncellenmesi sağlandı.

#### Kod İncelemesi:
```tsx
// app/profil/page.tsx
const handleSavePhoto = async (photoUrl: string) => {
  setProfilePhoto(photoUrl); // 1. Ekranda anında güncelle
  if (user) {
    localStorage.setItem(`whib_user_photo_${user.uid}`, photoUrl); // 2. LocalStorage
    
    if (auth?.currentUser) {
      try {
        await updateProfile(auth.currentUser, { photoURL: photoUrl }); // 3. Firebase Auth
      } catch (err) {
        console.warn(err);
      }
    }
    if (db) {
      try {
        // 4. Firestore dokümanını birleştir (merge: true var olan diğer verileri korur)
        await setDoc(doc(db, "users", user.uid), { photoUrl }, { merge: true });
      } catch (err) {
        console.error(err);
      }
    }
  }
};
```
*Kod Okuma Notu*: `{ merge: true }` parametresi çok önemlidir! Eğer `merge: true` koymazsanız `users/{uid}` içindeki `pins` veya diğer alanlar silinip sadece `photoUrl` kalır. `merge: true` ise var olan verilerin üzerine yeni alanı ekler/günceller.

---

### 💬 D. Topluluk Sohbetleri & Beğeni Sayacı (`app/topluluk/page.tsx`)

#### Yapılan İşlem:
Topluluk sayfasında açılan sohbet başlıkları Firestore `discussions` koleksiyonundan tarihe göre azalan sırayla (`orderBy("createdAt", "desc")`) canlı olarak çekildi. Beğeni butonuna basıldığında Firestore `increment` fonksiyonu kullanıldı.

#### Kod İncelemesi:
```tsx
// app/topluluk/page.tsx

// 1. Yeni Konu Ekleme (addDoc)
await addDoc(collection(db, "discussions"), {
  sehirId: sehirId,
  mekan: mekanAd,
  yazar: yazarAd,
  metin: yeniMetin.trim(),
  cevap: 0,
  likes: 1,
  category: yeniCategory,
  createdAt: serverTimestamp(), // Sunucu saati kullanımı
});

// 2. Beğeni Sayısını Artırma / Azaltma (updateDoc + increment)
const postRef = doc(db, "discussions", postId);
await updateDoc(postRef, {
  likes: increment(isLikedNow ? 1 : -1), // Firestore içinde güvenli matematiksel işlem
});
```
*Kod Okuma Notu*: `increment(1)` veya `increment(-1)` kullanmak, birden fazla kullanıcı aynı anda beğendiğinde çakışmaları engeller ve veritabanı seviyesinde toplama/çıkarma yapar.

---

### 🏛️ E. Mekan Yorumları (`MekanRehberiClient.tsx`)

#### Yapılan İşlem:
Mekan rehberi sayfasında seçilen mekana (`seciliMekan.id`) göre `place_reviews` koleksiyonundan yorumlar süzüldü (`where("placeId", "==", seciliMekan.id)`).

```tsx
// MekanRehberiClient.tsx
const q = query(
  collection(db, "place_reviews"),
  where("placeId", "==", seciliMekan.id)
);
```

---

## 💡 3. Kod Okuma Yeterliliğini Geliştirecek Temel Kalıplar (Design Patterns)

1. **State Immutability (Değişmezlik)**:
   React'te bir diziyi veya nesneyi güncellerken doğrudan `array.push()` yapmak yerine yeni bir dizi kopyası oluştururuz:
   ```tsx
   setKonusmalar((prev) => [newPost, ...prev]); // En üste ekler
   ```
2. **Offline Fallback (Çevrimdışı / Hata Toleransı)**:
   İnternet veya Firebase yapılandırması olmasa bile uygulamanın çökmemesi için `try-catch` ve `localStorage` ile yedek veriler kullanılır.
3. **Async / Await Mantığı**:
   Veritabanı veya ağ işlemleri zaman alacağı için `async` fonksiyonlar yazılır ve işlem bitene kadar `await` ile beklenir.

---

Bu doküman projenizin ana dizininde `BUGUN_YAPILANLAR.md` olarak kaydedilmiştir. İnceleyerek kod yapısını rahatlıkla takip edebilirsiniz! 🚀
