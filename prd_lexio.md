# PRD — Lexio
### Plateforme d'apprentissage du vocabulaire anglais propulsée par l'IA

> *Nom de travail : **Lexio** (lexicon). Alternatives si tu veux changer : WordWeave, VocaFlow, Lumio.*

| | |
|---|---|
| **Version** | 1.0 (MVP) |
| **Statut** | Draft pour validation avant développement |
| **Cible plateforme** | Web responsive (Next.js 15, App Router) |
| **Marché initial** | Apprenants francophones d'anglais (B1→C2) |

---

## 1. Résumé exécutif

La plupart des apprenants découvrent des mots anglais « dans la nature » — vidéos YouTube, films, podcasts, articles. Ils les notent quelque part, puis ne les revoient jamais efficacement. Le mot est vu une fois, puis oublié.

**Lexio transforme une simple liste de mots en un système d'apprentissage actif.** L'utilisateur ajoute un mot ; l'IA produit une fiche complète (définition EN, traduction FR, définition FR, prononciation, exemple, synonymes, niveau CEFR). L'utilisateur révise ensuite via quiz et répétition espacée, et — fonctionnalité phare — l'IA génère des **histoires personnalisées** qui réutilisent ses mots non maîtrisés dans le contexte de ses centres d'intérêt.

La proposition de valeur unique tient en une phrase : *« Tes mots, racontés dans une histoire qui te passionne, jusqu'à ce que tu les retiennes. »*

---

## 2. Problème & opportunité

**Le problème.** La rétention de vocabulaire échoue pour trois raisons :
- **Pas de contexte** : un mot listé seul (sans phrase, sans usage) n'ancre rien en mémoire.
- **Pas de répétition planifiée** : sans rappel au bon moment, la courbe de l'oubli gagne.
- **Pas d'engagement** : les listes et flashcards génériques sont ennuyeuses ; l'utilisateur décroche.

**L'opportunité.** Combiner trois leviers prouvés — contexte riche, répétition espacée, et personnalisation par centres d'intérêt — dans un produit où l'IA fait le travail fastidieux (rédiger les fiches, créer les histoires, générer les quiz).

---

## 3. Objectifs & métriques de succès

