import { BadgeItem, CommunityPost, GalleryItem, JournalEntry, PinItem, TravelRoute, UserProfile } from '../types/travel';

export const INITIAL_USER: UserProfile = {
  name: 'Taha Emre',
  email: null,
  handle: '@taha_gezgin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  bio: 'Dünyayı keşfeden bir gezgin | 14 şehir, 4 ülke',
  totalCities: 14,
  totalCountries: 4,
  totalPins: 28,
  level: 'Kıdemli Gezgin',
};

export const INITIAL_PINS: PinItem[] = [
  {
    id: 'pin-1',
    title: 'Kolezyum',
    cityName: 'Roma',
    countryName: 'İtalya',
    category: 'Gittim',
    rating: 5,
    note: 'Gün doğumunda gitmek muhteşemdi. Kalabalık olmadan bol bol fotoğraf çektik.',
    journal: 'Roma sabahı taş sokaklarda başladı. Kolezyumun gölgesinde kahvemi içerken tarihin içinde yürüyormuş gibi hissettim.',
    visitedDate: '12 Mayıs 2025',
    latitude: 41.8902,
    longitude: 12.4922,
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
    tags: ['Tarih', 'Mimari', 'Simge'],
  },
  {
    id: 'pin-2',
    title: 'Eiffel Kulesi',
    cityName: 'Paris',
    countryName: 'Fransa',
    category: 'Gittim',
    rating: 5,
    note: 'Gece ışık gösterisi unutulmazdı. Champ de Mars parkında piknik yaptık.',
    journal: 'Paris gecesinde kulenin ışıkları yandığında şehir bir anda sessizleşmiş gibi geldi.',
    visitedDate: '20 Eylül 2025',
    latitude: 48.8584,
    longitude: 2.2945,
    imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop&q=80',
    tags: ['Manzara', 'Romantik', 'Simge'],
  },
  {
    id: 'pin-3',
    title: 'Ayasofya',
    cityName: 'İstanbul',
    countryName: 'Türkiye',
    category: 'Gittim',
    rating: 5,
    note: 'Tarihi yarımadanın kalbi. Mimarisi ve atmosferi büyüleyici.',
    journal: 'Ayasofya meydanında yürürken İstanbulun katman katman bir hafıza gibi açıldığını hissettim.',
    visitedDate: '15 Ocak 2026',
    latitude: 41.0086,
    longitude: 28.9802,
    imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80',
    tags: ['Tarih', 'Kültür'],
  },
  {
    id: 'pin-4',
    title: 'Sagrada Familia',
    cityName: 'Barselona',
    countryName: 'İspanya',
    category: 'İstek',
    rating: 4,
    note: 'Gaudi eserlerini yakından görmek için sabırsızlanıyorum.',
    latitude: 41.4036,
    longitude: 2.1744,
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a771def6?w=800&auto=format&fit=crop&q=80',
    tags: ['Sanat', 'Mimari'],
  },
  {
    id: 'pin-5',
    title: 'Kapadokya Balon Turu',
    cityName: 'Nevşehir',
    countryName: 'Türkiye',
    category: 'Favori',
    rating: 5,
    note: 'Gün doğarken vadilerin üzerinde süzülmek hayatımın en iyi deneyimlerinden biriydi.',
    journal: 'Balon yükseldikçe vadiler sessizleşti. Kapadokya sabahı gerçekten başka bir dünya.',
    visitedDate: '5 Ekim 2025',
    latitude: 38.6431,
    longitude: 34.8289,
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&auto=format&fit=crop&q=80',
    tags: ['Macera', 'Doğa', 'Balon'],
  },
];

