export interface DhikrPreset {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  defaultTarget: number;
}

export const dhikrPresets: DhikrPreset[] = [
  { id: 'subhanallah', arabic: 'سُبْحَانَ اللّٰه', transliteration: 'Sübhanallah', meaning: 'Allah her türlü noksanlıktan münezzehtir', defaultTarget: 33 },
  { id: 'elhamdulillah', arabic: 'اَلْحَمْدُ لِلّٰه', transliteration: 'Elhamdülillah', meaning: 'Hamd Allah\'a mahsustur', defaultTarget: 33 },
  { id: 'allahuekber', arabic: 'اَللّٰهُ أَكْبَر', transliteration: 'Allahu Ekber', meaning: 'Allah en büyüktür', defaultTarget: 34 },
  { id: 'lailaheillallah', arabic: 'لَا إِلٰهَ إِلَّا اللّٰه', transliteration: 'Lâ ilâhe illallah', meaning: 'Allah\'tan başka ilah yoktur', defaultTarget: 100 },
  { id: 'estagfirullah', arabic: 'أَسْتَغْفِرُ اللّٰه', transliteration: 'Estağfirullah', meaning: 'Allah\'tan bağışlanma dilerim', defaultTarget: 100 },
  {
    id: 'salavat',
    arabic: 'اَللّٰهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ وَعَلٰى اٰلِ سَيِّدِنَا مُحَمَّدٍ',
    transliteration: 'Allahümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed',
    meaning: 'Allah\'ım! Hz. Muhammed\'e ve Hz. Muhammed\'in ailesine salât (rahmet ve esenlik) eyle.',
    defaultTarget: 100,
  },
  { id: 'havkale', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰه', transliteration: 'Lâ havle velâ kuvvete illâ billâh', meaning: 'Güç ve kuvvet ancak Allah\'tandır', defaultTarget: 100 },
  {
    id: 'kelimeitevhid',
    arabic: 'لَا إِلٰهَ إِلَّا اللهُ مُحَمَّدٌ رَسُولُ اللهِ',
    transliteration: 'Lâ ilâhe illallâh, Muhammedün resûlullâh.',
    meaning: 'Allah\'tan başka ilah olmadığına ve Muhammed\'in (s.a.v.) O\'nun Resûlü olduğuna şehadet ederim',
    defaultTarget: 70000,
  },
];

export interface DailyWird {
  id: string;
  dhikrId: string;
  target: number;
  progress: number;
}
