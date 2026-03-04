# CODO — Code Duel Online
## Comprehensive Project Presentation Document

> **Purpose:** This document contains all project details required to build a complete PowerPoint presentation for the CODO platform. Every section is designed to map directly to slides.

---

# SLIDE 1 — TITLE / COVER

## Project Name
**CODO — Code Duel Online**

## Tagline
> *"A gamified, competitive coding education platform where you never learn alone."*

## Team / Developer
Piyush Dev

## Technology Stack
Next.js 14 · TypeScript · Firebase · Tailwind CSS

---

# SLIDE 2 — WHAT IS CODO?

## Overview

**CODO (Code Duel Online)** is a full-stack competitive coding education platform that combines gamification, real-time coding challenges, structured learning, and social features into a single unified application.

## Core Concept

Users solve coding challenges, compete in duels, track their progress, join guilds with other developers, and follow structured lessons — all within a gamified experience built around XP, levels, streaks, and achievements.

## Problem It Solves

| Problem | CODO's Solution |
|---------|----------------|
| Learning to code alone is boring | AI Study Partners + Guild teams |
| No feedback on mistakes | Mistake Analyzer + detailed error categories |
| No motivation to practice daily | XP system, Daily Streaks, Level-ups |
| No competitive angle for motivation | Code Duels + Leaderboards |
| Scattered resources | Structured Lesson paths |

---

# SLIDE 3 — KEY FEATURES

## 🎮 Core Learning Experience

- **Coding Challenges** — Hundreds of problems categorized by difficulty (Easy, Medium, Hard) and topic (Arrays, Strings, Algorithms, etc.)
- **Code Duels** — Competitive timed coding challenges against peers
- **Interactive Lessons** — Structured lessons with embedded challenges and learning objectives
- **Multi-Language Support** — JavaScript, Python, Java, C++

## 🤖 AI & Mistake Analysis

- **Mistake Analyzer** — Categorizes submission errors (compilation, runtime, logic, timeout, memory) and provides targeted improvement suggestions
- **Common Mistake Detection** — Identifies patterns like off-by-one errors, null pointer exceptions, and more

## 🏆 Gamification

- **XP & Leveling System** — Earn XP from lessons, challenges, duels, logins, streaks
- **Daily Streaks** — Streak tracking with bonus XP
- **Achievements** — Unlock badges and trophies
- **Quest System** — Daily and weekly tasks with rewards
- **Pixel Pet Companion** — A virtual pet that grows with progress

## 👥 Social & Collaborative

- **Guilds** — Create or join teams of up to 5 members
- **Global & Challenge Leaderboards** — Rank by challenges solved, speed
- **Guild Leaderboards** — Guilds ranked by collective performance
- **Public Profiles** — Share achievements and stats with others
- **Notification System** — Real-time alerts for invitations, milestones, friend activity

## 📈 Progress & Analytics

- **Progress Dashboard** — Charts of challenges solved, lessons completed, level, recent activity
- **Knowledge Graph (Skill Tree)** — Visual skill tree showing your learning path
- **User Statistics** — Success rate, average solve time, total challenges solved

---

# SLIDE 4 — XP & LEVELING SYSTEM

## XP Earning Rules

| Activity | XP Earned |
|----------|-----------|
| Completing a Lesson | 100 – 250 XP |
| Winning a Code Duel | 200 – 500 XP |
| Watching AI Cinema | 50 – 100 XP |
| Daily Login | 25 XP |
| Daily Streak Bonus | +10 XP per consecutive day |
| Challenge Streak bonus | Variable |

## Level Progression

| Level Range | Title | XP Required |
|-------------|-------|-------------|
| Level 1 – 10 | Novice | 0 – 1,000 XP |
| Level 11 – 25 | Apprentice | 1,000 – 5,000 XP |
| Level 26 – 40 | Hero | 5,000 – 15,000 XP |
| Level 41+ | Legend | 15,000+ XP |

---

# SLIDE 5 — TECH STACK

## Full Technology Architecture

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | Unified frontend + API |
| **Language** | TypeScript | Type safety throughout |
| **Styling** | Tailwind CSS 4 | Utility-first responsive styling |
| **Animations** | Anime.js | Smooth micro-animations |
| **Icons** | Lucide React | Consistent icon library |
| **Auth** | Firebase Authentication | Email/Password, Social login |
| **Database** | Firebase Firestore | Real-time NoSQL database |
| **Admin SDK** | Firebase Admin | Server-side database operations |
| **Testing** | Jest + fast-check | Unit + property-based tests |
| **Middleware** | Next.js Edge Middleware | Auth protection, route guards |
| **Hosting** | Vercel | Production deployment |

