-- =========================================================
-- Lexio — Données de démonstration (optionnel)
-- =========================================================
-- Le profil et les lignes sont protégés par RLS et liés à un utilisateur.
-- 1) Crée d'abord un compte via l'app (ou Supabase Auth).
-- 2) Récupère son UUID :  select id, email from auth.users;
-- 3) Passe l'UUID en variable puis exécute ce fichier avec psql :
--      psql "<connection-string>" -v uid="'<USER-UUID>'" -f supabase/seed.sql
-- =========================================================

\if :{?uid}
  -- Centres d'intérêt
  insert into public.user_interests (user_id, interest) values
    (:uid, 'Football'),
    (:uid, 'IA'),
    (:uid, 'Technologie')
  on conflict (user_id, interest) do nothing;

  -- Quelques mots (next_review_date = aujourd'hui → tout de suite révisables)
  insert into public.vocabulary
    (user_id, word, english_definition, french_translation, french_definition,
     pronunciation, example_sentence, synonyms, cefr_level)
  values
    (:uid, 'heretic', 'a person holding an opinion against accepted belief',
     'hérétique', 'personne dont l''opinion s''oppose aux idées reçues',
     '/ˈher.ə.tɪk/', 'He was branded a heretic for his ideas.',
     array['dissenter','nonconformist'], 'C1'),
    (:uid, 'resilient', 'able to recover quickly from difficulty',
     'résilient', 'capable de récupérer rapidement', '/rɪˈzɪl.i.ənt/',
     'A resilient team never gives up.', array['tough','hardy'], 'B2'),
    (:uid, 'breakthrough', 'a sudden important discovery',
     'percée', 'découverte soudaine et importante', '/ˈbreɪk.θruː/',
     'The lab made a major breakthrough.', array['advance','discovery'], 'B2')
  on conflict (user_id, lower(word)) do nothing;
\else
  \echo '>> Variable :uid non définie. Relance avec  -v uid="''<USER-UUID>''"'
\endif
