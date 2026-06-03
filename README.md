# Lexio

**Plateforme d'apprentissage du vocabulaire anglais propulsée par l'IA**, pour apprenants
francophones (B1→C2). Tu ajoutes un mot, l'IA génère une fiche complète ; tu révises via quiz et
répétition espacée ; et — fonctionnalité phare — l'IA génère des **histoires personnalisées** qui
réutilisent tes mots non maîtrisés dans le contexte de tes centres d'intérêt.

> *« Tes mots, racontés dans une histoire qui te passionne, jusqu'à ce que tu les retiennes. »*

## Stack

- **Next.js 16** (App Router, Server Actions, Route Handlers) — TypeScript
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase** (Postgres + Auth + Row Level Security) via `@supabase/ssr`
- **OpenAI** (génération de fiches & histoires, structured outputs) — côté serveur uniquement
- **next-themes** (dark mode), **sonner** (toasts), **zod** (validation)

## Prérequis

- Node.js ≥ 20.9
- pnpm
- Un projet Supabase
- Une clé API OpenAI

## Démarrage

```bash
pnpm install
cp .env.example .env.local   # puis renseigne les valeurs
pnpm dev
```

### Variables d'environnement (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon / publishable Supabase |
| `AI_PROVIDER` | Fournisseur IA par défaut (`mistral`, `openai`, `gemini`, `groq`, `openrouter`, `deepseek`, `cerebras`) |
| `AI_API_KEY` | Clé du fournisseur (serveur uniquement). À défaut, `OPENAI_API_KEY` est utilisé |
| `AI_MODEL` | *(optionnel)* modèle ; sinon le défaut du provider |
| `AI_KEY_SECRET` | Secret de chiffrement des clés saisies par les utilisateurs (Réglages) |

### IA multi-provider

Lexio utilise le SDK OpenAI avec un `baseURL` configurable : tout fournisseur **compatible
OpenAI** fonctionne sans changer le code (voir [lib/ai/providers.ts](lib/ai/providers.ts)). La
plupart offrent un **tier gratuit** (Mistral, Gemini, Groq, OpenRouter…). Deux niveaux de config :

- **Par déploiement** : `AI_PROVIDER` + `AI_API_KEY` (+ `AI_MODEL`).
- **Par utilisateur** : dans **Réglages → Clé API IA**, chacun colle sa clé (chiffrée au repos avec
  `AI_KEY_SECRET`, jamais renvoyée au client). Cette clé prime sur le défaut.

## Base de données

Le schéma, les politiques RLS, le trigger de création de profil et les réglages IA sont dans
[`supabase/migrations/`](supabase/migrations). Pour les appliquer sur ton projet :

```bash
psql "<connection-string-postgres>" -f supabase/migrations/0001_schema.sql
psql "<connection-string-postgres>" -f supabase/migrations/0002_rls.sql
psql "<connection-string-postgres>" -f supabase/migrations/0003_trigger.sql
psql "<connection-string-postgres>" -f supabase/migrations/0004_user_ai_settings.sql
```

> La connection string se trouve dans Dashboard Supabase → **Connect**. Utilise la chaîne
> **Session Pooler** (compatible IPv4) si l'accès direct n'est pas joignable.

## Fonctionnalités

- **Auth** email/mot de passe (Supabase Auth) + création auto de profil (trigger).
- **Onboarding** : choix des centres d'intérêt (personnalisent les histoires).
- **Vocabulaire** : ajout d'un mot → **fiche IA** complète (déf. EN/FR, traduction, IPA,
  exemple, synonymes, niveau CEFR), anti-doublon, page détail avec **TTS** (Web Speech API).
- **Dashboard** : cartes stats (total, maîtrisés, en cours, dus) + **streak** + CTA réviser.
- **Quiz** : 4 types (déf→mot, mot→déf, QCM, texte à trou) + **répétition espacée**
  (1→3→7→14→30 j) ; suivi dans `quiz_attempts`.
- **Histoires IA** : récit anglais personnalisé intégrant tes mots non maîtrisés et tes
  centres d'intérêt, **mots surlignés cliquables** → fiche, historique.
- **Dark mode**, responsive mobile, accessibilité de base.

## Structure

```
app/
  (auth)/login, /signup       # authentification (Server Actions)
  (app)/dashboard, /vocabulary, /vocabulary/[id], /review, /stories, /settings
  onboarding/                 # sélection des centres d'intérêt
  api/generate-word · generate-story · quiz/submit   # route handlers (IA + SR)
components/  ui/ (shadcn) · layout/ · auth/ · onboarding/ · vocabulary/ · quiz/ ·
             dashboard/ · stories/ · settings/
lib/         supabase/{client,server,proxy}.ts · types.ts · openai.ts ·
             spaced-repetition.ts · quiz.ts · stats.ts · interests.ts
supabase/    migrations/ · seed.sql
proxy.ts     # refresh de session + protection des routes (Next 16)
```

> **Note Next.js 16** : le fichier `middleware` est remplacé par `proxy.ts` ; les APIs de
> requête (`cookies`, `params`) sont asynchrones. shadcn/ui s'appuie sur Base UI (prop `render`).

## Sécurité

- **RLS** activée sur toutes les tables ; chaque ligne n'est accessible que par son propriétaire
  (`auth.uid() = user_id`).
- La clé OpenAI n'est utilisée que côté serveur.

## Déploiement

Cible : **Vercel**. Renseigne les variables d'environnement dans le dashboard Vercel.

---

Construit par phases — voir l'historique git.
