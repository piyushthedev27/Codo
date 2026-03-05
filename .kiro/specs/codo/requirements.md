# CODO Platform - Requirements Document

## Introduction

CODO (Code Duel Online) is a full-stack competitive coding platform built with Next.js 14 App Router, Firebase, and TypeScript. Users engage in coding challenges, track progress, join guilds, learn through structured lessons, and compete on leaderboards. This requirements document specifies the complete platform including frontend pages, API routes, Firebase backend services, code execution engine, and all supporting features.
x
## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes with Firebase Admin SDK
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **Code Execution**: Node.js child processes with multi-language support
- **Caching**: In-memory caching for leaderboards and statistics
- **Monitoring**: Structured logging, performance monitoring
- **Testing**: Jest, fast-check (property-based testing)

## Glossary

- **User**: A registered participant in the CODO platform with Firebase Authentication
- **Challenge**: A coding problem with test cases stored in Firestore
- **Submission**: A user's code submission stored in Firestore with execution results
- **Execution_Engine**: Service using Node.js child processes to compile and run user code
- **Leaderboard**: Ranked list of users based on performance metrics with in-memory caching
- **Guild**: A group of users stored in Firestore with members subcollection
- **Lesson**: Structured educational content in Firestore with associated challenges
- **Progress_Tracker**: Service monitoring user advancement through lessons and challenges
- **Mistake_Analyzer**: Service identifying and categorizing errors in submissions
- **API_Routes**: Next.js API Routes handling all backend logic
- **Firestore**: Firebase NoSQL database for all persistent data
- **Firebase_Auth**: Firebase Authentication service for user management

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a user, I want to securely register and log in to the platform using Firebase Authentication, so that I can access my personalized experience and protect my account.

#### Acceptance Criteria

1. WHEN a user submits valid registration credentials (email, password, username), THE system SHALL create a Firebase Auth user and Firestore user document, returning a custom token
2. WHEN a user submits valid login credentials, THE Firebase Authentication SHALL verify credentials and return an ID token with automatic expiration
3. WHEN a user provides an invalid password, THE Firebase Authentication SHALL reject the login attempt and return a descriptive error message
4. WHEN a user's ID token expires, THE system SHALL require re-authentication for subsequent API requests
5. WHEN a user logs out, THE client SHALL clear the Firebase Auth session
6. THE Firebase Authentication SHALL handle password hashing and security automatically (no password storage in application)
7. WHEN a user requests password reset, THE Firebase Authentication SHALL send a reset email with a secure reset link

### Requirement 2: User Profile Management

**User Story:** As a user, I want to manage my profile information in Firestore, so that I can maintain accurate personal data and track my statistics.

#### Acceptance Criteria

1. WHEN a user requests their profile, THE API SHALL return user information from Firestore including username, email, avatar, bio, level, XP, and statistics
2. WHEN a user updates their profile information, THE API SHALL validate the input and update the Firestore user document
3. WHEN a user requests another user's public profile, THE API SHALL return only publicly visible information (username, avatar, statistics, guild membership)
4. THE API SHALL prevent users from modifying other users' profiles through Firebase Auth token verification

### Requirement 3: Code Execution Service

**User Story:** As a user, I want to submit code for challenges and receive immediate feedback, so that I can verify my solutions and learn from results.

#### Acceptance Criteria

1. WHEN a user submits code for a challenge, THE Execution_Engine SHALL use Node.js child processes to compile and execute the code against all test cases within 5 seconds
2. WHEN code execution completes, THE Execution_Engine SHALL return results including pass/fail status for each test case, execution time, and memory usage
3. IF code fails to compile, THEN THE Execution_Engine SHALL capture stderr and return a compilation error message with details
4. IF code execution exceeds time limits (5 seconds per test case), THEN THE Execution_Engine SHALL kill the process and return a timeout error
5. IF code execution encounters memory errors, THEN THE Execution_Engine SHALL detect memory-related error messages and return a memory limit exceeded error
6. WHEN code executes successfully, THE system SHALL store the submission in Firestore with timestamp, execution metrics, and test results
7. THE Execution_Engine SHALL support JavaScript (Node.js), Python (python3), Java (javac/java), and C++ (g++) with language-specific compilation and execution
8. THE Execution_Engine SHALL create isolated temporary directories for each execution to prevent file collisions
9. THE Execution_Engine SHALL clean up temporary files after execution completes

