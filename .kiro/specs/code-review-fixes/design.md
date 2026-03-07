# Design Document

## Overview

This design document outlines the technical approach to address all 40 requirements identified in the comprehensive code review of the Vita Dashboard (CODO) web application. The fixes are organized into logical implementation phases to ensure systematic resolution of critical issues, missing features, and technical debt.

The design follows a layered approach:
1. **Foundation Layer**: Core infrastructure (routing, API, error handling, auth)
2. **Feature Layer**: Complete missing features and pages
3. **Quality Layer**: UI/UX improvements, validation, accessibility
4. **Optimization Layer**: Performance, security, testing, documentation

This phased approach ensures that critical infrastructure is in place before building features, and that quality improvements are applied systematically across the codebase.

## Architecture

### System Architecture

The application follows Next.js 13+ App Router architecture with the following structure:

```
app/
├── (auth)/              # Authentication routes (login, signup, reset)
├── (dashboard)/         # Protected dashboard routes
│   ├── layout.tsx       # Dashboard layout with sidebar
│   ├── dashboard/       # Main dashboard
│   ├── lessons/         # Lessons listing and detail
│   │   └── [id]/        # Individual lesson page
│   ├── profile/         # User profiles
│   │   └── [username]/  # Dynamic profile page
│   ├── progress/        # Progress tracking
│   │   └── graph/       # Knowledge graph
│   ├── guild/           # Guild feature
│   ├── quests/          # Quest system
│   ├── shop/            # Item shop
│   ├── duel/            # Competitive duels
│   ├── pet/             # Pet companion
│   ├── cinema/          # AI video lessons
│   ├── leaderboard/     # Rankings
│   └── settings/        # User settings
├── api/                 # API routes
│   ├── lessons/         # Lesson endpoints
│   ├── users/           # User endpoints
│   ├── guilds/          # Guild endpoints
│   ├── notifications/   # Notification endpoints
│   ├── challenges/      # Challenge endpoints
│   ├── quests/          # Quest endpoints
│   ├── execute/         # Code execution
│   └── auth/            # Authentication
└── components/          # Shared components
    ├── ui/              # Base UI components
    ├── modals/          # Modal dialogs
    └── error-boundary/  # Error boundaries
```

### Data Flow Architecture

```
User Action → Component → API Route → Middleware → Database
                ↓                         ↓
            Local State              Auth Check
                ↓                         ↓
            UI Update               Rate Limit
                ↓                         ↓
         Toast/Error              Validation
```

### State Management Strategy

- **Server State**: React Query for API data caching and synchronization
- **Client State**: React Context for global UI state (theme, sidebar, notifications)
- **Form State**: React Hook Form for form management and validation
- **Persistent State**: Firestore for user data, localStorage for preferences

### Authentication Flow

```
1. User submits credentials → /api/auth/login
2. Verify credentials with Firebase Auth
3. Create session token (JWT)
4. Set secure HTTP-only cookie
5. Middleware validates token on protected routes
6. Refresh token before expiry
```

## Components and Interfaces

### Core Components

#### 1. Error Boundary Component

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}
```

Wraps route segments to catch and handle React errors gracefully. Displays user-friendly error messages with recovery options.

#### 2. Loading State Components

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

interface SkeletonLoaderProps {
  variant: 'text' | 'card' | 'avatar' | 'list';
  count?: number;
}
```

Provides consistent loading indicators across the application.

#### 3. Empty State Component

```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

Displays helpful messages when data is empty with actionable next steps.

#### 4. Toast Notification System

```typescript
interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}

interface ToastContextValue {
  showToast: (props: ToastProps) => void;
  dismissToast: (id: string) => void;
}
```

Centralized notification system with auto-dismiss and stacking support.

### Page Components

#### 1. Lessons Detail Page (`/lessons/[id]`)

```typescript
interface LessonPageProps {
  params: { id: string };
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  starterCode: string;
  testCases: TestCase[];
  hints: string[];
  xpReward: number;
  coinReward: number;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  hidden: boolean;
}
```

Features:
- Code editor with syntax highlighting
- Test case runner
- Hint system
- Progress tracking
- XP/coin rewards on completion

#### 2. Profile Page (`/profile/[username]`)

```typescript
interface ProfilePageProps {
  params: { username: string };
}

interface UserProfile {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  streak: number;
  lessonsCompleted: number;
  achievements: Achievement[];
  guild?: GuildInfo;
  stats: UserStats;
  isPrivate: boolean;
}
```

Features:
- User stats display
- Achievement showcase
- Activity timeline
- Edit profile modal (for own profile)
- Privacy settings

#### 3. Guild Page

```typescript
interface GuildData {
  id: string;
  name: string;
  description: string;
  avatar: string;
  members: GuildMember[];
  totalXP: number;
  rank: number;
  createdAt: Date;
  leaderId: string;
}

interface GuildMember {
  userId: string;
  username: string;
  avatar: string;
  role: 'leader' | 'officer' | 'member';
  xpContribution: number;
  joinedAt: Date;
}
```

Features:
- Guild creation (500 coins)
- Member management
- Guild leaderboard
- Guild chat
- Join/leave functionality

### API Interfaces

#### 1. Lesson API

```typescript
// GET /api/lessons/[id]
interface GetLessonResponse {
  lesson: LessonData;
  userProgress?: {
    completed: boolean;
    attempts: number;
    lastAttempt: Date;
  };
}

// POST /api/lessons/[id]/submit
interface SubmitLessonRequest {
  code: string;
  language: string;
}

