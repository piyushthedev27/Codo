# CODO — Standard Operating Procedure (SOP) & Project Blueprint
## Version 1.1 | March 2026

---

## 1. Executive Summary
**CODO (Code Duel Online)** is a gamified, competitive coding education platform. It bridges the gap between passive learning and high-pressure competitive programming by providing a structured, team-based, and highly interactive environment.

---

## 2. Technical Philosophy
- **Serverless First**: Everything runs on Next.js API Routes and Firebase managed services.
- **Micro-Services Logic**: Logic is separated by service (Authentication, Execution, Guilds, etc.) within the `lib/services` layer.
- **Verification Driven**: Use of property-based testing (`fast-check`) ensures that the system doesn't just work for common cases, but for *all* valid edge cases.
- **Immersive Design**: A "Pixel-Retro RPG" aesthetic designed to reduce learning anxiety and increase retention.

---

## 3. Product Architecture

### 3.1 Core Pillars
1. **The Arena**: Solving coding challenges and 1v1 duels.
2. **The Academy**: Structured lessons and learning paths.
3. **The Citadel (Guilds)**: Team-based collaboration and collective rankings.
4. **The Forge (Progress)**: XP, Leveling, and Detailed Mistake Analysis.

### 3.2 High-Level Workflow
1. **Onboarding**: Users register -> Self-assessment -> Learning path assigned.
2. **Engagement**: Daily challenges, lessons, and guild activity.
3. **Validation**: Submissions are executed in a sandbox -> Analyzed for mistakes -> XP & Leveling updated.
4. **Global Competition**: Climb the leaderboards individually and as a guild.

---

## 4. Frontend Blueprint (Next.js 14)

### 4.1 Route Map
- `(auth)/*`: Handles authentication flows (Login, Sign-up, Password Reset).
- `(dashboard)/dashboard`: The control center showing stats, streaks, and quick actions.
- `(dashboard)/challenges`: Browse and filter coding problems.
- `(dashboard)/duel`: Enter competitive matchmaking.
- `(dashboard)/guild`: Manage your team, invitations, and guild stats.
- `(dashboard)/lessons`: Browse the knowledge branches.
- `(dashboard)/profile/[username]`: View performance metrics and accomplishments.
- `onboarding/*`: Initial setup for new players.

### 4.2 UI Components
- **The Editor**: Monospaced code editor with multi-language support.
- **Pixel Stats**: RPG-style progress bars for HP (Health/Correctness) and XP.
- **Notification Center**: Real-time alerts for duels, invites, and milestones.

---

## 5. Backend Blueprint (API & Services)

### 5.1 Technology Stack
- **Framework**: Next.js 14 API Route Handlers.
- **Database**: Firebase Firestore (NoSQL).
- **Authentication**: Firebase Auth (JWT based).
- **Logic Layer**: `lib/services/` (Service-oriented architecture).

### 5.2 Key Service Modules
- **ExecutionEngine**: Compiles and runs code against test cases. Enforces 5s timeout and 256MB RAM limit.
- **MistakeAnalyzer**: Categorizes failures and provides didactic feedback.
- **LeaderboardService**: Manages ranking calculations and high-performance caching (30s TTL).
- **ProgressTracker**: Handles XP math, level-up logic, and streak maintenance.
- **GuildService**: Manages the life cycle of guilds and member roles.

---

## 6. Data Management Policy

### 6.1 Database Schema (Firestore)
- **Users**: Profile data, XP, Level, Stats.
- **Challenges**: Title, Difficulty, Hidden/Visible Test Cases.
- **Submissions**: Code snapshots, Execution metrics, Results.
- **Guilds**: Membership lists, collective scores, descriptions.
- **Notifications**: Unread messages, event logs.

### 6.2 Security Rules
- **Authentication Required**: All API calls must include a valid Firebase ID Token.
- **Ownership Enforcement**: Users can only read/write their own data (Middleware + Firestore Rules).
- **Admin Access**: Only authorized admin accounts can modify global challenges.

---

## 7. Developer Operations (DevOps)

### 7.1 Setup & Installation
1. `npm install`: Install dependencies.
2. `.env.local`: Setup Firebase credentials.
3. `npm run emulator`: Start the local Firebase environment.
4. `npm run dev`: Start the coding experience.

### 7.2 Testing SOP
- **Unit Tests**: `npm test` runs Jest suites.
- **Property Tests**: Automated edge-case generation for all API endpoints.
- **Acceptance Criteria**: Every feature must pass its 5-10 specific correctness properties before merging.

### 7.3 Deployment Flow
1. Branch creation and local verification.
2. Build check: `npm run build`.
3. Vercel deployment: Automatic on merge to `main`.
4. Firestore Rule Update: `firebase deploy --only firestore:rules`.

---

## 8. Gamification & XP Rules

| Activity | XP Benefit | Impact |
| --- | --- | --- |
| Daily Login | 25 XP | Encourages retention |
| Resolve Challenge | 100 - 350 XP | Encourages practice |
| Complete Lesson | 150 XP | Encourages learning |
| Win Duel | 250 XP | Encourages competition |
| 7-Day Streak | Bonus Points | Encourages consistency |

---

## 9. Performance & SLA Goals
- **API Latency**: 95% of requests < 200ms.
- **Code Execution**: Always < 5.0 seconds.
- **UI Responsiveness**: 60fps animations via Anime.js.
- **Data Availability**: 99.9% uptime via Firebase.

---

## 10. Future Scalability Plan
1. **AI Mentorship**: Real-time code hinting and animated explanations.
2. **Mobile Companion**: Native iOS/Android app for streak maintenance.
3. **Career Bridge**: Connecting high-ranking players with tech industry hiring partners.

---

*This document serves as the single source of truth for the CODO project. All architectural and feature decisions must align with these SOPs.*
