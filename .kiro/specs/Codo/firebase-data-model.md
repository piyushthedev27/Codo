# Firebase Data Model for CODO Backend

## Firestore Collections Structure

### users Collection
```javascript
users/{userId}
{
  uid: string,                    // Firebase Auth UID
  username: string,               // Unique username
  email: string,                  // User email (from Firebase Auth)
  avatarUrl: string,              // Profile picture URL
  bio: string,                    // User biography
  level: number,                  // Current level (default: 1)
  experiencePoints: number,       // Total XP (default: 0)
  totalChallengesSolved: number,  // Count of solved challenges
  successRate: number,            // Percentage (0-100)
  averageSolveTime: number,       // In milliseconds
  createdAt: timestamp,           // Account creation
  updatedAt: timestamp,           // Last profile update
  lastLogin: timestamp,           // Last login time
  isActive: boolean,              // Account status
  
  // Indexes needed:
  // - username (for uniqueness and search)
  // - createdAt (for sorting)
  // - totalChallengesSolved (for leaderboards)
}
```

### challenges Collection
```javascript
challenges/{challengeId}
{
  id: string,                     // Auto-generated ID
  title: string,                  // Challenge title
  description: string,            // Problem statement
  difficulty: string,             // 'easy', 'medium', 'hard'
  category: string,               // e.g., 'arrays', 'strings', 'algorithms'
  timeLimit: number,              // Execution time limit in seconds
  memoryLimit: number,            // Memory limit in MB
  testCases: array,               // Array of test case objects
  solutionCode: string,           // Optional solution
  createdBy: string,              // User ID of creator
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean,
  
  // Indexes needed:
  // - difficulty (for filtering)
  // - category (for filtering)
  // - createdAt (for sorting)
}

// Test case structure within testCases array:
{
  input: string,
  expectedOutput: string,
  isHidden: boolean              // Hide from users before submission
}
```

### submissions Collection
```javascript
submissions/{submissionId}
{
  id: string,                     // Auto-generated ID
  userId: string,                 // Reference to users collection
  challengeId: string,            // Reference to challenges collection
  code: string,                   // Submitted code
  language: string,               // 'javascript', 'python', 'java', 'cpp'
  status: string,                 // 'success', 'compilation_error', 'runtime_error', etc.
  executionTime: number,          // In milliseconds
  memoryUsed: number,             // In MB
  testResults: array,             // Array of test result objects
  errorMessage: string,           // Error details if failed
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Indexes needed:
  // - userId (for user submission history)
  // - challengeId (for challenge submissions)
  // - createdAt (for sorting)
  // - status (for filtering)
  // - Composite: userId + challengeId (for user's attempts on specific challenge)
}

// Test result structure within testResults array:
{
  testCaseId: number,
  passed: boolean,
  output: string,
  expectedOutput: string,
  error: string                   // If test failed
}
```

### guilds Collection
```javascript
guilds/{guildId}
{
  id: string,                     // Auto-generated ID
  name: string,                   // Unique guild name
  description: string,            // Guild description
  ownerId: string,                // User ID of guild owner
  isPublic: boolean,              // Public or private guild
  memberCount: number,            // Total members
  totalChallengesSolved: number,  // Aggregate of all members
  averageSolveTime: number,       // Average across members
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Indexes needed:
  // - name (for uniqueness and search)
  // - ownerId (for owner's guilds)
  // - totalChallengesSolved (for guild leaderboard)
}
```

### guildMembers Subcollection
```javascript
guilds/{guildId}/members/{userId}
{
  userId: string,                 // Reference to users collection
  role: string,                   // 'owner', 'moderator', 'member'
  joinedAt: timestamp,
  
  // Indexes needed:
  // - userId (for user's guild memberships)
}
```

### guildInvitations Collection
```javascript
guildInvitations/{invitationId}
{
  id: string,                     // Auto-generated ID
  guildId: string,                // Reference to guilds collection
  invitedUserId: string,          // User being invited
  invitedByUserId: string,        // User who sent invitation
  status: string,                 // 'pending', 'accepted', 'declined'
  expiresAt: timestamp,           // 7 days from creation
  createdAt: timestamp,
  
  // Indexes needed:
  // - guildId (for guild's invitations)
  // - invitedUserId (for user's invitations)
  // - status (for filtering)
  // - Composite: guildId + invitedUserId (for uniqueness)
}
```

### lessons Collection
```javascript
lessons/{lessonId}
{
  id: string,                     // Auto-generated ID
  title: string,                  // Lesson title
  description: string,            // Lesson overview
  category: string,               // e.g., 'basics', 'advanced'
  difficulty: string,             // 'easy', 'medium', 'hard'
  content: string,                // Lesson content (markdown)
  learningObjectives: array,      // Array of strings
  prerequisites: array,           // Array of lesson IDs
  challengeIds: array,            // Array of challenge IDs in order
  createdBy: string,              // User ID of creator
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean,
  
  // Indexes needed:
  // - category (for filtering)
  // - difficulty (for filtering)
}
```

