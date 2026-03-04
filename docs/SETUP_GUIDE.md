# CODO Complete Setup Guide

This guide walks you through everything you need to set up and run the CODO platform, including what you need to do on your side (Firebase Console, etc.).

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (5 Minutes)](#quick-start-5-minutes)
3. [Firebase Setup (Your Side)](#firebase-setup-your-side)
4. [Environment Setup](#environment-setup)
5. [Verification](#verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js 20+** - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Required Accounts

- **Firebase Account** - [Sign up](https://firebase.google.com/)
  - You'll need this to create a Firebase project
  - Free tier is sufficient for development

---

## Quick Start (5 Minutes)

### For Local Development (No Production Firebase Needed)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd codo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure:
   ```env
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
   FIRESTORE_EMULATOR_HOST=localhost:8080
   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
   ```

5. **Start Firebase Emulators** (Terminal 1)
   ```bash
   npm run emulator
   ```
   
   Wait for: `✔  All emulators ready!`

6. **Start Next.js App** (Terminal 2)
   ```bash
   npm run dev
   ```
   
   Wait for server to start on port 3000.

7. **Open your browser**
   - App & API: http://localhost:3000
   - Firebase Emulator UI: http://localhost:4000

✅ **You're ready to develop!**

---

## Firebase Setup (Your Side)

### Option 1: Local Development with Emulators (Recommended)

**No Firebase Console setup needed!** The emulators provide everything locally.

**What you get:**
- ✅ Local Firestore database
- ✅ Local Authentication
- ✅ No internet required
- ✅ Free (no Firebase costs)
- ✅ Fast development

**Already done in Quick Start above!**

### Option 2: Production Firebase Project

**When you need this:**
- Deploying to production
- Testing with real Firebase services
- Sharing with others online

**Steps to complete on your side:**

#### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `codo-production` (or your choice)
4. **Google Analytics**: Optional (you can disable for now)
5. Click **"Create project"**
6. Wait for project creation (1-2 minutes)

#### 2. Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. **Security rules**: Choose **"Start in production mode"**
4. **Location**: Choose closest to your users
5. Click **"Enable"**
6. Wait for database creation (1-2 minutes)

#### 3. Enable Authentication

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the toggle
6. Click **"Save"**

#### 4. Generate Service Account Key

**⚠️ IMPORTANT: This file contains sensitive credentials!**

1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **"Project settings"**
3. Go to **"Service Accounts"** tab
4. Click **"Generate new private key"**
5. A JSON file will download - **save it securely**
6. **DO NOT commit this file to Git!**
7. **DO NOT share this file publicly!**

#### 5. Configure Your Environment

1. Open the downloaded JSON file
2. Copy these values to `.env.local`:

```env
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

#### 6. Deploy Security Rules and Indexes

```bash
# Login to Firebase
firebase login

# Select your project
firebase use --add

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

#### 7. Remove Emulator Configuration

In `.env.local`, comment out or remove:
```env
# FIRESTORE_EMULATOR_HOST=localhost:8080
# FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

✅ **Firebase production setup complete!**

---

## Environment Setup

### Environment Configuration

1. **Copy example environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` file:**

**For Local Development:**
```env
NODE_ENV=development
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project

# Firebase Emulator (uncomment these)
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

**For Production:**
```env
NODE_ENV=production

# Firebase Production
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

### Start Development Server

```bash
npm run dev
```

The application will start on http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

Built files will be in the `.next/` folder.

---

## Verification

### 1. Check Application Health

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-03T...",
  "environment": "development"
}
```

### 2. Check Firebase Emulator UI

Open http://localhost:4000 in your browser.

You should see:
- Firestore tab (view database)
- Authentication tab (manage users)

### 3. Check App

Open http://localhost:3000 in your browser.

You should see the CODO landing page.

---

## Troubleshooting

### Port Already in Use

**Problem**: Error says port 3000 or 4000 is already in use.

**Solution**:

**macOS/Linux:**
```bash
# Find process on port 3000
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

**Windows:**
```bash
# Find process on port 3000
netstat -ano | findstr :3000
# Note the PID, then:
taskkill /PID <PID> /F
```

### Firebase Emulator Won't Start

**Problem**: Emulator fails to start or shows errors.

**Solutions**:

1. **Check Firebase CLI is installed:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Check firebase.json exists:**
   ```bash
   ls -la firebase.json
   ```

### Application Can't Connect to Firebase

**Problem**: App shows Firebase connection errors.

**Solutions**:

**For Emulator Mode:**
1. Ensure emulators are running: `npm run emulator`
2. Check `.env.local` has emulator settings uncommented.
3. Verify emulator is accessible:
   ```bash
   curl http://localhost:8080
   ```

**For Production Mode:**
1. Check `FIREBASE_PROJECT_ID` and `NEXT_PUBLIC_FIREBASE_PROJECT_ID` match your Firebase Console
2. Verify `FIREBASE_PRIVATE_KEY` has quotes and `\n` characters
3. Ensure Firestore is enabled in Firebase Console

---

## Next Steps

After successful setup:

1. **Explore the Emulator UI**: http://localhost:4000
   - Create test users
   - View Firestore data
   - Monitor authentication

2. **Start Developing**:
   - `app/` contains Next.js routes
   - `components/` contains React components
   - `lib/` and `services/` contains logic and Firebase admin handlers
   - Hot reloading is enabled for both client and server code

Happy coding! 🚀