### Requirement 4: Challenge Management

**User Story:** As a platform administrator, I want to manage coding challenges in Firestore, so that users have a variety of problems to solve.

#### Acceptance Criteria

1. THE API SHALL provide endpoints (GET /api/challenges, POST /api/challenges, GET /api/challenges/[id], PATCH /api/challenges/[id], DELETE /api/challenges/[id]) to create, read, update, and delete challenges in Firestore
2. WHEN a challenge is created, THE API SHALL validate that it includes title, description, difficulty ('easy', 'medium', 'hard'), category, timeLimit, memoryLimit, testCases array, and createdBy UID, then store in Firestore 'challenges' collection with server timestamp
3. WHEN a user requests available challenges (GET /api/challenges), THE API SHALL return challenges from Firestore filtered by difficulty and category query parameters, with a limit of 100 challenges maximum
4. WHEN a user requests challenge details (GET /api/challenges/[id]), THE API SHALL return the full challenge document from Firestore including title, description, difficulty, category, timeLimit, memoryLimit, and visible test cases
5. THE API SHALL store test cases with an 'isHidden' boolean flag, and SHALL only return test cases where isHidden=false to users before submission
6. THE challengeService SHALL use Firebase Admin SDK to perform CRUD operations on the 'challenges' collection
7. WHEN a challenge is updated, THE challengeService SHALL set updatedAt to FieldValue.serverTimestamp()
8. THE API SHALL verify Firebase Auth ID tokens for challenge creation/modification endpoints to ensure only authenticated users can create challenges

### Requirement 5: Submission Tracking and History

**User Story:** As a user, I want to view my submission history in Firestore, so that I can track my progress and review past attempts.

#### Acceptance Criteria

1. WHEN a user requests their submission history (GET /api/submissions/user/[userId]), THE submissionService SHALL query Firestore 'submissions' collection where userId matches, ordered by createdAt descending, with a limit of 20 submissions
2. WHEN a user requests a specific submission (GET /api/submissions/[id]), THE submissionService SHALL return the submission document from Firestore including code, language, status, executionTime, memoryUsed, testResults, and errorMessage
3. THE submissionService.getUserSubmissions() SHALL support filtering by challengeId parameter to return submissions for a specific challenge
4. THE API SHALL verify Firebase Auth ID tokens and prevent users from viewing other users' submission code by checking token.uid matches submission.userId
5. WHEN code execution completes, THE submissionService.saveSubmission() SHALL store the submission in Firestore with userId, challengeId, code, language, status, executionTime, memoryUsed, testResults, errorMessage, and server timestamps
6. THE submission document SHALL include status field with values: 'success', 'compilation_error', 'runtime_error', 'timeout', 'memory_limit_exceeded'

### Requirement 6: Leaderboard System

**User Story:** As a user, I want to see how my performance compares to others, so that I can gauge my skill level and stay motivated.

#### Acceptance Criteria

1. WHEN a user requests the global leaderboard (GET /api/leaderboards/global), THE leaderboardService SHALL query Firestore 'users' collection ordered by challengesSolved (desc) then avgExecutionTime (asc) for tie-breaking, returning top 100 users with rank, uid, username, displayName, challengesSolved, avgExecutionTime, xp, and level
2. WHEN a user requests a challenge-specific leaderboard (GET /api/leaderboards/challenge/[challengeId]), THE leaderboardService SHALL query Firestore 'submissions' collection where challengeId matches and status='success', ordered by executionTime (asc), keeping only each user's best time, returning top 50 users with rank, uid, username, displayName, bestTime, and submittedAt
3. WHEN a user requests their leaderboard position (GET /api/leaderboards/user/[userId]/rank), THE leaderboardService SHALL return the user's rank (1-indexed), uid, and challengesSolved from the global leaderboard
4. WHEN a user requests nearby competitors (GET /api/leaderboards/user/[userId]/nearby), THE leaderboardService SHALL return up to 5 users ranked above and 5 users ranked below from the global leaderboard
5. THE leaderboardService SHALL implement in-memory caching with 30-second TTL for all leaderboard queries to reduce Firestore reads
6. WHEN a successful submission is saved, THE system SHALL call invalidateLeaderboardCache() to clear all cached leaderboard data
7. THE cache SHALL store entries with expiresAt timestamp and automatically return null for expired entries