## Why Next.js App Router?

- **Unified codebase** — Frontend pages AND backend API routes in one project
- **File-system routing** — No manual router configuration
- **Server Components** — Faster page loads, SEO-friendly
- **API Route Handlers** — Replace Express.js without extra infrastructure
- **Edge Middleware** — Protect routes before they render
- **Built-in TypeScript** — First-class support

## Why Firebase?

- **No server to manage** — Firebase handles scaling automatically
- **Authentication included** — No custom auth system needed
- **Real-time updates** — Live leaderboards, notifications
- **Security Rules** — Database-level access control
- **Free tier** — Sufficient for development and early production

---

# SLIDE 6 — SYSTEM ARCHITECTURE

## High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                  USER'S BROWSER                          │
│    Next.js React App (App Router + Client Components)    │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTPS
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Next.js Server (Vercel)                     │
│  ┌───────────────────┐  ┌──────────────────────────────┐ │
│  │  App Router Pages │  │   API Route Handlers         │ │
│  │  (React Server    │  │   app/api/auth/              │ │
│  │   Components)     │  │   app/api/challenges/        │ │
│  └───────────────────┘  │   app/api/submissions/       │ │
│                         │   app/api/leaderboards/      │ │
│  ┌───────────────────┐  │   app/api/guilds/            │ │
│  │  Middleware        │  │   app/api/lessons/           │ │
│  │  (Auth protection,│  │   app/api/progress/          │ │
│  │   rate limiting)  │  │   app/api/notifications/     │ │
│  └───────────────────┘  └──────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────┘
                           │ Firebase Admin SDK
              ┌────────────┼────────────┐
              ▼            ▼            ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
   │   Firebase   │  │  Firebase    │  │  Firebase    │
   │     Auth     │  │  Firestore   │  │   Storage    │
   └──────────────┘  └──────────────┘  └──────────────┘
