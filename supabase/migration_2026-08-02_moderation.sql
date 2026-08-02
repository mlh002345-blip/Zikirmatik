-- Niyet — Ek migrasyon (2026-08-02)
-- Play Store'un kullanıcı içeriği (UGC) politikası gereği eklenen "kendi dua
-- talebini silme" ve "içerik şikayeti" özelliklerinin sunucu tarafı.
--
-- Bu betik idempotent'tir: kaç kez çalıştırırsanız çalıştırın hata vermez,
-- var olanı atlar. schema.sql'i ayrıca çalıştırmanıza gerek yok.

-- 1) Kullanıcı kendi dua talebini silebilsin
drop policy if exists "Kullanıcı kendi dua talebini silebilir" on public.dua_requests;

create policy "Kullanıcı kendi dua talebini silebilir"
  on public.dua_requests for delete
  to authenticated
  using (auth.uid() = user_id);

-- 2) Şikayet tablosu
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  request_id uuid not null references public.dua_requests (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.content_reports enable row level security;

-- Şikayetler yalnızca oluşturulabilir; okuma politikası kasıtlı olarak yok —
-- şikayetleri yalnızca proje sahibi Supabase panelinden görür.
drop policy if exists "Kullanıcı şikayet oluşturabilir" on public.content_reports;

create policy "Kullanıcı şikayet oluşturabilir"
  on public.content_reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);
