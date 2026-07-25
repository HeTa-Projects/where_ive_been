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
  ulkeId: string;
  koordinat: [number, number];
  ziyaretSayisi: number;
  ozet: string;
  etiketler: string[];
  mekanlar: Mekan[];
};

export type Ulke = {
  id: string;
  ad: string;
  bayrak: string;
  koordinat: [number, number];
  zoom: number;
  sehirSayisi: number;
  ziyaretSayisi: number;
};

export const ulkeler: Ulke[] = [
  {
    id: "turkiye",
    ad: "Türkiye",
    bayrak: "🇹🇷",
    koordinat: [39.0, 35.2],
    zoom: 6,
    sehirSayisi: 7,
    ziyaretSayisi: 450,
  },
  {
    id: "italya",
    ad: "İtalya",
    bayrak: "🇮🇹",
    koordinat: [41.8719, 12.5674],
    zoom: 6,
    sehirSayisi: 4,
    ziyaretSayisi: 280,
  },
  {
    id: "japonya",
    ad: "Japonya",
    bayrak: "🇯🇵",
    koordinat: [36.2048, 138.2529],
    zoom: 6,
    sehirSayisi: 3,
    ziyaretSayisi: 195,
  },
  {
    id: "fransa",
    ad: "Fransa",
    bayrak: "🇫🇷",
    koordinat: [46.2276, 2.2137],
    zoom: 6,
    sehirSayisi: 3,
    ziyaretSayisi: 220,
  },
  {
    id: "ispanya",
    ad: "İspanya",
    bayrak: "🇪🇸",
    koordinat: [40.4637, -3.7492],
    zoom: 6,
    sehirSayisi: 2,
    ziyaretSayisi: 175,
  },
  {
    id: "abd",
    ad: "ABD",
    bayrak: "🇺🇸",
    koordinat: [37.0902, -95.7129],
    zoom: 4,
    sehirSayisi: 3,
    ziyaretSayisi: 310,
  },
  {
    id: "ingiltere",
    ad: "İngiltere",
    bayrak: "🇬🇧",
    koordinat: [52.3555, -1.1743],
    zoom: 6,
    sehirSayisi: 2,
    ziyaretSayisi: 160,
  },
  {
    id: "almanya",
    ad: "Almanya",
    bayrak: "🇩🇪",
    koordinat: [51.1657, 10.4515],
    zoom: 6,
    sehirSayisi: 2,
    ziyaretSayisi: 140,
  },
  {
    id: "yunanistan",
    ad: "Yunanistan",
    bayrak: "🇬🇷",
    koordinat: [39.0742, 21.8243],
    zoom: 6,
    sehirSayisi: 2,
    ziyaretSayisi: 130,
  },
  {
    id: "misir",
    ad: "Mısır",
    bayrak: "🇪🇬",
    koordinat: [26.8206, 30.8025],
    zoom: 6,
    sehirSayisi: 2,
    ziyaretSayisi: 110,
  },
];