### Requirement 7: Guild System

**User Story:** As a user, I want to join or create guilds to collaborate with other users, so that I can participate in team-based competitions and community building.

#### Acceptance Criteria

1. WHEN a user creates a guild (POST /api/guilds), THE guildService SHALL validate the guild name is unique (case-sensitive) and between 3-50 characters, then create the guild document in Firestore 'guilds' collection with id, name, description, isPublic, ownerId, memberCount=1, and server timestamps
2. WHEN a guild is created, THE guildService SHALL use a Firestore batch to atomically write the guild document AND add the owner to the 'guilds/{guildId}/members' subcollection with role='owner' and joinedAt timestamp
3. WHEN a user requests to join a public guild (POST /api/guilds/[guildId]/members), THE guildService SHALL add the user to the members subcollection and increment memberCount using FieldValue.increment(1)
4. WHEN a user requests to join a private guild, THE guildService SHALL verify an accepted invitation exists before allowing the join
5. WHEN a guild owner invites a user (POST /api/guilds/[guildId]/invitations), THE guildService SHALL create an invitation document in Firestore 'guildInvitations' collection with guildId, inviteeEmail, invitedBy, status='pending', and expiresAt set to 7 days from creation
6. WHEN a user accepts an invitation (POST /api/guilds/[guildId]/invitations/[invitationId]/accept), THE guildService SHALL verify the invitation is pending and not expired, then use a Firestore batch to add the user to members subcollection, increment memberCount, and update invitation status to 'accepted'
7. WHEN a user requests guild details (GET /api/guilds/[guildId]), THE API SHALL return the guild document from Firestore including name, description, isPublic, ownerId, memberCount, and timestamps
8. WHEN a user requests guild members (GET /api/guilds/[guildId]/members), THE guildService SHALL query the 'guilds/{guildId}/members' subcollection and return all member documents with uid, role, and joinedAt
9. WHEN a guild owner removes a member (DELETE /api/guilds/[guildId]/members/[userId]), THE guildService SHALL verify the requester is the owner and the target is not the owner, then use a Firestore batch to delete the member document and decrement memberCount
10. WHEN a guild owner updates guild settings (PATCH /api/guilds/[guildId]), THE guildService SHALL verify the requester is the owner, validate the new name if provided, and update the guild document with updatedAt timestamp
11. THE guildService SHALL prevent non-owners from modifying guild settings by checking guild.ownerId === requesterId

### Requirement 8: Guild Leaderboard

**User Story:** As a guild member, I want to see my guild's performance compared to other guilds, so that I can track our collective progress.

#### Acceptance Criteria

1. WHEN a user requests the guild leaderboard (GET /api/leaderboards/guilds), THE guildLeaderboardService SHALL query Firestore 'guilds' collection ordered by totalChallengesSolved (desc) then averageSolveTime (asc), returning top 50 guilds with rank, id, name, memberCount, totalChallengesSolved, and averageSolveTime
2. WHEN a user requests their guild's member leaderboard (GET /api/guilds/[guildId]/leaderboard), THE guildLeaderboardService SHALL query the 'guilds/{guildId}/members' subcollection to get member UIDs, then fetch user documents from 'users' collection in batches of 30 (Firestore 'in' query limit), sort by challengesSolved (desc) then avgExecutionTime (asc), and return ranked members with uid, username, displayName, challengesSolved, and avgExecutionTime
3. WHEN a user requests their guild's statistics (GET /api/guilds/[guildId]/statistics), THE guildLeaderboardService SHALL return totalMembers, totalChallengesSolved, averageSolveTime, and activityLevel ('Low', 'Medium', 'High' based on challenges per member ratio)
4. THE guildLeaderboardService SHALL implement in-memory caching with 1-minute (60,000ms) TTL for all guild leaderboard queries to reduce Firestore reads
5. WHEN a guild member completes a challenge, THE system SHALL call invalidateGuildLeaderboardCache() to clear all cached guild leaderboard data
6. THE activityLevel calculation SHALL use the heuristic: >10 challenges/member = 'High', >3 challenges/member = 'Medium', otherwise 'Low'

