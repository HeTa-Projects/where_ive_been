export type Yorum = {
  id: string;
  yazar: string;
  puan: number;
  metin: string;
  tarih: string;
};

export type Mekan = {
  id: string;
  ad: string;
  tur: string;
  puan: number;
  yorumSayisi: number;
  ozet: string;
  yorumlar: Yorum[];
};

export type Sehir = {
  id: string;
  ad: string;
  ulke: string;
  koordinat: [number, number];
  ziyaretSayisi: number;
  ozet: string;
  etiketler: string[];
  mekanlar: Mekan[];
};

export const sehirler: Sehir[] = [
  {
    id: "istanbul",
    ad: "İstanbul",
    ulke: "Türkiye",
    koordinat: [41.0082, 28.9784],
    ziyaretSayisi: 128,
    ozet:
      "Tarihi yarımada, sahil rotaları ve mahalle keşifleriyle en çok yorumlanan şehirlerden biri.",
    etiketler: ["Tarih", "Sokak", "Deniz"],
    mekanlar: [
      {
        id: "balat",
        ad: "Balat Sokakları",
        tur: "Mahalle",
        puan: 4.7,
        yorumSayisi: 42,
        ozet: "Renkli evler, kahve durakları ve uzun yürüyüşler için güzel.",
        yorumlar: [
          {
            id: "balat-1",
            yazar: "Ece",
            puan: 5,
            metin: "Sabah erken gidince çok daha sakin. Fotoğraf ve kahve için ideal.",
            tarih: "2 gün önce",
          },
          {
            id: "balat-2",
            yazar: "Kerem",
            puan: 4,
            metin: "Hafta sonu kalabalık ama ara sokaklarda hâlâ güzel yerler var.",
            tarih: "1 hafta önce",
          },
        ],
      },
      {
        id: "arkeoloji",
        ad: "İstanbul Arkeoloji Müzeleri",
        tur: "Müze",
        puan: 4.8,
        yorumSayisi: 31,
        ozet: "Yarım gün ayırmaya değer, özellikle tarih sevenler için.",
        yorumlar: [
          {
            id: "arkeoloji-1",
            yazar: "Mina",
            puan: 5,
            metin: "Koleksiyon çok zengin. Sessiz gezmek isteyenlere hafta içi öneririm.",
            tarih: "3 gün önce",
          },
        ],
      },
      {
        id: "moda",
        ad: "Moda Sahili",
        tur: "Sahil",
        puan: 4.5,
        yorumSayisi: 55,
        ozet: "Gün batımı ve sakin mola için topluluğun favorilerinden.",
        yorumlar: [
          {
            id: "moda-1",
            yazar: "Deniz",
            puan: 4,
            metin: "Yürüyüş rotası çok keyifli, akşam saatlerinde yer bulmak zor olabilir.",
            tarih: "5 gün önce",
          },
        ],
      },
    ],
  },
  {
    id: "izmir",
    ad: "İzmir",
    ulke: "Türkiye",
    koordinat: [38.4237, 27.1428],
    ziyaretSayisi: 74,
    ozet:
      "Kordon, çarşılar ve yakın kaçamaklarla rahat tempolu gezi notları için ideal.",
    etiketler: ["Sahil", "Yemek", "Çarşı"],
    mekanlar: [
      {
        id: "kemeralti",
        ad: "Kemeraltı Çarşısı",
        tur: "Çarşı",
        puan: 4.6,
        yorumSayisi: 28,
        ozet: "Kaybolarak gezmesi keyifli, yemek durakları bol.",
        yorumlar: [
          {
            id: "kemeralti-1",
            yazar: "Mert",
            puan: 5,
            metin: "Kahve ve tatlı için çok iyi küçük duraklar var.",
            tarih: "Bugün",
          },
        ],
      },
      {
        id: "alsancak",
        ad: "Alsancak Kordon",
        tur: "Yürüyüş",
        puan: 4.4,
        yorumSayisi: 36,
        ozet: "Deniz kenarında uzun oturmalık klasik İzmir rotası.",
        yorumlar: [
          {
            id: "alsancak-1",
            yazar: "Seda",
            puan: 4,
            metin: "Gün batımında harika, kalabalık beklemek lazım.",
            tarih: "4 gün önce",
          },
        ],
      },
    ],
  },
  {
    id: "ankara",
    ad: "Ankara",
    ulke: "Türkiye",
    koordinat: [39.9334, 32.8597],
    ziyaretSayisi: 51,
    ozet:
      "Müze, tarih ve sanat duraklarını düzenli listelerle keşfetmek isteyenler için.",
    etiketler: ["Müze", "Tarih", "Sanat"],
    mekanlar: [
      {
        id: "anitkabir",
        ad: "Anıtkabir",
        tur: "Tarih",
        puan: 4.9,
        yorumSayisi: 64,
        ozet: "İlk kez gelen herkesin listesindeki en güçlü durak.",
        yorumlar: [
          {
            id: "anitkabir-1",
            yazar: "Can",
            puan: 5,
            metin: "Çok etkileyici. Müze kısmına ayrıca zaman ayırmak gerekiyor.",
            tarih: "1 gün önce",
          },
        ],
      },
      {
        id: "cer-modern",
        ad: "CerModern",
        tur: "Sanat",
        puan: 4.3,
        yorumSayisi: 19,
        ozet: "Sergi takvimine göre tekrar tekrar gidilebilir.",
        yorumlar: [
          {
            id: "cer-1",
            yazar: "Eylül",
            puan: 4,
            metin: "Sergiler değiştikçe tekrar bakmaya değer.",
            tarih: "2 hafta önce",
          },
        ],
      },
    ],
  },
  {
    id: "antalya",
    ad: "Antalya",
    ulke: "Türkiye",
    koordinat: [36.8969, 30.7133],
    ziyaretSayisi: 93,
    ozet:
      "Kaleiçi, falezler ve doğal rotalarla yaz kış gezi önerisi biriken şehir.",
    etiketler: ["Doğa", "Sahil", "Eski kent"],
    mekanlar: [
      {
        id: "kaleici",
        ad: "Kaleiçi",
        tur: "Tarihi merkez",
        puan: 4.6,
        yorumSayisi: 47,
        ozet: "Dar sokaklar, liman ve akşam yürüyüşü bir arada.",
        yorumlar: [
          {
            id: "kaleici-1",
            yazar: "Deniz",
            puan: 5,
            metin: "Akşamüstü limana inen sokaklar çok güzel.",
            tarih: "6 gün önce",
          },
        ],
      },
      {
        id: "duden",
        ad: "Düden Şelalesi",
        tur: "Doğa",
        puan: 4.5,
        yorumSayisi: 33,
        ozet: "Kısa gezi planlarında bile eklenebilecek ferah bir rota.",
        yorumlar: [
          {
            id: "duden-1",
            yazar: "Arda",
            puan: 4,
            metin: "Fotoğraf için güzel, hafta içi daha rahat geziliyor.",
            tarih: "1 hafta önce",
          },
        ],
      },
    ],
  },
  {
    id: "eskisehir",
    ad: "Eskişehir",
    ulke: "Türkiye",
    koordinat: [39.7767, 30.5206],
    ziyaretSayisi: 46,
    ozet:
      "Kompakt merkez, öğrenci enerjisi ve yürüyerek gezilen duraklarla kolay keşif.",
    etiketler: ["Kanal", "Kahve", "Müze"],
    mekanlar: [
      {
        id: "odunpazari",
        ad: "Odunpazarı Evleri",
        tur: "Tarihi bölge",
        puan: 4.7,
        yorumSayisi: 29,
        ozet: "Renkli sokaklar, butik müzeler ve fotoğraf için güçlü bir rota.",
        yorumlar: [
          {
            id: "odunpazari-1",
            yazar: "Selin",
            puan: 5,
            metin: "OMM ile aynı güne rahat sığıyor. Sokaklarda dolaşmak çok keyifli.",
            tarih: "Bugün",
          },
          {
            id: "odunpazari-2",
            yazar: "Berk",
            puan: 4,
            metin: "Hafta sonu kalabalık ama tarihi doku çok güzel korunmuş.",
            tarih: "3 gün önce",
          },
        ],
      },
      {
        id: "porsuk",
        ad: "Porsuk Çayı",
        tur: "Yürüyüş",
        puan: 4.4,
        yorumSayisi: 24,
        ozet: "Merkezde rahat bir mola, kafe ve köprü duraklarıyla birlikte güzel.",
        yorumlar: [
          {
            id: "porsuk-1",
            yazar: "Yağmur",
            puan: 4,
            metin: "Akşam ışıklarıyla çok daha güzel görünüyor.",
            tarih: "5 gün önce",
          },
        ],
      },
      {
        id: "omm",
        ad: "Odunpazarı Modern Müze",
        tur: "Müze",
        puan: 4.8,
        yorumSayisi: 18,
        ozet: "Mimari ve sergiler birlikte düşünülünce şehri özel hissettiriyor.",
        yorumlar: [
          {
            id: "omm-1",
            yazar: "İrem",
            puan: 5,
            metin: "Bina tek başına bile görülmeye değer. Sergileri de çok iyi seçilmiş.",
            tarih: "2 gün önce",
          },
        ],
      },
    ],
  },
];

export function sehirBul(sehirId: string | undefined) {
  return sehirler.find((sehir) => sehir.id === sehirId) ?? sehirler[0];
}