export const sehirler: Sehir[] = [
  // 🇹🇷 TÜRKİYE
  {
    id: "istanbul",
    ad: "İstanbul",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [41.0082, 28.9784],
    ziyaretSayisi: 128,
    ozet: "Tarihi yarımada, sahil rotaları ve mahalle keşifleriyle en çok yorumlanan şehirlerden biri.",
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
          { id: "balat-1", yazar: "Ece", puan: 5, metin: "Kahve ve fotoğraf için ideal.", tarih: "2 gün önce" },
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
          { id: "arkeoloji-1", yazar: "Mina", puan: 5, metin: "Koleksiyon çok zengin.", tarih: "3 gün önce" },
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
          { id: "moda-1", yazar: "Deniz", puan: 4, metin: "Yürüyüş rotası çok keyifli.", tarih: "5 gün önce" },
        ],
      },
    ],
  },
  {
    id: "izmir",
    ad: "İzmir",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [38.4237, 27.1428],
    ziyaretSayisi: 74,
    ozet: "Kordon, çarşılar ve yakın kaçamaklarla rahat tempolu gezi rotası.",
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
          { id: "kemeralti-1", yazar: "Mert", puan: 5, metin: "Dibek kahvesi efsane.", tarih: "Bugün" },
        ],
      },
    ],
  },
  {
    id: "ankara",
    ad: "Ankara",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [39.9334, 32.8597],
    ziyaretSayisi: 51,
    ozet: "Müze, tarih ve sanat duraklarını düzenli listelerle keşfetmek isteyenler için.",
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
          { id: "anitkabir-1", yazar: "Can", puan: 5, metin: "Çok etkileyici.", tarih: "1 gün önce" },
        ],
      },
    ],
  },
  {
    id: "antalya",
    ad: "Antalya",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [36.8969, 30.7133],
    ziyaretSayisi: 93,
    ozet: "Kaleiçi, falezler ve doğal rotalarla deniz ve tarih şehri.",
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
          { id: "kaleici-1", yazar: "Deniz", puan: 5, metin: "Liman manzarası harika.", tarih: "6 gün önce" },
        ],
      },
    ],
  },
  {
    id: "eskisehir",
    ad: "Eskişehir",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [39.7767, 30.5206],
    ziyaretSayisi: 46,
    ozet: "Kompakt merkez, öğrenci enerjisi ve Porsuk çayı yürüyüşleri.",
    etiketler: ["Kanal", "Kahve", "Müze"],
    mekanlar: [
      {
        id: "odunpazari",
        ad: "Odunpazarı Evleri",
        tur: "Tarihi bölge",
        puan: 4.7,
        yorumSayisi: 29,
        ozet: "Renkli sokaklar ve müzeler.",
        yorumlar: [
          { id: "odunpazari-1", yazar: "Selin", puan: 5, metin: "Fotoğraf için çok güzel.", tarih: "Bugün" },
        ],
      },
    ],
  },
  {
    id: "trabzon",
    ad: "Trabzon",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [41.0027, 39.7168],
    ziyaretSayisi: 38,
    ozet: "Sümela Manastırı, Uzungöl ve Karadeniz yayla keşifleri.",
    etiketler: ["Yayla", "Doğa", "Tarih"],
    mekanlar: [
      {
        id: "sumela",
        ad: "Sümela Manastırı",
        tur: "Antik Manastır",
        puan: 4.9,
        yorumSayisi: 35,
        ozet: "Kayalara oyulmuş tarihi mimari harikası.",
        yorumlar: [
          { id: "sumela-1", yazar: "Taha", puan: 5, metin: "Sisli havada büyüleyici.", tarih: "3 gün önce" },
        ],
      },
    ],
  },
  {
    id: "kapadokya",
    ad: "Nevşehir (Kapadokya)",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [38.6431, 34.8289],
    ziyaretSayisi: 85,
    ozet: "Peri bacaları, balon turları ve yeraltı şehirleri rotası.",
    etiketler: ["Balon", "Vadiler", "Tarih"],
    mekanlar: [
      {
        id: "goreme",
        ad: "Göreme Açık Hava Müzesi",
        tur: "Vadiler",
        puan: 4.9,
        yorumSayisi: 60,
        ozet: "Kaya kiliseleri ve balon izleme tepeleri.",
        yorumlar: [
          { id: "goreme-1", yazar: "Naz", puan: 5, metin: "Gündoğumunda balonlar eşsiz.", tarih: "Dün" },
        ],
      },
    ],
  },

  // 🇮🇹 İTALYA
  {
    id: "roma",
    ad: "Roma",
    ulke: "İtalya",
    ulkeId: "italya",
    koordinat: [41.9028, 12.4964],
    ziyaretSayisi: 95,
    ozet: "Kolezyum, Aşk Çeşmesi ve bin yıllık tarihiyle açık hava müzesi şehir.",
    etiketler: ["Tarih", "Sanat", "Pizza"],
    mekanlar: [
      {
        id: "kolezyum",
        ad: "Kolezyum (Colosseum)",
        tur: "Antik Yapı",
        puan: 4.9,
        yorumSayisi: 88,
        ozet: "Dünyanın en ikonik amfitiyatrosu.",
        yorumlar: [
          { id: "roma-1", yazar: "Aylin", puan: 5, metin: "Büyüleyici atmosfer.", tarih: "3 gün önce" },
        ],
      },
    ],
  },
  {
    id: "venedik",
    ad: "Venedik",
    ulke: "İtalya",
    ulkeId: "italya",
    koordinat: [45.4408, 12.3155],
    ziyaretSayisi: 50,
    ozet: "Kanallar, gondol turları ve San Marco Meydanı ile romantik kaçamak.",
    etiketler: ["Kanal", "Gondol", "Romantik"],
    mekanlar: [
      {
        id: "san-marco",
        ad: "San Marco Meydanı",
        tur: "Meydan & Bazilika",
        puan: 4.8,
        yorumSayisi: 45,
        ozet: "Venedik'in kalbi meşhur meydan.",
        yorumlar: [
          { id: "ven-1", yazar: "Kaan", puan: 5, metin: "Canlı müzik ve espresso harika.", tarih: "1 hafta önce" },
        ],
      },
    ],
  },
  {
    id: "floransa",
    ad: "Floransa",
    ulke: "İtalya",
    ulkeId: "italya",
    koordinat: [43.7696, 11.2558],
    ziyaretSayisi: 70,
    ozet: "Rönesansın doğduğu yer: Duomo Katedrali ve Uffizi Galerisi.",
    etiketler: ["Rönesans", "Sanat", "Köprü"],
    mekanlar: [
      {
        id: "duomo-flo",
        ad: "Floransa Duomo Katedrali",
        tur: "Katedral",
        puan: 4.9,
        yorumSayisi: 54,
        ozet: "Kubbesine çıkıp şehri izleyin.",
        yorumlar: [
          { id: "flo-1", yazar: "Burak", puan: 5, metin: "Kubbe manzarası 10/10.", tarih: "4 gün önce" },
        ],
      },
    ],
  },
  {
    id: "milano",
    ad: "Milano",
    ulke: "İtalya",
    ulkeId: "italya",
    koordinat: [45.4642, 9.19],
    ziyaretSayisi: 65,
    ozet: "Moda, tasarım ve meşhur Duomo di Milano katedrali.",
    etiketler: ["Moda", "Alışveriş", "Katedral"],
    mekanlar: [
      {
        id: "duomo-milano",
        ad: "Duomo di Milano",
        tur: "Gotik Katedral",
        puan: 4.8,
        yorumSayisi: 62,
        ozet: "Gotik mimarinin en görkemli yapılarından biri.",
        yorumlar: [
          { id: "mil-1", yazar: "Cem", puan: 5, metin: "Teras alanı harika.", tarih: "2 gün önce" },
        ],
      },
    ],
  },

  // 🇯🇵 JAPONYA
  {
    id: "tokyo",
    ad: "Tokyo",
    ulke: "Japonya",
    ulkeId: "japonya",
    koordinat: [35.6762, 139.6503],
    ziyaretSayisi: 62,
    ozet: "Gökdelenler, neon ışıklar, Tapınaklar ve teknoloji şehri.",
    etiketler: ["Teknoloji", "Sushi", "Neon"],
    mekanlar: [
      {
        id: "shibuya",
        ad: "Shibuya Yaya Geçidi",
        tur: "Şehir Merkezi",
        puan: 4.8,
        yorumSayisi: 52,
        ozet: "Dünyanın en kalabalık yaya geçidi ve Hachiko heykeli.",
        yorumlar: [
          { id: "tok-1", yazar: "Yusuf", puan: 5, metin: "İnanılmaz bir atmosfer.", tarih: "4 gün önce" },
        ],
      },
    ],
  },
  {
    id: "kyoto",
    ad: "Kyoto",
    ulke: "Japonya",
    ulkeId: "japonya",
    koordinat: [35.0116, 135.7681],
    ziyaretSayisi: 48,
    ozet: "Geleneksel tapınaklar, Bambu Ormanı ve Geisha sokakları.",
    etiketler: ["Tapınak", "Bambu", "Geleneksel"],
    mekanlar: [
      {
        id: "arashiyama",
        ad: "Arashiyama Bambu Ormanı",
        tur: "Doğa & Rota",
        puan: 4.9,
        yorumSayisi: 41,
        ozet: "Dev bambu ağaçları arasında huzurlu yürüyüş.",
        yorumlar: [
          { id: "kyo-1", yazar: "Leyla", puan: 5, metin: "Masalsı bir yürüyüş yolu.", tarih: "1 hafta önce" },
        ],
      },
    ],
  },
  {
    id: "osaka",
    ad: "Osaka",
    ulke: "Japonya",
    ulkeId: "japonya",
    koordinat: [34.6937, 135.5023],
    ziyaretSayisi: 40,
    ozet: "Sokak lezzetleri, Dotonbori kanalı ve Osaka Kalesi.",
    etiketler: ["Sokak Lezzeti", "Kale", "Kanal"],
    mekanlar: [
      {
        id: "dotonbori",
        ad: "Dotonbori Çarşısı",
        tur: "Sokak Lezzetleri",
        puan: 4.8,
        yorumSayisi: 39,
        ozet: "Takoyaki ve neon tabelalar eşliğinde lezzet turu.",
        yorumlar: [
          { id: "osa-1", yazar: "Oğuz", puan: 5, metin: "Yemekler harikaydı.", tarih: "5 gün önce" },
        ],
      },
    ],
  },

  // 🇫🇷 FRANSA
  {
    id: "paris",
    ad: "Paris",
    ulke: "Fransa",
    ulkeId: "fransa",
    koordinat: [48.8566, 2.3522],
    ziyaretSayisi: 84,
    ozet: "Eyfel Kulesi, Louvre Müzesi ve Şanzelize caddesi ile moda ve sanat başkenti.",
    etiketler: ["Eyfel", "Sanat", "Kruvazan"],
    mekanlar: [
      {
        id: "eyfel",
        ad: "Eyfel Kulesi",
        tur: "Anıt",
        puan: 4.7,
        yorumSayisi: 70,
        ozet: "Işık gösterisi ve park manzarası.",
        yorumlar: [
          { id: "prs-1", yazar: "Gamze", puan: 5, metin: "Işıklar büyülüyor.", tarih: "2 gün önce" },
        ],
      },
    ],
  },
  {
    id: "nis",
    ad: "Nis (Nice)",
    ulke: "Fransa",
    ulkeId: "fransa",
    koordinat: [43.7102, 7.262],
    ziyaretSayisi: 42,
    ozet: "Fransız Rivierası (Cote d'Azur) mavi kıyıları ve sahil yürüyüş yolları.",
    etiketler: ["Riviera", "Mavi Deniz", "Sahil"],
    mekanlar: [
      {
        id: "promenade",
        ad: "Promenade des Anglais",
        tur: "Sahil Kordonu",
        puan: 4.7,
        yorumSayisi: 31,
        ozet: "Turkuaz deniz kenarında yürüyüş ve palmiyeler.",
        yorumlar: [
          { id: "nis-1", yazar: "Selen", puan: 5, metin: "Denizin rengi şahane.", tarih: "1 hafta önce" },
        ],
      },
    ],
  },
  {
    id: "lyon",
    ad: "Lyon",
    ulke: "Fransa",
    ulkeId: "fransa",
    koordinat: [45.764, 4.8357],
    ziyaretSayisi: 30,
    ozet: "Fransa'nın gastronomi başkenti ve tarihi Eski Lyon sokakları.",
    etiketler: ["Gastronomi", "Tarih", "Nehir"],
    mekanlar: [
      {
        id: "vieux-lyon",
        ad: "Vieux Lyon (Eski Şehir)",
        tur: "Tarihi Bölge",
        puan: 4.6,
        yorumSayisi: 22,
        ozet: "Gizli geçitler (traboules) ve geleneksel restoranlar (bouchon).",
        yorumlar: [
          { id: "lyn-1", yazar: "Tolga", puan: 5, metin: "Yemekler çok lezzetli.", tarih: "3 gün önce" },
        ],
      },
    ],
  },

  // 🇪🇸 İSPANYA
  {
    id: "barselona",
    ad: "Barselona",
    ulke: "İspanya",
    ulkeId: "ispanya",
    koordinat: [41.3879, 2.1699],
    ziyaretSayisi: 90,
    ozet: "Gaudi'nin mimarisi, La Sagrada Familia, Park Guell ve Katalan sahilleri.",
    etiketler: ["Gaudi", "Mimar", "Tapas"],
    mekanlar: [
      {
        id: "sagrada-familia",
        ad: "La Sagrada Familia",
        tur: "Katedral",
        puan: 4.9,
        yorumSayisi: 85,
        ozet: "Gaudi'nin şaheseri katedral.",
        yorumlar: [
          { id: "bar-1", yazar: "Sinem", puan: 5, metin: "İçerideki ışık süzülüşleri muazzam.", tarih: "2 gün önce" },
        ],
      },
    ],
  },
  {
    id: "madrid",
    ad: "Madrid",
    ulke: "İspanya",
    ulkeId: "ispanya",
    koordinat: [40.4168, -3.7038],
    ziyaretSayisi: 85,
    ozet: "Kraliyet Sarayı, Prado Müzesi, Retiro Parkı ve haraketli meydanlar.",
    etiketler: ["Müze", "Saray", "Park"],
    mekanlar: [
      {
        id: "prado",
        ad: "Prado Müzesi",
        tur: "Müze",
        puan: 4.8,
        yorumSayisi: 50,
        ozet: "Dünyaca ünlü klasik resim sanat koleksiyonları.",
        yorumlar: [
          { id: "mad-1", yazar: "Emre", puan: 5, metin: "Tablolar muhteşem.", tarih: "5 gün önce" },
        ],
      },
    ],
  },

  // 🇺🇸 ABD
  {
    id: "new-york",
    ad: "New York",
    ulke: "ABD",
    ulkeId: "abd",
    koordinat: [40.7128, -74.006],
    ziyaretSayisi: 130,
    ozet: "Times Square, Central Park, Özgürlük Heykeli ve Broadway tiyatroları.",
    etiketler: ["Gökdelen", "Park", "Broadway"],
    mekanlar: [
      {
        id: "central-park",
        ad: "Central Park",
        tur: "Şehir Parkı",
        puan: 4.9,
        yorumSayisi: 95,
        ozet: "Dev gökdelenlerin ortasında devasa yeşil vaha.",
        yorumlar: [
          { id: "ny-1", yazar: "Kaan", puan: 5, metin: "Bisiklet kiralamak en iyi fikir.", tarih: "Dün" },
        ],
      },
    ],
  },
  {
    id: "los-angeles",
    ad: "Los Angeles",
    ulke: "ABD",
    ulkeId: "abd",
    koordinat: [34.0522, -118.2437],
    ziyaretSayisi: 90,
    ozet: "Hollywood, Santa Monica iskelesi, film stüdyoları ve pasifik sahili.",
    etiketler: ["Hollywood", "Sahil", "Sinema"],
    mekanlar: [
      {
        id: "santa-monica",
        ad: "Santa Monica İskelesi",
        tur: "Sahil & Dönme Dolap",
        puan: 4.7,
        yorumSayisi: 65,
        ozet: "Pasifik okyanusunda gün batımı ve tarihi dönme dolap.",
        yorumlar: [
          { id: "la-1", yazar: "Bora", puan: 5, metin: "Gün batımı harikaydı.", tarih: "3 gün önce" },
        ],
      },
    ],
  },
  {
    id: "miami",
    ad: "Miami",
    ulke: "ABD",
    ulkeId: "abd",
    koordinat: [25.7617, -80.1918],
    ziyaretSayisi: 90,
    ozet: "Ocean Drive, South Beach palmiyeleri ve Art Deco binaları.",
    etiketler: ["South Beach", "Palmiye", "Eğlence"],
    mekanlar: [
      {
        id: "south-beach",
        ad: "South Beach",
        tur: "Plaj & Sahil",
        puan: 4.8,
        yorumSayisi: 58,
        ozet: "Bembeyaz kumlar ve masmavi deniz turu.",
        yorumlar: [
          { id: "mia-1", yazar: "Hande", puan: 5, metin: "Palmiyeler altında harika atmosfer.", tarih: "4 gün önce" },
        ],
      },
    ],
  },

  // 🇬🇧 İNGİLTERE
  {
    id: "londra",
    ad: "Londra",
    ulke: "İngiltere",
    ulkeId: "ingiltere",
    koordinat: [51.5074, -0.1278],
    ziyaretSayisi: 105,
    ozet: "Big Ben, London Eye, British Museum ve kırmızı çift katlı otobüsler.",
    etiketler: ["Big Ben", "Müze", "Kırmızı Otobüs"],
    mekanlar: [
      {
        id: "british-museum",
        ad: "British Museum",
        tur: "Müze",
        puan: 4.9,
        yorumSayisi: 78,
        ozet: "Ücretsiz girişli dünya tarih mirası müzesi.",
        yorumlar: [
          { id: "lon-1", yazar: "Hakan", puan: 5, metin: "Tüm günü ayırmalısınız.", tarih: "2 gün önce" },
        ],
      },
    ],
  },
  {
    id: "edinburg",
    ad: "Edinburg",
    ulke: "İngiltere",
    ulkeId: "ingiltere",
    koordinat: [55.9533, -3.1883],
    ziyaretSayisi: 55,
    ozet: "Tarihi kalesi, gayda sesleri ve Gotik mimarili taş binaları.",
    etiketler: ["Kale", "Gotik", "İskoçya"],
    mekanlar: [
      {
        id: "edinburg-castle",
        ad: "Edinburg Kalesi",
        tur: "Tarihi Kale",
        puan: 4.8,
        yorumSayisi: 40,
        ozet: "Volkanik kayalıklar üzerine kurulu muazzam kale.",
        yorumlar: [
          { id: "edi-1", yazar: "Melis", puan: 5, metin: "Manzaraya bayıldım.", tarih: "1 hafta önce" },
        ],
      },
    ],
  },

  // 🇩🇪 ALMANYA
  {
    id: "berlin",
    ad: "Berlin",
    ulke: "Almanya",
    ulkeId: "almanya",
    koordinat: [52.52, 13.405],
    ziyaretSayisi: 80,
    ozet: "Brandenburg Kapısı, Berlin Duvarı sanatı ve alternatif kültür.",
    etiketler: ["Berlin Duvarı", "Tarih", "Kültür"],
    mekanlar: [
      {
        id: "brandenburg",
        ad: "Brandenburg Kapısı",
        tur: "Tarihi Anıt",
        puan: 4.7,
        yorumSayisi: 55,
        ozet: "Almanya'nın birleşmesini simgeleyen ikonik kapı.",
        yorumlar: [
          { id: "ber-1", yazar: "Onur", puan: 5, metin: "Gece ışıklandırması çok etkileyici.", tarih: "3 gün önce" },
        ],
      },
    ],
  },
  {
    id: "munih",
    ad: "Münih",
    ulke: "Almanya",
    ulkeId: "almanya",
    koordinat: [48.1351, 11.582],
    ziyaretSayisi: 60,
    ozet: "Marienplatz meydanı, Bavyera mimarisi ve İngiliz Bahçesi.",
    etiketler: ["Bavyera", "Meydan", "Park"],
    mekanlar: [
      {
        id: "marienplatz",
        ad: "Marienplatz Meydanı",
        tur: "Şehir Meydanı",
        puan: 4.8,
        yorumSayisi: 42,
        ozet: "Saat kulesi gösterisi ve tarihi belediye binası.",
        yorumlar: [
          { id: "mun-1", yazar: "Seda", puan: 5, metin: "Kahve molası için çok neşeli yer.", tarih: "5 gün önce" },
        ],
      },
    ],
  },

  // 🇬🇷 YUNANİSTAN
  {
    id: "atina",
    ad: "Atina",
    ulke: "Yunanistan",
    ulkeId: "yunanistan",
    koordinat: [37.9838, 23.7275],
    ziyaretSayisi: 75,
    ozet: "Akropolis tapınağı, Plaka sokakları ve taverna müzikleri.",
    etiketler: ["Akropolis", "Mitoloji", "Taverna"],
    mekanlar: [
      {
        id: "akropolis",
        ad: "Akropolis & Parthenon",
        tur: "Antik Tapınak",
        puan: 4.9,
        yorumSayisi: 68,
        ozet: "Antik Yunan mimarisinin tepe noktası tapınak.",
        yorumlar: [
          { id: "ati-1", yazar: "Ezgi", puan: 5, metin: "Tarihin ortasındasınız.", tarih: "4 gün önce" },
        ],
      },
    ],
  },
  {
    id: "santorini",
    ad: "Santorini",
    ulke: "Yunanistan",
    ulkeId: "yunanistan",
    koordinat: [36.3932, 25.4615],
    ziyaretSayisi: 55,
    ozet: "Mavi kubbeli beyaz evler, Oia gün batımı ve volkanik sahiller.",
    etiketler: ["Oia", "Gün Batımı", "Mavi Kubbe"],
    mekanlar: [
      {
        id: "oia",
        ad: "Oia Köyü Seyir Yolu",
        tur: "Seyir Noktası",
        puan: 4.9,
        yorumSayisi: 50,
        ozet: "Dünyanın en romantik gün batımı manzarası.",
        yorumlar: [
          { id: "san-1", yazar: "Ceren", puan: 5, metin: "Manzara kelimelerle anlatılamaz.", tarih: "Dün" },
        ],
      },
    ],
  },

  // 🇪🇬 MISIR
  {
    id: "kahire",
    ad: "Kahire",
    ulke: "Mısır",
    ulkeId: "misir",
    koordinat: [30.0444, 31.2357],
    ziyaretSayisi: 60,
    ozet: "Giza Piramitleri, Sfanks heykeli ve Nil nehri turları.",
    etiketler: ["Piramit", "Nil", "Sfanks"],
    mekanlar: [
      {
        id: "giza",
        ad: "Giza Piramitleri & Sfanks",
        tur: "Dünya Harikası",
        puan: 4.9,
        yorumSayisi: 58,
        ozet: "Büyük Keops piramidi ve Gizemli Sfanks.",
        yorumlar: [
          { id: "kah-1", yazar: "Cemil", puan: 5, metin: "Muazzam bir tarih tecrübesi.", tarih: "6 gün önce" },
        ],
      },
    ],
  },
  {
    id: "iskenderiye",
    ad: "İskenderiye",
    ulke: "Mısır",
    ulkeId: "misir",
    koordinat: [31.2001, 29.9187],
    ziyaretSayisi: 50,
    ozet: "Tarihi İskenderiye Kütüphanesi ve Akdeniz sahilleri.",
    etiketler: ["Kütüphane", "Akdeniz", "Tarih"],
    mekanlar: [
      {
        id: "iskenderiye-kutup",
        ad: "İskenderiye Kütüphanesi",
        tur: "Kütüphane & Müze",
        puan: 4.8,
        yorumSayisi: 35,
        ozet: "Antik kütüphanenin anısına inşa edilmiş devasa modern mimari.",
        yorumlar: [
          { id: "isk-1", yazar: "Nalan", puan: 5, metin: "Çok etkileyici kütüphane.", tarih: "1 hafta önce" },
        ],
      },
    ],
  },
];

export function sehirBul(sehirId: string | undefined) {
  return sehirler.find((sehir) => sehir.id === sehirId) ?? sehirler[0];
}
