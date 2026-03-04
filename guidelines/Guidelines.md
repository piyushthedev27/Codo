# CODO Project Guidelines

## Project Overview

CODO is a pixel-retro RPG-themed AI-powered coding education platform. The frontend UI (Figma → React + Vite + TypeScript) is **fully complete**. All new work focuses on:
1. Building the AWS backend (Lambda, DynamoDB, Cognito, API Gateway, S3, Bedrock)
2. Creating the frontend integration layer (`src/services/`, `src/hooks/`, `src/context/`, `src/types/`, `src/config/`)
3. Firebase integration
4. Replacing mock/static data in existing pages with real API calls
5. Running the server and Testing

**Do NOT modify existing UI components in `src/app/components/ui/` or change JSX structure in page files.**

---

## General Guidelines

* The project uses **Vite + React 18 + TypeScript** — NOT Next.js
* All frontend code lives in `src/` — do not create pages or components outside this folder
* All AWS infrastructure code lives in `infrastructure/` using AWS CDK (TypeScript)
* All Lambda function code lives in `backend/` (Node.js 20.x, TypeScript, ARM64)
* Never hardcode AWS resource names — always use environment variables
* Use AWS SDK v3 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `@aws-sdk/client-bedrock-runtime`) for all AWS interactions
* All DynamoDB timestamps must be **Unix epoch milliseconds** (number type), not ISO strings
* Use `requirements.md` as the single source of truth for all feature decisions — it is version 3.0 (All Issues Resolved)

---

## Design System Guidelines

### Color Palette
* Background: `#0a0a0f` (main), `#12121a` (secondary), `#1a1a2e` (cards)
* Primary accent: `#6c63ff` (purple)
* Secondary accent: `#00d4ff` (cyan)
* Success/XP: `#00ff88` (green)
* Streaks/coins: `#ffd700` (gold)
* Error/danger: `#ff4d6d` (red-pink)
* Text primary: `#e8e8f0`, Text secondary: `#8888aa`

### Typography
* **Press Start 2P** → headings, titles, level numbers
* **VT323** → UI labels, stats, button text
* **JetBrains Mono** → body text, code, descriptions

### Visual Style Rules
* Use a maximum border-radius of **4px** (pixel-art feel)
* Borders must be exactly **2px solid** with accent colors
* Hover states: elements lift 2px with neon glow effect
* Click states: button press animation (1px down)
* Progress bars must be segmented RPG-style (not smooth)
* Never use plain red, blue, or green — always use the curated palette above

---

## Frontend Integration Rules

* Install and use `aws-amplify` (v6+) for Cognito auth — import from `aws-amplify/auth`
* Use `signIn()` and `signUp()` from `aws-amplify/auth` (Amplify v6 API)
* Install `@monaco-editor/react` for code editors in `LessonPage.tsx` and `CodeDuel.tsx`
* All API calls must use the base client in `src/services/api.ts` with `VITE_API_GATEWAY_URL` as base URL
* JWT token must be included in `Authorization` header on all protected API requests
* Implement retry logic: 3 retries with exponential backoff (1s, 2s, 4s delays)
* Show a loading spinner for any API request that takes longer than 500ms
* Every data-heavy component (Leaderboard, Progress, KnowledgeGraph) must have skeleton loading states

### Error Messages (Use Exactly These Strings)
* Network error → `"Connection lost. Check your internet and try again."`
* 500 error → `"Something went wrong on our end. We're fixing it!"`
* 429 rate limit → `"Slow down! Try again in a minute."`
* Bedrock timeout → `"AI is thinking too hard. Try a simpler question."`

---

## Backend / Lambda Guidelines

### Lambda Configuration (All Functions)
* Runtime: **Node.js 20.x**
* Memory: **512 MB**
* Timeout: **30 seconds** (hard limit)
* Architecture: **ARM64** (Graviton2 — 20% cost saving)
* CORS: `Access-Control-Allow-Origin` must be set to frontend domain — NOT `*` in production

### AI / Bedrock
* Cinema generation & AI Peers & RAG → use **Claude 3 Haiku** (`anthropic.claude-3-haiku-20240307-v1:0`)
* Mistake Analyzer → use **Nova Lite** (`amazon.nova-lite-v1:0`)
* Cap max_tokens at **2000** for Cinema scripts ($0.05/script max)
* Log estimated Bedrock cost to CloudWatch as a custom metric on every call
* Cache Cinema scripts in `cinema_cache` DynamoDB table with 7-day TTL

