# CODO Platform - Technical Design Document

## Overview

The CODO platform is a full-stack competitive coding application built as a Next.js 14 App Router monolith with Firebase backend services. The system handles user authentication, code execution, challenge management, leaderboards, guilds, lessons, progress tracking, and mistake analysis. The architecture prioritizes developer velocity, security, and performance through a unified codebase with co-located frontend and backend.

### Key Design Principles

- **Monolithic Architecture**: Next.js 14 App Router with co-located frontend pages and API routes for rapid development and deployment
- **Firebase-First Backend**: Leverage Firebase Authentication and Firestore for managed backend services with no server administration
- **Security First**: Firebase Authentication, Firestore security rules, input validation, in-memory rate limiting
- **Performance Optimized**: In-memory caching (leaderboards, stats), Firestore composite indexes, custom performance monitoring
- **Observability**: Structured JSON logging for Firebase Cloud Logging, custom performance metrics collection
- **Resilient**: Error handling, graceful degradation, Firebase automatic backups and replication

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   Next.js 14 App Router Application             │
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────────┐   │
│  │  Frontend Pages      │      │  API Routes              │   │
│  │  app/(dashboard)/    │      │  app/api/                │   │
│  │  app/(auth)/         │      │  - /auth/register        │   │
│  │  - React Components  │◄────►│  - /challenges           │   │
│  │  - Firebase Client   │      │  - /submissions          │   │
│  │    SDK               │      │  - /guilds               │   │
│  │  - Tailwind CSS      │      │  - /leaderboards         │   │
│  └──────────────────────┘      │  - /lessons              │   │
│                                 │  - /notifications        │   │
│                                 │                          │   │
│                                 │  Middleware:             │   │
│                                 │  - Rate Limiter          │   │
│                                 │  - Error Handler         │   │
│                                 │  - Validation            │   │
│                                 └──────────┬───────────────┘   │
└────────────────────────────────────────────┼───────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────┐
                    │                        │                    │
                    ▼                        ▼                    ▼
         ┌──────────────────┐    ┌──────────────────┐  ┌─────────────────┐
         │ Firebase Auth    │    │ Firebase Admin   │  │ Node.js Child   │
         │ (Client SDK)     │    │ SDK              │  │ Processes       │
         │ - Email/Password │    │ - Token Verify   │  │ - Code Exec     │
         │ - Social Login   │    │ - Firestore      │  │ - Multi-lang    │
         │ - Token Mgmt     │    │   Operations     │  │ - Temp Dirs     │
         └──────────────────┘    └────────┬─────────┘  └─────────────────┘
                                           │
                                           ▼
                                 ┌──────────────────┐
                                 │ Firebase         │
                                 │ Firestore        │
                                 │ - Collections    │
                                 │ - Subcollections │
                                 │ - Security Rules │
                                 │ - Indexes        │
                                 └──────────────────┘
```

### Monolithic Architecture

The platform is built as a Next.js 14 App Router monolith with the following structure:

1. **Frontend Pages** (app/(dashboard)/, app/(auth)/)
   - Server and client components
   - Firebase Client SDK for authentication
   - Direct API calls to co-located API routes
   - Tailwind CSS + Radix UI for styling

2. **API Routes** (app/api/)
   - Next.js API Routes handling all backend logic
   - Firebase Admin SDK for server-side operations
   - In-memory rate limiting middleware
   - Error handling and validation middleware
   - Structured JSON logging

3. **Service Layer** (lib/services/)
   - challengeService: CRUD operations for challenges
   - submissionService: Submission storage and retrieval
   - executionEngine: Code compilation and execution
   - leaderboardService: Ranking with in-memory caching (30s TTL)
   - guildService: Guild management with Firestore subcollections
   - guildLeaderboardService: Guild rankings with caching (1min TTL)
   - lessonService: Lesson management and progress tracking
   - progressService: XP/level system with caching (5min TTL)
   - mistakeAnalysisService: Error categorization and feedback
   - notificationService: Notification management with caching (30s TTL)

4. **Middleware Layer** (lib/middleware/)
   - rateLimiter: In-memory sliding window rate limiting
   - errorHandler: Centralized error handling
   - validation: Input validation and sanitization

5. **Utilities** (lib/utils/)
   - structuredLogger: JSON logging for Firebase Cloud Logging
   - performanceMonitor: Custom metrics collection (latency, execution, cache)

6. **Firebase Backend**
   - Firebase Authentication: User management, token generation
   - Firebase Firestore: NoSQL database with collections and subcollections
   - Firestore Security Rules: Database-level access control
   - Firestore Indexes: Composite indexes for optimized queries

7. **Code Execution Engine**
   - Node.js child processes for code execution
   - Multi-language support: JavaScript, Python, Java, C++
   - Isolated temporary directories per execution
   - Timeout and memory limit enforcement
   - Automatic cleanup after execution

---

## Components and Interfaces

### API Routes Structure

The Next.js App Router organizes API routes in the `app/api/` directory with the following structure:

#### Authentication Routes

```
POST   /api/auth/register          - Create new user account
POST   /api/auth/verify            - Verify Firebase ID token
```

#### Challenge Routes

```
GET    /api/challenges             - List challenges (with filters: difficulty, category, limit)
POST   /api/challenges             - Create new challenge (authenticated)
GET    /api/challenges/[id]        - Get challenge details
PATCH  /api/challenges/[id]        - Update challenge (authenticated)
DELETE /api/challenges/[id]        - Delete challenge (authenticated)
```

#### Code Execution Routes

```
POST   /api/execute                - Execute code submission (rate limited: 10/min)
```

#### Submission Routes

```
POST   /api/submissions            - Create new submission
GET    /api/submissions/[id]       - Get submission details
GET    /api/submissions/[id]/analysis - Get mistake analysis for submission
GET    /api/submissions/user/[userId] - Get user's submission history
```

#### Leaderboard Routes

```
GET    /api/leaderboards/global    - Global leaderboard (top 100)
GET    /api/leaderboards/challenge/[challengeId] - Challenge leaderboard (top 50)
GET    /api/leaderboards/user/[userId]/rank - User's rank
GET    /api/leaderboards/user/[userId]/nearby - Nearby competitors (5 above, 5 below)
GET    /api/leaderboards/guilds    - Guild leaderboard (top 50)
```

#### Guild Routes

```
POST   /api/guilds                 - Create new guild
GET    /api/guilds/[guildId]       - Get guild details
PATCH  /api/guilds/[guildId]       - Update guild settings (owner only)
DELETE /api/guilds/[guildId]       - Delete guild (owner only)
GET    /api/guilds/[guildId]/members - Get guild members
POST   /api/guilds/[guildId]/members - Join guild
DELETE /api/guilds/[guildId]/members/[userId] - Remove member (owner only)
POST   /api/guilds/[guildId]/invitations - Create invitation (owner only)
GET    /api/guilds/[guildId]/invitations - List invitations (owner only)
POST   /api/guilds/[guildId]/invitations/[invitationId]/accept - Accept invitation
GET    /api/guilds/[guildId]/leaderboard - Guild member leaderboard
GET    /api/guilds/[guildId]/statistics - Guild statistics
```

#### Lesson Routes

```
GET    /api/lessons                - List lessons (with filters: category, difficulty)
GET    /api/lessons/[id]           - Get lesson details
GET    /api/lessons/[id]/challenges - Get lesson challenges
POST   /api/lessons/[id]/complete  - Mark lesson as completed
```

#### Notification Routes

```
GET    /api/notifications          - Get user notifications (limit: 50)
GET    /api/notifications/unread   - Get unread notifications
POST   /api/notifications/[notificationId]/read - Mark as read
DELETE /api/notifications/[notificationId] - Delete notification
```

#### AI/Helper Routes

```
POST   /api/ai/hint                - Get AI hint for challenge
POST   /api/cinema/generate        - Generate cinema content
POST   /api/cinema/tts             - Text-to-speech for cinema
```

### Service Interfaces

#### Execution Engine Interface

```typescript
// Input
interface ExecutionInput {
  code: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  timeLimit: number;  // seconds
  memoryLimit: number; // MB
}