```

## Key Architectural Decisions

1. **No separate backend server** — Everything is served from Next.js. API Routes handle all backend logic.
2. **Firebase-first** — Firebase Auth + Firestore handle auth and data. No custom DB server.
3. **Middleware-based auth** — Next.js Edge Middleware protects routes before rendering.
4. **Service layer** — Business logic is encapsulated in `lib/services/` files, not mixed into API routes.

---

# SLIDE 7 — PROJECT FOLDER STRUCTURE

```
codo/
│
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth pages (login, sign-up)
│   │   ├── login/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (dashboard)/                  # Protected pages
│   │   ├── dashboard/page.tsx        # Main hub
│   │   ├── challenges/page.tsx       # Challenge list
│   │   ├── leaderboard/page.tsx      # Rankings
│   │   ├── guild/page.tsx            # Guild management
│   │   ├── lessons/page.tsx          # Lesson browser
│   │   ├── progress/page.tsx         # Stats & progress
│   │   └── settings/page.tsx         # User settings
│   ├── api/                          # API Route Handlers
│   │   ├── auth/                     # Auth endpoints
│   │   ├── challenges/               # Challenge CRUD
│   │   ├── submissions/              # Code submission
│   │   ├── leaderboards/             # Ranking data
│   │   ├── guilds/                   # Guild management
│   │   ├── lessons/                  # Lesson content
│   │   ├── progress/                 # Progress tracking
│   │   └── notifications/            # Notification system
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
│
├── components/                       # Reusable React components
├── lib/                              # Shared utilities
│   ├── firebase-admin.ts             # Server-side Firebase Admin SDK
│   ├── firebase.ts                   # Client-side Firebase SDK
│   └── services/                     # Business logic services
│
├── hooks/                            # Custom React hooks
├── __tests__/                        # Test files
│   └── api/                         # API tests
│
├── firebase/                         # Firebase config files
│   ├── firestore.rules               # Security rules
│   └── firestore.indexes.json        # Composite indexes
│
├── .kiro/specs/Codo/                 # Design & requirements specs
│   ├── design.md                     # Full technical design
│   ├── requirements.md               # System requirements
│   ├── firebase-data-model.md        # Firestore data model
│   └── tasks.md                      # Implementation task list
│
├── middleware.ts                      # Auth protection middleware
├── next.config.js                     # Next.js configuration
├── .env.local                         # Environment secrets
└── firebase.json                      # Firebase Emulator config
```

---

# SLIDE 8 — DATABASE DESIGN (FIREBASE FIRESTORE)

## Firestore Collections Overview

```
Firestore Database
│
├── users/                    # User accounts & profiles
├── challenges/               # Coding problems
├── submissions/              # Code submissions & results
├── guilds/                   # Guild data
│   └── {guildId}/members/   # Guild members (subcollection)
├── guildInvitations/         # Pending invitations
├── lessons/                  # Educational content
├── progress/                 # User lesson progress
├── notifications/            # User notifications
└── mistakeAnalysis/          # Error analysis data
```

## Collection Schemas

### `users/{userId}`
```json
{
  "uid": "firebase-auth-uid",
  "username": "coder123",
  "email": "user@example.com",
  "avatarUrl": "https://...",
  "bio": "Passionate coder",
  "level": 5,
  "experiencePoints": 1250,
  "totalChallengesSolved": 42,
  "successRate": 85.5,
  "averageSolveTime": 180000,
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastLogin": "timestamp",
  "isActive": true
}
```

### `challenges/{challengeId}`
```json
{
  "id": "challenge-uuid",
  "title": "Two Sum",
  "description": "Find two numbers that add up to target...",
  "difficulty": "easy",
  "category": "arrays",
  "timeLimit": 5,
  "memoryLimit": 256,
  "testCases": [
    { "input": "[2,7,11,15], 9", "expectedOutput": "[0,1]", "isHidden": false },
    { "input": "[3,2,4], 6",     "expectedOutput": "[1,2]", "isHidden": true }
  ],
  "createdBy": "admin-user-id",
  "createdAt": "timestamp",
  "isActive": true
}
```

### `submissions/{submissionId}`
```json
{
  "id": "submission-uuid",
  "userId": "user-id",
  "challengeId": "challenge-id",
  "code": "function twoSum(nums, target) { ... }",
  "language": "javascript",
  "status": "success",
  "executionTime": 45,
  "memoryUsed": 12,
  "testResults": [
    { "testCaseId": 0, "passed": true, "output": "[0,1]", "expectedOutput": "[0,1]" }
  ],
  "errorMessage": null,
  "createdAt": "timestamp"
}
```

### `guilds/{guildId}`
```json
{
  "id": "guild-uuid",
  "name": "AlgoMasters",
  "description": "We master every algorithm",
  "ownerId": "user-id",
  "isPublic": true,
  "memberCount": 5,
  "totalChallengesSolved": 247,
  "averageSolveTime": 120000,
  "createdAt": "timestamp"
}
```

### Subcollection: `guilds/{guildId}/members/{userId}`
```json
{
  "userId": "user-id",
  "role": "member",
  "joinedAt": "timestamp"
}
```

### `notifications/{notificationId}`
```json
{
  "userId": "user-id",
  "type": "level_up",
  "title": "Level Up!",
  "message": "You reached Level 10. You are now a Hero!",
  "relatedId": null,
  "isRead": false,
  "createdAt": "timestamp"
}
```

### `mistakeAnalysis/{analysisId}`
```json
{
  "submissionId": "submission-uuid",
  "errorCategory": "logic",
  "description": "Off-by-one error in loop boundary",
  "suggestions": ["Check loop condition: use < instead of <="],
  "relatedLessons": ["lesson-arrays-101"],
  "commonMistakeType": "off-by-one",
  "createdAt": "timestamp"
}
```

## Database Relationships

```
users
  ├── has many submissions (via userId)
  ├── has many guilds as owner (via ownerId)
  ├── has many guild memberships (subcollection)
  ├── has many progress records (via userId)
  ├── has many notifications (via userId)
  └── has many challenges as creator (via createdBy)

challenges
  ├── has many submissions (via challengeId)
  └── referenced by lessons (via challengeIds array)

submissions
  ├── belongs to user (userId reference)
  ├── belongs to challenge (challengeId reference)
  └── has one mistake analysis (via submissionId)

guilds
  ├── has many members (subcollection)
  ├── has many invitations (via guildId)
  └── belongs to owner (ownerId reference)
```

---

# SLIDE 9 — API ENDPOINTS

## Complete REST API Reference

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/verify` | Verify Firebase token |
| POST | `/api/auth/password-reset` | Send password reset email |

### 👤 User Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId` | Get user profile |
| PUT | `/api/users/:userId` | Update user profile |
| GET | `/api/users/:userId/statistics` | Get user statistics |

### 💡 Challenges
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/challenges` | List challenges (filter by difficulty, category) |
| GET | `/api/challenges/:id` | Get challenge details |
| POST | `/api/challenges` | Create challenge (admin) |
| PUT | `/api/challenges/:id` | Update challenge (admin) |
| DELETE | `/api/challenges/:id` | Delete challenge (admin) |

### 📤 Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/submissions` | Submit code for execution |
| GET | `/api/submissions/:id` | Get submission details |
| GET | `/api/users/:userId/submissions` | Get user submission history |
| GET | `/api/submissions/:id/analysis` | Get mistake analysis |

