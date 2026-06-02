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
| `OPENAI_API_KEY` | Clé OpenAI (serveur uniquement — jamais exposée au client) |

## Base de données

Le schéma, les politiques RLS et le trigger de création de profil sont dans
[`supabase/migrations/`](supabase/migrations). Pour les appliquer sur ton projet :

```bash
psql "<connection-string-postgres>" -f supabase/migrations/0001_schema.sql
psql "<connection-string-postgres>" -f supabase/migrations/0002_rls.sql
psql "<connection-string-postgres>" -f supabase/migrations/0003_trigger.sql
```

> La connection string se trouve dans Dashboard Supabase → **Connect**. Utilise la chaîne
> **Session Pooler** (compatible IPv4) si l'accès direct n'est pas joignable.

## Structure

```
app/
  (auth)/login, /signup       # authentification (Server Actions)
  (app)/dashboard, /vocabulary, /review, /stories, /settings   # routes protégées
  onboarding/                 # sélection des centres d'intérêt
  api/                        # route handlers IA (à venir)
components/  ui/ (shadcn) · layout/ · auth/ · onboarding/ · …
lib/         supabase/{client,server,proxy}.ts · types.ts · interests.ts · …
supabase/    migrations/ · seed.sql
proxy.ts     # refresh de session + protection des routes (Next 16)
```

## Sécurité

- **RLS** activée sur toutes les tables ; chaque ligne n'est accessible que par son propriétaire
  (`auth.uid() = user_id`).
- La clé OpenAI n'est utilisée que côté serveur.

## Déploiement

Cible : **Vercel**. Renseigne les variables d'environnement dans le dashboard Vercel.

---

Construit par phases — voir l'historique git.