// Output
interface ExecutionOutput {
  status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout' | 'memory_limit_exceeded';
  results: Array<{
    testCaseId: number;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
    executionTime: number; // ms
    error?: string;
  }>;
  totalExecutionTime: number;  // ms
  memoryUsed: number;          // MB
  errorMessage?: string;
}
```

#### Challenge Service Interface

```typescript
interface ChallengeData {
  id?: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeLimit: number;
  memoryLimit: number;
  testCases: TestCase[];
  solutionCode?: string;
  createdBy: string;
  createdAt?: Date | FieldValue;
  updatedAt?: Date | FieldValue;
  isActive: boolean;
}

// Functions
createChallenge(data: Omit<ChallengeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>
getChallenge(challengeId: string): Promise<ChallengeData | null>
updateChallenge(challengeId: string, data: Partial<ChallengeData>): Promise<void>
deleteChallenge(challengeId: string): Promise<void>
```

#### Submission Service Interface

```typescript
interface SubmissionData {
  userId: string;
  challengeId: string;
  code: string;
  language: string;
  status: ExecutionOutput['status'];
  executionTime: number; // ms
  memoryUsed: number;    // MB
  testResults: unknown[];
  errorMessage: string | null;
}

// Functions
saveSubmission(data: SubmissionData): Promise<string>
getSubmission(submissionId: string): Promise<SubmissionData | null>
getUserSubmissions(userId: string, limit?: number, challengeId?: string): Promise<SubmissionData[]>
```

#### Leaderboard Service Interface

```typescript
interface GlobalLeaderboardEntry {
  rank: number;
  uid: string;
  username: string;
  displayName: string;
  challengesSolved: number;
  avgExecutionTime: number; // ms
  xp: number;
  level: number;
}

interface ChallengeLeaderboardEntry {
  rank: number;
  uid: string;
  username: string;
  displayName: string;
  bestTime: number; // ms
  submittedAt: Date | FieldValue | Timestamp;
}

// Functions (with 30-second in-memory caching)
getGlobalLeaderboard(): Promise<GlobalLeaderboardEntry[]>
getChallengeLeaderboard(challengeId: string): Promise<ChallengeLeaderboardEntry[]>
getUserRank(userId: string): Promise<UserRankResult>
getUserNearby(userId: string): Promise<NearbyResult>
invalidateLeaderboardCache(): void
```

#### Guild Service Interface

```typescript
interface GuildData {
  id?: string;
  name: string;
  description: string;
  isPublic: boolean;
  ownerId: string;
  memberCount: number;
  createdAt?: Date | FieldValue;
  updatedAt?: Date | FieldValue;
}

interface GuildMemberData {
  uid: string;
  role: 'owner' | 'member';
  joinedAt?: Date | FieldValue;
}

// Functions
createGuild(data: Pick<GuildData, 'name' | 'description' | 'isPublic'>, ownerId: string): Promise<string>
getGuild(guildId: string): Promise<GuildData | null>
updateGuild(guildId: string, data: Partial<GuildData>, requesterId: string): Promise<void>
joinGuild(guildId: string, userId: string): Promise<void>
removeMember(guildId: string, userId: string, requesterId: string): Promise<void>
createInvitation(guildId: string, inviteeEmail: string, requesterId: string): Promise<string>
acceptInvitation(invitationId: string, userId: string): Promise<void>
```

#### Progress Service Interface

```typescript
interface UserStats {
  level: number;
  experiencePoints: number;
  totalChallengesSolved: number;
  successRate: number;
  averageSolveTime: number;
  lastUpdated: Date | FieldValue;
}

interface DashboardData {
  stats: UserStats;
  recentActivity: Record<string, unknown>[];
  levelProgress: {
    currentLevel: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progressPercentage: number;
  };
}

// Functions (with 5-minute in-memory caching)
updateUserStats(userId: string, isSuccess: boolean, executionTime: number): Promise<void>
getUserStats(userId: string): Promise<UserStats | null>
getUserDashboardData(userId: string): Promise<DashboardData | null>
addXP(userId: string, xpAmount: number): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }>
calculateLevel(xp: number): number // BASE_XP=100, XP_GROWTH=1.2
```

#### Mistake Analyzer Interface

```typescript
interface MistakeAnalysis {
  id?: string;
  submissionId: string;
  userId: string;
  challengeId: string;
  errorCategory: 'compilation' | 'runtime' | 'logic' | 'timeout' | 'memory';
  description: string;
  suggestions: string[];
  relatedLessons: string[];
  commonMistakeType: string;
  createdAt: Date | FieldValue;
}

// Functions
analyzeSubmission(
  submissionId: string,
  userId: string,
  challengeId: string,
  status: string,
  errorMessage: string | null
): Promise<string | null>
getMistakeAnalysisBySubmission(submissionId: string): Promise<MistakeAnalysis | null>
getUsersMistakeStats(userId: string): Promise<MistakeStats>
```

#### Notification Service Interface

```typescript
type NotificationType = 
  | 'friend_activity'
  | 'level_up'
  | 'achievement'
  | 'guild_invite'
  | 'challenge_complete'
  | 'system';

interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date | FieldValue;
}

