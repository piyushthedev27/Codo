# API Documentation

## Overview

This document describes the API endpoints available in the application. All API routes are built using Next.js API routes and follow RESTful conventions.

## Base URL

```
http://localhost:3000/api (development)
https://your-domain.com/api (production)
```

## Authentication

Most API endpoints require authentication through Clerk. Include the session token in your requests:

```javascript
// Client-side with Clerk
const { getToken } = useAuth();
const token = await getToken();

fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Endpoints

### Dashboard API

#### GET `/api/dashboard`

Retrieves dashboard data for the authenticated user.

**Authentication**: Required

**Response**:
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string"
  },
  "stats": {
    "completedLessons": "number",
    "skillLevel": "string",
    "streakDays": "number"
  },
  "recentActivity": [
    {
      "id": "string",
      "type": "lesson|duel|collaboration",
      "title": "string",
      "timestamp": "string",
      "status": "completed|in_progress"
    }
  ],
  "peers": [
    {
      "id": "string",
      "name": "string",
      "avatar": "string",
      "skillLevel": "string",
      "isOnline": "boolean"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Server error

---

### Onboarding API

#### POST `/api/onboarding`

Handles user onboarding data submission.

**Authentication**: Required

**Request Body**:
```json
{
  "skillAssessment": {
    "programmingExperience": "beginner|intermediate|advanced",
    "preferredLanguages": ["javascript", "python", "java"],
    "learningGoals": ["web-development", "algorithms", "system-design"]
  },
  "preferences": {
    "learningStyle": "visual|auditory|kinesthetic",
    "peerInteractionLevel": "high|medium|low"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "user": {
    "id": "string",
    "skillLevel": "string",
    "generatedPeers": [
      {
        "id": "string",
        "name": "string",
        "avatar": "string",
        "specialization": "string"
      }
    ]
  }
}
```

**Error Responses**:
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - User not authenticated
- `500 Internal Server Error` - Server error

---

### User Profile API

#### GET `/api/user/profile`

Retrieves the current user's profile information.

**Authentication**: Required

**Response**:
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "avatar": "string",
  "skillLevel": "beginner|intermediate|advanced",
  "preferences": {
    "learningStyle": "string",
    "peerInteractionLevel": "string"
  },
  "stats": {
    "completedLessons": "number",
    "totalPoints": "number",
    "streakDays": "number",
    "rank": "number"
  },
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### PUT `/api/user/profile`

Updates the current user's profile information.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "string",
  "preferences": {
    "learningStyle": "visual|auditory|kinesthetic",
    "peerInteractionLevel": "high|medium|low"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    // Updated user object
  }
}
```

---

### Database Test API

#### GET `/api/database/test`

Tests database connectivity and returns connection status.

**Authentication**: Not required (for development/testing)

**Response**:
```json
{
  "status": "connected|error",
  "message": "string",
  "timestamp": "string",
  "database": {
    "host": "string",
    "connected": "boolean"
  }
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-24T12:00:00Z"
}
```

### Common Error Codes

- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks required permissions
- `VALIDATION_ERROR` - Request data validation failed
- `NOT_FOUND` - Requested resource not found
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Server-side error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **General endpoints**: 100 requests per minute per user
- **AI-powered endpoints**: 20 requests per minute per user
- **Database operations**: 50 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## WebSocket Endpoints

For real-time features like collaborative coding and live chat:

### Collaborative Coding
- **Endpoint**: `ws://localhost:3000/ws/coding/collaborative`
- **Authentication**: Required via query parameter `?token=<session_token>`

### Live Chat
- **Endpoint**: `ws://localhost:3000/ws/chat`
- **Authentication**: Required via query parameter `?token=<session_token>`

## SDK Usage Examples

### JavaScript/TypeScript

```typescript
// API client wrapper
class APIClient {
  private baseURL = '/api';
  
  async request(endpoint: string, options: RequestInit = {}) {
    const { getToken } = useAuth();
    const token = await getToken();
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  }
  
  // Onboarding
  async submitOnboarding(data: OnboardingData) {
    return this.request('/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // User Profile
  async getProfile() {
    return this.request('/user/profile');
  }
  
  async updateProfile(data: ProfileUpdateData) {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}
```

## Testing

Use the provided test endpoints to verify API functionality:

```bash
# Test database connection
curl http://localhost:3000/api/database/test

# Test authenticated endpoint (requires valid session)
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/dashboard
```