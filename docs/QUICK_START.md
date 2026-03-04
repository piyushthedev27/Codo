# Quick Start Guide

Get the CODO application running in 5 minutes!

## Prerequisites

- Node.js 20+
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and ensure your Firebase Emulators or production credentials are set. For local development, uncomment the emulator lines:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

### 3. Start Firebase Emulators

In terminal 1:

```bash
npm run emulator
```

Wait for:
```
✔  All emulators ready!
```

### 4. Start Next.js Development Server

In terminal 2:

```bash
npm run dev
```

Wait for development server to start on Port 3000.

### 5. Verify Setup

Open your browser:

- **App & API**: http://localhost:3000
- **Emulator UI**: http://localhost:4000

## You're Ready! 🎉

The application is now running with:
- ✅ Next.js 14 App Router on port 3000 (Frontend + API Routes)
- ✅ Firebase Emulators (Firestore + Auth)
- ✅ Emulator UI for data inspection
- ✅ Hot reload enabled

## Common Commands

```bash
# Start emulators
npm run emulator

# Start Next.js (development mode with hot reload)
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

## Next Steps

1. **Explore the Emulator UI**: http://localhost:4000
   - Create test users in Authentication
   - View Firestore collections
   - Monitor real-time updates

2. **Read the Documentation**:
   - [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
   - [FIREBASE_SETUP.md](./firebase/FIREBASE_SETUP.md) - Firebase configuration guide
   - [README.md](./README.md) - Project overview

## Troubleshooting

### Port Already in Use

If you see "Port already in use" errors:

```bash
# Kill processes on emulator or Next.js ports
lsof -ti:8080 | xargs kill -9  # Firestore
lsof -ti:9099 | xargs kill -9  # Auth
lsof -ti:4000 | xargs kill -9  # UI
lsof -ti:3000 | xargs kill -9  # Next.js
```

### Next.js Won't Start

1. Check that you ran `npm install` in the root folder.
2. Verify `.env.local` is present and configured.
3. Check logs for specific errors in the terminal.

## Need Help?

- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions
- Review [FIREBASE_SETUP.md](./firebase/FIREBASE_SETUP.md) for Firebase-specific issues