// Functions (with 30-second in-memory caching for unread count)
createNotification(input: CreateNotificationInput): Promise<string>
getNotifications(userId: string, limit?: number): Promise<Notification[]>
getUnreadNotifications(userId: string): Promise<Notification[]>
getUnreadCount(userId: string): Promise<number>
markAsRead(userId: string, notificationId: string): Promise<boolean>
deleteNotification(userId: string, notificationId: string): Promise<boolean>
```

---

## Data Models

### Firebase Firestore Collections

**Note:** The complete Firestore data model, including detailed collection structures, field types, security rules, and composite indexes, is documented in `firebase-data-model.md`.

#### Collections Overview

CODO uses Firebase Firestore as its NoSQL database with the following collections:

1. **users** - User profiles and statistics (Firebase Auth UID as document ID)
   - Fields: uid, username, email, avatarUrl, bio, level, experiencePoints, totalChallengesSolved, successRate, averageSolveTime, timestamps
   - Indexed for global leaderboard: (totalChallengesSolved DESC, averageSolveTime ASC)

2. **challenges** - Coding problems with test cases
   - Fields: id, title, description, difficulty, category, timeLimit, memoryLimit, testCases[], solutionCode, createdBy, isActive, timestamps
   - Indexed for filtering: (difficulty, category), (isActive, createdAt DESC)

3. **submissions** - User code submissions and results
   - Fields: id, userId, challengeId, code, language, status, executionTime, memoryUsed, testResults[], errorMessage, timestamps
   - Indexed for queries: (userId, createdAt DESC), (challengeId, executionTime ASC), (userId, challengeId, createdAt DESC)

4. **guilds** - Guild information with members subcollection
   - Fields: id, name, description, isPublic, ownerId, memberCount, totalChallengesSolved, averageSolveTime, timestamps
   - Subcollection: guilds/{guildId}/members/{userId} with fields: uid, role, joinedAt
   - Indexed for guild leaderboard: (totalChallengesSolved DESC, createdAt ASC)

5. **guildInvitations** - Guild invitation records
   - Fields: id, guildId, inviteeEmail, invitedBy, status, expiresAt, createdAt
   - Indexed for queries: (invitedUserId, status, expiresAt), (guildId, invitedUserId)

6. **lessons** - Educational content with challenge references
   - Fields: id, title, description, category, difficulty, content (Markdown), learningObjectives[], prerequisites[], challengeIds[], createdBy, isActive, timestamps
   - Indexed for filtering: (category, difficulty)

7. **progress** - User learning progress tracking
   - Fields: id, userId, lessonId, status, progressPercentage, completedChallenges, totalChallenges, completedAt, timestamps
   - Indexed for queries: (userId, lessonId)

8. **notifications** - User notifications
   - Fields: id, userId, type, title, body, isRead, metadata, createdAt
   - Indexed for queries: (userId, isRead, createdAt DESC)

9. **mistakeAnalysis** - Error analysis for failed submissions
   - Fields: id, submissionId, userId, challengeId, errorCategory, description, suggestions[], relatedLessons[], commonMistakeType, createdAt

#### Key Firestore Features Used

- **Firebase Authentication** - Manages user accounts with automatic password hashing and security
- **Security Rules** - Database-level access control enforcing ownership and authentication
- **Composite Indexes** - Optimized queries for leaderboards, filtering, and sorting (defined in firestore.indexes.json)
- **Subcollections** - Guild members stored as subcollection under guilds for efficient member management
- **Server Timestamps** - Consistent timestamp generation using FieldValue.serverTimestamp()
- **Batch Operations** - Atomic multi-document writes for guild creation, member management
- **Transactions** - ACID guarantees for user stats updates, XP awards, level calculations
- **Denormalization** - Store aggregated data (memberCount, totalChallengesSolved) for read performance


### Data Relationships

Since Firestore is a NoSQL database, relationships are maintained through document references, ID fields, and application logic:

```
users (Firebase Auth + Firestore)
  ├── has many submissions (via userId field in submissions collection)
  ├── has many guilds as owner (via ownerId field in guilds collection)
  ├── has many guild memberships (via guilds/{guildId}/members subcollection)
  ├── has many progress records (via userId field in progress collection)
  ├── has many notifications (via userId field in notifications collection)
  ├── has many mistake analyses (via userId field in mistakeAnalysis collection)
  └── has many challenges as creator (via createdBy field in challenges collection)

challenges
  ├── has many submissions (via challengeId field in submissions collection)
  ├── referenced by lessons (via challengeIds array in lessons collection)
  └── has many mistake analyses (via challengeId field in mistakeAnalysis collection)

submissions
  ├── belongs to user (userId reference)
  ├── belongs to challenge (challengeId reference)
  └── has one mistake analysis (via submissionId field in mistakeAnalysis collection)

guilds
  ├── has many members (subcollection: guilds/{guildId}/members/{userId})
  ├── has many invitations (via guildId field in guildInvitations collection)
  └── belongs to owner (ownerId reference to users collection)

lessons
  ├── references many challenges (challengeIds array)
  ├── has many progress records (via lessonId field in progress collection)
  └── references prerequisite lessons (prerequisites array of lesson IDs)

progress
  ├── belongs to user (userId reference)
  └── belongs to lesson (lessonId reference)

notifications
  └── belongs to user (userId reference)

mistakeAnalysis
  ├── belongs to submission (submissionId reference)
  ├── belongs to user (userId reference)
  └── belongs to challenge (challengeId reference)
