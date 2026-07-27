# Niyet — Supabase Kurulumu

1. https://supabase.com adresinden ücretsiz bir hesap açın, **New project** ile yeni bir proje oluşturun.
2. Proje hazır olduğunda sol menüden **SQL Editor**'e girin, **New query** açın, bu klasördeki
   `schema.sql` dosyasının tüm içeriğini yapıştırıp **Run** ile çalıştırın.
3. Sol menüden **Settings > API**'ye girin, şu iki değeri kopyalayın:
   - **Project URL**
   - **anon public** key
4. Proje kök dizininde `.env.example` dosyasını `.env` olarak kopyalayın ve bu iki değeri girin:
   ```
   cp .env.example .env
   ```
5. **Settings > Authentication > Providers > Email** altında "Confirm email" seçeneğini
   kapatabilirsiniz (test sırasında e-posta doğrulama beklememek için); yayına alırken
   tekrar açmanız önerilir.
6. `npm install` (eğer henüz çalıştırmadıysanız) ve `npx expo start` ile uygulamayı başlatın.

Bu adımlardan sonra kayıt/giriş, grup zikirleri ve dua talepleri gerçek, paylaşımlı bir
veritabanı üzerinden çalışır — aynı gruba farklı telefonlardan katılan kişiler birbirinin
katkısını anlık olarak görür.