### DynamoDB Rules
* All tables must use **on-demand billing** (not provisioned)
* Enable **point-in-time recovery** on all tables
* Use DynamoDB atomic increment operations (`ADD`) for XP updates — never read-modify-write
* Use `Promise.all()` for independent parallel DynamoDB queries

### XP & Level Formula (Do Not Change)
```
level = floor(sqrt(total_xp / 100)) + 1
```
* New users start with `total_xp = 100`, `level = 1`
* Invariant: `total_xp >= (level - 1)^2 * 100` must always hold

### XP Awards (Exact Values)
* Complete lesson: **150 XP**
* Watch AI Cinema: **75 XP**
* Win Code Duel: **300 XP + (seconds_remaining × 2)**
* Daily login: **25 XP**
* Streak bonus (per day): **+10 XP**
* 7-day streak bonus: **+100 XP**

---

## API Endpoint Conventions

* RAG endpoint: `POST /rag/query` (not `/rag/ask`)
* Leaderboard: `GET /leaderboard/:category` where category = `individual` | `guild` | `friends`
* All protected endpoints must be validated by Cognito JWT Authorizer at API Gateway level
* Onboarding gate: API Gateway Authorizer must check `onboarding_completed` flag and return **403** if false on non-auth/non-onboarding routes

---

## DynamoDB Schema Source of Truth

Use `requirements.md` (v3.0) for all table schemas. Key fields:

| Table | Partition Key | Sort Key |
|-------|--------------|----------|
| users | user_id (String) | — |
| progress | user_id (String) | lesson_id (String) |
| peers | user_id (String) | timestamp (Number) |
| lessons | lesson_id (String) | — |
| cinema_cache | lesson_id (String) | — |
| duels | user_id (String) | timestamp (Number) |
| guilds | guild_id (String) | — |
| quests | user_id (String) | quest_id (String) |
| leaderboard | category (String) | entity_id (String) |

> Note: `leaderboard` uses GSI `total_xp-index` with PK=category, SK=total_xp for ranking queries.

---

## Cost & Budget Rules

* Total AWS budget: **$100** for the hackathon period
* Alert threshold: Send SNS notification when total spend hits **$90**
* CloudWatch Logs retention: **7 days** on all log groups
* Use **Standard-IA** S3 storage class for assets accessed less than once/month
* API Gateway rate limit: **100 requests/minute per user**, **1000 requests/minute per IP**
* When Bedrock daily cost for AI Peers exceeds **$5**, throttle to 1 request/minute per user

---

## File Naming Conventions

* Services: `src/services/[feature].service.ts` (e.g., `cinema.service.ts`)
* Hooks: `src/hooks/use[Feature].ts` (e.g., `useCinema.ts`)
* Context: `src/context/[Name]Context.tsx`
* Types: `src/types/[feature].types.ts`
* Lambda handlers: `backend/lambdas/[name]/index.ts`

---

## Pixel Pet Rules

* Stages: `egg` (0–500 XP) → `baby` (500–2000 XP) → `teen` (2000–5000 XP) → `adult` (5000+ XP)
* Hunger decays **5 points every 6 hours** (computed at read time from `last_hunger_update`)
* Feeding adds **25 hunger points**, capped at **100**
* When hunger = 0, mood becomes `sad`
* Invariant: `pet_hunger` must always be between 0 and 100 inclusive

---

## What NOT to Do

* ❌ Do NOT modify files in `src/app/components/ui/` (shadcn/ui components)
* ❌ Do NOT change JSX structure or UI rendering in page files — only replace data-fetching logic
* ❌ Do NOT use Amplify Hosting — frontend hosting is out of scope
* ❌ Do NOT use `CORS: '*'` in Lambda responses in production
* ❌ Do NOT use ISO string timestamps in DynamoDB — use Unix epoch milliseconds
* ❌ Do NOT use provisioned DynamoDB billing — always on-demand
* ❌ Do NOT call Bedrock with more than 2000 max_tokens for Cinema scripts
* ❌ Do NOT read-modify-write for XP updates — use DynamoDB atomic increments
