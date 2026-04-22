# Aura Health — Steps to Savings

## What if staying healthy actually paid you?

A gamified wellness prototype. Walk 10,000 steps, earn $2.50. Build streaks. Watch your wallet grow.

**Author:** Rajan Gupta · [rajangupta.ai](https://rajangupta.ai)

> Built as a prototype to explore one idea: *what if staying healthy actually paid you?* Front-end, back-end, and auth in under an hour using **Vibe Coding with Lovable.dev**. The app rewards daily activity with streaks, wallet boosts, confetti, and a glowing Health Pulse orb — making wellness feel more like a game than a chore.
>
> Special thanks to **Jyothi Nookula** for the inspiration on AI product thinking.

---

## What it does

- **Sync** your daily steps, sleep, and heart rate.
- **Earn** $2.50 every time you hit the 10,000-step threshold.
- **Build streaks** for consecutive qualifying days.
- **See your Health Pulse** — a glowing orb that reflects your overall state at a glance.
- **Track earnings** in an append-only rewards ledger (honest money trail).

---

## Architecture

```
    Browser (React + Vite + Tailwind + shadcn/ui)
                     │
                     ▼
                  Supabase
           ┌────────┬────────────┐
           ▼        ▼            ▼
         Auth    Postgres    Edge Function
                (RLS-scoped)  (sync-health-data)
```

| Layer | Tech |
|---|---|
| Frontend | React 18 · Vite · Bun · TypeScript · Tailwind · shadcn/ui |
| Auth | Supabase Auth |
| DB | Supabase Postgres with Row-Level Security |
| Backend | Supabase Edge Functions (Deno) |
| Tooling | Lovable.dev (scaffolded the whole thing in under an hour) |

---

## Data model

| Table | Purpose |
|---|---|
| `profiles` | User info · `current_streak` · `total_earnings` |
| `daily_metrics` | Per-day: `steps_count` · `sleep_hours` · `heart_rate_avg` |
| `rewards_ledger` | Append-only log of every payout, with reason |

**Row-Level Security is enabled on every table** — users can only ever read or write their own rows. `auth.uid() = user_id` gates every policy.

---

## Running locally

```bash
# 1. Clone
git clone https://github.com/rgstack/aura-sync.git
cd aura-sync

# 2. Install
bun install        # or: npm install

# 3. Set up env
cp .env.example .env
# then edit .env with your Supabase project values

# 4. Run
bun run dev        # or: npm run dev
```

Open http://localhost:5173.

### Environment variables

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API → anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase → Project Settings → General |

**Note:** these are Supabase *anon* (publishable) keys. They are designed to be bundled into the browser. Safety comes from Row-Level Security policies, which are enabled on every table in this project.

---

## What's next (MVP → real product)

This is a working prototype. To ship it:

- [ ] Real health integration — Apple Health / Google Fit / Fitbit / Terra API
- [ ] Actual payouts — Stripe Connect / gift cards / prepaid
- [ ] Combine multiple signals into a real "aura" score (steps + sleep + HR)
- [ ] Social / team streaks
- [ ] Anti-fraud (gyroscope validation, cross-device sanity checks)

---

## Credits

- Scaffold: **Lovable.dev** — vibe-coding front-end + backend + auth in under an hour
- Inspiration: **Jyothi Nookula** — AI product thinking
