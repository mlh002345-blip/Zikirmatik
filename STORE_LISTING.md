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

Tüm ikonlar `scripts/generate-icons.ps1` ile üretildi. Marka işareti,
uygulamanın kendi `MotifPattern` bileşenindeki **star8** geometrisinin
(8 köşeli Selçuk yıldızı) birebir aynısı — zümrüt zemin (`#0A2B20`→`#285943`)
üzerinde altın nur gradyanı (`#C9A24B`→`#E8C97A`→`#FFF6DC`). Biçimi değiştirmek
isterseniz betikteki yarıçap/renk değerlerini düzenleyip yeniden çalıştırın.

| Varlık | Gereken boyut | Durum |
|---|---|---|
| `assets/icon.png` | 1024×1024 | ✅ Üretildi |
| `assets/android-icon-foreground.png` | 512×512, saydam | ✅ Üretildi (adaptif güvenli alan içinde) |
| `assets/android-icon-background.png` | 512×512 | ✅ Üretildi |
| `assets/android-icon-monochrome.png` | 512×512, saydam siluet | ✅ Üretildi (temalı ikon) |
| `assets/splash-icon.png` | 1024×1024, saydam | ✅ Üretildi |
| `assets/favicon.png` | 48×48 | ✅ Üretildi |
| `store-assets/play-store-icon.png` | 512×512, 32-bit PNG | ✅ Üretildi — Play Console'a yüklenecek |
| `store-assets/feature-graphic.png` | 1024×500 | ✅ Üretildi — Play Console'a yüklenecek |
| Telefon ekran görüntüleri | min 2, JPEG/PNG, 16:9 veya 9:16 | ⚠️ **Eksik — cihazda alınmalı** |

Ekran görüntüleri bu ortamda üretilemedi (headless; ekran görüntüsü alacak
cihaz/emülatör veya tarayıcı erişimi yok). Öneri: `npx expo start` ile
uygulamayı telefonunuzda Expo Go üzerinden açıp Zikirmatik, Bahçe, Galeri ve
Dua Kardeşliği ekranlarından en az 2 (tercihen 4-6) görüntü alın.

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