### Requirement 9: Lesson System

**User Story:** As a user, I want to access structured lessons with associated challenges, so that I can learn programming concepts systematically.

#### Acceptance Criteria

1. WHEN a user requests available lessons (GET /api/lessons), THE lessonService SHALL query Firestore 'lessons' collection where isActive=true, optionally filtered by category and difficulty query parameters, returning lessons with id, title, description, category, difficulty, content (Markdown), learningObjectives, prerequisites (lesson IDs), challengeIds (ordered), and timestamps
2. WHEN a user requests lesson details (GET /api/lessons/[id]), THE lessonService SHALL return the lesson document from Firestore including all fields: title, description, category, difficulty, content, learningObjectives, prerequisites, challengeIds, createdBy, and timestamps
3. WHEN a user requests lesson challenges (GET /api/lessons/[id]/challenges), THE lessonService SHALL fetch challenge documents from Firestore 'challenges' collection in batches of 30 (Firestore 'in' query limit) maintaining the order specified in lesson.challengeIds array
4. WHEN a user completes all challenges in a lesson (POST /api/lessons/[id]/complete), THE lessonService SHALL update or create a progress document in Firestore 'progress' collection with userId, lessonId, status='completed', progressPercentage=100, completedChallenges=totalChallenges, completedAt timestamp, and award completion points
5. WHEN a user requests their lesson progress (GET /api/lessons/progress), THE lessonService SHALL query Firestore 'progress' collection where userId matches, returning all UserLessonProgress documents with status ('not_started', 'in_progress', 'completed'), progressPercentage, completedChallenges, totalChallenges, and timestamps
6. WHEN a user attempts to access a lesson, THE lessonService.checkPrerequisites() SHALL verify all prerequisite lesson IDs are in the user's completed lessons list before allowing access
7. THE UserLessonProgress document SHALL track status, progressPercentage, completedChallenges, totalChallenges, and completedAt timestamp

### Requirement 10: Progress Tracking

**User Story:** As a user, I want to track my learning progress, so that I can see my improvement over time and stay motivated.

#### Acceptance Criteria

1. WHEN a user completes a challenge, THE progressService.updateUserStats() SHALL use a Firestore transaction to atomically update the user document with totalAttempts+1, totalChallengesSolved (if success), successRate (calculated as solved/attempts * 100), and averageSolveTime (weighted average of execution times)
2. WHEN a user successfully completes a challenge, THE progressService SHALL award 50 XP, add it to experiencePoints, calculate the new level using calculateLevel(xp) with BASE_XP=100 and XP_GROWTH=1.2 exponential curve, and update the user's level field
3. WHEN a user's level increases, THE progressService.addXP() SHALL return leveledUp=true, triggering a notification, and update the user profile with the new level
4. WHEN a user requests their progress dashboard (GET /api/progress), THE progressService.getUserDashboardData() SHALL return stats (level, experiencePoints, totalChallengesSolved, successRate, averageSolveTime), recentActivity (last 5 submissions ordered by createdAt desc), and levelProgress (currentLevel, currentLevelXp, nextLevelXp, progressPercentage)
5. THE progressService SHALL calculate levelProgress by determining accumulated XP from previous levels, subtracting from total XP to get current level XP, calculating required XP for next level using BASE_XP * XP_GROWTH^(level-1), and computing progressPercentage as (currentLevelXp / nextLevelXp * 100)
6. THE progressService SHALL implement in-memory caching with 5-minute (300,000ms) TTL for user statistics to reduce Firestore reads
7. WHEN user stats are updated, THE progressService SHALL call invalidateStatsCache(userId) to clear the cached entry
8. THE level calculation SHALL use the formula: level increases when total XP >= sum of (BASE_XP * XP_GROWTH^(i-1)) for i=1 to level