```

### Firestore Design Patterns

**Denormalization for Performance:**
- Guild memberCount stored in guild document (updated via FieldValue.increment)
- User statistics (totalChallengesSolved, successRate, avgExecutionTime) stored in user document
- Guild statistics (totalChallengesSolved, averageSolveTime) stored in guild document

**Subcollections for Scalability:**
- Guild members stored as subcollection (guilds/{guildId}/members/{userId})
- Allows efficient member queries without loading entire guild document
- Supports atomic batch operations for member addition/removal

**Application-Level Referential Integrity:**
- Validate userId exists before creating submission
- Validate challengeId exists before creating submission
- Validate guildId exists before creating invitation
- Clean up related documents when deleting (e.g., delete all members when deleting guild)

**Caching Strategy:**
- In-memory caching for frequently accessed data (leaderboards, stats)
- Cache invalidation on data updates
- TTL-based expiration (30s for leaderboards, 5min for stats, 1min for guild leaderboards)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before writing the correctness properties, I need to analyze the acceptance criteria for testability. Let me use the prework tool to formalize this analysis.


### Property 1: User Registration Creates Account

*For any* valid registration credentials (email, password, username), submitting them should result in a new user account being created and a session token being returned.

**Validates: Requirements 1.1**

### Property 2: Valid Login Returns Token

*For any* user account and valid login credentials, authentication should succeed and return a session token with an expiration time.

**Validates: Requirements 1.2**

### Property 3: Invalid Password Rejected

*For any* user account, attempting login with an incorrect password should be rejected with a descriptive error message.

**Validates: Requirements 1.3**

### Property 4: Expired Token Requires Re-authentication

*For any* expired session token, subsequent API requests should be rejected and require re-authentication.

**Validates: Requirements 1.4**

### Property 5: Logout Invalidates Token

*For any* valid session token, after logout is called, that token should no longer be valid for subsequent requests.

**Validates: Requirements 1.5**

### Property 6: Firebase Auth Password Handling

*For any* user password, Firebase Authentication should handle secure password storage and validation without exposing password hashes to the application.

**Validates: Requirements 1.6**

### Property 7: Password Reset Link Expires

*For any* password reset request, a reset link should be generated with a 1-hour expiration window.

**Validates: Requirements 1.7**

### Property 8: Profile Contains All Fields

*For any* user profile request, the response should include username, email, avatar, bio, and statistics.

**Validates: Requirements 2.1**

### Property 9: Profile Updates Persist

*For any* profile update, the changes should be validated and persisted to the database, retrievable on subsequent requests.

**Validates: Requirements 2.2**

### Property 10: Public Profile Access Control

*For any* request to view another user's profile, only publicly visible information (username, avatar, statistics, guild membership) should be returned.

**Validates: Requirements 2.3**

### Property 11: Profile Modification Authorization

*For any* user, attempting to modify another user's profile should be rejected.

**Validates: Requirements 2.4**

### Property 12: Code Execution Within Time Limit

*For any* code submission, compilation and execution should complete within 5 seconds.

**Validates: Requirements 3.1**

### Property 13: Execution Results Complete

*For any* successful code execution, results should include pass/fail status for each test case, execution time, and memory usage.

**Validates: Requirements 3.2**

### Property 14: Compilation Errors Detailed

*For any* code that fails to compile, the system should return a compilation error message with line numbers and descriptions.

**Validates: Requirements 3.3**

### Property 15: Timeout Handling

*For any* code execution that exceeds the 5-second time limit, the system should terminate execution and return a timeout error.

**Validates: Requirements 3.4**

### Property 16: Memory Limit Enforcement

*For any* code execution that exceeds 256MB memory limit, the system should terminate execution and return a memory limit exceeded error.

**Validates: Requirements 3.5**

### Property 17: Submission Persistence

*For any* successful code execution, the submission should be stored in the database with timestamp and execution metrics.

**Validates: Requirements 3.6**

### Property 18: Multi-language Support

*For any* supported programming language (JavaScript, Python, Java, C++), code submissions should be compiled and executed correctly.

**Validates: Requirements 3.7**

### Property 19: Challenge CRUD Operations

*For any* challenge, create, read, update, and delete operations should work correctly with proper authorization.

**Validates: Requirements 4.1**

### Property 20: Challenge Creation Validation

*For any* challenge creation request, the system should validate that title, description, difficulty level, test cases, and time/memory limits are provided.

**Validates: Requirements 4.2**

### Property 21: Challenge Filtering

*For any* challenge list request with filters (difficulty, category, completion status), only matching challenges should be returned.

**Validates: Requirements 4.3**

### Property 22: Challenge Details Complete

*For any* challenge details request, the response should include the full problem statement, examples, and constraints.

**Validates: Requirements 4.4**

### Property 23: Test Cases Hidden Before Submission

*For any* user requesting challenge details before submission, test cases should not be included in the response.

**Validates: Requirements 4.5**

### Property 24: Submission History Complete

*For any* user submission history request, all submissions should be returned with timestamps, challenge details, and results.

**Validates: Requirements 5.1**

### Property 25: Submission Details Accessible

*For any* specific submission request, the response should include submitted code, execution results, and feedback.

**Validates: Requirements 5.2**

### Property 26: Submission Filtering

*For any* submission history request with filters (challenge, date range, status), only matching submissions should be returned.

**Validates: Requirements 5.3**

### Property 27: Submission Code Access Control

*For any* user, attempting to view another user's submission code should be rejected.

**Validates: Requirements 5.4**

### Property 28: Global Leaderboard Ranking

*For any* global leaderboard request, users should be ranked by total challenges solved, with ties broken by average solve time, returning top 100.

**Validates: Requirements 6.1**

### Property 29: Challenge Leaderboard Ranking

*For any* challenge-specific leaderboard request, users should be ranked by fastest solve time for that challenge.

**Validates: Requirements 6.2**

### Property 30: User Rank Position

*For any* user rank request, the response should include their rank, score, and nearby competitors (top 5 above and below).

**Validates: Requirements 6.3**

### Property 31: Leaderboard Update Latency

*For any* successful submission, leaderboard rankings should be updated within 30 seconds.

**Validates: Requirements 6.4**

### Property 32: Leaderboard Caching

*For any* leaderboard request, if the data was updated within the last 30 seconds, cached results should be served.

**Validates: Requirements 6.5**

### Property 33: Guild Creation Validation

*For any* guild creation request, the guild name should be validated as unique and between 3-50 characters, with the creator set as owner.

**Validates: Requirements 7.1**

### Property 34: Guild Membership Access Control

*For any* guild join request, the user should be added if the guild is public or if they have an invitation.

**Validates: Requirements 7.2**

### Property 35: Guild Invitation Expiration

*For any* guild invitation created, it should have a 7-day expiration window.

**Validates: Requirements 7.3**

### Property 36: Guild Details Complete

*For any* guild details request, the response should include guild name, description, member list, and statistics.

**Validates: Requirements 7.4**

### Property 37: Guild Member Removal

*For any* guild member removal by owner, the user should be removed from the guild and related records updated.

**Validates: Requirements 7.5**

### Property 38: Guild Settings Update

*For any* guild settings update by owner, changes should be validated and persisted to the database.

**Validates: Requirements 7.6**

### Property 39: Guild Settings Authorization

*For any* user who is not a guild owner, attempting to modify guild settings should be rejected.

**Validates: Requirements 7.7**

### Property 40: Guild Leaderboard Ranking

*For any* guild leaderboard request, guilds should be ranked by total challenges solved by all members.

**Validates: Requirements 8.1**

### Property 41: Guild Statistics Complete

*For any* guild statistics request, the response should include member count, total challenges solved, average solve time, and rank.

**Validates: Requirements 8.2**

### Property 42: Guild Leaderboard Update Latency

*For any* member's successful submission, guild leaderboard rankings should be updated within 1 minute.

**Validates: Requirements 8.3**

### Property 43: Lesson Organization

*For any* lesson list request, lessons should be organized by category and difficulty level.

**Validates: Requirements 9.1**

### Property 44: Lesson Details Complete

*For any* lesson details request, the response should include lesson content, learning objectives, and associated challenges.

**Validates: Requirements 9.2**

### Property 45: Lesson Completion

*For any* user who completes all challenges in a lesson, the lesson should be marked as completed and completion points awarded.

**Validates: Requirements 9.3**

### Property 46: Lesson Progress Tracking

*For any* lesson progress request, the response should include completed lessons, current lesson, and progress percentage.

**Validates: Requirements 9.4**

### Property 47: Lesson Prerequisite Enforcement

*For any* lesson access request, users should be prevented from accessing lessons above their current level unless they meet prerequisites.

**Validates: Requirements 9.5**

### Property 48: Challenge Statistics Update

*For any* completed challenge, user statistics should be updated including total solved, success rate, and average solve time.

**Validates: Requirements 10.1**

### Property 49: Lesson Completion Rewards

*For any* completed lesson, experience points should be awarded and user level updated.

**Validates: Requirements 10.2**

### Property 50: Level Up Notification

*For any* user reaching a new level, a notification should be triggered and their profile updated.

**Validates: Requirements 10.3**

### Property 51: Progress Dashboard Complete

*For any* progress dashboard request, the response should include challenges solved, lessons completed, current level, and recent activity.

**Validates: Requirements 10.4**

### Property 52: Statistics Caching

*For any* user statistics calculation, results should be cached for 5 minutes to reduce database load.

**Validates: Requirements 10.5**

### Property 53: Error Categorization

*For any* failed submission, the error should be categorized as compilation error, runtime error, logic error, timeout, or memory limit.

**Validates: Requirements 11.1**

### Property 54: Mistake Analysis Complete

*For any* mistake analysis request, the response should include error category, description, and suggestions for improvement.

**Validates: Requirements 11.2**

### Property 55: Mistake Statistics

*For any* mistake statistics request, the response should include common error types, frequency, and related lessons.

**Validates: Requirements 11.3**

### Property 56: Common Mistake Feedback

*For any* known common mistake, the system should provide specific feedback for improvement.

**Validates: Requirements 11.4**

### Property 57: Guild Invitation Notification

*For any* guild invitation, a notification should be created and stored in the database.

**Validates: Requirements 12.1**

### Property 58: Friend Activity Notification

*For any* friend's challenge completion, a notification should be sent if the user has enabled friend activity notifications.

**Validates: Requirements 12.2**

### Property 59: Milestone Notification

*For any* user milestone achievement (level up, challenge streak), a notification should be sent.

**Validates: Requirements 12.3**

### Property 60: Notification Retrieval

*For any* notification request, unread notifications should be returned with timestamps and actions.

**Validates: Requirements 12.4**

### Property 61: Notification Status Update

*For any* notification marked as read, the notification status should be updated in the database.

**Validates: Requirements 12.5**

### Property 62: Standard Rate Limiting

*For any* user, standard endpoint requests should be limited to 100 per minute.

**Validates: Requirements 13.1**

### Property 63: Resource-Intensive Rate Limiting

*For any* user, resource-intensive endpoint requests (code execution) should be limited to 10 per minute.

**Validates: Requirements 13.2**

### Property 64: Rate Limit Response

*For any* request exceeding rate limits, the system should return a 429 status code with retry-after header.

**Validates: Requirements 13.3**

### Property 65: Input Validation

*For any* API request, all input should be validated to prevent SQL injection, XSS, and other common attacks.

**Validates: Requirements 13.4**

### Property 66: HTTPS Enforcement

*For any* API communication, HTTPS should be required.

**Validates: Requirements 13.5**

### Property 67: CORS Configuration

*For any* API request, CORS should only allow requests from authorized frontend domains.

**Validates: Requirements 13.6**

### Property 68: Data Persistence

*For any* user data, submission, challenge, or guild information, it should be persisted in the database.

**Validates: Requirements 14.1**

### Property 69: Firestore Batch Operations

*For any* set of related database operations, Firestore batch writes or transactions should ensure atomicity and data consistency.

**Validates: Requirements 14.2**

### Property 70: Application-Level Referential Integrity

*For any* relationship between Firestore documents (user-submission, challenge-submission, guild-member), the application should maintain referential integrity through validation and cleanup logic.

**Validates: Requirements 14.5**

### Property 71: Standard Request Latency

*For any* standard API request, response time should be within 200ms (p95 latency).

**Validates: Requirements 15.1**

### Property 72: Code Execution Performance

*For any* code submission, compilation and execution should complete within 5 seconds.

**Validates: Requirements 15.2**

### Property 73: Cache Effectiveness

*For any* frequently accessed data (leaderboards, user profiles), caching should reduce database load.

**Validates: Requirements 15.3**

### Property 74: Request Logging

*For any* API request, it should be logged with timestamp, user ID, endpoint, status code, and response time.

**Validates: Requirements 16.1**

### Property 75: Submission Logging

*For any* code submission, it should be logged with language, execution time, memory usage, and results.

**Validates: Requirements 16.2**

### Property 76: Error Logging

*For any* error that occurs, it should be logged with stack trace and context information.

**Validates: Requirements 16.4**

### Property 77: Database Schema Completeness

*For any* database schema, it should include tables for Users, Challenges, Submissions, Guilds, Lessons, and Progress.

**Validates: Requirements 18.1**

### Property 78: Database Indexes

*For any* frequently queried column (user_id, challenge_id, created_at), appropriate indexes should be defined.

**Validates: Requirements 18.2**

### Property 79: Firestore Document References

*For any* relationship between Firestore documents, document references or ID fields should be used to maintain relationships, with application-level validation ensuring data integrity.

**Validates: Requirements 18.3**

### Property 80: Response Format Consistency

*For any* API response, it should be in JSON format with consistent structure.

**Validates: Requirements 19.1**

### Property 81: HTTP Status Codes

*For any* API response, appropriate HTTP status codes should be returned (200, 201, 400, 401, 403, 404, 500).

**Validates: Requirements 19.2**

### Property 82: Error Response Format

*For any* error response, it should include error code and descriptive message.

**Validates: Requirements 19.3**

### Property 83: Response Time SLA

*For any* standard API request, response time should be within 200ms.

**Validates: Requirements 19.4**

### Property 84: Pagination Support

*For any* list endpoint, pagination should be supported with limit and offset parameters.

**Validates: Requirements 19.5**

### Property 85: Environment Configuration

*For any* deployment, configuration should be loaded from environment variables for Firebase credentials, API keys, Redis connection, and service URLs.

**Validates: Requirements 20.1**

### Property 86: Environment-Specific Configuration

*For any* environment (development, staging, production), the correct configuration should be loaded.

**Validates: Requirements 20.2**

### Property 87: Configuration Validation

*For any* system startup, all required configuration should be validated and the system should fail fast if missing.

**Validates: Requirements 20.3**

### Property 88: Secrets Management

*For any* sensitive data (Firebase service account keys, API keys, Redis passwords), it should be managed securely through secrets management.

**Validates: Requirements 20.4**

---

## Error Handling

### Error Categories

1. **Authentication Errors** (401)
   - Missing Authorization header
   - Invalid Firebase ID token
   - Expired token
   - Token verification failure

2. **Authorization Errors** (403)
   - Insufficient permissions (non-owner trying to modify guild)
   - Attempting to access other users' private data
   - Admin-only operations without admin role

3. **Validation Errors** (400)
   - Missing required fields (title, description, difficulty for challenges)
   - Invalid input format (invalid difficulty value, invalid language)
   - Constraint violations (guild name length, unique guild name)
   - Invalid query parameters

4. **Not Found Errors** (404)
   - Resource doesn't exist (challenge, guild, submission, lesson)
   - User not found
   - Document not found in Firestore

5. **Rate Limit Errors** (429)
   - Standard endpoints: >100 requests/minute
   - Code execution: >10 requests/minute
   - Response includes Retry-After header and X-RateLimit headers

6. **Server Errors** (500)
   - Firestore connection failures
   - Firebase Admin SDK initialization errors
   - Code execution engine failures
   - Unexpected exceptions

### Error Response Format

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": "Additional context (optional)"
}
```

