# Play Store Yayım Kontrol Listesi

## Tamamlanan (bu ortamda otomatik yapıldı)

- [x] `app.json`: Android `versionCode`, iOS `buildNumber`, geçersiz
      `newArchEnabled` alanı kaldırıldı, `expo-splash-screen` eklentisi
      düzgün yapılandırıldı (daha önce hiç kullanılmayan `splash-icon.png`
      artık gerçekten splash ekranında gösteriliyor).
- [x] `eas.json` oluşturuldu (`development` / `preview` / `production` build
      profilleri + Play Store `submit` yapılandırması, `internal` track).
- [x] Expo SDK 57 ile uyumsuz bağımlılıklar güncellendi (`expo install --fix`);
      `npx expo-doctor` artık **20/20** geçiyor.
- [x] `npx tsc --noEmit` hatasız.
- [x] Web bundle başarıyla derlenip sunucu 200 döndü (kod düzeyinde regresyon
      kontrolü — gerçek cihaz/tarayıcı erişimi bu ortamda yok).
- [x] Gizlilik politikası yazıldı ve yayına alındı:
      https://github.com/mlh002345-blip/Zikirmatik/blob/claude/niyet-zikirmatik-design-xtervm/PRIVACY_POLICY.md
      — Ayarlar ekranı ve kayıt ekranından bağlandı.
- [x] Google Play'in kullanıcı içeriği (UGC) politikası gereği: dua
      taleplerinde "..." menüsünden şikayet etme ve kendi paylaşımını silme
      eklendi (`supabase/migration_2026-08-02_moderation.sql` — **mevcut
      Supabase projenizde SQL Editor'de çalıştırmanız gerekiyor**, bkz.
      `supabase/README.md`).
- [x] Ayarlar ekranındaki işlevsiz (hiçbir şey yapmayan) butonlara "yakında"
      geri bildirimi eklendi — Play Store incelemesinde "bozuk buton" izlenimi
      vermesin diye.
- [x] Mağaza metinleri (`STORE_LISTING.md`) hazırlandı.

## Sizin (hesap sahibi olarak) yapmanız gereken adımlar

Bu adımlar sizin Expo/Google hesabınıza bağlı olduğu için bu ortamdan
yapılamadı — bir asistanın sizin hesabınıza kimlik bilgisiyle giriş yapması
zaten güvenli/mümkün değil:

1. **Supabase migrasyonu**: `supabase/migration_2026-08-02_moderation.sql`
   dosyasını Supabase Dashboard > SQL Editor'de çalıştırın (şikayet/silme
   özelliği için).
2. **EAS'e giriş**: `npx eas login` (Expo hesabınızla).
3. **Projeyi EAS'e bağlayın**: `npx eas init` — bu, `app.json` içine
   `extra.eas.projectId` ekleyecek.
4. **Google Play Console hesabı** yoksa açın (tek seferlik 25$ kayıt ücreti,
   kimlik doğrulama gerektirir) ve "Niyet" için yeni bir uygulama oluşturun.
5. **Production build alın**:
   ```
   npx eas build --platform android --profile production
   ```
   Bu, imzalı bir `.aab` (Android App Bundle) üretir; imzalama anahtarını
   EAS otomatik oluşturup güvenli şekilde saklar.
6. **Play Console'a yükleyin** — iki yoldan biri:
   - Manuel: EAS build sayfasından `.aab` dosyasını indirip Play Console >
     Production/Internal testing'e elle yükleyin, VEYA
   - Otomatik: Play Console'da bir servis hesabı (service account) oluşturup
     JSON anahtarını proje köküne `google-service-account.json` olarak
     kaydedin (bu dosya `.gitignore`'da zaten hariç tutuluyor), sonra:
     ```
     npx eas submit --platform android --profile production
     ```
7. **Mağaza listelemesini doldurun**: `STORE_LISTING.md` içindeki hazır
   metinleri kopyalayın; eksik olan üç grafiği (yüksek çözünürlüklü simge,
   öne çıkan görsel, ekran görüntüleri) hazırlayıp yükleyin.
8. **İçerik derecelendirmesi ve Veri güvenliği anketlerini** `STORE_LISTING.md`
   içindeki yol gösterici bölüme göre doldurun.
9. İlk sürümü **Internal testing** track'inde yayınlayıp kendi hesabınızla
   test etmeniz, ardından **Production**'a terfi ettirmeniz önerilir.

## Neden bu adımlar otomatikleştirilemedi

Bu ortamda: `gh` (GitHub CLI) kurulu değil, `eas whoami` "Not logged in"
döndürdü, yerel bir Android SDK/emülatör yok ve tarayıcı erişimi
etkinleştirilmedi. Google Play Console ve Expo hesaplarına gerçek kimlik
bilgileriyle giriş, güvenlik ve hesap sahipliği nedeniyle sizin tarafınızdan
yapılmalı.
