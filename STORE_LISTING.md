# Play Console — Mağaza Listeleme Metinleri

Bu dosya, Play Console > "Mağaza varlığı" bölümlerine kopyala-yapıştır yapılacak
hazır metinleri içerir.

## Uygulama adı

Niyet — Zikirmatik

## Kısa açıklama (max 80 karakter)

Zikir say, manevi bahçeni büyüt, dua kardeşliğine katıl.

(58 karakter)

## Tam açıklama (max 4000 karakter)

```
Niyet, zikrini sayarken maneviyatını da görünür kılan bir zikirmatik uygulaması.

ZİKİRMATİK
Haptik geri bildirimli, sade ve odaklanmayı kolaylaştıran bir sayaç ile
dilediğin zikri çek. Her tur, kendi hedefine göre ilerler.

MANEVİ BAHÇE
Çektiğin her zikirle bahçen yeşerir, çiçek açar. Zikrin arttıkça büyüyen bu
canlı ekosistem, maneviyatının bir aynası gibi cebinde taşınır.

NUR MOTİFLERİ
Selçuklu ve Osmanlı motiflerinden ilhamla tasarlanmış desenleri, zikrinle
doldur. Tamamladığın her motif, kişisel galerine eklenir.

DUA KARDEŞLİĞİ
Rekabetten uzak, yardımlaşma üzerine kurulu bir topluluk. Dua taleplerini
paylaş, başkalarının niyetlerine "amin" de.

AİLE VE GRUP ZİKRİ
Ailenle veya arkadaşlarınla ortak bir hedef belirle, davet koduyla grup
oluştur; herkesin katkısını anlık olarak gör.

GÜNLÜK TAKİP
Günlük virdlerini, haftalık geçmişini ve seri (streak) istatistiklerini takip
ederek düzenli bir zikir alışkanlığı edin.

Niyet; reklamsız, sade ve maneviyatına odaklanmana yardımcı olacak şekilde
tasarlandı.
```

(≈1000 karakter, sınırın çok altında — istenirse genişletilebilir)

## Kategori

Yaşam Tarzı (Lifestyle) — alternatif: Sağlık ve Fitness

## İletişim e-postası

mlh002345@gmail.com

## Gizlilik politikası URL'i

https://github.com/mlh002345-blip/Zikirmatik/blob/claude/niyet-zikirmatik-design-xtervm/PRIVACY_POLICY.md

## Grafik varlıkları — durum

| Varlık | Gereken boyut | Durum |
|---|---|---|
| Uygulama simgesi (adaptive icon) | 512×512 (min) | Mevcut (`assets/android-icon-foreground.png` vb.) |
| Play Console yüksek çözünürlüklü simge | 512×512, 32-bit PNG | **Eksik — Play Console'a ayrıca yüklenmeli** |
| Öne çıkan görsel (feature graphic) | 1024×500 | **Eksik — tasarlanmalı** |
| Telefon ekran görüntüleri | min 2, JPEG/PNG, 16:9 veya 9:16 | **Eksik — cihaz/emülatörde alınmalı** |

Bu üç grafik varlığı bu ortamda üretilemedi (headless ortamda ekran görüntüsü
alacak bir cihaz/emülatör veya tarayıcı erişimi yok). Öneri: `npx expo start`
ile uygulamayı bir telefonda (Expo Go) açıp gerçek ekran görüntüleri alın; öne
çıkan görsel için `assets/icon.png` ve `#0F3D2E` zümrüt yeşili zemin rengi
temel alınarak basit bir tasarım yeterlidir.

## Veri güvenliği formu (Data safety) — yol gösterici

Play Console > App content > Data safety bölümünde işaretlenecekler
(bkz. `PRIVACY_POLICY.md` için ayrıntılı gerekçe):

- **Toplanan veri türleri:** E-posta adresi, Ad, Kullanıcının oluşturduğu
  içerik (dua talebi metni, grup adı).
- **Amaç:** Hesap yönetimi, Uygulama işlevselliği.
- **Şifreli iletim:** Evet (HTTPS/TLS).
- **Kullanıcı veri silme talebi yolu var mı:** Evet — e-posta ile
  (mlh002345@gmail.com).
- **Üçüncü taraflarla paylaşım:** Supabase (barındırma), Google (yalnızca
  Google ile giriş tercih edilirse kimlik doğrulama).
- **Reklam / analiz SDK'sı:** Yok.

## İçerik derecelendirmesi anketi — yol gösterici

- Şiddet, cinsellik, kumar: Yok.
- Kullanıcı tarafından oluşturulan metin (dua talepleri, grup adları): Var —
  ankette "Kullanıcılar metin paylaşabilir" seçeneği işaretlenmeli.
- Uygulama içi moderasyon: Kullanıcılar "..." menüsünden içerik
  şikayet edebilir ve kendi paylaşımını silebilir (bkz. `dua.tsx`).

Beklenen derecelendirme: **Herkes / 3+** (PEGI 3 dengi).