### progress Collection
```javascript
progress/{progressId}
{
  id: string,                     // Auto-generated ID
  userId: string,                 // Reference to users collection
  lessonId: string,               // Reference to lessons collection
  status: string,                 // 'not_started', 'in_progress', 'completed'
  progressPercentage: number,     // 0-100
  completedChallenges: number,    // Count of completed challenges
  totalChallenges: number,        // Total challenges in lesson
  completedAt: timestamp,         // When lesson was completed
  createdAt: timestamp,
  updatedAt: timestamp,
  
  // Indexes needed:
  // - userId (for user's progress)
  // - lessonId (for lesson progress)
  // - Composite: userId + lessonId (for uniqueness)
}
```

### notifications Collection
```javascript
notifications/{notificationId}
{
  id: string,                     // Auto-generated ID
  userId: string,                 // Reference to users collection
  type: string,                   // 'guild_invitation', 'friend_activity', 'achievement', 'level_up'
  title: string,                  // Notification title
  message: string,                // Notification message
  relatedId: string,              // ID of related entity (guild, challenge, etc.)
  isRead: boolean,                // Read status
  createdAt: timestamp,
  readAt: timestamp,              // When notification was read
  
  // Indexes needed:
  // - userId (for user's notifications)
  // - isRead (for filtering unread)
  // - createdAt (for sorting)
  // - Composite: userId + isRead (for user's unread notifications)
}
```

### mistakeAnalysis Collection
```javascript
mistakeAnalysis/{analysisId}
{
  id: string,                     // Auto-generated ID
  submissionId: string,           // Reference to submissions collection
  errorCategory: string,          // 'compilation', 'runtime', 'logic', 'timeout', 'memory'
  description: string,            // Error description
  suggestions: array,             // Array of suggestion strings
  relatedLessons: array,          // Array of lesson IDs
  commonMistakeType: string,      // e.g., 'off-by-one', 'null-pointer'
  createdAt: timestamp,
  
  // Indexes needed:
  // - submissionId (for submission's analysis)
  // - errorCategory (for statistics)
}
```

## Firestore Security Rules

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
             get(/databases/$(database)/documents/guilds/$(guildId)).data.ownerId == request.auth.uid;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if false; // Prevent deletion
    }
    
    // Challenges collection
    match /challenges/{challengeId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated(); // Admin check in backend
      allow update: if isAuthenticated(); // Admin check in backend
      allow delete: if false; // Admin only via backend
    }
    
    // Submissions collection
    match /submissions/{submissionId} {
      allow read: if isAuthenticated() && 
                     (resource.data.userId == request.auth.uid || 
                      request.auth.token.admin == true);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if false; // Immutable after creation
      allow delete: if false;
    }
    
    // Guilds collection
    match /guilds/{guildId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isGuildOwner(guildId);
      allow delete: if isGuildOwner(guildId);
      
      // Guild members subcollection
      match /members/{userId} {
        allow read: if isAuthenticated();
        allow create: if isGuildOwner(guildId);
        allow delete: if isGuildOwner(guildId) || isOwner(userId);
      }
    }
    
    // Guild invitations
    match /guildInvitations/{invitationId} {
      allow read: if isAuthenticated() && 
                     (resource.data.invitedUserId == request.auth.uid ||
                      isGuildOwner(resource.data.guildId));
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.invitedUserId == request.auth.uid;
      allow delete: if isAuthenticated();
    }
    
    // Lessons collection
    match /lessons/{lessonId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated(); // Admin check in backend
      allow update: if isAuthenticated(); // Admin check in backend
      allow delete: if false;
    }
    
    // Progress collection
    match /progress/{progressId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if false;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }
    
    // Mistake analysis collection
    match /mistakeAnalysis/{analysisId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

## Firestore Indexes

Create these composite indexes in Firebase Console:

```
Collection: submissions
- userId (Ascending) + createdAt (Descending)
- challengeId (Ascending) + createdAt (Descending)
- userId (Ascending) + challengeId (Ascending) + createdAt (Descending)
- status (Ascending) + createdAt (Descending)

Collection: notifications
- userId (Ascending) + isRead (Ascending) + createdAt (Descending)

Collection: guildInvitations
- guildId (Ascending) + invitedUserId (Ascending)
- invitedUserId (Ascending) + status (Ascending)

Collection: progress
- userId (Ascending) + lessonId (Ascending)

Collection: users
- totalChallengesSolved (Descending) + averageSolveTime (Ascending)

Collection: guilds
- totalChallengesSolved (Descending)
```

## Data Relationships

```
users (Firebase Auth + Firestore)
  ├── has many submissions
  ├── has many guilds (as owner)
  ├── has many guild memberships
  ├── has many progress records
  ├── has many notifications
  └── has many challenges (as creator)

challenges
  ├── has many submissions
  └── referenced by lessons

submissions
  ├── belongs to user
  ├── belongs to challenge
  └── has one mistake analysis

guilds
  ├── has many members (subcollection)
  ├── has many invitations
  └── belongs to owner (user)

lessons
  ├── references many challenges
  └── has many progress records

progress
  ├── belongs to user
  └── belongs to lesson
```

## Migration from PostgreSQL to Firestore

Key differences:
1. **No foreign keys** - Use document references and maintain consistency in application logic
2. **Denormalization** - Store frequently accessed data together (e.g., guild member count in guild document)
3. **Subcollections** - Use for one-to-many relationships (e.g., guild members)
4. **Array fields** - Use for ordered lists (e.g., test cases, learning objectives)
5. **Timestamps** - Use Firestore server timestamps for consistency
6. **Indexes** - Create composite indexes for complex queries
7. **Security rules** - Enforce access control at database level
