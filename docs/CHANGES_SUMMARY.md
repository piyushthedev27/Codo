# CODO Changes Summary

This document summarizes the major architectural changes made to the CODO project during and after its Next.js migration.

---

## 🔄 Migration: Vite + Express → Next.js 14 (App Router)

### Summary

The CODO project was migrated from a **split architecture** (Vite/React frontend + Express.js backend) to a **unified Next.js 14 App Router** application. This single codebase handles both the user-facing frontend and all API endpoints.

### What Changed

| Area | Before | After |
|------|--------|-------|
| **Framework** | Vite + React 18 | Next.js 14 (App Router) |
| **Routing** | React Router 7 | Next.js App Router (file-system routing) |
| **Backend** | Separate Express.js service | Next.js API Routes (`app/api/`) |
| **Ports** | Frontend: 5173, Backend: 3000 | Unified: 3000 |
| **Styling** | Tailwind + global CSS | Tailwind + Next.js CSS setup |
| **Environment** | `backend/.env` + root `.env` | Single `.env.local` at root |
| **Build** | Dual npm builds | Single `npm run build` |
| **Package installs** | Two `npm install` commands | Single `npm install` |
| **Containerization** | None | None |

---

## 🗄️ Database: PostgreSQL/Redis → Firebase Firestore

The backend storage was changed to use **Firebase Firestore** exclusively, removing any previous reliance on PostgreSQL or Redis.

### Firestore Collections Used

| Collection | Purpose |
|------------|---------|
| `users` | User profiles and statistics |
| `challenges` | Coding problems with test cases |
| `submissions` | User code submissions and results |
| `guilds` | Guild information |
| `guildInvitations` | Guild invitation records |
| `lessons` | Educational content |
| `progress` | User lesson progress tracking |
| `notifications` | User notifications |
| `mistakeAnalysis` | Error analysis for failed submissions |

Full Firestore schema is in `.kiro/specs/Codo/firebase-data-model.md`.

---

## 🔑 Authentication

Authentication has always been **Firebase Authentication** — this did not change. Passwords are never stored in the application.

---

## 📡 API Endpoints

All API routes now live inside `app/api/` using Next.js Route Handlers:

```
/api/auth/register
/api/auth/login
/api/auth/logout
/api/auth/verify
/api/users/:userId
/api/challenges
/api/challenges/:challengeId
/api/submissions
/api/leaderboards/global
/api/guilds
/api/lessons
/api/progress
/api/notifications
/api/health
```

---

## 📁 Removed Components

The following are **no longer present** in the project:

- **`backend/` folder** — Replaced by Next.js API routes in `app/api/`
- **Docker / Redis** — Not used
- **Express.js** — Replaced by Next.js Route Handlers
- **`docs/backend/` folder** — Was specific to the old Express setup

---

## ✅ Preserved Features

- Firebase Authentication (Email/Password)
- Firebase Firestore data model
- Firestore security rules (`firebase/firestore.rules`)
- Firestore composite indexes (`firebase/firestore.indexes.json`)
- Firebase Emulator support for local development
- Jest tests for API logic
- Rate limiting via middleware
- CORS handling via Next.js configuration