or

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Execution Engine Error Handling

- **Compilation errors**: Capture stderr, return compilation_error status with error message
- **Runtime errors**: Capture exception, return runtime_error status with error message
- **Timeout**: Kill child process after 5 seconds, return timeout status
- **Memory limit**: Detect memory-related errors in stderr, return memory_limit_exceeded status
- **Unsupported language**: Return 400 error with message indicating language not supported
- **Temporary directory cleanup**: Always clean up temp files in finally block

### Middleware Error Handling

The errorHandler middleware (lib/middleware/errorHandler.ts) provides centralized error handling:
- Catches all unhandled errors in API routes
- Logs errors using structuredLogger.logError()
- Returns consistent error responses
- Includes stack traces in development mode only
- Maps known error types to appropriate HTTP status codes

---

## Testing Strategy

### Dual Testing Approach

The testing strategy combines unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Test specific user registration scenarios
- Test error handling for invalid inputs
- Test authorization boundaries
- Test Firestore operations with emulator

**Property-Based Tests**: Verify universal properties across all inputs
- For each correctness property, implement a property-based test
- Use fast-check for TypeScript/Node.js
- Minimum 100 iterations per property test
- Tag each test with feature and property reference

### Property-Based Testing Configuration

Each property-based test should:
1. Reference the design document property number and text
2. Generate random valid inputs using fast-check generators
3. Execute the system under test
4. Assert the property holds for all generated inputs
5. Run minimum 100 iterations