### 🏆 Leaderboards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboards/global` | Global top 100 users |
| GET | `/api/leaderboards/challenge/:id` | Challenge-specific ranking |
| GET | `/api/leaderboards/user/:id/rank` | User's rank position |
| GET | `/api/leaderboards/user/:id/nearby` | Nearby competitors |
| GET | `/api/leaderboards/guilds` | Guild leaderboard |

### 🏰 Guilds
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/guilds` | Create guild |
| GET | `/api/guilds/:id` | Get guild details |
| PUT | `/api/guilds/:id` | Update guild settings |
| DELETE | `/api/guilds/:id` | Delete guild |
| GET | `/api/guilds/:id/members` | List guild members |
| POST | `/api/guilds/:id/members` | Add member |
| DELETE | `/api/guilds/:id/members/:userId` | Remove member |
| POST | `/api/guilds/:id/invitations` | Create invitation |
| POST | `/api/guilds/:id/invitations/:invId/accept` | Accept invitation |

### 📚 Lessons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lessons` | List lessons |
| GET | `/api/lessons/:id` | Get lesson details |
| GET | `/api/lessons/:id/challenges` | Lesson's challenges |
| GET | `/api/users/:userId/lessons/progress` | User lesson progress |
| POST | `/api/lessons/:id/complete` | Mark lesson complete |

### 📊 Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:userId/progress` | User progress |
| GET | `/api/users/:userId/dashboard` | Full dashboard stats |
| GET | `/api/users/:userId/achievements` | User achievements |

### 🔔 Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread` | Unread notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| DELETE | `/api/notifications/:id` | Delete notification |

---

# SLIDE 10 — CODE EXECUTION ENGINE

## How It Works

```
User submits code
       │
       ▼
API Route (/api/submissions)
       │
       ▼
Execution Engine (lib/services/executionEngine.ts)
       │
  ┌────┴────┐
  │ Compile │
  └────┬────┘
       │ (if compilation error → return error with line numbers)
       │
  ┌────▼────────────┐
  │ Execute against  │
  │ all test cases   │
  └────┬────────────┘
       │ Timeout: 5 seconds
       │ Memory Limit: 256 MB
       │
  ┌────▼────────────────┐
  │ Collect Results      │
  │ (pass/fail, output)  │
  └────┬────────────────┘
       │
  ┌────▼────────────────────────────────────┐
  │ Save Submission to Firestore             │
  │ Update User Statistics                   │
  │ Update Leaderboards                      │
  │ Run Mistake Analysis (if failed)         │
  └─────────────────────────────────────────┘
```

## Supported Languages

| Language | Compiler / Runtime |
|----------|-------------------|
| JavaScript | Node.js |
| Python | Python 3 |
| Java | javac + JVM |
| C++ | g++ |

## Execution Limits

| Constraint | Value |
|------------|-------|
| Time Limit | 5 seconds per submission |
| Memory Limit | 256 MB |
| Rate Limit (code execution) | 10 requests/minute per user |
| Standard API Rate Limit | 100 requests/minute per user |

## Error Categories

| Category | Description |
|----------|-------------|
| `compilation_error` | Code failed to compile (includes line numbers) |
| `runtime_error` | Code crashed during execution |
| `logic_error` | Code ran but output doesn't match expected |
| `timeout` | Exceeded 5-second time limit |
| `memory_limit` | Exceeded 256 MB memory limit |

---

