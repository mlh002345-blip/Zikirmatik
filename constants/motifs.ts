// 25 özgün manevi motif — Selçuklu/Osmanlı geometrik sanatından ilham alır.
// Her motif bir "pattern" tipine (star8, star10, star12, girih, rosette, weave)
// ve bir çizim varyasyonuna (variant) bağlanır; MotifPattern bileşeni bunları render eder.

export type MotifCategory = 'Sabır' | 'Şükür' | 'İhsan' | 'Tevekkül' | 'Rahmet';
export type MotifPatternType = 'star8' | 'star10' | 'star12' | 'girih' | 'rosette' | 'weave';

export interface Motif {
  id: string;
  name: string;
  category: MotifCategory;
  arabic: string;
  description: string;
  target: number; // zikir adedi ile tamamlanır
  pattern: MotifPatternType;
  variant: number; // 0-4, aynı pattern ailesinde çizim çeşitlemesi
}

export const motifs: Motif[] = [
  { id: 'sabir-yildizi', name: 'Sabır Yıldızı', category: 'Sabır', arabic: 'الصَّبْر', description: 'Zorlukta direnmenin sekiz köşeli nuru.', target: 1000, pattern: 'star8', variant: 0 },
  { id: 'ihsan-geometrisi', name: 'İhsan Geometrisi', category: 'İhsan', arabic: 'الإحسان', description: 'Görülmese de görülüyormuşçasına güzellik.', target: 1500, pattern: 'star10', variant: 0 },
  { id: 'sukur-cicegi', name: 'Şükür Çiçeği', category: 'Şükür', arabic: 'الشُّكْر', description: 'Nimeti fark eden kalbin açan gülü.', target: 500, pattern: 'rosette', variant: 0 },
  { id: 'tevekkul-dugumu', name: 'Tevekkül Düğümü', category: 'Tevekkül', arabic: 'التَّوَكُّل', description: 'Sebeplere sarılıp Allah\'a güvenmenin örgüsü.', target: 1200, pattern: 'girih', variant: 0 },
  { id: 'rahmet-halkasi', name: 'Rahmet Halkası', category: 'Rahmet', arabic: 'الرَّحْمَة', description: 'Kuşatan merhametin iç içe daireleri.', target: 700, pattern: 'weave', variant: 0 },
  { id: 'huzur-yildizi', name: 'Huzur Yıldızı', category: 'Sabır', arabic: 'السَّكِينَة', description: 'On iki köşeli dinginlik.', target: 1000, pattern: 'star12', variant: 0 },
  { id: 'affetme-gulu', name: 'Affetme Gülü', category: 'Rahmet', arabic: 'العَفْو', description: 'Bağışlamanın yumuşak yaprakları.', target: 900, pattern: 'rosette', variant: 1 },
  { id: 'niyet-nuru', name: 'Niyet Nuru', category: 'İhsan', arabic: 'النِّيَّة', description: 'Her amelin özündeki saf ışık.', target: 1111, pattern: 'star8', variant: 1 },
  { id: 'hamd-oruntusu', name: 'Hamd Örüntüsü', category: 'Şükür', arabic: 'الحَمْد', description: 'Övgünün tekrar eden desenleri.', target: 800, pattern: 'girih', variant: 1 },
  { id: 'teslimiyet-dairesi', name: 'Teslimiyet Dairesi', category: 'Tevekkül', arabic: 'التَّسْلِيم', description: 'Kadere rıza gösteren döngü.', target: 1300, pattern: 'star10', variant: 1 },
  { id: 'ihlas-yildizi', name: 'İhlas Yıldızı', category: 'İhsan', arabic: 'الإخْلاص', description: 'Sadece Allah rızası için parlayan.', target: 1600, pattern: 'star12', variant: 1 },
  { id: 'safa-havuzu', name: 'Safa Havuzu', category: 'Rahmet', arabic: 'الصَّفَاء', description: 'Berraklaşan kalbin yansıması.', target: 600, pattern: 'weave', variant: 1 },
  { id: 'kanaat-yaprakligi', name: 'Kanaat Yapraklığı', category: 'Şükür', arabic: 'القَنَاعَة', description: 'Azla yetinmenin sade zerafeti.', target: 500, pattern: 'rosette', variant: 2 },
  { id: 'yakin-orgusu', name: 'Yakîn Örgüsü', category: 'Tevekkül', arabic: 'اليَقِين', description: 'Şüphesiz imanın sıkı dokusu.', target: 1400, pattern: 'girih', variant: 2 },
  { id: 'huzme-i-nur', name: 'Hüzme-i Nur', category: 'İhsan', arabic: 'شُعَاعُ النُّور', description: 'Dağılan ışık demetleri.', target: 1000, pattern: 'star8', variant: 2 },
  { id: 'dirilis-cemberi', name: 'Diriliş Çemberi', category: 'Rahmet', arabic: 'الإحْيَاء', description: 'Kalbi yeniden canlandıran halka.', target: 750, pattern: 'weave', variant: 2 },
  { id: 'metanet-kalesi', name: 'Metanet Kalesi', category: 'Sabır', arabic: 'المَتَانَة', description: 'Sarsılmaz duruşun on iki bastionu.', target: 1200, pattern: 'star12', variant: 2 },
  { id: 'rida-gulzari', name: 'Rıza Gülzarı', category: 'Tevekkül', arabic: 'الرِّضَا', description: 'Hoşnutluğun çiçek bahçesi.', target: 850, pattern: 'rosette', variant: 3 },
  { id: 'zikir-dugumu', name: 'Zikir Düğümü', category: 'Şükür', arabic: 'الذِّكْر', description: 'Dilin ve kalbin birleştiği örgü.', target: 1000, pattern: 'girih', variant: 3 },
  { id: 'sabr-i-cemil', name: 'Sabr-ı Cemîl', category: 'Sabır', arabic: 'الصَّبْرُ الجَمِيل', description: 'Güzel sabrın on köşeli formu.', target: 1500, pattern: 'star10', variant: 2 },
  { id: 'letafet-cemberi', name: 'Letafet Çemberi', category: 'İhsan', arabic: 'اللَّطَافَة', description: 'İnceliğin iç içe geçen daireleri.', target: 650, pattern: 'weave', variant: 3 },
  { id: 'hidayet-yildizi', name: 'Hidayet Yıldızı', category: 'Rahmet', arabic: 'الهِدَايَة', description: 'Doğru yolu gösteren sekiz uç.', target: 1100, pattern: 'star8', variant: 3 },
  { id: 'vefa-orgusu', name: 'Vefa Örgüsü', category: 'Şükür', arabic: 'الوَفَاء', description: 'Sadakatin kesişen çizgileri.', target: 900, pattern: 'girih', variant: 4 },
  { id: 'muhabbet-gulu', name: 'Muhabbet Gülü', category: 'Rahmet', arabic: 'المَحَبَّة', description: 'Sevginin taç yaprakları.', target: 777, pattern: 'rosette', variant: 4 },
  { id: 'ebediyet-cemberi', name: 'Ebediyet Çemberi', category: 'Tevekkül', arabic: 'الأَبَدِيَّة', description: 'Sonsuzluğa açılan on iki köşe.', target: 2000, pattern: 'star12', variant: 3 },
];

export const categoryOrder: MotifCategory[] = ['Sabır', 'Şükür', 'İhsan', 'Tevekkül', 'Rahmet'];