### Requirement 11: Mistake Analysis

**User Story:** As a user, I want to understand my mistakes, so that I can learn from errors and improve my coding skills.

#### Acceptance Criteria

1. WHEN a user's submission fails, THE mistakeAnalysisService.analyzeSubmission() SHALL categorize the error into one of five categories: 'compilation', 'runtime', 'logic', 'timeout', or 'memory' based on the submission status
2. WHEN a submission has status='compilation_error', THE mistakeAnalysisService SHALL create a MistakeAnalysis document in Firestore 'mistakeAnalysis' collection with errorCategory='compilation', description='The code failed to compile', suggestions=['Check for syntax errors or missing imports', 'Verify variable names and types'], and commonMistakeType='syntax-error' if errorMessage contains 'unexpected token'
3. WHEN a submission has status='runtime_error', THE mistakeAnalysisService SHALL set errorCategory='runtime', description='The code encountered an error during execution', suggestions=['Check for null pointers or undefined variables', 'Verify array bounds'], and commonMistakeType='null-pointer' if errorMessage contains 'cannot read property'
4. WHEN a submission has status='timeout', THE mistakeAnalysisService SHALL set errorCategory='timeout', description='The execution took too long', suggestions=['Optimize your algorithm', 'Check for infinite loops'], and commonMistakeType='infinite-loop'
5. WHEN a submission has status='memory_limit_exceeded', THE mistakeAnalysisService SHALL set errorCategory='memory', description='The code used too much memory', suggestions=['Reduce memory usage', 'Avoid creating large objects unnecessarily'], and commonMistakeType='memory-leak'
6. WHEN a user requests mistake analysis for a submission (GET /api/submissions/[id]/analysis), THE mistakeAnalysisService.getMistakeAnalysisBySubmission() SHALL query Firestore 'mistakeAnalysis' collection where submissionId matches and return the analysis document with errorCategory, description, suggestions, relatedLessons, and commonMistakeType
7. WHEN a user requests their mistake statistics (GET /api/progress/mistakes), THE mistakeAnalysisService.getUsersMistakeStats() SHALL query all mistake analysis documents for the user, aggregate by errorCategory, count commonMistakeTypes, and return totalMistakes, byCategory object, and commonTypes array sorted by count descending
8. THE MistakeAnalysis document SHALL include submissionId, userId, challengeId, errorCategory, description, suggestions array, relatedLessons array, commonMistakeType, and createdAt timestamp

### Requirement 12: Real-time Notifications

**User Story:** As a user, I want to receive notifications about important events, so that I can stay informed about challenges, guild activities, and achievements.

#### Acceptance Criteria

1. WHEN a user receives a guild invitation, THE notificationService.createNotification() SHALL create a notification document in Firestore 'notifications' collection with userId, type='guild_invite', title, body, isRead=false, metadata object, and createdAt server timestamp, then call invalidateUnreadCache(userId)
2. WHEN a user's friend completes a challenge and friend activity notifications are enabled, THE notificationService.createFriendActivityNotification() SHALL create a notification with type='friend_activity', title='Friend Activity', body='{friendName} {activity}', and metadata containing friendName and activity
3. WHEN a user achieves a milestone (level up or achievement), THE notificationService.createMilestoneNotification() SHALL create a notification with type='level_up' or 'achievement', title='Level Up! 🎉' or 'Achievement Unlocked! 🏆', body with congratulations message, and metadata containing milestone details
4. WHEN a user requests their notifications (GET /api/notifications), THE notificationService.getNotifications() SHALL query Firestore 'notifications' collection where userId matches, ordered by createdAt descending, with a limit of 50, returning all notification documents with id, userId, type, title, body, isRead, metadata, and createdAt
5. WHEN a user requests unread notifications (GET /api/notifications/unread), THE notificationService.getUnreadNotifications() SHALL query where userId matches and isRead=false, update the unread count cache with 30-second TTL, and return the notifications
6. WHEN a user requests unread count, THE notificationService.getUnreadCount() SHALL check the in-memory cache first (30-second TTL), and if not cached, query Firestore for count of documents where userId matches and isRead=false, then cache the result
### Requirement 13: API Rate Limiting and Security