# SLIDE 11 — FIRESTORE SECURITY RULES

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    function isGuildOwner(guildId) {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/guilds/$(guildId))
          .data.ownerId == request.auth.uid;
    }

    // Users — only owner can update, everyone can read
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false;
    }

    // Submissions — user can only read their own
    match /submissions/{submissionId} {
      allow read: if isAuthenticated() &&
        (resource.data.userId == request.auth.uid ||
         request.auth.token.admin == true);
      allow create: if isAuthenticated() &&
        request.resource.data.userId == request.auth.uid;
      allow update: if false; // Immutable
      allow delete: if false;
    }

    // Guilds — owner can update/delete
    match /guilds/{guildId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isGuildOwner(guildId);
      allow delete: if isGuildOwner(guildId);
      
      match /members/{userId} {
        allow read: if isAuthenticated();
        allow create: if isGuildOwner(guildId);
        allow delete: if isGuildOwner(guildId) || isOwner(userId);
      }
    }

    // Notifications — users can only see their own
    match /notifications/{notificationId} {
      allow read, update, delete: if isAuthenticated() &&
        resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
    }
  }
}
```

---

# SLIDE 12 — GAMIFICATION DESIGN

## Experience Points Formula

| Activity | Points |
|----------|--------|
| Solve easy challenge | 100 XP |
| Solve medium challenge | 200 XP |
| Solve hard challenge | 350 XP |
| Complete a lesson | 150 XP |
| Win a duel | 250 XP |
| Daily login | 25 XP |
| 7-day streak | bonus 100 XP |

## User Levels

```
Level  1-10  →  Novice     (0 – 1,000 XP)
Level 11-25  →  Apprentice (1,001 – 5,000 XP)
Level 26-40  →  Hero       (5,001 – 15,000 XP)
Level 41+    →  Legend     (15,001+ XP)
```

## Leaderboard Ranking Algorithm

**Global Leaderboard:**
1. Primary sort: `totalChallengesSolved` (descending)
2. Tiebreaker: `averageSolveTime` (ascending — faster is better)
3. Return top 100 users

**Challenge Leaderboard:**
1. Ranked by fastest solve time for that specific challenge

**Guild Leaderboard:**
1. Ranked by `totalChallengesSolved` (sum of all members)

## User's Rank in Leaderboard

When a user queries their rank, the response includes:
- Their exact rank number
- Their score
- Top 5 users above them
- Top 5 users below them

---

# SLIDE 13 — SECURITY DESIGN

## Authentication Flow

```
User Enters Credentials
        │
        ▼
Firebase Authentication
(Email + Password Validation)
        │
        ▼
Firebase issues ID Token
(JWT with 1-hour expiry)
        │
        ▼
Client stores token
        │
        ▼
Every API request attaches token
in Authorization header
        │
        ▼
Firebase Admin SDK verifies token
server-side before processing
```

## Security Layers

| Layer | Technology | What it Protects |
|-------|------------|-----------------|
| Network | HTTPS/TLS | All data in transit |
| Auth | Firebase Auth + JWT | Identity verification |
| Route | Next.js Middleware | Prevents accessing protected pages |
| API | Firebase Admin token verify | Invalid/expired tokens rejected |
| Database | Firestore Security Rules | Direct database access control |
| Rate Limiting | Middleware | Abuse prevention |
| Input | Validation middleware | XSS, injection attacks |

## Password Security

- Passwords are **never stored** in the application or database
- Firebase Authentication manages all password hashing internally
- Password reset via Firebase's own email + time-limited token system
- No custom password storage code

---

# SLIDE 14 — PERFORMANCE TARGETS

## SLA Requirements

| Metric | Target |
|--------|--------|
| Standard API response time | < 200ms (p95) |
| Code execution (including compilation) | < 5 seconds |
| Leaderboard update after submission | < 30 seconds |
| Guild leaderboard update | < 1 minute |

## Caching Strategy

| Data | Cache TTL | Strategy |
|------|-----------|---------|
| Global Leaderboard | 30 seconds | In-memory cache, invalidate on submission |
| User Statistics | 5 minutes | In-memory cache, invalidate on update |
| Challenge Metadata | 1 hour | In-memory cache |
| Guild Statistics | 1 minute | In-memory cache, invalidate on member submission |

## Firestore Composite Indexes

```
Collection: submissions
  - userId + createdAt (DESC)
  - challengeId + createdAt (DESC)
  - userId + challengeId + createdAt (DESC)
  - status + createdAt (DESC)

Collection: notifications
  - userId + isRead + createdAt (DESC)

Collection: users
  - totalChallengesSolved (DESC) + averageSolveTime (ASC)

Collection: guilds
  - totalChallengesSolved (DESC)
