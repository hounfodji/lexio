-- =========================================================
-- Lexio — Réglages IA par utilisateur (provider + clé chiffrée)
-- =========================================================
create table public.user_ai_settings (
  user_id        uuid primary key references public.profiles (id) on delete cascade,
  provider       text not null,
  api_key_cipher text,        -- AES-256-GCM (iv:tag:cipher b64) ; null = pas de clé perso
  model          text,
  updated_at     timestamptz not null default now()
);

alter table public.user_ai_settings enable row level security;

create policy "user_ai_settings_select_own" on public.user_ai_settings
  for select using (auth.uid() = user_id);
create policy "user_ai_settings_insert_own" on public.user_ai_settings
  for insert with check (auth.uid() = user_id);
create policy "user_ai_settings_update_own" on public.user_ai_settings
  for update using (auth.uid() = user_id);
create policy "user_ai_settings_delete_own" on public.user_ai_settings
  for delete using (auth.uid() = user_id);