**User Story:** As a platform operator, I want to protect the backend from abuse, so that the service remains stable and available for all users.

#### Acceptance Criteria

1. THE rateLimiter middleware SHALL implement in-memory rate limiting using a sliding window algorithm with a Map storing timestamps per client identifier
2. THE rateLimiter SHALL provide STANDARD_RATE_LIMIT preset with maxRequests=100 and windowMs=60,000 (100 requests per minute) for standard API endpoints
3. THE rateLimiter SHALL provide INTENSIVE_RATE_LIMIT preset with maxRequests=10 and windowMs=60,000 (10 requests per minute) for resource-intensive endpoints (code execution at /api/execute)
4. WHEN a client exceeds rate limits, THE rateLimiter.withRateLimit() SHALL return a 429 status code with JSON response containing success=false, message='Too many requests. Please try again later.', code='RATE_LIMITED', and headers 'Retry-After' (seconds until reset), 'X-RateLimit-Limit', and 'X-RateLimit-Remaining'=0
5. THE rateLimiter SHALL extract client IP from request headers checking 'x-forwarded-for' (first IP in comma-separated list), then 'x-real-ip', defaulting to 'unknown'
6. THE rateLimiter SHALL create unique keys as '{keyPrefix}:{ip}' and track timestamps in a sliding window, filtering out timestamps older than windowMs
7. THE rateLimiter SHALL run a cleanup interval every 5 minutes (300,000ms) to remove entries where all timestamps are older than 1 hour, preventing memory leaks
### Requirement 14: Data Persistence and Backup

**User Story:** As a platform operator, I want to ensure data integrity and availability, so that user data is never lost.

#### Acceptance Criteria

1. THE Firebase Firestore SHALL persist all user data, submissions, challenges, guilds, lessons, progress, notifications, and mistake analysis in collections with automatic replication and durability guarantees
2. THE application SHALL use Firestore transactions (adminDb().runTransaction()) for operations requiring atomicity, such as updating user stats (progressService.updateUserStats), adding guild members with memberCount increment (guildService.joinGuild), and awarding XP with level calculation (progressService.addXP)
3. THE application SHALL use Firestore batch writes (adminDb().batch()) for multi-document operations requiring consistency, such as creating guilds with owner member (guildService.createGuild), removing guild members with memberCount decrement (guildService.removeMember), and accepting invitations with member addition (guildService.acceptInvitation)
4. THE Firebase Firestore SHALL provide automated continuous backups with point-in-time recovery managed by Google Cloud Platform
5. THE Firestore security rules SHALL enforce referential integrity by validating userId ownership (isOwner(userId)), guild ownership (isGuildOwner(guildId)), and authentication requirements (isAuthenticated()) for all write operations
6. THE Firestore security rules SHALL prevent deletion of critical collections (users, challenges, lessons, submissions, progress, mistakeAnalysis) by setting allow delete: if false
### Requirement 15: Performance and Scalability

**User Story:** As a platform operator, I want the backend to handle growing user load, so that the platform remains responsive as it scales.

#### Acceptance Criteria

1. THE performanceMonitor utility SHALL track API request latency by recording duration samples (up to 1000 per endpoint) in a circular buffer using recordLatency(endpoint, durationMs)
2. THE performanceMonitor SHALL calculate p95 latency by sorting samples and selecting the value at the 95th percentile index for each endpoint
3. THE Execution_Engine SHALL process code submissions within 5 seconds including compilation and execution, with timeouts enforced by Node.js child process kill after 5000ms
4. THE performanceMonitor SHALL track code execution times by language using trackExecution(label, durationMs) and calculate average execution time with getAvgExecutionTime(label)
5. THE system SHALL implement in-memory caching for frequently accessed data with specific TTLs: leaderboards (30 seconds), user statistics (5 minutes), guild leaderboards (1 minute), and unread notification counts (30 seconds)
6. THE performanceMonitor SHALL track cache hit rates using recordCacheHit(cacheKey) and recordCacheMiss(cacheKey), calculating hit rate as hits/(hits+misses)
### Requirement 16: Logging and Monitoring