### Objectifs produit (MVP)
1. Permettre à un utilisateur d'ajouter un mot et d'obtenir une fiche complète en **moins de 5 secondes**.
2. Offrir un cycle de révision quotidien clair (« X mots à réviser aujourd'hui »).
3. Livrer la génération d'histoires comme moment « wow » qui distingue le produit.

### KPIs à suivre
| Métrique | Cible MVP | Pourquoi |
|---|---|---|
| **D7 retention** | ≥ 25 % | L'apprentissage est une habitude ; le retour à J+7 valide le hook. |
| Mots ajoutés / utilisateur / semaine | ≥ 10 | Mesure l'usage du cœur de produit. |
| Taux de complétion des révisions dues | ≥ 50 % | La répétition espacée n'a de valeur que si elle est suivie. |
| Histoires générées / utilisateur actif / semaine | ≥ 2 | Adoption de la feature phare. |
| Streak médian | ≥ 3 jours | Engagement habituel. |

---

## 4. Personas

**Persona 1 — Aïcha, 24 ans, étudiante (B2 → C1).**
Regarde des séries en VO et des conférences tech sur YouTube. Note des mots dans son téléphone mais ne les revoit jamais. *Besoin :* un endroit unique pour capturer et réviser, sans friction. *Frustration :* les apps existantes sont trop génériques et n'utilisent pas ses propres mots.

**Persona 2 — Karim, 31 ans, ingénieur (B1 → B2).**
Doit améliorer son anglais professionnel (réunions, documentation). Motivé mais peu de temps. *Besoin :* sessions courtes, ciblées, dans son domaine (technologie, business). *Frustration :* le vocabulaire « scolaire » est déconnecté de son quotidien.

---

## 5. Périmètre MVP

### Dans le périmètre ✅
- Authentification (email) via Supabase Auth.
- Onboarding avec sélection de centres d'intérêt.
- Ajout manuel de mots + génération de fiche par IA (JSON structuré).
- Base de vocabulaire personnelle avec RLS.
- Dashboard de progression.
- Page détail d'un mot (avec TTS navigateur).
- 4 types de quiz minimum + suivi des scores.
- Algorithme de répétition espacée (1 → 3 → 7 → 14 → 30 jours).
- Générateur d'histoires personnalisées.
- Dark mode, responsive mobile, accessibilité de base.

### Hors périmètre (post-MVP) ❌
- Import automatique depuis YouTube / sous-titres / extension navigateur.
- Audio TTS de qualité studio (on utilise le TTS du navigateur au MVP).
- Mode multijoueur / social / classements.
- Application mobile native.
- Paiement / abonnement (le MVP est gratuit pour valider l'usage).
- Support multilingue de l'interface (FR/EN au MVP, interface en français/anglais).

---

## 6. Parcours utilisateur principal

```
Inscription → Onboarding (intérêts) → Dashboard
     │
     ├─→ Ajouter un mot → Génération IA → Fiche enregistrée
     │
     ├─→ Réviser (mots dus) → Quiz → Mise à jour mastery + next_review_date
     │
     └─→ Générer une histoire → Mots non maîtrisés + intérêts → Histoire mise en évidence
```

---

## 7. Exigences fonctionnelles

### F1 — Authentification
- F1.1 : Inscription / connexion par email + mot de passe (Supabase Auth).
- F1.2 : Création automatique d'un profil (`profiles`) au premier login.
- F1.3 : Redirection vers l'onboarding si les intérêts ne sont pas encore définis.
- F1.4 : Routes protégées ; un utilisateur non authentifié est redirigé vers `/login`.

### F2 — Onboarding & centres d'intérêt
- F2.1 : Présenter une grille de centres d'intérêt prédéfinis (Football, IA, Entrepreneuriat, Technologie, Lecture, Histoire, Sciences, Business, Finance, Films, Musique, Gaming).
- F2.2 : Sélection minimum 1, recommandé 3.
- F2.3 : Stockage dans `user_interests` ; modifiable plus tard dans les réglages.

### F3 — Ajout de mots & génération IA
- F3.1 : Champ de saisie d'un mot anglais.
- F3.2 : Appel OpenAI (sortie JSON structurée) générant : `english_definition`, `french_translation`, `french_definition`, `pronunciation` (IPA), `example_sentence`, `synonyms` (tableau), `cefr_level`.
- F3.3 : Anti-doublon : un même mot ne peut être ajouté deux fois par le même utilisateur (contrainte `UNIQUE(user_id, lower(word))`).
- F3.4 : État de chargement pendant la génération ; gestion d'erreur si l'API échoue (retry possible).
- F3.5 : Le mot est enregistré avec `mastery_score = 0`, `review_count = 0`, `next_review_date = today`, `status = 'new'`.

### F4 — Dashboard
- F4.1 : Cartes statistiques — Total mots, Mots maîtrisés, Mots en apprentissage, Révisions dues aujourd'hui, Série (streak).
- F4.2 : CTA proéminent « Réviser maintenant » si des révisions sont dues.
- F4.3 : Accès rapide à « Ajouter un mot » et « Générer une histoire ».

### F5 — Page détail d'un mot
- F5.1 : Afficher mot, prononciation (IPA), définition EN, définition FR, traduction, exemple(s), synonymes, mastery_score.
- F5.2 : Bouton « Écouter » (Web Speech API / `SpeechSynthesis`).
- F5.3 : Actions « Marquer comme connu » et « Marquer comme difficile » (ajustent mastery_score et next_review_date).

### F6 — Système de quiz
- F6.1 : Au moins 4 types : (1) Définition → Mot, (2) Mot → Définition, (3) QCM, (4) Texte à trou (fill-in-the-blank).
- F6.2 : Les distracteurs du QCM sont tirés du vocabulaire de l'utilisateur (même niveau CEFR si possible).
- F6.3 : Enregistrement de chaque tentative dans `quiz_attempts` (type, correct/incorrect, horodatage).
- F6.4 : Mise à jour du `mastery_score` et de l'intervalle de répétition après chaque réponse.

### F7 — Répétition espacée
- F7.1 : Intervalles : 1 → 3 → 7 → 14 → 30 jours.
- F7.2 : Réponse correcte → avancer d'un cran (`interval_index++`, plafonné à 30 j) ; recalculer `next_review_date`.
- F7.3 : Réponse incorrecte → réinitialiser à 1 jour (`interval_index = 0`).
- F7.4 : `status` dérivé — `new` (jamais révisé), `learning` (en cours), `mastered` (dernier intervalle atteint + mastery_score ≥ seuil).

### F8 — Générateur d'histoires (feature phare)
- F8.1 : Sélectionner N mots non maîtrisés (priorité aux mots dus / faible mastery).
- F8.2 : Récupérer les centres d'intérêt de l'utilisateur.
- F8.3 : Prompt OpenAI → histoire en anglais naturel, intéressante, pédagogique, intégrant tous les mots, adaptée aux intérêts.
- F8.4 : Mots du vocabulaire **mis en évidence** dans le rendu (surlignage cliquable → fiche du mot).
- F8.5 : Enregistrer dans `story_history` (titre, contenu, mots utilisés, intérêts utilisés).

---

## 8. Exigences non-fonctionnelles

- **Performance** : Time-to-interactive du dashboard < 2,5 s ; génération de fiche < 5 s (p95).
- **Sécurité** : Row Level Security activée sur toutes les tables ; chaque ligne accessible uniquement par son propriétaire (`auth.uid() = user_id`). Clé OpenAI uniquement côté serveur (jamais exposée au client).
- **Accessibilité** : contrastes WCAG AA, navigation clavier, labels ARIA, focus visibles.
- **Responsive** : mobile-first ; breakpoints Tailwind standard.
- **Dark mode** : thème clair/sombre via `next-themes`, respect de la préférence système.
- **Coût IA** : mettre en cache la fiche générée (pas de régénération à chaque affichage) ; limiter la longueur des histoires.
- **Fiabilité** : tous les appels IA ont un état de chargement et une gestion d'erreur explicite (toast + retry).

---

## 9. Architecture technique (haut niveau)

- **Frontend & backend** : Next.js 15 (App Router), pas de backend séparé. Server Actions + Route Handlers (`app/api/*`) pour la logique IA et l'écriture en base.
- **Auth & DB** : Supabase (Postgres + Auth + RLS). Client `@supabase/ssr` pour le rendu serveur.
- **IA** : OpenAI API appelée **exclusivement côté serveur**. Sortie JSON structurée (response_format / structured outputs).
- **Déploiement** : Vercel. Variables d'environnement injectées via le dashboard Vercel.

```
app/
  (auth)/login, /signup
  (app)/dashboard, /vocabulary, /vocabulary/[id], /review, /stories, /settings
  api/
    generate-word/     → fiche IA
    generate-story/    → histoire IA
    quiz/submit/       → tentative + mise à jour SR
components/   ui/ (shadcn), vocabulary/, quiz/, dashboard/, stories/
lib/         supabase/ (client, server), openai.ts, spaced-repetition.ts
supabase/    migrations/, seed.sql
```

---

## 10. User Stories

> Format : *En tant que [rôle], je veux [action] afin de [bénéfice].* — avec critères d'acceptation (CA).

### Epic A — Authentification & Onboarding
- **A1** — En tant que visiteur, je veux créer un compte avec mon email afin d'accéder à l'application.
  - CA : email + mot de passe valides → compte créé → profil créé → redirection onboarding.
  - CA : email déjà utilisé → message d'erreur clair.
- **A2** — En tant que nouvel utilisateur, je veux choisir mes centres d'intérêt afin que mon contenu soit personnalisé.
  - CA : je dois sélectionner au moins 1 intérêt pour continuer.
  - CA : mes choix sont enregistrés et réutilisés dans la génération d'histoires.
- **A3** — En tant qu'utilisateur connecté, je veux rester authentifié entre les sessions afin de ne pas me reconnecter à chaque fois.

### Epic B — Vocabulaire
- **B1** — En tant qu'apprenant, je veux ajouter un mot anglais afin de l'enregistrer pour révision.
  - CA : saisie du mot → fiche IA complète générée en < 5 s → mot visible dans ma liste.
  - CA : doublon empêché avec message explicite.
  - CA : si l'IA échoue, je vois une erreur et peux réessayer.
- **B2** — En tant qu'apprenant, je veux voir la fiche détaillée d'un mot afin d'en comprendre le sens et l'usage.
  - CA : toutes les informations (déf. EN/FR, traduction, IPA, exemple, synonymes, mastery) sont affichées.
- **B3** — En tant qu'apprenant, je veux écouter la prononciation afin d'apprendre à la dire.
  - CA : un clic sur « Écouter » déclenche le TTS du navigateur.
- **B4** — En tant qu'apprenant, je veux marquer un mot « connu » ou « difficile » afin d'ajuster sa fréquence de révision.

### Epic C — Révision & Quiz
- **C1** — En tant qu'apprenant, je veux savoir combien de mots sont à réviser aujourd'hui afin de planifier ma session.
- **C2** — En tant qu'apprenant, je veux répondre à différents types de quiz afin de tester ma mémoire sous plusieurs angles.
  - CA : au moins 4 types disponibles ; le QCM utilise mes propres mots comme distracteurs.
- **C3** — En tant qu'apprenant, je veux que mon score de maîtrise se mette à jour après chaque réponse afin de suivre ma progression.
  - CA : bonne réponse → intervalle avancé ; mauvaise → réinitialisé à 1 jour.
- **C4** — En tant qu'apprenant, je veux voir ma série (streak) afin de rester motivé.

### Epic D — Histoires IA
- **D1** — En tant qu'apprenant, je veux générer une histoire avec mes mots non maîtrisés afin de les voir en contexte.
  - CA : tous les mots sélectionnés apparaissent dans l'histoire et sont mis en évidence.
  - CA : le thème reflète mes centres d'intérêt.
- **D2** — En tant qu'apprenant, je veux cliquer sur un mot surligné dans l'histoire afin d'ouvrir sa fiche.
- **D3** — En tant qu'apprenant, je veux retrouver mes histoires passées afin de les relire.

### Epic E — Tableau de bord
- **E1** — En tant qu'apprenant, je veux un tableau de bord récapitulant ma progression afin d'avoir une vue d'ensemble (total, maîtrisés, en cours, dus, streak).

---

## 11. Schéma de base de données (Supabase / PostgreSQL)

> Améliorations par rapport au brief, signalées en commentaire : ajout de `quiz_attempts` (nécessaire pour « track scores »), `interval_index` & `status` sur `vocabulary` (pour une répétition espacée propre), `words_used`/`interests_used` sur `story_history`, et contrainte anti-doublon.

### 11.1 — Types & extensions

```sql
-- Niveaux CEFR sous forme d'enum pour garantir la cohérence
create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- Statut d'apprentissage d'un mot (dérivé de la répétition espacée)
create type word_status as enum ('new', 'learning', 'mastered');

-- Types de quiz
create type quiz_type as enum ('def_to_word', 'word_to_def', 'multiple_choice', 'fill_in_blank');
```

### 11.2 — Tables

```sql
-- =========================================================
-- PROFILES : miroir applicatif de auth.users
-- =========================================================
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- USER_INTERESTS : centres d'intérêt choisis à l'onboarding
-- =========================================================
create table public.user_interests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  interest    text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, interest)
);
create index idx_user_interests_user on public.user_interests (user_id);

-- =========================================================
-- VOCABULARY : base de mots personnelle
-- =========================================================
create table public.vocabulary (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  word                text not null,
  english_definition  text,
  french_translation  text,
  french_definition   text,
  pronunciation       text,                 -- IPA, ex: /ˈher.ə.tɪk/
  example_sentence    text,
  synonyms            text[] default '{}',  -- tableau Postgres
  cefr_level          cefr_level,
  mastery_score       int  not null default 0,    -- 0 à 100
  review_count        int  not null default 0,
  interval_index      int  not null default 0,     -- AJOUT : index dans [1,3,7,14,30]
  status              word_status not null default 'new', -- AJOUT
  next_review_date    date not null default current_date,
  created_at          timestamptz not null default now(),
  -- AJOUT : anti-doublon insensible à la casse
  constraint uq_user_word unique (user_id, word)
);
create index idx_vocabulary_user on public.vocabulary (user_id);
create index idx_vocabulary_review on public.vocabulary (user_id, next_review_date);

-- =========================================================
-- QUIZ_ATTEMPTS : historique des réponses (AJOUT — suivi des scores)
-- =========================================================
create table public.quiz_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  vocabulary_id  uuid not null references public.vocabulary (id) on delete cascade,
  quiz_type      quiz_type not null,
  is_correct     boolean not null,
  created_at     timestamptz not null default now()
);
create index idx_quiz_attempts_user on public.quiz_attempts (user_id, created_at);

-- =========================================================
-- STORY_HISTORY : histoires générées
-- =========================================================
create table public.story_history (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  title           text not null,
  content         text not null,
  words_used      text[] default '{}',  -- AJOUT : traçabilité
  interests_used  text[] default '{}',  -- AJOUT
  created_at      timestamptz not null default now()
);
create index idx_story_history_user on public.story_history (user_id, created_at);
```

### 11.3 — Row Level Security

```sql
-- Activer RLS partout
alter table public.profiles       enable row level security;
alter table public.user_interests enable row level security;
alter table public.vocabulary     enable row level security;
alter table public.quiz_attempts  enable row level security;
alter table public.story_history  enable row level security;

-- PROFILES : un utilisateur ne voit/modifie que son profil
create policy "own profile - select" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile - update" on public.profiles
  for update using (auth.uid() = id);
create policy "own profile - insert" on public.profiles
  for insert with check (auth.uid() = id);

-- Modèle générique pour les tables possédées (user_id)
-- À répliquer pour user_interests, vocabulary, quiz_attempts, story_history
create policy "owner - select" on public.vocabulary
  for select using (auth.uid() = user_id);
create policy "owner - insert" on public.vocabulary
  for insert with check (auth.uid() = user_id);
create policy "owner - update" on public.vocabulary
  for update using (auth.uid() = user_id);
create policy "owner - delete" on public.vocabulary
  for delete using (auth.uid() = user_id);
-- (idem pour user_interests, quiz_attempts, story_history)
```

### 11.4 — Création automatique du profil (trigger)

```sql
-- Crée une ligne profiles dès qu'un utilisateur s'inscrit dans auth.users
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 11.5 — Logique de répétition espacée (référence)

```
INTERVALS = [1, 3, 7, 14, 30]   // jours

onCorrect(word):
  word.review_count   += 1
  word.interval_index  = min(word.interval_index + 1, 4)
  word.mastery_score   = min(word.mastery_score + 20, 100)
  word.next_review_date = today + INTERVALS[word.interval_index]
  word.status = (word.interval_index == 4 && mastery_score >= 80) ? 'mastered' : 'learning'

onWrong(word):
  word.review_count   += 1
  word.interval_index  = 0
  word.mastery_score   = max(word.mastery_score - 15, 0)
  word.next_review_date = today + 1
  word.status = 'learning'
```

---

## 12. Risques & hypothèses

| Risque | Mitigation |
|---|---|
| Coût des appels OpenAI à l'échelle | Cache des fiches ; histoires courtes ; quotas par utilisateur post-MVP. |
| Qualité IPA / prononciation incohérente | Validation du JSON ; fallback TTS navigateur. |
| Génération JSON non conforme | Structured outputs + validation Zod côté serveur, retry si parsing échoue. |
| RLS mal configurée → fuite de données | Tests d'autorisation avant déploiement ; politique par table revue. |

---

## 13. Roadmap MVP (séquencement suggéré)

1. **Socle** : setup Next.js + Supabase + Auth + schéma & RLS + migrations.
2. **Vocabulaire** : ajout de mot + génération IA + liste + page détail + TTS.
3. **Dashboard** : cartes statistiques + streak.
4. **Quiz + répétition espacée** : 4 types + `quiz_attempts` + mise à jour mastery.
5. **Histoires IA** : génération + mise en évidence + historique.
6. **Polish** : dark mode, états de chargement, gestion d'erreur, accessibilité, seed data, README.

---

*Fin du PRD — prêt pour validation avant passage au code.*