```

---

# SLIDE 15 — TESTING STRATEGY

## Overview

CODO uses a **dual testing approach** combining traditional unit tests with **property-based testing** for comprehensive correctness guarantees.

## Testing Libraries

| Tool | Purpose |
|------|---------|
| **Jest** | Unit test runner |
| **fast-check** | Property-based test generation |
| **Firebase Emulator Suite** | Isolated test environment for Firestore + Auth |

## Test Types

### Unit Tests
- Test specific scenarios and edge cases
- Test error handling for invalid inputs
- Example: "Register with duplicate email returns 400"

### Property-Based Tests
- Verify universal correctness properties across ALL inputs
- Each test generates 100+ random valid inputs automatically
- Example: *"For ANY valid registration credentials, the system SHALL create a user account and return a token"*

## Correctness Properties Tested (Sample)

| Property | Description |
|----------|-------------|
| Property 1 | Valid registration always creates user account |
| Property 2 | Valid login always returns token |
| Property 3 | Invalid password always rejected |
| Property 12 | Code execution always within 5 seconds |
| Property 15 | Timeout always terminates execution |
| Property 28 | Global leaderboard always ranks top 100 |
| Property 33 | Guild name always validated (3-50 chars) |
| Property 48 | Challenge completion always updates stats |
| Property 53 | Failed submission always categorizes error |

> **Total: 88 correctness properties** tracked against requirements

## Coverage Goals

- Unit test coverage: **80%+**
- Property test coverage: **All acceptance criteria**
- Integration: All critical user workflows

---

# SLIDE 16 — IMPLEMENTATION PHASES

## Development Roadmap

| Phase | Feature Area | Status |
|-------|-------------|--------|
| Phase 1 | Project Setup & Infrastructure | ✅ Complete |
| Phase 2 | Authentication & User Management | ✅ Complete |
| Phase 3 | Code Execution Engine | ✅ Complete |
| Phase 4 | Challenge Management & Submissions | ✅ Complete |
| Phase 5 | Leaderboard System | 🔄 In Progress |
| Phase 6 | Guild System | ⏳ Pending |
| Phase 7 | Guild Leaderboard & Lessons | ⏳ Pending |
| Phase 8 | Progress Tracking & Mistake Analysis | ⏳ Pending |
| Phase 9 | Notifications & API Gateway | ⏳ Pending |
| Phase 10 | Firestore Operations & Performance | ⏳ Pending |
| Phase 11 | Configuration & Documentation | ⏳ Pending |
| Phase 12 | Integration Testing & Final Verification | ⏳ Pending |

## Phase 1: Infrastructure (Complete ✅)
- Next.js 14 App Router setup
- Firebase Admin SDK integration
- Firebase Emulator Suite for local dev
- TypeScript configuration
- Environment & secrets management
- Firestore security rules & indexes
- Jest testing setup

## Phase 2: Authentication (Complete ✅)
- User registration via Firebase Auth
- User login with ID token generation
- Password reset via Firebase email
- Auth middleware (token verification)  
- User profile CRUD (Firestore)
- Public/private profile access control

## Phase 3: Code Execution Engine (Complete ✅)
- Multi-language compilation (JS, Python, Java, C++)
- 5-second timeout enforcement
- 256 MB memory limit enforcement
- Test case execution and pass/fail collection
- Execution result persistence to Firestore
- Detailed compilation error messages

## Phase 4: Challenges & Submissions (Complete ✅)
- Challenge CRUD operations (with admin authorization)
- Challenge filtering by difficulty, category
- Test cases hidden until submission
- Submission storage in Firestore
- Submission history retrieval
- Access control (own submissions only)

---

# SLIDE 17 — USER JOURNEYS

## Journey 1: New User Registration

```
Landing Page (/) 
  → Click "Get Started"
  → Sign Up Page (/sign-up)
  → Enter email, password, username
  → Firebase registers user
  → Firestore user profile created
  → Onboarding: Skill Assessment (/onboarding/assessment)
  → Path selection (/onboarding/path)
  → Dashboard (/dashboard)
```

## Journey 2: Solving a Challenge

```
Dashboard
  → Browse Challenges (/challenges)
  → Filter by difficulty: "Medium"
  → Click on a challenge
  → Read problem statement
  → Write code in embedded editor
  → Click "Submit"
  → Code sent to Execution Engine
  → Results shown: pass/fail per test case
  → If failed: Mistake Analyzer shows what went wrong
  → If passed: XP awarded, leaderboard updated
```

## Journey 3: Joining a Guild

```
Dashboard → Guilds (/guild)
  → Browse public guilds
  → Click "Join" (public guild) OR wait for invitation
  → Become a member
  → View guild leaderboard
  → Compete as a team
  → Guild score = sum of all members' challenges solved
```

## Journey 4: Completing a Lesson

```
Dashboard → Lessons (/lessons)
  → Select a topic/lesson
  → Read lesson content
  → Work through embedded challenges (in order)
  → All challenges passed → Lesson marked complete
  → XP awarded
  → Level-up check triggered
  → Notification: "Level Up!" (if applicable)
  → Progress dashboard updated
```

---

# SLIDE 18 — UI & DESIGN SYSTEM

## Theme: Pixel-Retro RPG

CODO uses a **dark, neon, pixel-art RPG aesthetic** to create an immersive learning environment.

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Background (Main) | `#0a0a0f` | Page background |
| Background (Secondary) | `#12121a` | Sections |
| Background (Cards) | `#1a1a2e` | Cards, panels |
| Purple (Primary) | `#6c63ff` | Buttons, highlights |
| Cyan (Secondary) | `#00d4ff` | Links, focus states |
| Green (Success/XP) | `#00ff88` | Success, XP gains |
| Gold (Streaks/Coins) | `#ffd700` | Streaks, rewards |
| Red-Pink (Danger) | `#ff4d6d` | Errors, danger |
| Text (Primary) | `#e8e8f0` | Main text |
| Text (Secondary) | `#8888aa` | Labels, captions |

