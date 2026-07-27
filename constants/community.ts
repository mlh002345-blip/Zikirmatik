export interface DuaRequest {
  id: string;
  authorName: string;
  authorInitial: string;
  category: 'Şifa' | 'Sınav' | 'Hayırlı Kısmet' | 'Aile' | 'Yolculuk';
  text: string;
  duaCount: number;
  timeAgo: string;
  joined: boolean;
}

export const duaRequests: DuaRequest[] = [
  { id: 'd1', authorName: 'Ayşe K.', authorInitial: 'A', category: 'Şifa', text: 'Annem için şifa niyetine dua bekliyorum. Rabbim şifa versin.', duaCount: 214, timeAgo: '2 sa', joined: true },
  { id: 'd2', authorName: 'Mehmet Y.', authorInitial: 'M', category: 'Sınav', text: 'Yarınki sınavım için Allah kolaylık versin, dua edin lütfen.', duaCount: 89, timeAgo: '4 sa', joined: false },
  { id: 'd3', authorName: 'Zeynep A.', authorInitial: 'Z', category: 'Hayırlı Kısmet', text: 'Hayırlı bir kısmet için niyet ettim, siz de niyetime ortak olur musunuz.', duaCount: 156, timeAgo: '6 sa', joined: true },
  { id: 'd4', authorName: 'Bir Kardeşiniz', authorInitial: 'K', category: 'Aile', text: 'Ailemde huzur ve bereket için dua niyaz ediyorum.', duaCount: 302, timeAgo: '1 g', joined: false },
  { id: 'd5', authorName: 'Emre S.', authorInitial: 'E', category: 'Yolculuk', text: 'Yarın uzun bir yolculuğa çıkıyorum, hayırlısıyla tamamlamak için dua bekliyorum.', duaCount: 47, timeAgo: '1 g', joined: false },
  { id: 'd6', authorName: 'Fatma D.', authorInitial: 'F', category: 'Şifa', text: 'Babamın ameliyatı yaklaşıyor, dualarınıza ihtiyacımız var.', duaCount: 431, timeAgo: '2 g', joined: true },
];

export interface DhikrGroup {
  id: string;
  name: string;
  memberCount: number;
  targetLabel: string;
  targetTotal: number;
  targetProgress: number;
  avatarInitials: string[];
}

export const dhikrGroups: DhikrGroup[] = [
  { id: 'g1', name: 'Aile Zikir Halkası', memberCount: 6, targetLabel: '70.000 Kelime-i Tevhid', targetTotal: 70000, targetProgress: 48210, avatarInitials: ['A', 'M', 'Z', 'F'] },
  { id: 'g2', name: 'Cuma Kardeşliği', memberCount: 24, targetLabel: '100.000 Salavat', targetTotal: 100000, targetProgress: 62050, avatarInitials: ['E', 'S', 'K', 'B'] },
  { id: 'g3', name: 'Şifa Niyetine', memberCount: 11, targetLabel: '10.000 İstiğfar', targetTotal: 10000, targetProgress: 9120, avatarInitials: ['A', 'F', 'D'] },
];