Example test tag format:
```typescript
// Feature: codo-platform, Property 1: User Registration Creates Account
test('Property 1: User Registration Creates Account', () => {
  // Test implementation
});
```

### Testing Libraries

- **Unit Testing**: Jest with TypeScript support (@types/jest, ts-jest)
- **API Testing**: Supertest for HTTP endpoint testing
- **Property-Based Testing**: fast-check for generative testing
- **Code Coverage**: Istanbul (built into Jest)
- **Firebase Testing**: Firebase Emulator Suite (Auth, Firestore)
- **Mocking**: Jest mocks for Firebase Admin SDK

### Test Organization

```
__tests__/
├── unit/
│   ├── services/
│   │   ├── challengeService.test.ts
│   │   ├── submissionService.test.ts
│   │   ├── executionEngine.test.ts
│   │   ├── leaderboardService.test.ts
│   │   ├── guildService.test.ts
│   │   ├── lessonService.test.ts
│   │   ├── progressService.test.ts
│   │   ├── mistakeAnalysisService.test.ts
│   │   └── notificationService.test.ts
│   ├── middleware/
│   │   ├── rateLimiter.test.ts
│   │   ├── errorHandler.test.ts
│   │   └── validation.test.ts
│   └── utils/
│       ├── structuredLogger.test.ts
│       └── performanceMonitor.test.ts
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── challenges.test.ts
│   │   ├── submissions.test.ts
│   │   ├── guilds.test.ts
│   │   ├── leaderboards.test.ts
│   │   ├── lessons.test.ts
│   │   └── notifications.test.ts
│   └── firestore/
│       ├── security-rules.test.ts
│       └── indexes.test.ts
└── properties/
    ├── auth.properties.test.ts
    ├── challenges.properties.test.ts
    ├── submissions.properties.test.ts
    ├── guilds.properties.test.ts
    ├── lessons.properties.test.ts
    ├── progress.properties.test.ts
    ├── notifications.properties.test.ts
    ├── leaderboards.properties.test.ts
    ├── security.properties.test.ts
    ├── performance.properties.test.ts
    └── firestore.properties.test.ts
```

### Firebase Emulator Testing

All tests run against the Firebase Emulator Suite:
- **Firestore Emulator**: Test database operations without affecting production (port 8080)
- **Authentication Emulator**: Test auth flows with test users (port 9099)
- **Emulator UI**: Visual interface for debugging (port 4000)
- **Emulator Configuration**: Configured in `firebase.json`
- **Test Isolation**: Clear emulator data between test suites using @firebase/rules-unit-testing
- **CI/CD Integration**: Run emulators in CI pipeline with firebase emulators:exec

### Test Setup

```typescript
// jest.setup.ts
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      host: 'localhost',
      port: 8080,
      rules: fs.readFileSync('firebase/firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});
```

### Coverage Goals

- Unit test coverage: 80%+
- Property test coverage: All testable acceptance criteria (88 properties defined)
- Integration test coverage: Critical user workflows
- End-to-end test coverage: Main user journeys

---

## Security Design

### Authentication

- **Firebase Authentication** for user management (no custom auth implementation)
- **Firebase ID tokens** with automatic expiration and refresh
- **Custom claims** for role-based access control (admin, user)
- **Token verification** in API routes using adminAuth().verifyIdToken()
- **Authorization header** format: `Bearer <firebase-id-token>`
- **Client-side auth** handled by Firebase Client SDK
- **Server-side auth** handled by Firebase Admin SDK

### Password Security

- **Firebase Authentication** handles all password security automatically
- **Password hashing** managed by Firebase (bcrypt with salt)
- **Password strength** requirements enforced by Firebase
- **Password reset** via Firebase Auth email templates with time-limited tokens
- **No password storage** in application code or Firestore
- **Secure password reset** with 1-hour expiration window

### Input Validation

- **Validation middleware** (lib/middleware/validation.ts) for request validation
- **Firestore security rules** for database-level validation
- **XSS prevention** through React's automatic escaping and output encoding
- **Injection prevention** through Firestore parameterized queries (no SQL injection possible)
- **CORS configuration** in next.config.js allowing only authorized domains
- **Type safety** through TypeScript interfaces and validation

### Rate Limiting

- **In-memory sliding window** rate limiting (lib/middleware/rateLimiter.ts)
- **Standard endpoints**: 100 requests/minute per IP
- **Resource-intensive endpoints** (code execution): 10 requests/minute per IP
- **Rate limit headers**: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After
- **429 status code** with retry-after header when limit exceeded
- **Automatic cleanup** every 5 minutes to prevent memory leaks
- **Per-instance rate limiting** (not distributed across instances)