export const INITIAL_ROUTES: TravelRoute[] = [
  {
    id: 'route-1',
    title: 'İstanbul Tarihi Yarımada Rotası',
    cityName: 'İstanbul',
    duration: '1 Gün',
    difficulty: 'Kolay',
    description: 'Sultanahmet, Ayasofya, Yerebatan Sarnıcı ve Kapalıçarşıyı kapsayan klasik kültür rotası.',
    coverImage: 'https://images.unsplash.com/photo-1527838832700-54595d042457?w=800&auto=format&fit=crop&q=80',
    likesCount: 142,
    stops: [
      { id: 's1', title: 'Ayasofya Meydanı', description: 'Güne kahve ve meydan yürüyüşü ile başlama', completed: true, estimatedTime: '09:00' },
      { id: 's2', title: 'Yerebatan Sarnıcı', description: 'Büyüleyici sütunlar ve Medusa başı ziyareti', completed: true, estimatedTime: '11:00' },
      { id: 's3', title: 'Tarihi Sultanahmet Köftecisi', description: 'Öğle yemeği ve geleneksel lezzetler', completed: false, estimatedTime: '13:00' },
      { id: 's4', title: 'Kapalıçarşı Gezisi', description: 'Otantik dükkanlar ve hediyelik eşya molası', completed: false, estimatedTime: '15:00' },
    ],
  },
  {
    id: 'route-2',
    title: 'Roma Antik Şehir ve Lezzet Rotası',
    cityName: 'Roma',
    duration: '2 Gün',
    difficulty: 'Orta',
    description: 'Kolezyumdan Aşk Çeşmesine, iyi dondurmacılardan makarna mekanlarına uzanan rota.',
    coverImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop&q=80',
    likesCount: 289,
    stops: [
      { id: 'r1', title: 'Kolezyum ve Roman Forum', description: 'Antik Romanın izlerini keşfetme', completed: true, estimatedTime: '09:30' },
      { id: 'r2', title: 'Trevi Çeşmesi', description: 'Bozuk para atıp dilek dileme', completed: false, estimatedTime: '14:00' },
      { id: 'r3', title: 'Pantheon', description: 'Dünyanın en iyi korunan antik tapınağı', completed: false, estimatedTime: '16:30' },
      { id: 'r4', title: 'Giolitti Dondurma', description: 'Romanın en eski dondurmacısında mola', completed: false, estimatedTime: '18:00' },
    ],
  },
];

export const INITIAL_JOURNAL: JournalEntry[] = INITIAL_PINS.filter((pin) => pin.journal).map((pin) => ({
  id: `journal-${pin.id}`,
  title: pin.title,
  cityName: pin.cityName,
  body: pin.journal ?? '',
  mood: pin.category === 'Favori' ? 'Unutulmaz' : 'Keyifli',
  date: pin.visitedDate ?? 'Tarihsiz',
  imageUrl: pin.imageUrl,
}));

export const INITIAL_GALLERY: GalleryItem[] = INITIAL_PINS.filter((pin) => pin.imageUrl).map((pin) => ({
  id: `gallery-${pin.id}`,
  title: pin.title,
  cityName: pin.cityName,
  imageUrl: pin.imageUrl ?? '',
  note: pin.note,
}));

export const INITIAL_BADGES: BadgeItem[] = [
  { id: 'b1', title: 'İlk Pin', description: 'İlk gezilecek yeri kaydet.', icon: 'location', unlocked: true, progress: 100, unlockedAt: 'Bugün' },
  { id: 'b2', title: 'Avrupa Kaşifi', description: 'Avrupada 3 farklı ülkeyi ziyaret et.', icon: 'compass', unlocked: true, progress: 100, unlockedAt: 'Ocak 2026' },
  { id: 'b3', title: 'Fotoğrafçı Gezgin', description: 'Galeriye 10 fotoğraf ekle.', icon: 'camera', unlocked: false, progress: 50 },
  { id: 'b4', title: 'Dünya Vatandaşı', description: 'En az 10 farklı ülkeyi ziyaret et.', icon: 'earth', unlocked: false, progress: 40 },
];

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    authorName: 'Ece Yılmaz',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    cityName: 'Roma',
    content: 'Trasteverede harika bir aile işletmesi taze makarna restoranı buldum. Rezervasyon yaptırmak iyi fikir.',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    likesCount: 48,
    commentsCount: 12,
    createdAt: '2 saat önce',
    isLiked: true,
  },
];