interface SubmitLessonResponse {
  success: boolean;
  testResults: TestResult[];
  xpEarned?: number;
  coinsEarned?: number;
}
```

#### 2. User API

```typescript
// GET /api/users/[userId]
interface GetUserResponse {
  user: UserProfile;
}

// PATCH /api/users/[userId]
interface UpdateUserRequest {
  displayName?: string;
  bio?: string;
  avatar?: string;
  settings?: UserSettings;
}

// GET /api/users/[userId]/stats
interface GetUserStatsResponse {
  xpOverTime: DataPoint[];
  lessonsOverTime: DataPoint[];
  skillBreakdown: SkillData[];
  streakHistory: StreakData[];
}
```

#### 3. Guild API

```typescript
// GET /api/guilds/[guildId]
interface GetGuildResponse {
  guild: GuildData;
}

// POST /api/guilds/[guildId]/join
interface JoinGuildRequest {
  userId: string;
}

interface JoinGuildResponse {
  success: boolean;
  guild: GuildData;
}
```

#### 4. Code Execution API

```typescript
// POST /api/execute
interface ExecuteCodeRequest {
  code: string;
  language: 'javascript' | 'python' | 'typescript';
  testCases?: TestCase[];
  timeout?: number;
}

interface ExecuteCodeResponse {
  success: boolean;
  output?: string;
  error?: {
    message: string;
    line?: number;
    stack?: string;
  };
  executionTime: number;
}
```

### Middleware Components

#### 1. Authentication Middleware

```typescript
interface AuthMiddlewareConfig {
  protectedRoutes: string[];
  publicRoutes: string[];
  redirectTo: string;
}
```

Validates JWT tokens and redirects unauthenticated users.

#### 2. Rate Limiting Middleware

```typescript
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}
```

Prevents API abuse with configurable rate limits per endpoint.

#### 3. Error Handling Middleware

```typescript
interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: Record<string, any>;
  };
  statusCode: number;
}
```

Standardizes error responses across all API routes.

## Data Models

### User Model

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  lastActive: Date;
  createdAt: Date;
  settings: UserSettings;
  guildId?: string;
  inventory: InventoryItem[];
  achievements: string[];
  emailVerified: boolean;
  onboardingCompleted: boolean;
}

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  editor: EditorSettings;
  soundEnabled: boolean;
}
```

### Lesson Model