### Data Protection

- **HTTPS required** for all communications (enforced by Next.js deployment)
- **Firestore security rules** enforce access control at database level
- **Firebase credentials** managed through environment variables
- **Audit logging** for sensitive operations via structuredLogger
- **Firestore encryption** at rest (automatic by Firebase)
- **Firebase Auth tokens** encrypted in transit
- **No sensitive data** in client-side code or logs

### Firestore Security Rules

Security rules defined in `firebase/firestore.rules`:
- **Authentication required** for all operations (isAuthenticated())
- **Ownership validation** for user data (isOwner(userId))
- **Guild owner validation** for guild operations (isGuildOwner(guildId))
- **Immutable submissions** (allow update: if false)
- **Prevent deletion** of critical data (users, challenges, lessons)
- **Read-only for non-owners** (submissions visible only to owner or admin)

### API Security Best Practices

- **Token verification** on every protected endpoint
- **Input sanitization** before processing
- **Error messages** don't leak sensitive information
- **Stack traces** only in development mode
- **Secrets management** via environment variables
- **No hardcoded credentials** in source code

---

## Performance Considerations

### Caching Strategy

**In-Memory Caching** (per Next.js instance):
- **Leaderboard data**: 30-second TTL (leaderboardService)
  - Global leaderboard (top 100 users)
  - Challenge leaderboards (top 50 per challenge)
  - User rank and nearby competitors
- **User statistics**: 5-minute TTL (progressService)
  - Level, XP, challenges solved, success rate, average solve time
- **Guild leaderboards**: 1-minute TTL (guildLeaderboardService)
  - Global guild leaderboard (top 50 guilds)
  - Guild member leaderboards
  - Guild statistics
- **Unread notification count**: 30-second TTL (notificationService)

**Cache Implementation**:
```typescript
interface CacheEntry<T> {
  data: T;
  expiresAt: number; // epoch ms
}

const cache = new Map<string, CacheEntry<unknown>>();

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}
```

**Cache Invalidation**:
- Leaderboards: Invalidated on successful submission
- User stats: Invalidated on stats update
- Guild leaderboards: Invalidated on member challenge completion
- Notification count: Invalidated on notification create/read/delete

### Database Optimization

- **Composite indexes** on frequently queried fields (see firestore.indexes.json):
  - submissions: (userId, createdAt DESC), (challengeId, executionTime ASC)
  - users: (totalChallengesSolved DESC, averageSolveTime ASC)
  - guilds: (totalChallengesSolved DESC, createdAt ASC)
  - notifications: (userId, isRead, createdAt DESC)
- **Firestore query optimization** for leaderboards and statistics
- **Denormalized data** for read performance (memberCount, totalChallengesSolved)
- **Subcollections** for guild members to avoid loading entire guild document
- **Batch operations** for multiple writes (guild creation, member management)
- **Transactions** for atomic updates (user stats, XP awards)
- **Limit queries** to prevent large result sets (100 challenges, 50 leaderboard entries)

### Horizontal Scaling

- **Stateless API routes** (except for in-memory caches which are per-instance)
- **Load balancing** across Next.js instances (Vercel, AWS, etc.)
- **Per-instance caching** (cache not shared across instances)
- **Firebase Firestore** automatically scales reads and writes
- **Firebase Authentication** handles auth scaling automatically

### Performance Monitoring

**Custom Performance Monitoring** (lib/utils/performanceMonitor.ts):
- **Latency tracking**: Record p95 latency per endpoint (circular buffer of 1000 samples)
- **Execution time tracking**: Track average execution time per language
- **Cache hit rate tracking**: Monitor cache effectiveness per cache key
- **Performance reports**: Generate comprehensive snapshots of all metrics

**Metrics Collected**:
```typescript
interface PerformanceReport {
  latency: Record<string, { p95: number; sampleCount: number }>;
  execution: Record<string, { avgMs: number; sampleCount: number }>;
  cache: Record<string, { hits: number; misses: number; hitRate: number }>;
  generatedAt: string;
}
```

### Performance Targets

- **Standard API requests**: <200ms (p95 latency)
- **Code execution**: <5 seconds (enforced by timeout)
- **Leaderboard updates**: <30 seconds (cache TTL)
- **Guild leaderboard updates**: <1 minute (cache TTL)
- **User stats updates**: <5 minutes (cache TTL)

### Code Execution Optimization

- **Isolated temporary directories** per execution to prevent file collisions
- **Automatic cleanup** of temp files after execution
- **Process timeout** enforcement (5 seconds per test case)
- **Memory limit** detection through stderr parsing
- **Language-specific optimization**:
  - JavaScript: Direct Node.js execution (no compilation)
  - Python: python3 interpreter
  - Java: javac compilation + java execution
  - C++: g++ compilation + executable execution

---

## Deployment and Operations

### Environment Configuration

- **Development**: 
  - Local Firebase Emulator Suite (Auth port 9099, Firestore port 8080, UI port 4000)
  - Environment variables in `.env.local`
  - Next.js dev server (npm run dev)
  
- **Staging**: 
  - Firebase project with staging configuration
  - Vercel preview deployments or staging environment
  - Environment variables in Vercel/deployment platform
  
- **Production**: 
  - Firebase project with production settings
  - Vercel production deployment or custom hosting
  - Secure environment variables management
  - HTTPS enforced

### Environment Variables

**Firebase Admin SDK** (Server-side):
- `FIREBASE_SERVICE_ACCOUNT_KEY` - Full JSON service account key (recommended for Vercel)
- OR individual variables:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

**Firebase Client SDK** (Frontend):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

**Application**:
- `VITE_API_URL` - Backend API URL
- `NODE_ENV` - Environment mode (development, production, test)

### Monitoring and Alerting

- **Firebase Cloud Logging** for application logs (structured JSON format)
- **Firebase Performance Monitoring** for API metrics (optional)
- **Custom performance monitoring** via performanceMonitor utility
- **Vercel Analytics** for deployment and runtime metrics (if using Vercel)
- **Alert thresholds** (manual setup required):
  - Error rates >1%
  - Response time p95 >500ms
  - Firestore read/write quota usage >80%
  - Cache hit rate <80%

### Logging

- **Structured JSON logging** (lib/utils/structuredLogger.ts)
- **Winston-style logger** with Firebase Cloud Logging compatibility
- **Log levels**: ERROR, CRITICAL, INFO, DEBUG
- **Severity field** recognized by GCP: DEFAULT, DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL
- **Log format**:
  ```json
  {
    "severity": "INFO",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "type": "request",
    "method": "GET",
    "path": "/api/challenges",
    "statusCode": 200,
    "durationMs": 45,
    "userId": "user-id"
  }
  ```
- **90-day log retention** (Firebase Cloud Logging default)

### Backup and Recovery

