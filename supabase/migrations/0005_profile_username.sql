-- =========================================================
-- Lexio — Ajout du champ username au profil
-- Display name simple, modifiable, non-unique. Login toujours par email.
-- =========================================================

alter table public.profiles add column if not exists username text;

-- Backfill : équivalent de ce qu'on aurait initialisé au signup.
update public.profiles
   set username = split_part(email, '@', 1)
 where username is null;

-- Trigger mis à jour : initialiser le username dès l'insertion.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;
