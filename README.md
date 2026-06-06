# Lexio

AI-assisted English vocabulary platform for French speakers (B1→C2): add a word, an LLM
generates a complete study card; review through spaced-repetition quizzes; and have the
LLM weave your not-yet-mastered words into personalized short stories built around your
interests.

## Overview

Lexio targets the gap between *recognizing* a word and *retaining* it. Learners add
English words; the app calls a large language model to produce a structured study card
(definitions, translation, IPA, example, synonyms, CEFR level) and then schedules reviews
with a spaced-repetition algorithm. Its distinguishing feature is contextual reinforcement:
instead of flashcards alone, the app generates short English stories that reuse the
learner's weakest words inside topics they chose during onboarding. The project is a
full-stack web application; the "AI" layer is provider-agnostic and runs entirely
server-side.

## Technical approach

This is an applied LLM-systems project. **No model is trained or fine-tuned** — Lexio
uses prompt-engineered, schema-validated calls against provider-hosted models, plus a
deterministic spaced-repetition engine and browser-side neural text-to-speech.

### Provider-agnostic, OpenAI-compatible LLM integration

All generation goes through the OpenAI SDK with a configurable `baseURL`, so any
OpenAI-compatible endpoint works without code changes ([lib/ai/providers.ts](lib/ai/providers.ts)).
Seven providers are registered with their default models — Mistral (default,
`mistral-small-latest`), OpenAI (`gpt-4o-mini`), Google Gemini (`gemini-2.5-flash`),
Groq (`llama-3.3-70b-versatile`), OpenRouter (`deepseek/deepseek-chat:free`), DeepSeek
(`deepseek-chat`), and Cerebras (`llama-3.3-70b`).

Configuration resolves at two levels ([lib/ai/resolve.ts](lib/ai/resolve.ts)):

- **Per deployment** — `AI_PROVIDER` + `AI_API_KEY` (+ optional `AI_MODEL`) from the
  environment. A legacy `OPENAI_API_KEY` alone transparently selects the OpenAI provider.
- **Per user** — a user can paste their own provider key in *Settings*. It is encrypted
  at rest with **AES-256-GCM** (32-byte key derived via SHA-256 from `AI_KEY_SECRET`,
  stored as `iv:tag:cipher` base64) and never returned to the client
  ([lib/ai/crypto.ts](lib/ai/crypto.ts)). A user key takes precedence over the
  deployment default; on decryption failure the resolver falls back to the env config.

### Structured outputs

Both generators request `response_format: { type: "json_object" }` and validate the
parsed JSON against a **Zod** schema, retrying once before surfacing an error
([lib/ai/generate.ts](lib/ai/generate.ts)):

- **Word card** (temperature 0.3): `english_definition`, `french_translation`,
  `french_definition`, IPA `pronunciation` (post-normalized to `/…/`), `example_sentence`,
  up to 8 `synonyms`, and a `cefr_level` enum (`A1`–`C2`). A case-insensitive uniqueness
  check (`UNIQUE(user_id, lower(word))`) prevents duplicates and avoids wasted LLM calls.
- **Story** (temperature 0.8): a 120–220-word English story that must include every
  supplied word verbatim and adapt its theme to the learner's interests, returned as
  `{ title, content }`.

### Spaced-repetition engine

A small, deterministic, fully testable module ([lib/spaced-repetition.ts](lib/spaced-repetition.ts)).
Review intervals are `[1, 3, 7, 14, 30]` days. A correct answer advances the interval
index and adds 20 to a 0–100 mastery score; a word becomes `mastered` only at the last
interval with mastery ≥ 80. A wrong answer subtracts 15 and resets the interval to 1 day.
Next-review dates are computed in UTC. The quiz submit handler logs every attempt and
applies the update transactionally per word
([app/api/quiz/submit/route.ts](app/api/quiz/submit/route.ts)).

### Quiz generation

Quizzes are built client-server from the user's due words ([lib/quiz.ts](lib/quiz.ts)),
with four question types — definition→word, word→definition, multiple-choice
(translation→word), and fill-in-the-blank (the example sentence with the word blanked
out). Distractors are drawn preferentially from words of the **same CEFR level**, only
eligible types are offered per word (based on which fields exist), and free-text answers
are normalized (case, punctuation) before comparison.

### Personalized story generation (serving)

The story route ([app/api/generate-story/route.ts](app/api/generate-story/route.ts))
selects up to six non-mastered words ordered by lowest mastery then earliest review date
(falling back to recently added words if everything is mastered), fetches the user's
interests, calls the resolved LLM, and persists the result to `story_history` with the
words and interests used. The story UI then highlights and links the reused words back to
their cards.

### Browser-side neural TTS

Pronunciation uses the Web Speech API by default, with optional **HD neural voices that
run entirely in the browser** ([lib/tts/](lib/tts/)): Kokoro-82M
(`onnx-community/Kokoro-82M-v1.0-ONNX`, ~80 MB, four US/UK voices) and Piper, both
executed in WebAssembly inside a Web Worker with download-progress reporting and timeouts
(5 min for the initial model download, 1 min per synthesis). Failures fall back to the
native speech synthesizer.