- **Firebase automatic backups** (managed by Google Cloud Platform)
- **Point-in-time recovery** available through Firebase console
- **Firestore export** for long-term archival (manual or scheduled)
- **Recovery time objective**: <5 minutes (Firebase automatic failover)
- **Backup retention**: Configurable in Firebase project settings

### Deployment Process

1. **Build**: `npm run build` - Creates production Next.js build
2. **Test**: `npm test` - Run unit and integration tests with Firebase emulators
3. **Deploy**: 
   - Vercel: Automatic deployment on git push
   - Custom: Deploy to Node.js hosting (AWS, GCP, Azure)
4. **Firestore Rules**: Deploy security rules with `firebase deploy --only firestore:rules`
5. **Firestore Indexes**: Deploy indexes with `firebase deploy --only firestore:indexes`

### CI/CD Pipeline

```yaml
# Example GitHub Actions workflow
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: firebase emulators:exec "npm test"
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: vercel/action@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## Project Structure

```
codo-platform/
├── app/                                    # Next.js 14 App Router
│   ├── (auth)/                            # Auth pages group
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/                       # Dashboard pages group
│   │   ├── dashboard/page.tsx
│   │   ├── challenges/page.tsx
│   │   ├── duel/page.tsx
│   │   ├── guild/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── lessons/
│   │   │   └── [id]/page.tsx
│   │   ├── profile/
│   │   │   └── [username]/page.tsx
│   │   ├── progress/
│   │   │   ├── page.tsx
│   │   │   ├── graph/page.tsx
│   │   │   └── mistakes/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── api/                               # API Routes
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── verify/route.ts
│   │   ├── challenges/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── execute/route.ts
│   │   ├── submissions/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── analysis/route.ts
│   │   │   └── user/[userId]/route.ts
│   │   ├── leaderboards/
│   │   │   ├── global/route.ts
│   │   │   ├── challenge/[challengeId]/route.ts
│   │   │   ├── guilds/route.ts
│   │   │   └── user/[userId]/
│   │   │       ├── rank/route.ts
│   │   │       └── nearby/route.ts
│   │   ├── guilds/
│   │   │   ├── route.ts
│   │   │   └── [guildId]/
│   │   │       ├── route.ts
│   │   │       ├── members/
│   │   │       │   ├── route.ts
│   │   │       │   └── [userId]/route.ts
│   │   │       ├── invitations/
│   │   │       │   ├── route.ts
│   │   │       │   └── [invitationId]/accept/route.ts
│   │   │       ├── leaderboard/route.ts
│   │   │       └── statistics/route.ts
│   │   ├── lessons/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── challenges/route.ts
│   │   │       └── complete/route.ts
│   │   ├── notifications/
│   │   │   ├── route.ts
│   │   │   ├── unread/route.ts
│   │   │   └── [notificationId]/
│   │   │       ├── route.ts
│   │   │       └── read/route.ts
│   │   ├── ai/
│   │   │   └── hint/route.ts
│   │   └── cinema/
│   │       ├── generate/route.ts
│   │       └── tts/route.ts
│   ├── layout.tsx                         # Root layout
│   └── page.tsx                           # Home page
├── lib/                                   # Shared libraries
│   ├── firebase/
│   │   ├── admin.ts                       # Firebase Admin SDK
│   │   └── client.ts                      # Firebase Client SDK
│   ├── services/
│   │   ├── challengeService.ts
│   │   ├── submissionService.ts
│   │   ├── executionEngine.ts
│   │   ├── leaderboardService.ts
│   │   ├── guildService.ts
│   │   ├── guildLeaderboardService.ts
│   │   ├── lessonService.ts
│   │   ├── progressService.ts
│   │   ├── mistakeAnalysisService.ts
│   │   └── notificationService.ts
│   ├── middleware/
│   │   ├── rateLimiter.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   └── utils/
│       ├── structuredLogger.ts
│       └── performanceMonitor.ts
├── components/                            # React components
│   ├── ui/                                # Radix UI components
│   ├── auth/
│   ├── challenges/
│   ├── guilds/
│   └── ...
├── __tests__/                             # Test files
│   ├── unit/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── integration/
│   │   ├── api/
│   │   └── firestore/
│   └── properties/
├── firebase/                              # Firebase configuration
│   ├── firestore.rules                   # Security rules
│   ├── firestore.indexes.json            # Composite indexes
│   └── firebase.json                      # Firebase config
├── public/                                # Static assets
├── .kiro/                                 # Kiro specs
│   └── specs/
│       └── Codo/
│           ├── requirements.md
│           ├── design.md
│           ├── firebase-data-model.md
│           └── tasks.md
├── .env.example                           # Environment variables template
├── .env.local                             # Local environment variables (gitignored)
├── .firebaserc                            # Firebase project config
├── firebase.json                          # Firebase emulator config
├── next.config.js                         # Next.js configuration
├── tailwind.config.ts                     # Tailwind CSS config
├── tsconfig.json                          # TypeScript configuration
├── jest.config.js                         # Jest configuration
├── package.json                           # Dependencies and scripts
└── README.md                              # Project documentation
```

### Key Directories

- **app/**: Next.js 14 App Router with co-located pages and API routes
- **lib/**: Shared libraries including services, middleware, and utilities
- **components/**: React components for UI
- **__tests__/**: Test files organized by type (unit, integration, properties)
- **firebase/**: Firebase configuration files (rules, indexes)
- **.kiro/specs/**: Specification documents for the project

---

## Next Steps

This design document provides the technical foundation for the CODO platform implementation. The implementation follows a Next.js 14 App Router monolithic architecture with Firebase backend services.

### Implementation Status

The platform has been implemented with the following components:

1. ✅ **Frontend Pages** - Next.js App Router pages for auth and dashboard
2. ✅ **API Routes** - Complete REST API with all endpoints
3. ✅ **Firebase Integration** - Authentication and Firestore database
4. ✅ **Service Layer** - All services implemented (challenges, submissions, guilds, lessons, progress, etc.)
5. ✅ **Middleware** - Rate limiting, error handling, validation
6. ✅ **Code Execution Engine** - Multi-language support with Node.js child processes
7. ✅ **Caching** - In-memory caching for leaderboards and statistics
8. ✅ **Logging** - Structured JSON logging for Firebase Cloud Logging
9. ✅ **Performance Monitoring** - Custom metrics collection
10. ✅ **Security** - Firebase Auth, Firestore rules, rate limiting

### Testing Phase

The next phase involves comprehensive testing:

1. **Unit Tests** - Test individual services and utilities
2. **Integration Tests** - Test API routes with Firebase emulators
3. **Property-Based Tests** - Verify correctness properties using fast-check
4. **Security Tests** - Validate Firestore security rules
5. **Performance Tests** - Verify latency and throughput targets

### Deployment Phase

After testing, the platform can be deployed:

1. **Environment Setup** - Configure Fireba