```typescript
interface Lesson {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  starterCode: string;
  solution: string;
  testCases: TestCase[];
  hints: string[];
  xpReward: number;
  coinReward: number;
  prerequisites: string[];
  estimatedTime: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Guild Model

```typescript
interface Guild {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar: string;
  banner: string;
  leaderId: string;
  members: string[];
  totalXP: number;
  rank: number;
  maxMembers: number;
  isPublic: boolean;
  requirements: {
    minLevel?: number;
    minXP?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Quest Model

```typescript
interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'achievement';
  requirements: QuestRequirement[];
  rewards: QuestReward[];
  deadline?: Date;
  chainId?: string;
  order?: number;
  createdAt: Date;
}

interface QuestRequirement {
  type: 'complete_lessons' | 'earn_xp' | 'win_duels' | 'feed_pet';
  target: number;
  current: number;
}

interface QuestReward {
  type: 'xp' | 'coins' | 'item' | 'achievement';
  amount: number;
  itemId?: string;
}
```

### Pet Model

```typescript
interface Pet {
  id: string;
  userId: string;
  name: string;
  type: string;
  stage: 'egg' | 'baby' | 'teen' | 'adult' | 'mega';
  xp: number;
  happiness: number;
  hunger: number;
  lastFed: Date;
  lastPlayed: Date;
  accessories: string[];
  createdAt: Date;
}
```

### Notification Model

```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'achievement' | 'guild' | 'duel' | 'quest' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}
```

### Shop Item Model

```typescript
interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'avatar' | 'pet_accessory' | 'theme' | 'boost';
  price: number;
  image: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  limited: boolean;
  availableUntil?: Date;
  requirements?: {
    minLevel?: number;
    achievement?: string;
  };
}
```

### Submission Model

```typescript
interface Submission {
  id: string;
  userId: string;
  lessonId?: string;
  challengeId?: string;
  code: string;
  language: string;
  status: 'pending' | 'passed' | 'failed' | 'error';
  testResults: TestResult[];
  executionTime: number;
  createdAt: Date;
}

interface TestResult {
  testCase: string;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}
```

### Mistake Model

```typescript
interface Mistake {
  id: string;
  userId: string;
  errorType: string;
  errorMessage: string;
  code: string;
  language: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  relatedLessons: string[];
  resolved: boolean;
  firstOccurrence: Date;
  lastOccurrence: Date;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Before defining the correctness properties, I need to analyze the acceptance criteria to determine which are testable as properties, examples, or edge cases.


### Property Reflection

After analyzing all acceptance criteria, I've identified several areas where properties can be consolidated to avoid redundancy:

**Consolidation Opportunities:**

1. **Form Validation Properties** (11.1-11.12): Multiple validation rules can be combined into comprehensive validation properties rather than separate properties for each field
2. **Data Persistence Properties** (14.1-14.8): All persistence operations follow the same pattern - can be combined into general persistence properties
3. **Authentication Guard Properties** (15.1-15.4): Multiple redirect scenarios can be combined into general auth guard properties
4. **Settings Persistence Properties** (21.1-21.11): Similar to data persistence, can be consolidated
5. **Error Response Properties** (5.1-5.9): Multiple error status codes can be combined into general error handling properties
6. **Accessibility Properties** (12.1-12.10): Can be grouped into comprehensive accessibility properties
7. **Navigation Link Properties** (3.4, 3.8, 3.9): All about valid hrefs, can be combined
8. **Empty State Properties** (7.9, 7.10): Can be combined into general empty state structure property
9. **Error Boundary Properties** (8.5, 8.6): Both about required buttons, can be combined
10. **Pet Evolution Properties** (23.1-23.4): All follow same pattern at different thresholds, can be combined

**Properties to Keep Separate:**
- Properties testing different behavioral patterns (e.g., rewards vs validation vs persistence)
- Properties with different input domains (e.g., guild operations vs lesson operations)
- Properties testing different system layers (e.g., API vs UI vs database)

This reflection ensures each property provides unique validation value without logical redundancy.

### Correctness Properties

#### Property 1: Lesson Submission Rewards

*For any* correct code submission to a lesson, the system should award the specified XP and coins to the user's account.

**Validates: Requirements 1.8**

#### Property 2: Lesson Submission Feedback

*For any* incorrect code submission to a lesson, the system should display error feedback indicating which test cases failed.

**Validates: Requirements 1.9**

#### Property 3: Profile Data Completeness

*For any* user profile page, the rendered output should contain all required fields: username, XP, level, streak, lessons completed, achievements, and recent activity.

**Validates: Requirements 2.3, 2.4, 2.5**

#### Property 4: Profile Privacy Enforcement

*For any* private user profile viewed by a non-owner, the system should hide sensitive information (bio, activity, achievements) while displaying basic stats.

**Validates: Requirements 2.10**

#### Property 5: Profile Guild Display

*For any* user profile where the user is a guild member, the guild information should be displayed on the profile page.

**Validates: Requirements 2.6**

#### Property 6: Navigation Link Validity

*For any* navigation link (sidebar, quick access, or in-page), the href attribute should point to an existing route in the application.

**Validates: Requirements 3.4, 3.8, 3.9**

#### Property 7: Protected Endpoint Authentication

*For any* protected API endpoint, requests without valid authentication tokens should be rejected with 401 status.

**Validates: Requirements 4.11**

#### Property 8: API Rate Limiting

*For any* API endpoint, requests exceeding the configured rate limit should return 429 status with retry-after information.

**Validates: Requirements 4.12**

#### Property 9: Error Status Code Mapping

*For any* API error, the response should include the appropriate HTTP status code matching the error type (400 for validation, 404 for not found, 500 for server errors).

**Validates: Requirements 5.1, 5.4, 5.7**

#### Property 10: Validation Error Details

*For any* validation failure, the API response should return 400 status with field-specific error messages indicating which fields failed validation and why.

**Validates: Requirements 5.5**

#### Property 11: Error Message Safety

*For any* error response, the message should not expose sensitive information such as database details, file paths, or internal implementation details.

**Validates: Requirements 5.9**

#### Property 12: Error Logging

*For any* error occurring in the system, the error should be logged with full stack trace to the console or logging service.

**Validates: Requirements 5.8**

#### Property 13: Loading State Interaction Blocking

*For any* component in a loading state, all interactive elements (buttons, inputs, links) should be disabled until loading completes.

**Validates: Requirements 6.8**

#### Property 14: Long Operation Progress

*For any* operation exceeding 3 seconds, a progress indicator should be displayed to inform the user of ongoing work.

**Validates: Requirements 6.9**

#### Property 15: Loading Cancellation Cleanup

*For any* cancelled loading operation, the component state should be properly cleaned up with no memory leaks or pending promises.

**Validates: Requirements 6.10**

#### Property 16: Empty State Structure

*For any* empty state display, the UI should include an icon, descriptive message, and at least one actionable button or link.

**Validates: Requirements 7.9, 7.10**

#### Property 17: Error Boundary Catching

*For any* React component error thrown during render, lifecycle, or event handler, the nearest error boundary should catch it and prevent app crash.

**Validates: Requirements 8.3, 8.8**

#### Property 18: Error Boundary UI

*For any* caught error, the error boundary should display a user-friendly message along with "Try Again" and "Go Home" action buttons.

**Validates: Requirements 8.4, 8.5, 8.6**

#### Property 19: Error Boundary Logging

*For any* error caught by an error boundary, the error should be logged to the error tracking service with full context.

**Validates: Requirements 8.7**

#### Property 20: Error Boundary Session Preservation

*For any* component error caught by error boundary, the user's session data and authentication state should remain intact.

**Validates: Requirements 8.9**

#### Property 21: Guild Creation Cost

*For any* successful guild creation, exactly 500 coins should be deducted from the user's account balance.

**Validates: Requirements 9.1, 9.2**

#### Property 22: Guild Creation Persistence

*For any* successful guild creation, a new guild document should exist in the database with the creator as leader and initial member.

**Validates: Requirements 9.3**

#### Property 23: Guild Membership Bidirectional Update

*For any* user joining a guild, both the guild's member list should include the user AND the user's document should reference the guild ID.

**Validates: Requirements 9.4, 9.5**

#### Property 24: Guild Membership Removal

*For any* user leaving a guild, the user should be removed from the guild's member list and the guild reference should be removed from the user's document.

**Validates: Requirements 9.12**

#### Property 25: Notification Count Update

*For any* new notification created for a user, the user's unread notification count should increment by one.

**Validates: Requirements 10.2**

#### Property 26: Notification Read Status

*For any* notification clicked by a user, the notification's read status should be updated to true in the database.

**Validates: Requirements 10.3**

#### Property 27: Notification Timestamp Format

*For any* notification displayed in the UI, the timestamp should be formatted in relative time (e.g., "2 hours ago", "just now").

**Validates: Requirements 10.5**

#### Property 28: Notification Grouping

*For any* set of notifications, they should be grouped by type (achievement, guild, duel, quest, system) in the display.

**Validates: Requirements 10.6**

#### Property 29: Notification Sound Trigger

*For any* important notification (achievement, duel challenge) when sound is enabled in user settings, a notification sound should play.

**Validates: Requirements 10.9**

#### Property 30: Notification Preference Persistence

*For any* change to notification preferences, the updated settings should be saved to the user's document in Firestore.

**Validates: Requirements 10.10**

#### Property 31: Form Validation Enforcement

*For any* form with validation rules, the submit button should be disabled and submission prevented when any validation rule fails.

**Validates: Requirements 11.10**

#### Property 32: Guild Name Validation

*For any* guild name input, validation should fail if the name is empty, shorter than 3 characters, longer than 30 characters, or contains invalid characters.

**Validates: Requirements 11.1, 11.2, 11.3**

#### Property 33: Bio Length Validation

*For any* bio input in profile edit, validation should fail if the text exceeds 150 characters.

**Validates: Requirements 11.5**

#### Property 34: Email Format Validation

*For any* email input, validation should fail if the format doesn't match standard email pattern (user@domain.tld).

**Validates: Requirements 11.6**

#### Property 35: Password Strength Validation

*For any* password input, validation should fail if the password doesn't meet minimum strength requirements (length, character variety).

**Validates: Requirements 11.7**

#### Property 36: Validation Error Display

*For any* form validation error, the error message should be displayed inline near the invalid field in red color.

**Validates: Requirements 11.8, 11.9, 11.11**

#### Property 37: Validation Error Clearing

*For any* form field with a validation error, the error should clear when the user corrects the input to meet validation rules.

**Validates: Requirements 11.12**

#### Property 38: Interactive Element Accessibility

*For any* interactive element (button, link, input), it should have proper ARIA labels, keyboard navigation support, and visible focus indicators.

**Validates: Requirements 12.1, 12.2, 12.3**

#### Property 39: Image Accessibility

*For any* image displayed in the application, it should have descriptive alt text or be marked as decorative with empty alt.

**Validates: Requirements 12.4**

#### Property 40: Form Label Association

*For any* form input, it should have an associated label element properly linked via htmlFor/id or aria-label.

**Validates: Requirements 12.8**

#### Property 41: Search Input Debouncing

*For any* rapid sequence of keystrokes in the search input, only the final value after 300ms of inactivity should trigger a search query.

**Validates: Requirements 13.1**

#### Property 42: Search Results Display Threshold

*For any* search query with length >= 1 character, the search results dropdown should be displayed.

**Validates: Requirements 13.2**

#### Property 43: Search Results Content Matching

*For any* search result item displayed, it should match the search query in at least one of: title, description, tags, or content.

**Validates: Requirements 13.3, 13.4, 13.5**

#### Property 44: Search Results Highlighting

*For any* search result displayed, the text matching the search query should be highlighted with distinct styling.

**Validates: Requirements 13.6**

#### Property 45: Search Result Navigation

*For any* search result clicked, the application should navigate to the corresponding page for that result.

**Validates: Requirements 13.7**

#### Property 46: Search Results Empty State

*For any* search query returning no matches, a "No results found" message should be displayed.

**Validates: Requirements 13.10**

#### Property 47: Search Results Limit

*For any* search query, the displayed results should be limited to a maximum of 6 items.

**Validates: Requirements 13.11**

#### Property 48: Data Persistence on User Actions

*For any* user action that modifies data (earning XP/coins, completing lessons, updating profile, changing settings, feeding pet, purchasing items), the changes should be persisted to Firestore.

**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8**

#### Property 49: Login Data Synchronization

*For any* user login, local storage data should be synchronized with Firestore to ensure consistency.

**Validates: Requirements 14.9**

#### Property 50: Optimistic UI Updates

*For any* data mutation operation, the UI should update immediately (optimistically) before receiving server confirmation.

**Validates: Requirements 14.11**

#### Property 51: Sync Conflict Resolution

*For any* data sync conflict between local and remote state, the system should resolve using last-write-wins or merge strategy.

**Validates: Requirements 14.12**

#### Property 52: Unauthenticated Access Redirect

*For any* unauthenticated user attempting to access a protected route, the system should redirect to the login page with the original URL preserved.

**Validates: Requirements 15.1, 15.2, 15.6**

#### Property 53: Authenticated Auth Page Redirect

*For any* authenticated user attempting to access login or signup pages, the system should redirect to the dashboard.

**Validates: Requirements 15.3, 15.4**

#### Property 54: Protected Route Authentication Check

*For any* protected route, the middleware should verify authentication status before allowing access to the page.

**Validates: Requirements 15.5**

#### Property 55: Post-Login Redirect

*For any* successful authentication where a redirect URL was preserved, the system should navigate to that original destination.

**Validates: Requirements 15.7**

#### Property 56: Token Refresh Before Expiry

*For any* authentication token within 5 minutes of expiration, the system should automatically refresh the token.

**Validates: Requirements 15.8**

#### Property 57: Token Expiration Handling

*For any* expired authentication token, the system should gracefully handle by redirecting to login without data loss.

**Validates: Requirements 15.9**

#### Property 58: Logout Session Cleanup

*For any* user logout action, all session data should be cleared from memory, cookies, and local storage.

**Validates: Requirements 15.10**

#### Property 59: Code Execution Sandboxing

*For any* code execution request, the code should run in a sandboxed environment with enforced timeout (5 seconds) and memory limits.

**Validates: Requirements 16.2, 16.3, 16.4, 16.5**

#### Property 60: Code Execution Output Capture

*For any* code execution, both console output and runtime errors should be captured and returned in the response.

**Validates: Requirements 16.6, 16.7**

#### Property 61: Code Execution Success Display

*For any* successful code execution, the output should be displayed in the console panel with success styling.

**Validates: Requirements 16.9**

#### Property 62: Code Execution Error Display

*For any* failed code execution, the error message with line number should be displayed in the console panel with error styling.

**Validates: Requirements 16.10**

#### Property 63: Responsive Layout Adaptation

*For any* viewport width between 320px and 2560px, the layout should adapt appropriately without horizontal scrolling or broken layouts.

**Validates: Requirements 17.1**

#### Property 64: Mobile Sidebar Collapse

*For any* viewport width below 768px, the dashboard sidebar should collapse and be accessible via hamburger menu.

**Validates: Requirements 17.2, 17.3**

#### Property 65: Touch Target Sizing

*For any* interactive element on mobile viewports, the touch target should be at least 44x44 pixels for accessibility.

**Validates: Requirements 17.6**

#### Property 66: Mobile Content Stacking

*For any* multi-column layout on mobile viewports, columns should stack vertically for readability.

**Validates: Requirements 17.8**

#### Property 67: Leaderboard Current User Highlight

*For any* leaderboard display where the current user appears in the list, that user's row should be visually highlighted.

**Validates: Requirements 18.8**

#### Property 68: Leaderboard Filtering

*For any* leaderboard filter selection (timeframe or category), the displayed data should update to show only entries matching that filter.

**Validates: Requirements 18.4, 18.5**

#### Property 69: Toast Notification Positioning

*For any* toast notification displayed, it should appear in the bottom-right corner without blocking interactive elements.

**Validates: Requirements 19.1, 19.9**

#### Property 70: Toast Notification Stacking

*For any* multiple toast notifications displayed simultaneously, they should stack vertically with consistent spacing.

**Validates: Requirements 19.2**

#### Property 71: Toast Auto-Dismiss

*For any* toast notification, it should automatically dismiss after 5 seconds unless the user hovers over it.

**Validates: Requirements 19.3, 19.5**

#### Property 72: Toast Type Styling

*For any* toast notification, it should display the appropriate icon and color scheme based on its type (success, error, info, warning).

**Validates: Requirements 19.6, 19.7**

#### Property 73: Video Completion Tracking

*For any* cinema video watched to completion (>90%), the system should save completion status and award XP to the user.

**Validates: Requirements 20.7, 20.8**

#### Property 74: Video Playback Controls

*For any* cinema video, the player should support play, pause, seek, speed adjustment, and fullscreen controls.

**Validates: Requirements 20.2, 20.3, 20.4, 20.6**

#### Property 75: Settings Persistence

*For any* settings change (notifications, language, theme, editor, sound), the updated value should be saved to the user's Firestore document.

**Validates: Requirements 21.1, 21.2, 21.3, 21.4, 21.5**

#### Property 76: Settings Load on Mount

*For any* settings page load, the current saved preferences should be fetched from Firestore and applied to the UI.

**Validates: Requirements 21.6, 21.7**

#### Property 77: Duel Timer Auto-Submit

*For any* duel where the timer reaches zero, the current code should be automatically submitted for evaluation.

**Validates: Requirements 22.3**

#### Property 78: Duel Correct Solution Rewards

*For any* duel where the submitted solution passes all test cases, the user should be awarded XP and coins.

**Validates: Requirements 22.4**

#### Property 79: Duel Incorrect Solution Feedback

*For any* duel where the submitted solution fails test cases, the specific test case failures should be displayed to the user.

**Validates: Requirements 22.5**

#### Property 80: Pet Evolution Threshold Triggers

*For any* pet reaching XP thresholds (500, 2000, 5000), the pet should evolve to the next stage (Teen, Adult, Mega) with updated appearance.

**Validates: Requirements 23.1, 23.2, 23.3, 23.8**

#### Property 81: Pet Evolution Notification

*For any* pet evolution event, an achievement notification should be displayed to the user.

**Validates: Requirements 23.5**

#### Property 82: Pet Stats Persistence

*For any* pet stat change (XP, happiness, hunger), the updated values should be saved to the pet document in Firestore.

**Validates: Requirements 23.9**

#### Property 83: Quest Progress Tracking

*For any* user action that contributes to quest requirements, the quest progress should be updated in the database.

**Validates: Requirements 24.2, 24.3**

#### Property 84: Quest Completion Rewards

*For any* quest where all requirements are met, the specified rewards should be awarded to the user and the quest moved to completed status.

**Validates: Requirements 24.4, 24.5**

#### Property 85: Quest Deadline Display

*For any* quest with a deadline, the remaining time should be displayed in the quest UI.

**Validates: Requirements 24.6**

#### Property 86: Shop Purchase Validation

*For any* shop purchase attempt, the system should validate that the user has sufficient coins before processing.

**Validates: Requirements 25.1**

#### Property 87: Shop Purchase Transaction

*For any* successful shop purchase, the item cost should be deducted from coins, the item added to inventory, and the transaction saved to database.

**Validates: Requirements 25.2, 25.3, 25.4**

#### Property 88: Shop Owned Item Display

*For any* shop item already owned by the user, it should be displayed with "Owned" status and purchase button disabled.

**Validates: Requirements 25.5, 25.6**

#### Property 89: Progress Data Visualization

*For any* progress page load, the user's XP over time, lessons over time, and skill breakdown should be fetched and displayed in charts.

**Validates: Requirements 26.1, 26.2, 26.3, 26.4**

#### Property 90: Progress Date Range Filtering

*For any* date range selection on the progress page, the displayed charts should update to show only data within that range.

**Validates: Requirements 26.6**

#### Property 91: Mistake Categorization

*For any* coding error made by a user, it should be categorized by type and stored with frequency count in the mistakes collection.

**Validates: Requirements 27.1, 27.2, 27.3**

#### Property 92: Mistake Lesson Linking

*For any* mistake displayed in the analyzer, it should include links to related lessons that teach the relevant concept.

**Validates: Requirements 27.5**

#### Property 93: Onboarding Progress Persistence

*For any* onboarding step completion, the progress should be saved to allow resuming if the user leaves.

**Validates: Requirements 28.8, 28.9**

#### Property 94: Onboarding Completion Redirect

*For any* user completing all required onboarding steps, the system should redirect to the dashboard and award welcome bonus.

**Validates: Requirements 28.4, 28.10**

#### Property 95: Password Reset Token Validation

*For any* password reset attempt, the system should validate that the token is valid, not expired (< 1 hour old), and not previously used.

**Validates: Requirements 29.3, 29.7, 29.8**

#### Property 96: Password Reset Success Flow

*For any* successful password reset, the user should be redirected to login with a success message.

**Validates: Requirements 29.6, 29.9**

#### Property 97: Email Verification Token Validation

*For any* email verification attempt, the system should validate that the token is valid and not expired (< 24 hours old).

**Validates: Requirements 30.2, 30.7**

#### Property 98: Email Verification Success Flow

*For any* successful email verification, the user's verified status should be updated and they should be redirected to onboarding.

**Validates: Requirements 30.3, 30.4**

#### Property 99: Rate Limit UI Feedback

*For any* API request that receives a 429 response, a toast notification should display the time until rate limit reset.

**Validates: Requirements 31.1, 31.2**

#### Property 100: Rate Limit Button Disabling

*For any* form or action that is rate limited, the submit buttons should be disabled until the rate limit resets.

**Validates: Requirements 31.4**

#### Property 101: Defensive Data Access

*For any* data access operation, the code should use optional chaining or null checks to prevent accessing properties of undefined/null.

**Validates: Requirements 32.1, 32.4, 32.9, 32.10**

#### Property 102: Default Prop Values

*For any* component with optional props, default values should be provided to prevent undefined errors.

**Validates: Requirements 32.2**

#### Property 103: Data Validation Before Render

*For any* data received from API, it should be validated against expected structure before rendering to prevent runtime errors.

**Validates: Requirements 32.3, 32.7**

#### Property 104: Image Fallback Handling

*For any* image that fails to load, a fallback image or placeholder should be displayed instead of broken image icon.

**Validates: Requirements 32.8**

#### Property 105: Analytics Event Tracking

*For any* significant user action (page view, button click, form submission, lesson completion), an analytics event should be sent to the tracking service.

**Validates: Requirements 37.1, 37.2, 37.3, 37.4, 37.5**

#### Property 106: Analytics Privacy Compliance

*For any* analytics tracking, the system should respect user privacy preferences and GDPR requirements.

**Validates: Requirements 37.9, 37.10**

#### Property 107: Input Sanitization

*For any* user input that will be displayed or stored, it should be sanitized to prevent XSS attacks.

**Validates: Requirements 38.7**

#### Property 108: Secure Cookie Configuration

*For any* authentication cookie set by the system, it should have HttpOnly, Secure, and SameSite flags enabled.

**Validates: Requirements 38.10**


## Error Handling

### Error Handling Strategy

The application implements a comprehensive multi-layered error handling approach:

#### 1. Client-Side Error Handling

**React Error Boundaries**
- Root error boundary wraps the entire application
- Route-specific error boundaries for each major section
- Component-level error boundaries for complex features
- Graceful degradation with fallback UI
- Error logging to tracking service

**API Error Handling**
- Centralized error handling in API client
- Automatic retry with exponential backoff for transient errors
- User-friendly error messages mapped from error codes
- Toast notifications for user-facing errors
- Silent logging for non-critical errors

**Form Validation Errors**
- Real-time validation with debouncing
- Field-level error messages
- Form-level error summary
- Prevention of invalid submissions
- Clear error messages with correction guidance

#### 2. Server-Side Error Handling

**API Route Error Handling**
- Try-catch blocks in all route handlers
- Standardized error response format
- Appropriate HTTP status codes
- Detailed logging with request context
- Safe error messages (no sensitive data exposure)

**Middleware Error Handling**
- Authentication errors (401)
- Authorization errors (403)
- Rate limiting errors (429)
- Validation errors (400)
- Server errors (500)

**Database Error Handling**
- Connection error recovery
- Transaction rollback on failure
- Optimistic locking for concurrent updates
- Graceful degradation for read failures
- Retry logic for transient failures

#### 3. Error Response Format

All API errors follow this standardized format:

```typescript
{
  error: {
    message: string;        // User-friendly message
    code: string;           // Error code for client handling
    details?: {             // Optional additional context
      field?: string;       // For validation errors
      constraint?: string;  // For constraint violations
    };
  };
  statusCode: number;
}
```

#### 4. Error Categories and Handling

**Authentication Errors (401)**
- Invalid or expired tokens
- Missing authentication
- Action: Redirect to login, preserve redirect URL

**Authorization Errors (403)**
- Insufficient permissions
- Resource access denied
- Action: Display error message, suggest alternatives

**Validation Errors (400)**
- Invalid input format
- Missing required fields
- Constraint violations
- Action: Display field-specific errors, prevent submission

**Not Found Errors (404)**
- Non-existent resources
- Invalid routes
- Action: Display 404 page with navigation options

**Rate Limit Errors (429)**
- Too many requests
- Action: Display countdown, disable actions, implement backoff

**Server Errors (500)**
- Unexpected exceptions
- Database failures
- External service errors
- Action: Display generic error, log details, offer retry

#### 5. Error Logging and Monitoring

**Client-Side Logging**
- Error boundaries log to error tracking service
- API errors logged with request/response context
- User actions leading to error captured
- Browser and device information included

**Server-Side Logging**
- All errors logged with full stack traces
- Request context (user, endpoint, params)
- Performance metrics (execution time)
- Structured logging for easy querying

**Error Tracking Integration**
- Sentry or similar service integration
- Error grouping and deduplication
- User impact tracking
- Alert thresholds for critical errors

#### 6. Error Recovery Strategies

**Automatic Recovery**
- Token refresh before expiry
- Retry with exponential backoff
- Fallback to cached data
- Graceful degradation of features

**User-Initiated Recovery**
- "Try Again" buttons in error states
- "Refresh" options for stale data
- "Go Home" navigation from error pages
- Clear error messages with next steps

**Data Recovery**
- Optimistic updates with rollback
- Local storage backup for forms
- Session preservation during errors
- Conflict resolution for sync issues

### Error Prevention Strategies

**Defensive Programming**
- Optional chaining for nested properties
- Null checks before data access
- Default values for optional props
- Type guards for runtime validation

**Input Validation**
- Client-side validation before submission
- Server-side validation as source of truth
- Sanitization to prevent XSS
- Rate limiting to prevent abuse

**Testing**
- Unit tests for error scenarios
- Integration tests for error flows
- Property-based tests for edge cases
- E2E tests for critical error paths

## Testing Strategy

### Testing Approach

The application uses a dual testing approach combining traditional unit/integration tests with property-based testing for comprehensive coverage.

#### 1. Unit Testing

**Scope**: Individual functions, hooks, and utilities

**Framework**: Jest + React Testing Library

**Coverage Areas**:
- Utility functions (validation, formatting, calculations)
- Custom React hooks (useAuth, useToast, useDebounce)
- Helper functions (API clients, data transformers)
- Pure functions (reducers, selectors)

**Example Tests**:
- Email validation accepts valid formats
- Password strength calculation returns correct scores
- Date formatting handles edge cases (null, invalid dates)
- Debounce hook delays execution correctly

**Best Practices**:
- Test behavior, not implementation
- Use descriptive test names
- Arrange-Act-Assert pattern
- Mock external dependencies
- Aim for 80%+ coverage of utility code

#### 2. Component Testing

**Scope**: React components in isolation

**Framework**: React Testing Library + Jest

**Coverage Areas**:
- Component rendering with various props
- User interactions (clicks, typing, form submission)
- Conditional rendering logic
- Accessibility compliance
- Error states and edge cases

**Example Tests**:
- Button component renders with correct text and icon
- Form component displays validation errors
- Modal component opens and closes correctly
- Loading spinner appears during async operations
- Empty state displays when data is empty

**Best Practices**:
- Test from user perspective
- Query by accessible roles and labels
- Avoid testing implementation details
- Test keyboard navigation
- Verify ARIA attributes

#### 3. Integration Testing

**Scope**: API routes and database interactions

**Framework**: Jest + Supertest + Firebase Emulator

**Coverage Areas**:
- API endpoint request/response cycles
- Authentication and authorization flows
- Database CRUD operations
- Middleware execution order
- Error handling and status codes

**Example Tests**:
- POST /api/lessons/[id]/submit validates code and returns results
- GET /api/users/[userId] returns 404 for non-existent users
- Protected endpoints return 401 without auth token
- Rate limiting returns 429 after threshold
- Guild creation deducts coins and creates document

**Best Practices**:
- Use test database or emulator
- Clean up test data after each test
- Test happy path and error scenarios
- Verify side effects (database changes, emails sent)
- Test middleware integration

#### 4. Property-Based Testing

**Scope**: Universal properties that should hold for all inputs

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: comprehensive-code-review-fixes, Property {number}: {property_text}`

**Coverage Areas**:
- Data validation rules
- State transitions
- API contracts
- Business logic invariants
- Round-trip properties (serialization, parsing)

**Example Property Tests**:

```typescript
// Property 31: Form Validation Enforcement
test('Feature: comprehensive-code-review-fixes, Property 31', () => {
  fc.assert(
    fc.property(
      fc.record({
        guildName: fc.string(),
        description: fc.string(),
      }),
      (formData) => {
        const errors = validateGuildForm(formData);
        const hasErrors = Object.keys(errors).length > 0;
        const canSubmit = isFormSubmittable(formData, errors);
        
        // If there are validation errors, submission should be blocked
        if (hasErrors) {
          expect(canSubmit).toBe(false);
        }
      }
    ),
    { numRuns: 100 }
  );
});

// Property 48: Data Persistence on User Actions
test('Feature: comprehensive-code-review-fixes, Property 48', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.record({
        userId: fc.uuid(),
        xpEarned: fc.integer({ min: 1, max: 1000 }),
      }),
      async ({ userId, xpEarned }) => {
        const initialXP = await getUserXP(userId);
        await awardXP(userId, xpEarned);
        const finalXP = await getUserXP(userId);
        
        // XP should be persisted to database
        expect(finalXP).toBe(initialXP + xpEarned);
      }
    ),
    { numRuns: 100 }
  );
});

// Property 80: Pet Evolution Threshold Triggers
test('Feature: comprehensive-code-review-fixes, Property 80', async () => {
  fc.assert(
    fc.asyncProperty(
      fc.record({
        petId: fc.uuid(),
        xpToAdd: fc.integer({ min: 0, max: 6000 }),
      }),
      async ({ petId, xpToAdd }) => {
        const pet = await createTestPet(petId);
        await addPetXP(petId, xpToAdd);
        const updatedPet = await getPet(petId);
        
        const totalXP = pet.xp + xpToAdd;
        
        // Verify correct stage based on XP
        if (totalXP < 500) {
          expect(updatedPet.stage).toBe('baby');
        } else if (totalXP < 2000) {
          expect(updatedPet.stage).toBe('teen');
        } else if (totalXP < 5000) {
          expect(updatedPet.stage).toBe('adult');
        } else {
          expect(updatedPet.stage).toBe('mega');
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Best Practices**:
- Generate diverse inputs with fast-check generators
- Test invariants that should always hold
- Use shrinking to find minimal failing cases
- Tag tests with property references
- Run sufficient iterations (100+)

#### 5. End-to-End Testing

**Scope**: Critical user flows through the entire application

**Framework**: Playwright or Cypress

**Coverage Areas**:
- User authentication flow
- Lesson completion flow
- Guild creation and joining
- Shop purchase flow
- Profile editing flow
- Onboarding flow

**Example E2E Tests**:
- User can sign up, verify email, complete onboarding, and reach dashboard
- User can browse lessons, complete a lesson, and see XP/coins awarded
- User can create a guild, invite members, and see guild leaderboard
- User can purchase shop item and see it in inventory
- User can edit profile and see changes reflected

**Best Practices**:
- Test critical business flows
- Use realistic test data
- Run against staging environment
- Include visual regression testing
- Test across browsers and devices

#### 6. Accessibility Testing

**Scope**: WCAG compliance and screen reader support

**Framework**: jest-axe + manual testing

**Coverage Areas**:
- Automated accessibility checks with axe
- Keyboard navigation testing
- Screen reader compatibility
- Color contrast verification
- Focus management

**Example Tests**:
- All pages pass axe accessibility checks
- All interactive elements are keyboard accessible
- Focus moves logically through the page
- Form errors are announced to screen readers
- Images have appropriate alt text

**Best Practices**:
- Run axe checks on all pages
- Test with actual screen readers
- Verify keyboard-only navigation
- Check color contrast ratios
- Test with reduced motion enabled

#### 7. Performance Testing

**Scope**: Load times, bundle size, runtime performance

**Tools**: Lighthouse, Bundle Analyzer, React DevTools Profiler

**Coverage Areas**:
- Page load performance
- Bundle size optimization
- Runtime performance (re-renders)
- API response times
- Database query performance

**Metrics**:
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- Bundle size < 200KB (gzipped)

#### 8. Security Testing

**Scope**: Authentication, authorization, input validation, XSS prevention

**Coverage Areas**:
- Authentication bypass attempts
- Authorization boundary testing
- XSS injection attempts
- CSRF protection
- SQL injection (if applicable)
- Rate limiting effectiveness

**Example Tests**:
- Protected routes reject unauthenticated requests
- Users cannot access other users' private data
- User input is sanitized before display
- CSRF tokens are validated
- Rate limits prevent abuse

### Test Organization

```
tests/
├── unit/
│   ├── utils/
│   ├── hooks/
│   └── helpers/
├── component/
│   ├── ui/
│   ├── modals/
│   └── pages/
├── integration/
│   ├── api/
│   └── database/
├── property/
│   ├── validation.property.test.ts
│   ├── persistence.property.test.ts
│   └── business-logic.property.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── lessons.spec.ts
│   └── guild.spec.ts
└── accessibility/
    └── a11y.test.ts
```

### Continuous Integration

**CI Pipeline**:
1. Lint and type check
2. Run unit tests
3. Run component tests
4. Run integration tests
5. Run property-based tests
6. Build application
7. Run E2E tests
8. Generate coverage report
9. Deploy to staging (if all pass)

**Coverage Requirements**:
- Overall: 80%+
- Critical paths: 95%+
- Utility functions: 90%+
- Components: 75%+

**Quality Gates**:
- All tests must pass
- No TypeScript errors
- No ESLint errors
- Coverage thresholds met
- Bundle size within limits
- Lighthouse score > 90

### Testing Best Practices Summary

1. **Write tests first for new features** (TDD approach)
2. **Test behavior, not implementation**
3. **Use property-based tests for universal rules**
4. **Use unit tests for specific examples and edge cases**
5. **Mock external dependencies appropriately**
6. **Keep tests fast and isolated**
7. **Use descriptive test names**
8. **Maintain test code quality**
9. **Run tests in CI/CD pipeline**
10. **Review test coverage regularly**

The combination of unit tests, component tests, integration tests, property-based tests, and E2E tests provides comprehensive coverage ensuring the application is correct, reliable, and maintainable.

