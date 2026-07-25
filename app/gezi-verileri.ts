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
  { id: "turkiye", ad: "Türkiye", bayrak: "🇹🇷", koordinat: [39.0, 35.2], zoom: 6, sehirSayisi: 7, ziyaretSayisi: 450 },
  { id: "italya", ad: "İtalya", bayrak: "🇮🇹", koordinat: [41.8719, 12.5674], zoom: 6, sehirSayisi: 4, ziyaretSayisi: 280 },
  { id: "japonya", ad: "Japonya", bayrak: "🇯🇵", koordinat: [36.2048, 138.2529], zoom: 6, sehirSayisi: 3, ziyaretSayisi: 195 },
  { id: "fransa", ad: "Fransa", bayrak: "🇫🇷", koordinat: [46.2276, 2.2137], zoom: 6, sehirSayisi: 3, ziyaretSayisi: 220 },
  { id: "ispanya", ad: "İspanya", bayrak: "🇪🇸", koordinat: [40.4637, -3.7492], zoom: 6, sehirSayisi: 3, ziyaretSayisi: 175 },
  { id: "abd", ad: "ABD", bayrak: "🇺🇸", koordinat: [37.0902, -95.7129], zoom: 4, sehirSayisi: 3, ziyaretSayisi: 310 },
  { id: "ingiltere", ad: "İngiltere", bayrak: "🇬🇧", koordinat: [52.3555, -1.1743], zoom: 6, sehirSayisi: 2, ziyaretSayisi: 160 },
  { id: "almanya", ad: "Almanya", bayrak: "🇩🇪", koordinat: [51.1657, 10.4515], zoom: 6, sehirSayisi: 3, ziyaretSayisi: 140 },
  { id: "yunanistan", ad: "Yunanistan", bayrak: "🇬🇷", koordinat: [39.0742, 21.8243], zoom: 6, sehirSayisi: 2, ziyaretSayisi: 130 },
  { id: "misir", ad: "Mısır", bayrak: "🇪🇬", koordinat: [26.8206, 30.8025], zoom: 6, sehirSayisi: 2, ziyaretSayisi: 110 },
  { id: "hollanda", ad: "Hollanda", bayrak: "🇳🇱", koordinat: [52.1326, 5.2913], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 185 },
  { id: "isvicre", ad: "İsviçre", bayrak: "🇨🇭", koordinat: [46.8182, 8.2275], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 165 },
  { id: "avusturya", ad: "Avusturya", bayrak: "🇦🇹", koordinat: [47.5162, 14.5501], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 145 },
  { id: "portekiz", ad: "Portekiz", bayrak: "🇵🇹", koordinat: [39.3999, -8.2245], zoom: 6, sehirSayisi: 2, ziyaretSayisi: 155 },
  { id: "belcika", ad: "Belçika", bayrak: "🇧🇪", koordinat: [50.5039, 4.4699], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 120 },
  { id: "isvec", ad: "İsveç", bayrak: "🇸🇪", koordinat: [60.1282, 18.6435], zoom: 5, sehirSayisi: 2, ziyaretSayisi: 95 },
  { id: "norvec", ad: "Norveç", bayrak: "🇳🇴", koordinat: [60.472, 8.4689], zoom: 5, sehirSayisi: 2, ziyaretSayisi: 110 },
  { id: "finlandiya", ad: "Finlandiya", bayrak: "🇫🇮", koordinat: [61.9241, 25.7482], zoom: 5, sehirSayisi: 1, ziyaretSayisi: 80 },
  { id: "izlanda", ad: "İzlanda", bayrak: "🇮🇸", koordinat: [64.9631, -19.0208], zoom: 6, sehirSayisi: 1, ziyaretSayisi: 140 },
  { id: "cekya", ad: "Çekya", bayrak: "🇨🇿", koordinat: [49.8175, 15.473], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 190 },
  { id: "macaristan", ad: "Macaristan", bayrak: "🇭🇺", koordinat: [47.1625, 19.5033], zoom: 7, sehirSayisi: 1, ziyaretSayisi: 170 },
  { id: "polonya", ad: "Polonya", bayrak: "🇵🇱", koordinat: [51.9194, 19.1451], zoom: 6, sehirSayisi: 2, ziyaretSayisi: 105 },
  { id: "hirvatistan", ad: "Hırvatistan", bayrak: "🇭🇷", koordinat: [45.1, 15.2], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 130 },
  { id: "karadag", ad: "Karadağ", bayrak: "🇲🇪", koordinat: [42.7087, 19.3744], zoom: 8, sehirSayisi: 2, ziyaretSayisi: 115 },
  { id: "kanada", ad: "Kanada", bayrak: "🇨🇦", koordinat: [56.1304, -106.3468], zoom: 4, sehirSayisi: 2, ziyaretSayisi: 125 },
  { id: "meksika", ad: "Meksika", bayrak: "🇲🇽", koordinat: [23.6345, -102.5528], zoom: 5, sehirSayisi: 2, ziyaretSayisi: 140 },
  { id: "brezilya", ad: "Brezilya", bayrak: "🇧🇷", koordinat: [-14.235, -51.9253], zoom: 4, sehirSayisi: 2, ziyaretSayisi: 150 },
  { id: "arjantin", ad: "Arjantin", bayrak: "🇦🇷", koordinat: [-38.4161, -63.6167], zoom: 4, sehirSayisi: 1, ziyaretSayisi: 90 },
  { id: "guneykore", ad: "Güney Kore", bayrak: "🇰🇷", koordinat: [35.9078, 127.7669], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 180 },
  { id: "tayland", ad: "Tayland", bayrak: "🇹🇭", koordinat: [15.87, 100.9925], zoom: 6, sehirSayisi: 2, ziyaretSayisi: 210 },
  { id: "endonezya", ad: "Endonezya", bayrak: "🇮🇩", koordinat: [-0.7893, 113.9213], zoom: 5, sehirSayisi: 2, ziyaretSayisi: 230 },
  { id: "vietnam", ad: "Vietnam", bayrak: "🇻🇳", koordinat: [14.0583, 108.2772], zoom: 6, sehirSayisi: 2, ziyaretSayisi: 115 },
  { id: "singapur", ad: "Singapur", bayrak: "🇸🇬", koordinat: [1.3521, 103.8198], zoom: 11, sehirSayisi: 1, ziyaretSayisi: 190 },
  { id: "malezya", ad: "Malezya", bayrak: "🇲🇾", koordinat: [4.2105, 101.9758], zoom: 6, sehirSayisi: 1, ziyaretSayisi: 100 },
  { id: "bae", ad: "BAE (Birleşik Arap Emirlikleri)", bayrak: "🇦🇪", koordinat: [23.4241, 53.8478], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 240 },
  { id: "katar", ad: "Katar", bayrak: "🇶🇦", koordinat: [25.3548, 51.1839], zoom: 9, sehirSayisi: 1, ziyaretSayisi: 85 },
  { id: "suudiarabistan", ad: "Suudi Arabistan", bayrak: "🇸🇦", koordinat: [23.8859, 45.0792], zoom: 5, sehirSayisi: 2, ziyaretSayisi: 140 },
  { id: "urdun", ad: "Ürdün", bayrak: "🇯🇴", koordinat: [30.5852, 36.2384], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 125 },
  { id: "fas", ad: "Fas", bayrak: "🇲🇦", koordinat: [31.7917, -7.0926], zoom: 6, sehirSayisi: 2, ziyaretSayisi: 135 },
  { id: "guneyafrika", ad: "Güney Afrika", bayrak: "🇿🇦", koordinat: [-30.5595, 22.9375], zoom: 5, sehirSayisi: 2, ziyaretSayisi: 95 },
  { id: "avustralya", ad: "Avustralya", bayrak: "🇦🇺", koordinat: [-25.2744, 133.7751], zoom: 4, sehirSayisi: 2, ziyaretSayisi: 160 },
  { id: "yenizelanda", ad: "Yeni Zelanda", bayrak: "🇳🇿", koordinat: [-40.9006, 174.886], zoom: 5, sehirSayisi: 2, ziyaretSayisi: 110 },
  { id: "gurcistan", ad: "Gürcistan", bayrak: "🇬🇪", koordinat: [42.3154, 43.3569], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 150 },
  { id: "azerbaycan", ad: "Azerbaycan", bayrak: "🇦🇿", koordinat: [40.1431, 47.5769], zoom: 7, sehirSayisi: 2, ziyaretSayisi: 165 },
  { id: "ukrayna", ad: "Ukrayna", bayrak: "🇺🇦", koordinat: [48.3794, 31.1656], zoom: 6, sehirSayisi: 2, ziyaretSayisi: 105 },
  { id: "rusya", ad: "Rusya", bayrak: "🇷🇺", koordinat: [61.524, 105.3188], zoom: 3, sehirSayisi: 2, ziyaretSayisi: 140 },
  { id: "cin", ad: "Çin", bayrak: "🇨🇳", koordinat: [35.8617, 104.1954], zoom: 4, sehirSayisi: 3, ziyaretSayisi: 180 },
  { id: "hindistan", ad: "Hindistan", bayrak: "🇮🇳", koordinat: [20.5937, 78.9629], zoom: 5, sehirSayisi: 2, ziyaretSayisi: 130 },
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
    ozet: "Tarihi yarımada, sahil rotaları ve mahalle keşifleriyle en çok yorumlanan şehir.",
    etiketler: ["Tarih", "Sokak", "Deniz"],
    mekanlar: [
      {
        id: "balat",
        ad: "Balat Sokakları",
        tur: "Mahalle",
        puan: 4.7,
        yorumSayisi: 42,
        ozet: "Renkli evler, kahve durakları ve uzun yürüyüşler.",
        yorumlar: [{ id: "b1", yazar: "Ece", puan: 5, metin: "Kahve ve fotoğraf için ideal.", tarih: "2 gün önce" }],
      },
      {
        id: "arkeoloji",
        ad: "İstanbul Arkeoloji Müzeleri",
        tur: "Müze",
        puan: 4.9,
        yorumSayisi: 31,
        ozet: "Lahitler, antik eserler ve sessiz bahçe keyfi.",
        yorumlar: [{ id: "a1", yazar: "Mert", puan: 5, metin: "Saatlerce gezilebilir.", tarih: "1 hafta önce" }],
      },
    ],
  },
  {
    id: "eskisehir",
    ad: "Eskişehir",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [39.7767, 30.5206],
    ziyaretSayisi: 84,
    ozet: "Odunpazarı evleri, Porsuk Çayı ve müzeler şehri.",
    etiketler: ["Kültür", "Yürüyüş", "Müze"],
    mekanlar: [
      {
        id: "odunpazari",
        ad: "Odunpazarı Evleri",
        tur: "Tarihi Bölge",
        puan: 4.8,
        yorumSayisi: 28,
        ozet: "Geleneksel ahşap mimari ve el sanatları atölyeleri.",
        yorumlar: [{ id: "o1", yazar: "Burak", puan: 5, metin: "Çok huzurlu sokaklar.", tarih: "3 gün önce" }],
      },
      {
        id: "omm",
        ad: "Odunpazarı Modern Müze (OMM)",
        tur: "Müze",
        puan: 4.9,
        yorumSayisi: 19,
        ozet: "Kengo Kuma imzalı modern mimari harikası.",
        yorumlar: [{ id: "omm1", yazar: "Selin", puan: 5, metin: "Sergiler muazzam.", tarih: "5 gün önce" }],
      },
    ],
  },
  {
    id: "nevsehir",
    ad: "Nevşehir (Kapadokya)",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [38.6244, 34.7144],
    ziyaretSayisi: 96,
    ozet: "Peribacaları, balon turları ve vadileriyle büyüleyici masal diyarı.",
    etiketler: ["Doğa", "Balon", "Tarih"],
    mekanlar: [
      {
        id: "goreme",
        ad: "Göreme Açık Hava Müzesi",
        tur: "Tarihi Bölge",
        puan: 4.9,
        yorumSayisi: 54,
        ozet: "Kaya kiliseleri ve antik freskler.",
        yorumlar: [{ id: "g1", yazar: "Ahmet", puan: 5, metin: "Gün doğumu manzarası harika.", tarih: "Dün" }],
      },
    ],
  },
  {
    id: "antalya",
    ad: "Antalya (Kaş & Kalkan)",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [36.2, 29.6378],
    ziyaretSayisi: 110,
    ozet: "Koylar, Likya Yolu trekking rotaları ve turkuaz deniz.",
    etiketler: ["Plaj", "Trekking", "Deniz"],
    mekanlar: [
      {
        id: "kekova",
        ad: "Kekova Batık Şehir",
        tur: "Tarihi Deniz Rotası",
        puan: 4.9,
        yorumSayisi: 38,
        ozet: "Tekne ve kano turları ile antik kalıntılar.",
        yorumlar: [{ id: "k1", yazar: "Deniz", puan: 5, metin: "Berrak sular ve tarih.", tarih: "4 gün önce" }],
      },
    ],
  },
  {
    id: "izmir",
    ad: "İzmir (Efes & Alaçatı)",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [38.4237, 27.1428],
    ziyaretSayisi: 92,
    ozet: "Efes Antik Kenti, Kordon boyu ve taş evli sokaklar.",
    etiketler: ["Antik Kent", "Deniz", "Ege"],
    mekanlar: [
      {
        id: "efes",
        ad: "Efes Antik Kenti",
        tur: "Tarihi Bölge",
        puan: 5.0,
        yorumSayisi: 65,
        ozet: "Celsus Kütüphanesi ve antik tiyatro.",
        yorumlar: [{ id: "e1", yazar: "Cem", puan: 5, metin: "Dünyanın en iyi antik kentlerinden.", tarih: "1 hafta önce" }],
      },
    ],
  },
  {
    id: "ankara",
    ad: "Ankara",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [39.9334, 32.8597],
    ziyaretSayisi: 75,
    ozet: "Anıtkabir, Ankara Kalesi ve medeniyetler müzesi.",
    etiketler: ["Başkent", "Tarih", "Müze"],
    mekanlar: [
      {
        id: "anitkabir",
        ad: "Anıtkabir",
        tur: "Anıt Müze",
        puan: 5.0,
        yorumSayisi: 120,
        ozet: "Atatürk'ün ebedi istirahatgahı ve müze kompleksi.",
        yorumlar: [{ id: "ank1", yazar: "Zeynep", puan: 5, metin: "Gurur verici bir atmosfer.", tarih: "3 gün önce" }],
      },
    ],
  },
  {
    id: "trabzon",
    ad: "Trabzon (Uzungöl & Sümela)",
    ulke: "Türkiye",
    ulkeId: "turkiye",
    koordinat: [41.0027, 39.7168],
    ziyaretSayisi: 68,
    ozet: "Sümela Manastırı, yaylalar ve Karadeniz doğası.",
    etiketler: ["Doğa", "Yayla", "Tarih"],
    mekanlar: [
      {
        id: "sumela",
        ad: "Sümela Manastırı",
        tur: "Tarihi Bölge",
        puan: 4.8,
        yorumSayisi: 40,
        ozet: "Sarp kayalıklara inşa edilmiş tarihi yapı.",
        yorumlar: [{ id: "s1", yazar: "Kaan", puan: 5, metin: "Manzara nefes kesici.", tarih: "1 ay önce" }],
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
    ziyaretSayisi: 140,
    ozet: "Kolezyum, Aşk Çeşmesi ve Vatikan kalbi.",
    etiketler: ["Antik", "Tarih", "Sanat"],
    mekanlar: [
      {
        id: "colosseum",
        ad: "Kolezyum (Colosseum)",
        tur: "Tarihi Yapı",
        puan: 4.9,
        yorumSayisi: 85,
        ozet: "Roma İmparatorluğu'nun en ikonik amfitiyatrosu.",
        yorumlar: [{ id: "col1", yazar: "Marco", puan: 5, metin: "Ağırlığı hissedilen tarih.", tarih: "3 gün önce" }],
      },
    ],
  },
  {
    id: "venedik",
    ad: "Venedik",
    ulke: "İtalya",
    ulkeId: "italya",
    koordinat: [45.4408, 12.3155],
    ziyaretSayisi: 110,
    ozet: "Kanal turları, gondollar ve San Marco Meydanı.",
    etiketler: ["Kanal", "Romantik", "Sanat"],
    mekanlar: [
      {
        id: "gondola",
        ad: "Büyük Kanal Gondol Turu",
        tur: "Kanal Rotası",
        puan: 4.8,
        yorumSayisi: 60,
        ozet: "Tarihi saraylar arasından pürüzsüz kanal geçişi.",
        yorumlar: [{ id: "gond1", yazar: "Laura", puan: 5, metin: "Büyülü deneyim.", tarih: "5 gün önce" }],
      },
    ],
  },
  {
    id: "floransa",
    ad: "Floransa",
    ulke: "İtalya",
    ulkeId: "italya",
    koordinat: [43.7696, 11.2558],
    ziyaretSayisi: 95,
    ozet: "Rönesans'ın doğduğu yer, Duomo ve Ponte Vecchio.",
    etiketler: ["Rönesans", "Müze", "Mimari"],
    mekanlar: [{ id: "duomo", ad: "Floransa Katedrali (Duomo)", tur: "Katedral", puan: 4.9, yorumSayisi: 45, ozet: "Brunelleschi kubbesi ile mimari harikası.", yorumlar: [] }],
  },
  {
    id: "milano",
    ad: "Milano",
    ulke: "İtalya",
    ulkeId: "italya",
    koordinat: [45.4642, 9.19],
    ziyaretSayisi: 85,
    ozet: "Moda başkenti, Duomo di Milano ve Galleria Vittorio Emanuele.",
    etiketler: ["Moda", "Alışveriş", "Mimari"],
    mekanlar: [{ id: "milan-duomo", ad: "Duomo di Milano", tur: "Katedral", puan: 4.8, yorumSayisi: 50, ozet: "Gotik mimarinin en görkemli örneği.", yorumlar: [] }],
  },

  // 🇯🇵 JAPONYA
  {
    id: "tokyo",
    ad: "Tokyo",
    ulke: "Japonya",
    ulkeId: "japonya",
    koordinat: [35.6762, 139.6503],
    ziyaretSayisi: 130,
    ozet: "Futuristik gökdelenler, Shibuya ve tarihi tapınaklar.",
    etiketler: ["Futuristik", "Kültür", "Teknoloji"],
    mekanlar: [{ id: "sensoji", ad: "Senso-ji Tapınağı", tur: "Tapınak", puan: 4.9, yorumSayisi: 70, ozet: "Tokyo'nun en eski ve en kutsal tapınağı.", yorumlar: [] }],
  },
  {
    id: "kyoto",
    ad: "Kyoto",
    ulke: "Japonya",
    ulkeId: "japonya",
    koordinat: [35.0116, 135.7681],
    ziyaretSayisi: 105,
    ozet: "Geleneksel bambu ormanları, geyşalar ve Fushimi Inari.",
    etiketler: ["Geleneksel", "Tapınak", "Doğa"],
    mekanlar: [{ id: "fushimi", ad: "Fushimi Inari Taisha", tur: "Tapınak", puan: 5.0, yorumSayisi: 90, ozet: "Binlerce kırmızı Torii kapısından geçen patika.", yorumlar: [] }],
  },
  {
    id: "osaka",
    ad: "Osaka",
    ulke: "Japonya",
    ulkeId: "japonya",
    koordinat: [34.6937, 135.5023],
    ziyaretSayisi: 80,
    ozet: "Sokak lezzetleri, Dotonbori ve Osaka Kalesi.",
    etiketler: ["Gurme", "Sokak", "Kale"],
    mekanlar: [{ id: "dotonbori", ad: "Dotonbori Sokakları", tur: "Sokak Rotası", puan: 4.8, yorumSayisi: 40, ozet: "Gece ışıkları ve meşhur Takoyaki durakları.", yorumlar: [] }],
  },

  // 🇫🇷 FRANSA
  {
    id: "paris",
    ad: "Paris",
    ulke: "Fransa",
    ulkeId: "fransa",
    koordinat: [48.8566, 2.3522],
    ziyaretSayisi: 160,
    ozet: "Eyfel Kulesi, Louvre Müzesi ve Sen Nehri kıyısı.",
    etiketler: ["Romantik", "Müze", "Sanat"],
    mekanlar: [{ id: "eiffel", ad: "Eyfel Kulesi", tur: "Anıt Yapı", puan: 4.9, yorumSayisi: 110, ozet: "Dünyanın en ikonik sembollerinden biri.", yorumlar: [] }],
  },
  {
    id: "nice",
    ad: "Nice",
    ulke: "Fransa",
    ulkeId: "fransa",
    koordinat: [43.7102, 7.262],
    ziyaretSayisi: 70,
    ozet: "Fransız Rivierası, Promenade des Anglais ve turkuaz sahil.",
    etiketler: ["Riviera", "Plaj", "Deniz"],
    mekanlar: [{ id: "promenade", ad: "Promenade des Anglais", tur: "Sahil Yolu", puan: 4.7, yorumSayisi: 30, ozet: "Palmiyeler altında Akdeniz yürüyüşü.", yorumlar: [] }],
  },
  {
    id: "lyon",
    ad: "Lyon",
    ulke: "Fransa",
    ulkeId: "fransa",
    koordinat: [45.764, 4.8357],
    ziyaretSayisi: 55,
    ozet: "Fransa'nın gurme başkenti, Traboules gizli geçitleri.",
    etiketler: ["Gurme", "Tarih", "Nehir"],
    mekanlar: [{ id: "vieux-lyon", ad: "Vieux Lyon (Eski Şehir)", tur: "Tarihi Bölge", puan: 4.8, yorumSayisi: 25, ozet: "Rönesans mimarisi ve gizli geçitler.", yorumlar: [] }],
  },

  // 🇪🇸 İSPANYA
  {
    id: "barselona",
    ad: "Barselona",
    ulke: "İspanya",
    ulkeId: "ispanya",
    koordinat: [41.3879, 2.1699],
    ziyaretSayisi: 145,
    ozet: "Gaudi'nin Sagrada Familia'sı, Park Güell ve La Rambla.",
    etiketler: ["Gaudi", "Plaj", "Sanat"],
    mekanlar: [{ id: "sagrada", ad: "La Sagrada Familia", tur: "Katedral", puan: 4.9, yorumSayisi: 95, ozet: "Modernist mimarinin tamamlanamayan şaheseri.", yorumlar: [] }],
  },
  {
    id: "madrid",
    ad: "Madrid",
    ulke: "İspanya",
    ulkeId: "ispanya",
    koordinat: [40.4168, -3.7038],
    ziyaretSayisi: 100,
    ozet: "Kraliyet Sarayı, Prado Müzesi ve Tapas barları.",
    etiketler: ["Saray", "Tapas", "Müze"],
    mekanlar: [{ id: "prado", ad: "Prado Müzesi", tur: "Müze", puan: 4.8, yorumSayisi: 50, ozet: "İspanyol kraliyet sanat koleksiyonu.", yorumlar: [] }],
  },

  // 🇺🇸 ABD
  {
    id: "newyork",
    ad: "New York",
    ulke: "ABD",
    ulkeId: "abd",
    koordinat: [40.7128, -74.006],
    ziyaretSayisi: 170,
    ozet: "Times Square, Central Park ve Özgürlük Heykeli.",
    etiketler: ["Metropol", "Park", "Işıklar"],
    mekanlar: [{ id: "centralpark", ad: "Central Park", tur: "Şehir Parkı", puan: 4.9, yorumSayisi: 120, ozet: "Gökdelenler ortasında devasa yeşil vaha.", yorumlar: [] }],
  },
  {
    id: "losangeles",
    ad: "Los Angeles",
    ulke: "ABD",
    ulkeId: "abd",
    koordinat: [34.0522, -118.2437],
    ziyaretSayisi: 115,
    ozet: "Hollywood, Santa Monica iskelesi ve palmiyeler.",
    etiketler: ["Sinema", "Plaj", "Güneş"],
    mekanlar: [{ id: "hollywood", ad: "Hollywood Walk of Fame", tur: "Cadde Rotası", puan: 4.6, yorumSayisi: 60, ozet: "Ünlülerin yıldızları ile dolu bulvar.", yorumlar: [] }],
  },

  // 🇬🇧 İNGİLTERE
  {
    id: "londra",
    ad: "Londra",
    ulke: "İngiltere",
    ulkeId: "ingiltere",
    koordinat: [51.5074, -0.1278],
    ziyaretSayisi: 150,
    ozet: "Big Ben, London Eye, Thames Nehri ve British Museum.",
    etiketler: ["Kültür", "Tarih", "Müze"],
    mekanlar: [{ id: "bigben", ad: "Big Ben & Elizabeth Kulesi", tur: "Saat Kulesi", puan: 4.9, yorumSayisi: 80, ozet: "Londra'nın dünyaca ünlü ikonik saat kulesi.", yorumlar: [] }],
  },

  // 🇩🇪 ALMANYA
  {
    id: "berlin",
    ad: "Berlin",
    ulke: "Almanya",
    ulkeId: "almanya",
    koordinat: [52.52, 13.405],
    ziyaretSayisi: 120,
    ozet: "Brandenburg Kapısı, Berlin Duvarı ve Müze Adası.",
    etiketler: ["Tarih", "Sanat", "Gece Hayatı"],
    mekanlar: [{ id: "brandenburg", ad: "Brandenburg Kapısı", tur: "Tarihi Anıt", puan: 4.8, yorumSayisi: 65, ozet: "Alman birleşmesinin ve tarihinin sembolü.", yorumlar: [] }],
  },
  {
    id: "munih",
    ad: "Münih",
    ulke: "Almanya",
    ulkeId: "almanya",
    koordinat: [48.1351, 11.582],
    ziyaretSayisi: 90,
    ozet: "Marienplatz, Englischer Garten ve Bavyera kültürü.",
    etiketler: ["Bavyera", "Kültür", "Park"],
    mekanlar: [{ id: "marienplatz", ad: "Marienplatz", tur: "Meydan", puan: 4.7, yorumSayisi: 40, ozet: "Yeni Belediye Binası ve Glockenspiel gösterisi.", yorumlar: [] }],
  },

  // 🇳🇱 HOLLANDA
  {
    id: "amsterdam",
    ad: "Amsterdam",
    ulke: "Hollanda",
    ulkeId: "hollanda",
    koordinat: [52.3676, 4.9041],
    ziyaretSayisi: 150,
    ozet: "Bisiklet yolları, kanallar, Van Gogh Müzesi.",
    etiketler: ["Kanal", "Bisiklet", "Müze"],
    mekanlar: [{ id: "vangogh", ad: "Van Gogh Müzesi", tur: "Müze", puan: 4.9, yorumSayisi: 85, ozet: "Ressamın en ikonik eserlerinin sergisi.", yorumlar: [] }],
  },

  // 🇨🇭 İSVİÇRE
  {
    id: "zohrih",
    ad: "Zürih",
    ulke: "İsviçre",
    ulkeId: "isvicre",
    koordinat: [47.3769, 8.5417],
    ziyaretSayisi: 95,
    ozet: "Zürih Gölü, Alpler manzarası ve çikolata durakları.",
    etiketler: ["Göl", "Alpler", "Lüks"],
    mekanlar: [{ id: "zurichlake", ad: "Zürih Gölü Kıyısı", tur: "Göl Rotası", puan: 4.8, yorumSayisi: 40, ozet: "Kuğular ve dağ manzaraları eşliğinde gezinti.", yorumlar: [] }],
  },

  // 🇨🇿 ÇEKYA
  {
    id: "prag",
    ad: "Prag",
    ulke: "Çekya",
    ulkeId: "cekya",
    koordinat: [50.0755, 14.4378],
    ziyaretSayisi: 140,
    ozet: "Karl Köprüsü, Astronomik Saat ve Prag Kalesi.",
    etiketler: ["Masalsı", "Gotik", "Tarih"],
    mekanlar: [{ id: "charlesbridge", ad: "Karl Köprüsü (Charles Bridge)", tur: "Tarihi Köprü", puan: 4.9, yorumSayisi: 90, ozet: "Heykellerle süslü Vltava nehri geçidi.", yorumlar: [] }],
  },

  // 🇦🇪 BAE
  {
    id: "dubai",
    ad: "Dubai",
    ulke: "BAE (Birleşik Arap Emirlikleri)",
    ulkeId: "bae",
    koordinat: [25.2048, 55.2708],
    ziyaretSayisi: 160,
    ozet: "Burj Khalifa, Dubai Mall ve çöl safarileri.",
    etiketler: ["Gökdelen", "Çöl", "Lüks"],
    mekanlar: [{ id: "burjkhalifa", ad: "Burj Khalifa", tur: "Gökdelen", puan: 4.9, yorumSayisi: 100, ozet: "Dünyanın en yüksek binası gözlem terası.", yorumlar: [] }],
  },

  // 🇸🇬 SİNGAPUR
  {
    id: "singapur-sehir",
    ad: "Singapur Şehir Devleti",
    ulke: "Singapur",
    ulkeId: "singapur",
    koordinat: [1.3521, 103.8198],
    ziyaretSayisi: 130,
    ozet: "Gardens by the Bay, Marina Bay Sands ve botanik parklar.",
    etiketler: ["Yeşil Metropol", "Mimari", "Işıklar"],
    mekanlar: [{ id: "gardensbybay", ad: "Gardens by the Bay", tur: "Botanik Park", puan: 5.0, yorumSayisi: 95, ozet: "Işıklı Supertree ağaçları ve dev seralar.", yorumlar: [] }],
  },

  // 🇮🇩 ENDONEZYA
  {
    id: "bali",
    ad: "Bali (Ubud & Seminyak)",
    ulke: "Endonezya",
    ulkeId: "endonezya",
    koordinat: [-8.4095, 115.1889],
    ziyaretSayisi: 175,
    ozet: "Pirinç terasları, şelaleler ve tropik tapınaklar.",
    etiketler: ["Tropik", "Doğa", "Tapınak"],
    mekanlar: [{ id: "tegallalang", ad: "Tegallalang Pirinç Terasları", tur: "Doğa Rotası", puan: 4.9, yorumSayisi: 80, ozet: "Yeşilin her tonunda katmanlı pirinç tarlaları.", yorumlar: [] }],
  },
];

export function sehirBul(id: string): Sehir | undefined {
  return sehirler.find((s) => s.id === id);
}

const ULKE_KODLARI: Record<string, string> = {
  turkiye: "tr",
  italya: "it",
  japonya: "jp",
  fransa: "fr",
  ispanya: "es",
  abd: "us",
  ingiltere: "gb",
  almanya: "de",
  yunanistan: "gr",
  misir: "eg",
  hollanda: "nl",
  isvicre: "ch",
  avusturya: "at",
  portekiz: "pt",
  belcika: "be",
  isvec: "se",
  norvec: "no",
  finlandiya: "fi",
  izlanda: "is",
  cekya: "cz",
  macaristan: "hu",
  polonya: "pl",
  hirvatistan: "hr",
  karadag: "me",
  kanada: "ca",
  meksika: "mx",
  brezilya: "br",
  arjantin: "ar",
  guneykore: "kr",
  tayland: "th",
  endonezya: "id",
  vietnam: "vn",
  singapur: "sg",
  malezya: "my",
  bae: "ae",
  katar: "qa",
  suudiarabistan: "sa",
  urdun: "jo",
  fas: "ma",
  guneyafrika: "za",
  avustralya: "au",
  yenizelanda: "nz",
  gurcistan: "ge",
  azerbaycan: "az",
  ukrayna: "ua",
  rusya: "ru",
  cin: "cn",
  hindistan: "in",
};

export function ulkeBayrakUrl(ulkeId: string): string {
  const code = ULKE_KODLARI[ulkeId.toLowerCase()] || "tr";
  return `https://flagcdn.com/w40/${code}.png`;
}