**User Story:** As a platform operator, I want visibility into system behavior, so that I can identify and resolve issues quickly.

#### Acceptance Criteria

1. THE structuredLogger.logRequest() SHALL log all API requests with severity='INFO', type='request', method, path, statusCode, durationMs, userId (if authenticated), and ISO 8601 timestamp in JSON format compatible with Firebase Cloud Logging and Vercel Log Drains
2. THE structuredLogger.logSubmission() SHALL log all code submissions with severity='INFO', type='submission', userId, challengeId, language, verdict ('accepted', 'wrong_answer', 'time_limit', 'compile_error', 'runtime_error'), executionMs, and timestamp
3. THE performanceMonitor SHALL track key metrics including request latency (p95 per endpoint), code execution times (average per language), cache hit rates (per cache key), and sample counts, accessible via getPerformanceReport()
4. WHEN an error occurs, THE structuredLogger.logError() SHALL log with severity='ERROR', type='error', message, stack trace (if Error instance), optional context object, and timestamp, outputting to console.error for ERROR and CRITICAL severities
5. THE structuredLogger SHALL support severity levels recognized by GCP: DEFAULT, DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL
6. THE structuredLogger.logDebug() SHALL only output logs when process.env.NODE_ENV === 'development' to reduce production log volume
### Requirement 17: API Documentation

**User Story:** As a frontend developer, I want comprehensive API documentation, so that I can integrate with the backend efficiently.

#### Acceptance Criteria

1. THE API routes SHALL be self-documenting through TypeScript interfaces and JSDoc comments in route handler files (app/api/**/route.ts)
2. THE API SHALL follow RESTful conventions with consistent endpoint patterns: GET for retrieval, POST for creation, PATCH for updates, DELETE for removal
3. THE API responses SHALL include consistent JSON structure with data payload and appropriate HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 429 (Too Many Requests), 500 (Internal Server Error)
4. THE API error responses SHALL include error field with descriptive message, optional code field for error categorization, and optional details field for additional context
5. THE API documentation SHALL be maintained through code comments and TypeScript type definitions, ensuring type safety between frontend and backend
### Requirement 18: Database Schema Design

**User Story:** As a backend developer, I want a well-designed database schema, so that data is organized efficiently and queries perform well.

#### Acceptance Criteria

1. THE Firestore database SHALL include collections for: users, challenges, submissions, guilds (with members subcollection), guildInvitations, lessons, progress, notifications, and mistakeAnalysis
2. THE Firestore SHALL define composite indexes in firestore.indexes.json for frequently queried field combinations including:
   - submissions: (userId, createdAt DESC), (challengeId, executionTime ASC), (userId, challengeId, createdAt DESC), (userId, status, createdAt DESC), (status, createdAt DESC)
   - users: (totalChallengesSolved DESC, averageSolveTime ASC) for global leaderboard
   - challenges: (difficulty, category), (isActive, createdAt DESC)
   - guilds: (totalChallengesSolved DESC, createdAt ASC) for guild leaderboard
### Requirement 19: Integration with Frontend

**User Story:** As a frontend developer, I want seamless integration with the backend, so that the user experience is smooth and responsive.

#### Acceptance Criteria