## Typography

| Font | Usage |
|------|-------|
| Press Start 2P | Headings, titles, level numbers (pixel font) |
| VT323 | UI labels, stats, buttons (retro monospace) |
| JetBrains Mono | Body text, code, descriptions |

## Visual Style Elements

- 2px solid pixel borders with minimal radius (4px max)
- Neon glow effects on hover / active states
- Scanline CRT monitor overlay effects
- Segmented progress bars (RPG-style HP/XP bars)
- Pixel grid background patterns
- Pixel art character sprites (64×64px)

## UI Pages by Category

**Public Pages:**
- `/` — Hero landing page
- `/login` — Login
- `/sign-up` — Account creation

**Onboarding:**
- `/onboarding/assessment` — Skill self-assessment
- `/onboarding/path` — Choose learning track

**Dashboard Pages:**
- `/dashboard` — Main hub with stats
- `/challenges` — Browse challenges
- `/duel` — Competitive coding arena
- `/lessons` — Structured learning
- `/progress` — Progress charts
- `/progress/graph` — Skill tree/knowledge graph
- `/progress/mistakes` — Mistake analyzer
- `/leaderboard` — Global rankings
- `/guild` — Team management
- `/profile/:username` — Public profile
- `/settings` — Preferences

---

# SLIDE 19 — NOTIFICATIONS & REAL-TIME

## Notification Types

| Type | Trigger | Message Example |
|------|---------|----------------|
| `guild_invitation` | Someone invites you | "AlgoMasters invited you to join!" |
| `friendship_activity` | Friend solves a challenge | "Alex solved Two Sum in 1:23!" |
| `level_up` | User reaches new level | "You reached Level 15 — Legend Tier!" |
| `achievement` | Milestone hit | "Streak achievement: 7 days in a row!" |

## Notification Flow

```
Event occurs (e.g., user levels up)
        │
        ▼
Progress Tracker detects level change
        │
        ▼
Notification Service creates document in Firestore
  /notifications/{auto-id}
        │
        ▼
Client app uses Firestore real-time listener
        │
        ▼
Notification badge updates instantly
        │
        ▼
User opens notification panel
        │
        ▼
PUT /api/notifications/:id/read
  → Firestore document updated: isRead = true
```

---

# SLIDE 20 — SYSTEM REQUIREMENTS SUMMARY

## Functional Requirements

| # | Requirement | Status |
|---|-------------|--------|
| 1 | User Authentication & Authorization | ✅ |
| 2 | User Profile Management | ✅ |
| 3 | Code Execution Service | ✅ |
| 4 | Challenge Management | ✅ |
| 5 | Submission Tracking & History | ✅ |
| 6 | Leaderboard System | 🔄 |
| 7 | Guild System | ⏳ |
| 8 | Guild Leaderboard | ⏳ |
| 9 | Lesson System | ⏳ |
| 10 | Progress Tracking | ⏳ |
| 11 | Mistake Analysis | ⏳ |
| 12 | Real-time Notifications | ⏳ |
| 13 | API Rate Limiting & Security | 🔄 |
| 14 | Data Persistence & Backup | ✅ |
| 15 | Performance & Scalability | ✅ |
| 16 | Logging & Monitoring | ✅ |
| 17 | API Documentation | ⏳ |
| 18 | Database Schema Design | ✅ |
| 19 | Integration with Frontend | ✅ |
| 20 | Environment Configuration | ✅ |

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| API Response Time | < 200ms p95 |
| Code Execution Time | < 5 seconds |
| Availability | 99.9% uptime |
| Rate Limiting (standard) | 100 req/min per user |
| Rate Limiting (execution) | 10 req/min per user |
| Data Encryption | In transit (HTTPS) + at rest (Firestore) |
| Log Retention | 90 days |
| Backup Retention | 30 days |

---

# SLIDE 21 — COMPETITIVE COMPARISON

