# Documentation Structure

Visual guide to the CODO project and documentation structure.

## 📁 Project Folder Structure

```
codo/
│
├── docs/                           # 📚 ALL DOCUMENTATION HERE
│   │
│   ├── README.md                   # Documentation overview & navigation
│   ├── SETUP_GUIDE.md             # 🚀 START HERE - Complete setup
│   ├── QUICK_START.md             # ⚡ 5-minute quick start
│   ├── YOUR_TASKS.md              # 📋 What YOU need to do
│   ├── DOCUMENTATION_INDEX.md     # 📖 Complete index
│   ├── STRUCTURE.md               # This file
│   └── CHANGES_SUMMARY.md         # Summary of architectural changes
│   │
│   └── firebase/                  # 🔥 Firebase documentation
│       └── FIREBASE_SETUP.md      # Firebase Console setup steps
│
├── app/                            # Next.js App Router (pages + API routes)
│   ├── (auth)/                    # Auth group (login, sign-up)
│   ├── (dashboard)/               # Dashboard group
│   ├── api/                       # API Routes (server-side endpoints)
│   │   ├── auth/                  # Authentication endpoints
│   │   ├── challenges/            # Challenge management
│   │   ├── submissions/           # Submission handling
│   │   ├── leaderboards/          # Leaderboard data
│   │   ├── guilds/                # Guild management
│   │   ├── lessons/               # Lesson content
│   │   ├── progress/              # Progress tracking
│   │   ├── notifications/         # Notifications
│   │   └── health/                # Health check
│   └── layout.tsx                 # Root layout
│
├── components/                     # React components
├── lib/                            # Firebase client + shared utilities
│   ├── firebase-admin.ts          # Firebase Admin SDK (server-side)
│   ├── firebase.ts                # Firebase Client SDK (client-side)
│   └── middleware/                # Auth middleware helpers
│
├── hooks/                          # React hooks
├── __tests__/                      # Test files
│   └── api/                       # API route tests
├── firebase/                       # Firebase config files
│   ├── firestore.rules            # Firestore security rules
│   └── firestore.indexes.json     # Composite index definitions
├── .kiro/                          # Design & requirement specs
│   └── specs/Codo/
│       ├── design.md              # Technical design document
│       ├── requirements.md        # System requirements
│       ├── firebase-data-model.md # Firestore data model
│       └── tasks.md               # Development tasks
├── .env.local                      # Local environment variables (git-ignored)
├── .env.example                    # Environment template
├── firebase.json                   # Firebase Emulator configuration
├── .firebaserc                     # Firebase project selection
├── next.config.js                  # Next.js configuration
├── middleware.ts                   # Next.js edge middleware (auth protection)
├── package.json
└── tsconfig.json
```

## 🎯 Documentation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     NEW USER ARRIVES                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   docs/README.md       │  ← Documentation overview
         │   (Start here)         │
         └────────┬───────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌──────────────────┐
│ Quick Setup?  │   │ Complete Setup?  │
└───────┬───────┘   └────────┬─────────┘
        │                    │
        ▼                    ▼
┌───────────────┐   ┌──────────────────┐
│ QUICK_START   │   │ SETUP_GUIDE      │
│ (5 minutes)   │   │ (comprehensive)  │
└───────┬───────┘   └────────┬─────────┘
        │                    │
        │                    ▼
        │           ┌──────────────────┐
        │           │ YOUR_TASKS       │
        │           │ (what to do)     │
        │           └────────┬─────────┘
        │                    │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────┐
        │ firebase/      │
        │ FIREBASE_SETUP │
        └────────────────┘
```

## 📖 Documentation Types

### 🚀 Getting Started Guides

```
SETUP_GUIDE.md
├── Prerequisites
├── Quick Start (5 min)
├── Firebase Setup (Your Side)
│   ├── Create Project
│   ├── Enable Firestore
│   ├── Enable Auth
│   ├── Generate Key
│   └── Configure .env.local
├── Environment Setup
├── Verification
└── Troubleshooting

QUICK_START.md
├── Install Dependencies (npm install)
├── Configure Environment (.env.local)
├── Start Firebase Emulators
└── Start Next.js (npm run dev)

YOUR_TASKS.md
├── Local Development Tasks
│   └── (Almost nothing!)
└── Production Tasks
    ├── Firebase Console Steps
    ├── Environment Config
    └── Deploy Rules
```

### 🔥 Firebase Documentation

```
firebase/FIREBASE_SETUP.md
├── Quick Start (Emulators)
│   ├── Install Firebase CLI
│   ├── Start Emulators
│   └── Configure .env.local
├── Production Setup
│   ├── Create Project
│   ├── Enable Services
│   ├── Generate Credentials
│   └── Deploy Rules
└── Troubleshooting
```

## 🗺️ Navigation Map

### By User Type

```
New Developer (First Time)
    ↓
    docs/SETUP_GUIDE.md
    ↓
    docs/YOUR_TASKS.md

Experienced Developer (Quick Setup)
    ↓
    docs/QUICK_START.md
    ↓
    Start coding!

Production Deployer
    ↓
    docs/YOUR_TASKS.md (Production section)
    ↓
    docs/firebase/FIREBASE_SETUP.md
```

### By Task

```
"I want to run the project"
    → docs/QUICK_START.md

"I want to deploy to production"
    → docs/YOUR_TASKS.md (Production section)
    → docs/firebase/FIREBASE_SETUP.md

"I want to configure Firebase"
    → docs/firebase/FIREBASE_SETUP.md

"I have an error"
    → docs/SETUP_GUIDE.md (Troubleshooting)
```

## 🎯 Quick Reference

### Essential Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `docs/README.md` | Documentation overview | Finding documentation |
| `docs/SETUP_GUIDE.md` | Complete setup | First time setup |
| `docs/QUICK_START.md` | Fast setup | Quick local dev |
| `docs/YOUR_TASKS.md` | Your tasks | Know what to do |
| `docs/DOCUMENTATION_INDEX.md` | Complete index | Find specific topic |

### By Environment

| Environment | Files to Read |
|-------------|---------------|
| **Local Development** | QUICK_START.md |
| **Production** | SETUP_GUIDE.md → YOUR_TASKS.md → firebase/FIREBASE_SETUP.md |

### By Topic

| Topic | Files |
|-------|-------|
| **Firebase** | firebase/FIREBASE_SETUP.md |
| **Architecture** | .kiro/specs/Codo/design.md |
| **Requirements** | .kiro/specs/Codo/requirements.md |
| **Data Model** | .kiro/specs/Codo/firebase-data-model.md |

---

**Need help navigating?** → [docs/README.md](./README.md)

**Want to start?** → [docs/SETUP_GUIDE.md](./SETUP_GUIDE.md)

**Looking for something?** → [docs/DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