1. THE API routes SHALL return responses in JSON format with consistent structure: success responses contain data payload, error responses contain error field with message and optional code/details fields
2. THE API routes SHALL include appropriate HTTP status codes: 200 (OK for successful GET/PATCH), 201 (Created for successful POST), 400 (Bad Request for validation errors), 401 (Unauthorized for missing/invalid auth), 403 (Forbidden for insufficient permissions), 404 (Not Found for missing resources), 429 (Too Many Requests for rate limit), 500 (Internal Server Error for unexpected errors)
3. THE API error responses SHALL return JSON with error message and descriptive code, example: {error: 'Unauthorized: Invalid token', code: 'INVALID_TOKEN'} or {success: false, message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED'}
4. THE Next.js App Router SHALL co-locate frontend pages (app/(dashboard)/, app/(auth)/) with API routes (app/api/) in a monolithic architecture, enabling fast development and deployment
5. THE API routes SHALL support pagination for list endpoints using limit query parameter (e.g., GET /api/challenges?limit=20) with maximum limits enforced (100 for challenges, 50 for notifications)
6. THE next.config.js SHALL configure CORS headers for /api/:path* routes allowing credentials, all origins (can be restricted in production), standard HTTP methods (GET, POST, PATCH, DELETE, PUT, OPTIONS), and required headers including Authorization for Firebase Auth tokens
### Requirement 20: Environment Configuration

**User Story:** As a DevOps engineer, I want to configure the backend for different environments, so that I can deploy to development, staging, and production.

#### Acceptance Criteria

1. THE system SHALL support configuration via environment variables for Firebase credentials, API URLs, and service configuration
2. THE Firebase Admin SDK (lib/firebase/admin.ts) SHALL support two configuration methods:
   - Option 1: FIREBASE_SERVICE_ACCOUNT_KEY containing full JSON service account key (recommended for Vercel/production)
   - Option 2: Individual variables FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY (with \n replacement for newlines)
3. THE Firebase Client SDK SHALL use environment variables prefixed with VITE_ for frontend configuration: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID
4. THE system SHALL use VITE_API_URL environment variable to configure the backend API URL (http://localhost:3000 for development, production URL for deployed environments)
5. THE Firebase Admin SDK SHALL validate all required configuration on startup and throw an error with descriptive message if environment variables are missing in production
6. THE Firebase Admin SDK SHALL log a warning (not error) in non-production environments when configuration is missing, allowing builds to succeed without credentials
7. THE system SHALL use process.env.NODE_ENV to differentiate between 'development', 'production', and 'test' environments, enabling environment-specific behavior (e.g., debug logging only in development)
8. THE .env.example file SHALL document all required environment variables with placeholder values and comments explaining where to obtain the values (Firebase Console → Project Settings)
9. THE system SHALL support Firebase Emulator Suite for local development using firebase.json configuration with emulator ports: auth (9099), firestore (8080), and UI (4000)
### Requirement 18: Database Schema Design

**User Story:** As a backend developer, I want a well-designed database schema, so that data is organized efficiently and queries perform well.

#### Acceptance Criteria

1. THE Database SHALL include tables for Users, Challenges, Submissions, Guilds, Lessons, and Progress
2. THE Database SHALL define appropriate indexes on frequently queried columns (user_id, challenge_id, created_at)
3. THE Database SHALL enforce foreign key constraints to maintain referential integrity
4. THE Database SHALL use appropriate data types for each column (VARCHAR for strings, TIMESTAMP for dates, INT for counts)
5. THE Database SHALL support efficient queries for leaderboards, user statistics, and submission history

### Requirement 19: Integration with Frontend

**User Story:** As a frontend developer, I want seamless integration with the backend, so that the user experience is smooth and responsive.

#### Acceptance Criteria

1. THE API_Gateway SHALL return responses in JSON format with consistent structure
2. THE API_Gateway SHALL include appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
3. THE API_Gateway SHALL return error responses with error code and descriptive message
4. WHEN the frontend requests data, THE API_Gateway SHALL return data within 200ms for standard requests
5. THE API_Gateway SHALL support pagination for list endpoints with limit and offset parameters

### Requirement 20: Environment Configuration

**User Story:** As a DevOps engineer, I want to configure the backend for different environments, so that I can deploy to development, staging, and production.

#### Acceptance Criteria

1. THE system SHALL support configuration via environment variables for database connection, API keys, and service URLs
2. THE system SHALL load different configurations for development, staging, and production environments
3. THE system SHALL validate all required configuration on startup and fail fast if missing
4. THE system SHALL support secrets management for sensitive data (database passwords, API keys)