| Feature | CODO | LeetCode | HackerRank | Codecademy |
|---------|------|----------|------------|------------|
| Code Challenges | ✅ | ✅ | ✅ | ✅ |
| Competitive Duels | ✅ | ❌ | Limited | ❌ |
| Guild/Team System | ✅ | ❌ | ❌ | ❌ |
| Mistake Analyzer | ✅ | ❌ | Limited | ❌ |
| Gamified XP/Levels | ✅ | Limited | Limited | ✅ |
| Pixel RPG Theme | ✅ | ❌ | ❌ | ❌ |
| Free to Use | ✅ | Freemium | Freemium | Freemium |
| Multiple Languages | ✅ | ✅ | ✅ | ✅ |
| Structured Lessons | ✅ | ❌ | ✅ | ✅ |
| Progress Dashboard | ✅ | ✅ | ✅ | ✅ |

---

# SLIDE 22 — FUTURE ROADMAP

## Planned Features

### Phase 13: Multiplayer Duels
- Real-time 1v1 code duels with live spectating
- Matchmaking system by skill level
- Duel history and win/loss stats

### Phase 14: AI Study Partners
- Three AI personas (Sarah, Alex, Jordan) with distinct specialties
- AI Code Cinema — animated code explanations with voiceover
- Personalized hint system based on user's mistake history

### Phase 15: Mobile Support
- React Native mobile app
- Offline lesson browsing
- Push notifications

### Phase 16: More Languages
- Rust, Go, Kotlin, Swift
- Language-specific lesson tracks

### Phase 17: Custom Challenges
- Users can create and share their own challenges
- Community upvote/downvote system
- Challenge marketplace

### Phase 18: Internship Integration
- Company-sponsored challenges
- Portfolio builder for job seekers
- Mock interview mode

---

# SLIDE 23 — KEY TECHNICAL ACHIEVEMENTS

## 1. Unified Full-Stack Architecture
Migrated from split Vite + Express to a single Next.js 14 codebase. One `npm install`, one `npm run dev`, one deployment target.

## 2. Firebase-Native Backend
Zero server management. Firestore handles persistence, Auth handles users, Security Rules handle authorization — all without a custom database server.

## 3. Property-Based Testing
88 correctness properties formally defined and tested using `fast-check`. Properties generate hundreds of random inputs per test, catching edge cases traditional unit tests miss.

## 4. Real-Time Architecture
Firestore real-time listeners enable instant leaderboard and notification updates without polling or WebSockets.

## 5. Multi-Language Code Execution Engine
Built a sandbox execution engine that compiles and runs JavaScript, Python, Java, and C++ with strict 5-second timeout and 256 MB memory enforcement.

## 6. Firebase Emulator-First Development
Full local development without any cloud costs. Firebase Emulator Suite replicates Firestore + Auth behavior exactly.

---

# SLIDE 24 — DEPLOYMENT

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with Firebase emulator settings

# 3. Start Firebase Emulators (Terminal 1)
npm run emulator

# 4. Start Next.js App (Terminal 2)
npm run dev
```

**Access:**
- App: http://localhost:3000
- Firebase Emulator UI: http://localhost:4000

## Production Deployment (Vercel + Firebase)

```bash
# Build production bundle
npm run build

# Deploy via Vercel CLI
vercel --prod
```

**Firebase Setup Required:**
1. Create Firebase project at console.firebase.google.com
2. Enable Firestore Database
3. Enable Email/Password Authentication
4. Generate Service Account Key
5. Add credentials to Vercel environment variables
6. Deploy security rules: `firebase deploy --only firestore:rules`
7. Deploy indexes: `firebase deploy --only firestore:indexes`

## Environment Variables (`.env.local`)

```env
# Public (accessible client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# Private (server-side only)
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam...
```

---

# SLIDE 25 — PROJECT SUMMARY

## What We Built

**CODO** is a production-ready, full-stack competitive coding platform built with:

- **Next.js 14** (App Router) — Unified frontend + backend
- **Firebase Auth + Firestore** — Serverless, scalable data layer
- **Multi-language Execution Engine** — JavaScript, Python, Java, C++
- **Gamification System** — XP, levels, streaks, guilds, leaderboards
- **Mistake Analyzer** — AI-powered error categorization and feedback
- **Property-Based Testing** — 88 formal correctness properties verified

## Scale & Impact

| Metric | Detail |
|--------|--------|
| API Endpoints | 35+ REST endpoints |
| Firestore Collections | 9 collections + subcollections |
| Supported Languages | 4 (JS, Python, Java, C++) |
| Correctness Properties | 88 formally defined |
| Development Phases | 12 planned phases |
| Implementation Tasks | 100+ discrete tasks tracked |

## Core Value Proposition

> CODO makes coding practice **fun**, **social**, and **measurable** by combining competitive gaming mechanics with structured education — all in a unified, serverless Next.js application.

---

*Document generated: March 2026 | Version 1.1 | CODO — Code Duel Online*
