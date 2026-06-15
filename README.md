# FounderCouncil AI

Your AI advisory board. Ask a business question, and four specialized AI
advisors — powered by different frontier models via [OpenRouter](https://openrouter.ai)
— each weigh in. A fifth **Chairman** model then synthesizes everything into a
single, structured verdict.

## The council

| Seat | Role | Default model (OpenRouter) |
| --- | --- | --- |
| ♟️ Strategist | Market, positioning, business model | `openai/gpt-4o` |
| 🛡️ Risk Analyst | Failure modes, legal/financial/operational risk | `anthropic/claude-3.5-sonnet` |
| 🔬 Researcher | Market context, comparables, benchmarks | `google/gemini-pro-1.5` |
| 🛠️ Technical Builder | Architecture, MVP scope, build effort | `deepseek/deepseek-chat` |
| ⚖️ Chairman | Final synthesis & verdict | `openai/gpt-4o` |

The Chairman returns:

- Executive summary
- Best recommendation
- Key risks
- Financial considerations
- Action plan
- Confidence score (0–100)
- Final decision: **Proceed / Pause / Reject**

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **OpenRouter** for multi-model inference (OpenAI-compatible API)
- **Supabase** (Postgres + Auth) for persistence and per-user accounts
- **Vitest** for unit tests; **GitHub Actions** for CI

## Features

- **Live streaming results** — advisors appear one by one as they answer
  (newline-delimited JSON stream), then the Chairman verdict, with skeleton
  placeholders while each seat is still thinking.
- **Accounts & per-user history** — Supabase email/password auth; every session
  is scoped to its owner via Row Level Security.
- **Export** — copy any verdict as Markdown (or download as a `.md` file).
- **Delete** — remove sessions from your history.
- **Graceful demo mode** — with no Supabase keys the app still runs councils
  (auth off, nothing saved).

## Pages

- `/` — landing page
- `/login` — sign in / sign up (when Supabase is configured)
- `/dashboard` — stats + recent sessions
- `/council` — the council form (ask a question, watch it stream)
- `/results/[id]` — a saved session's full verdict + advisor responses
- `/history` — all your saved sessions (with delete)

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in your keys:

```bash
cp .env.example .env.local
```

- **`OPENROUTER_API_KEY`** — required. Get one at <https://openrouter.ai/keys>.
- **Supabase keys** — optional but recommended. Without them the app still runs
  councils, but results aren't saved (no dashboard/history/permalinks).

You can override any council model with the `COUNCIL_MODEL_*` variables.

### 3. Provision the database (optional)

In your Supabase project, run the SQL in [`supabase/schema.sql`](supabase/schema.sql)
via the SQL editor. This creates the `council_sessions` table (with `user_id`)
and per-user Row Level Security policies.

**Auth:** the app uses Supabase email/password auth. In the Supabase dashboard
under **Authentication → Providers → Email**, enable it. If you keep "Confirm
email" on, new sign-ups must click the emailed link before signing in (set the
site URL / redirect to your domain). To skip confirmation in local dev, turn it
off there.

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

## Testing & CI

```bash
npm test        # run unit tests (Vitest)
npm run lint    # ESLint
npm run build   # production build
```

Unit tests cover the Chairman JSON parsing/normalization, request validation,
council config, the Markdown exporter, and the ND-JSON stream reader. The
[CI workflow](.github/workflows/ci.yml) runs lint + tests + build on every push
and PR.

## How it works

1. `POST /api/council` receives `{ question, councilType }`, validates it
   (`lib/validation.ts`), and requires an authenticated user when Supabase is on.
2. It opens a **newline-delimited JSON stream**. `runSeats()` calls all four
   advisor models **in parallel** via OpenRouter and emits each as it resolves.
   A single advisor failing doesn't sink the run — its error is captured.
3. The four responses are passed to the **Chairman** model, which returns strict
   JSON that's defensively parsed and normalized into a `ChairmanVerdict`
   (`lib/chairman.ts`), then streamed to the client.
4. If Supabase is configured, the session is saved (stamped with the user's id)
   and the API streams the saved `id`. The client renders everything live.

## Data model

`council_sessions`:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | primary key |
| `user_id` | uuid | FK to `auth.users`; owner of the session |
| `question` | text | the user's question |
| `council_type` | text | one of the council types |
| `model_responses` | jsonb | array of advisor responses |
| `chairman_response` | jsonb | the structured verdict |
| `created_at` | timestamptz | defaults to `now()` |

## Security notes

- The **service-role key** is used only server-side and never exposed to the
  browser. It's used to insert rows, always stamping a **verified** `user_id`
  taken from the authenticated session.
- All browser/user reads and deletes go through the **anon key + user session**,
  so **Row Level Security** scopes every row to its owner (`auth.uid() = user_id`).
- `middleware.ts` refreshes the session and gates `/dashboard`, `/council`,
  `/history`, and `/results` behind auth (no-op in demo mode).

## Project structure

```
src/
  middleware.ts             # session refresh + route protection
  app/
    api/council/route.ts        # streaming council orchestration endpoint
    api/council/[id]/route.ts   # delete a session
    auth/callback/route.ts      # email-confirm / OAuth code exchange
    council/page.tsx            # council form
    dashboard/page.tsx          # dashboard
    history/page.tsx            # history list (+ delete)
    login/page.tsx              # auth
    results/[id]/page.tsx       # single result (+ export)
    error.tsx                   # global error boundary
    page.tsx                    # landing
  components/               # UI components
  lib/
    openrouter.ts            # OpenRouter chat client
    council.ts               # seats, models, prompts
    chairman.ts              # Chairman synthesis + verdict parsing
    runCouncil.ts            # orchestration (parallel seats, streaming hooks)
    validation.ts            # request validation
    ndjson.ts                # streaming JSON reader
    markdown.ts              # verdict -> Markdown exporter
    db.ts                    # persistence helpers
    supabase/                # admin / server / browser clients
tests/                       # Vitest unit tests
supabase/schema.sql          # database schema + RLS
.github/workflows/ci.yml     # lint + test + build
```
