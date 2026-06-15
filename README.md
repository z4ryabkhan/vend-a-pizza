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
- **Supabase** (Postgres) for persistence

## Pages

- `/` — landing page
- `/dashboard` — stats + recent sessions
- `/council` — the council form (ask a question)
- `/results/[id]` — a saved session's full verdict + advisor responses
- `/history` — all saved sessions

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
via the SQL editor. This creates the `council_sessions` table and a read policy.

### 4. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

## How it works

1. `POST /api/council` receives `{ question, councilType }`.
2. `runCouncil()` calls all four advisor models **in parallel** via OpenRouter.
   A single advisor failing doesn't sink the run — its error is captured.
3. The four responses are passed to the **Chairman** model, which returns strict
   JSON that's defensively parsed and normalized into a `ChairmanVerdict`.
4. If Supabase is configured, the session is saved and the API returns its `id`.

## Data model

`council_sessions`:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | primary key |
| `question` | text | the user's question |
| `council_type` | text | one of the council types |
| `model_responses` | jsonb | array of advisor responses |
| `chairman_response` | jsonb | the structured verdict |
| `created_at` | timestamptz | defaults to `now()` |

## Security notes

- The **service-role key** is used only server-side (API routes / server
  components) and is never exposed to the browser.
- Browser reads use the **anon key** with a read-only RLS policy.
- Before adding multi-tenant auth, add a `user_id` column and tighten the RLS
  policy to scope rows per user.

## Project structure

```
src/
  app/
    api/council/route.ts   # council orchestration endpoint
    council/page.tsx        # council form
    dashboard/page.tsx      # dashboard
    history/page.tsx        # history list
    results/[id]/page.tsx   # single result
    page.tsx                # landing
  components/               # UI components
  lib/                      # openrouter, supabase, council config, orchestration
supabase/schema.sql         # database schema
```
