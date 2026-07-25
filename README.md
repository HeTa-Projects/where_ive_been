# Where I've Been

Gezilen sehirleri, mekan yorumlarini, puanlari ve topluluk paylasimlarini
toplayan web uygulamasi iskeleti.

## Kullanilan Teknolojiler

- React ile arayuz
- TypeScript / TSX ile ekran kodlari
- CSS ile tasarim
- Vinext ile yerel calistirma ve build
- Firebase Authentication ve Firestore sonraki adim olarak eklenecek

## Nasil Calistirilir?

```bash
npm.cmd install
npm.cmd run dev
```

Sonra tarayicida su adresi ac:

```txt
http://localhost:3000/
```

## Ana Dosyalar

- `app/page.tsx`: Ana ekran, sehirler, mekanlar ve topluluk ornek verileri
- `app/globals.css`: Sayfanin gorunumu ve mobil uyumu
- `app/layout.tsx`: Site basligi ve genel sayfa yapisi

## Sonraki Adimlar

- Firebase projesi acmak
- Firebase Authentication ile kullanici girisi eklemek
- Firestore koleksiyonlarini olusturmak:
  - `users`
  - `cities`
  - `places`
  - `reviews`
  - `communityPosts`
- Harita icin Leaflet veya Mapbox eklemek