### Platform & data

Next.js 16 App Router with Server Actions and Route Handlers; session refresh and route
protection use the Next.js 16 `proxy.ts` convention (the renamed middleware)
([proxy.ts](proxy.ts)). Data lives in Supabase Postgres with **Row-Level Security on every
table** (`auth.uid() = user_id`) and a trigger that mirrors `auth.users` into `profiles`
on signup. Tables: `profiles`, `user_interests`, `vocabulary`, `quiz_attempts`,
`story_history`, `user_ai_settings` ([supabase/migrations/](supabase/migrations/)).

## Results / status

Lexio is a **functioning full-stack application**, built in phases (see git history).
The following are implemented and wired end-to-end: email/password auth with automatic
profile creation, interest onboarding, AI word-card generation with duplicate guarding,
the dashboard with stats and streak, the four-type quiz with spaced-repetition updates,
personalized story generation with clickable word links, per-user encrypted provider keys,
and in-browser HD TTS.

This is an engineering project, not an ML-research one: **there are no trained models, no
benchmark datasets, and no quantitative evaluation metrics in the repo**, so none are
claimed here. Output quality depends on the chosen provider/model. There is also no
automated test suite at present.

## Tech stack

- **Next.js 16.2.7** (App Router, Server Actions, Route Handlers, `proxy.ts`) · **React 19** · **TypeScript 5**
- **Tailwind CSS v4** + **shadcn/ui** (on Base UI)
- **Supabase** — Postgres + Auth + Row-Level Security via `@supabase/ssr`
- **OpenAI SDK v6** against any OpenAI-compatible endpoint · **Zod** for structured-output validation
- **Kokoro-js** + **@mintplex-labs/piper-tts-web** (WASM TTS) · **next-themes** · **sonner**
- Node.js ≥ 20.9 · pnpm · deploys to **Vercel**

## Repository structure

```
app/
  (auth)/login, /signup            # email/password auth (Server Actions)
  (app)/dashboard, /vocabulary, /vocabulary/[id], /review, /stories, /settings
  onboarding/                      # interest selection
  api/generate-word · generate-story · quiz/submit   # Route Handlers (LLM + SR)
components/  ui/ (shadcn) · vocabulary/ · quiz/ · stories/ · settings/ · …
lib/
  ai/        providers · resolve · generate · crypto   # provider-agnostic LLM layer
  tts/       engines · hd-tts · worker                 # in-browser neural TTS
  spaced-repetition.ts · quiz.ts · stats.ts · interests.ts
  supabase/  client · server · proxy
supabase/    migrations/ (0001–0004) · seed.sql
proxy.ts     # Next.js 16 session refresh + route protection
```

## Setup & usage

Prerequisites: Node.js ≥ 20.9, pnpm, a Supabase project, and an API key for at least one
supported LLM provider (most offer a free tier).

```bash
pnpm install
cp .env.example .env.local   # fill in the values below
pnpm dev
```

### Environment variables (`.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `AI_PROVIDER` | Default provider: `mistral` \| `openai` \| `gemini` \| `groq` \| `openrouter` \| `deepseek` \| `cerebras` |
| `AI_API_KEY` | Provider key (server-only). Falls back to `OPENAI_API_KEY` if unset |
| `AI_MODEL` | *(optional)* model override; otherwise the provider default |
| `AI_KEY_SECRET` | Secret used to encrypt user-supplied keys. Without it, per-user keys are disabled (the deployment default still works) |

### Database

Apply the migrations to your Supabase Postgres instance (use the **Session Pooler**
connection string from Dashboard → Connect if direct access is unreachable):

```bash
psql "<postgres-connection-string>" -f supabase/migrations/0001_schema.sql
psql "<postgres-connection-string>" -f supabase/migrations/0002_rls.sql
psql "<postgres-connection-string>" -f supabase/migrations/0003_trigger.sql
psql "<postgres-connection-string>" -f supabase/migrations/0004_user_ai_settings.sql
```

### Deployment

Target platform is **Vercel**; set the same environment variables in the project settings.

## Limitations / roadmap

- No automated test suite yet; the spaced-repetition and quiz modules are pure functions
  and are the natural first targets for unit tests.
- No quantitative evaluation of LLM output quality; generation quality varies by provider/model.
- Piper currently exposes a single voice (engine uses a per-session singleton); Kokoro
  offers four.
- Migrations are applied manually via `psql` rather than through a managed migration tool.

---

## Notes on the Next.js 16 conventions

`middleware` is replaced by `proxy.ts`; request APIs (`cookies`, `params`) are async;
shadcn/ui is built on Base UI (`render` prop). Per repo policy ([AGENTS.md](AGENTS.md)),
framework docs live in `node_modules/next/dist/docs/`.
