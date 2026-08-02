-- Niyet — Ek migrasyon (2026-08-02)
-- Zaten kurulu bir projeniz varsa (schema.sql'i daha önce çalıştırdıysanız),
-- Play Store'un kullanıcı içeriği (UGC) politikası gereği eklenen "kendi dua
-- talebini silme" ve "içerik şikayeti" özellikleri için SADECE bu dosyayı
-- SQL Editor'de çalıştırmanız yeterli. schema.sql'i tekrar çalıştırmayın.

create policy "Kullanıcı kendi dua talebini silebilir"
  on public.dua_requests for delete
  to authenticated
  using (auth.uid() = user_id);

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  request_id uuid not null references public.dua_requests (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.content_reports enable row level security;

create policy "Kullanıcı şikayet oluşturabilir"
  on public.content_reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);
