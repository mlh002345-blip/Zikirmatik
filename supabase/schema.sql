-- Niyet — Supabase şeması
-- Kurulum: Supabase projenizde Dashboard > SQL Editor'e yapıştırıp çalıştırın.
-- Bu betik idempotent değildir; sıfırdan bir proje için tasarlanmıştır.

-- ============================================================
-- PROFİLLER
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'Niyet Kullanıcısı',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiller herkese görünür (isim/avatar için)"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Yeni kullanıcı kayıt olduğunda otomatik profil satırı oluştur.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- GRUP ZİKİRLERİ
-- ============================================================

create table public.dhikr_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dhikr_id text not null,
  target bigint not null check (target > 0),
  progress bigint not null default 0,
  invite_code text not null unique,
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.dhikr_groups (id) on delete cascade,
  -- profiles(id) referans alınıyor (auth.users değil) ki PostgREST
  -- group_members -> profiles ilişkisini otomatik algılayıp üye adlarını
  -- tek sorguda getirebilsin.
  user_id uuid not null references public.profiles (id) on delete cascade,
  contribution bigint not null default 0,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

alter table public.dhikr_groups enable row level security;
alter table public.group_members enable row level security;

create policy "Gruplar tüm giriş yapmış kullanıcılara görünür"
  on public.dhikr_groups for select
  to authenticated
  using (true);

create policy "Grup üyelikleri herkese görünür"
  on public.group_members for select
  to authenticated
  using (true);

-- Doğrudan INSERT/UPDATE politikası yok: tüm yazma işlemleri aşağıdaki
-- SECURITY DEFINER RPC fonksiyonları üzerinden, tutarlılık ve atomiklik
-- garantisiyle yapılır.

create or replace function public.create_dhikr_group(p_name text, p_dhikr_id text, p_target bigint)
returns public.dhikr_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.dhikr_groups;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Giriş yapmalısınız.';
  end if;

  v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));

  insert into public.dhikr_groups (name, dhikr_id, target, invite_code, created_by)
  values (nullif(trim(p_name), ''), p_dhikr_id, greatest(p_target, 1), v_code, auth.uid())
  returning * into v_group;

  insert into public.group_members (group_id, user_id, contribution)
  values (v_group.id, auth.uid(), 0);

  return v_group;
end;
$$;

create or replace function public.join_group_by_code(p_code text)
returns public.dhikr_groups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.dhikr_groups;
begin
  if auth.uid() is null then
    raise exception 'Giriş yapmalısınız.';
  end if;

  select * into v_group from public.dhikr_groups where invite_code = upper(trim(p_code));
  if not found then
    raise exception 'Bu kodla eşleşen bir grup bulunamadı.';
  end if;

  insert into public.group_members (group_id, user_id, contribution)
  values (v_group.id, auth.uid(), 0)
  on conflict (group_id, user_id) do nothing;

  return v_group;
end;
$$;

create or replace function public.increment_group_contribution(p_group_id uuid, p_amount int default 1)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Giriş yapmalısınız.';
  end if;

  update public.group_members
    set contribution = contribution + p_amount
    where group_id = p_group_id and user_id = auth.uid();

  if not found then
    raise exception 'Bu grubun üyesi değilsiniz.';
  end if;

  update public.dhikr_groups
    set progress = progress + p_amount
    where id = p_group_id;
end;
$$;

-- Realtime: grup ve üyelik değişiklikleri anlık yayınlansın.
alter publication supabase_realtime add table public.dhikr_groups;
alter publication supabase_realtime add table public.group_members;

-- ============================================================
-- DUA TALEPLERİ
-- ============================================================

create table public.dua_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  category text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.dua_amins (
  request_id uuid not null references public.dua_requests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (request_id, user_id)
);

alter table public.dua_requests enable row level security;
alter table public.dua_amins enable row level security;

create policy "Dua talepleri herkese görünür"
  on public.dua_requests for select
  to authenticated
  using (true);

create policy "Kullanıcı kendi dua talebini oluşturabilir"
  on public.dua_requests for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Amin'ler herkese görünür"
  on public.dua_amins for select
  to authenticated
  using (true);

create policy "Kullanıcı kendi amin'ini ekleyebilir"
  on public.dua_amins for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Kullanıcı kendi amin'ini kaldırabilir"
  on public.dua_amins for delete
  to authenticated
  using (auth.uid() = user_id);

alter publication supabase_realtime add table public.dua_requests;
alter publication supabase_realtime add table public.dua_amins;
