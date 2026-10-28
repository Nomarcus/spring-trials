-- Fjädra: topplista och delade spelarbanor i Supabase.
-- Kör hela filen en gång i Supabase → SQL Editor → New query → Run.
-- Spelet använder den publika "anon"-nyckeln. Reglerna nedan låter alla LÄSA och LÄGGA TILL,
-- men ingen kan ändra eller ta bort något. Det gör bara ägaren i Supabase-panelen (Table Editor).
-- Huvudbanorna ligger i spelets kod på GitHub och kan aldrig ändras härifrån.

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  level_id text not null check (char_length(level_id) between 1 and 40),
  name text not null check (char_length(name) between 1 and 16),
  time real not null check (time > 1 and time < 7200),
  created_at timestamptz not null default now()
);
create index if not exists scores_level_time on public.scores (level_id, time);
alter table public.scores enable row level security;
drop policy if exists "alla kan läsa topplistan" on public.scores;
create policy "alla kan läsa topplistan" on public.scores for select to anon using (true);
drop policy if exists "alla kan lägga till en tid" on public.scores;
create policy "alla kan lägga till en tid" on public.scores for insert to anon with check (true);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  author text not null check (char_length(author) between 1 and 16),
  doc jsonb not null check (octet_length(doc::text) < 400000),
  created_at timestamptz not null default now()
);
alter table public.levels enable row level security;
drop policy if exists "alla kan läsa delade banor" on public.levels;
create policy "alla kan läsa delade banor" on public.levels for select to anon using (true);
drop policy if exists "alla kan dela en bana" on public.levels;
create policy "alla kan dela en bana" on public.levels for insert to anon with check (true);
-- Inga update/delete-policyer: spelare kan inte ändra eller ta bort något.
