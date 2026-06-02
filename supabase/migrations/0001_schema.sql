-- =========================================================
-- Lexio — Schéma initial (types, tables, index)
-- =========================================================

-- Types & extensions ---------------------------------------
create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
create type word_status as enum ('new', 'learning', 'mastered');
create type quiz_type as enum ('def_to_word', 'word_to_def', 'multiple_choice', 'fill_in_blank');

-- PROFILES : miroir applicatif de auth.users ---------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

-- USER_INTERESTS : centres d'intérêt choisis à l'onboarding -
create table public.user_interests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  interest    text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, interest)
);
create index idx_user_interests_user on public.user_interests (user_id);

-- VOCABULARY : base de mots personnelle --------------------
create table public.vocabulary (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  word                text not null,
  english_definition  text,
  french_translation  text,
  french_definition   text,
  pronunciation       text,                 -- IPA, ex: /ˈher.ə.tɪk/
  example_sentence    text,
  synonyms            text[] not null default '{}',
  cefr_level          cefr_level,
  mastery_score       int  not null default 0,    -- 0 à 100
  review_count        int  not null default 0,
  interval_index      int  not null default 0,     -- index dans [1,3,7,14,30]
  status              word_status not null default 'new',
  next_review_date    date not null default current_date,
  created_at          timestamptz not null default now()
);
-- anti-doublon insensible à la casse (F3.3 : UNIQUE(user_id, lower(word)))
create unique index uq_user_word on public.vocabulary (user_id, lower(word));
create index idx_vocabulary_user on public.vocabulary (user_id);
create index idx_vocabulary_review on public.vocabulary (user_id, next_review_date);

-- QUIZ_ATTEMPTS : historique des réponses -----------------
create table public.quiz_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  vocabulary_id  uuid not null references public.vocabulary (id) on delete cascade,
  quiz_type      quiz_type not null,
  is_correct     boolean not null,
  created_at     timestamptz not null default now()
);
create index idx_quiz_attempts_user on public.quiz_attempts (user_id, created_at);

-- STORY_HISTORY : histoires générées ----------------------
create table public.story_history (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  title           text not null,
  content         text not null,
  words_used      text[] not null default '{}',
  interests_used  text[] not null default '{}',
  created_at      timestamptz not null default now()
);
create index idx_story_history_user on public.story_history (user_id, created_at);
