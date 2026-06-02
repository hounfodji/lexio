-- =========================================================
-- Lexio — Row Level Security
-- Chaque ligne n'est accessible que par son propriétaire.
-- =========================================================

alter table public.profiles       enable row level security;
alter table public.user_interests enable row level security;
alter table public.vocabulary     enable row level security;
alter table public.quiz_attempts  enable row level security;
alter table public.story_history  enable row level security;

-- PROFILES : clé = id ---------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- USER_INTERESTS -------------------------------------------
create policy "user_interests_select_own" on public.user_interests
  for select using (auth.uid() = user_id);
create policy "user_interests_insert_own" on public.user_interests
  for insert with check (auth.uid() = user_id);
create policy "user_interests_update_own" on public.user_interests
  for update using (auth.uid() = user_id);
create policy "user_interests_delete_own" on public.user_interests
  for delete using (auth.uid() = user_id);

-- VOCABULARY -----------------------------------------------
create policy "vocabulary_select_own" on public.vocabulary
  for select using (auth.uid() = user_id);
create policy "vocabulary_insert_own" on public.vocabulary
  for insert with check (auth.uid() = user_id);
create policy "vocabulary_update_own" on public.vocabulary
  for update using (auth.uid() = user_id);
create policy "vocabulary_delete_own" on public.vocabulary
  for delete using (auth.uid() = user_id);

-- QUIZ_ATTEMPTS --------------------------------------------
create policy "quiz_attempts_select_own" on public.quiz_attempts
  for select using (auth.uid() = user_id);
create policy "quiz_attempts_insert_own" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);
create policy "quiz_attempts_delete_own" on public.quiz_attempts
  for delete using (auth.uid() = user_id);

-- STORY_HISTORY --------------------------------------------
create policy "story_history_select_own" on public.story_history
  for select using (auth.uid() = user_id);
create policy "story_history_insert_own" on public.story_history
  for insert with check (auth.uid() = user_id);
create policy "story_history_delete_own" on public.story_history
  for delete using (auth.uid() = user_id);
