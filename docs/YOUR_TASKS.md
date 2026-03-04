# What You Need to Do (Your Tasks)

This document clearly outlines what YOU need to do on your side to set up CODO, especially for production deployment.

## 🎯 Overview

For **local development**: You don't need to do anything in Firebase Console! Just follow the Quick Start guide.

For **production deployment**: You need to complete several steps in Firebase Console and configure your environment.

---

## 📋 Local Development (No Firebase Console Needed)

### What You Need to Do

1. **Install Node.js 20+**
   - Download from https://nodejs.org/

2. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Clone and install dependencies**
   ```bash
   git clone <your-repo>
   cd codo
   npm install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and uncomment:
   ```env
   FIRESTORE_EMULATOR_HOST=localhost:8080
   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
   ```

5. **Start services**
   ```bash
   # Terminal 1: Start Firebase Emulators
   npm run emulator
   
   # Terminal 2: Start Next.js App
   npm run dev
   ```

✅ **Done! You're ready to develop locally.**

---

## 🚀 Production Deployment (Firebase Console Required)

### Step 1: Create Firebase Project

**Where:** https://console.firebase.google.com/

**What to do:**
1. Click **"Add project"**
2. Enter project name: `codo-production` (or your choice)
3. Click **"Create project"**

---

### Step 2: Enable Firestore Database

**Where:** Firebase Console → Firestore Database

**What to do:**
1. Click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. **Security rules**: Select **"Start in production mode"**
4. **Location**: Choose closest to your users
5. Click **"Enable"**

---

### Step 3: Enable Authentication

**Where:** Firebase Console → Authentication

**What to do:**
1. Click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"** row
5. Toggle **"Enable"** to ON
6. Click **"Save"**

---

### Step 4: Generate Service Account Key

**⚠️ CRITICAL: This file contains sensitive credentials!**

**Where:** Firebase Console → Project Settings → Service Accounts

**What to do:**
1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Click **"Project settings"**
3. Go to **"Service Accounts"** tab
4. Click **"Generate new private key"** button
5. Click **"Generate key"** in the confirmation popup
6. A JSON file will download automatically
7. **Save this file securely** (e.g., `codo-firebase-key.json`)

**⚠️ IMPORTANT:**
- **DO NOT commit this file to Git**
- **DO NOT share this file publicly**

---

### Step 5: Configure Environment Variables

**Where:** Your project → `.env.local` file

**What to do:**
1. Open the downloaded JSON file (from Step 4)
2. Add/update these lines in `.env.local`:

```env
NODE_ENV=production
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

3. **Remove or comment out** emulator settings:
```env
# FIRESTORE_EMULATOR_HOST=localhost:8080
# FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

---

### Step 6: Deploy Security Rules and Indexes

**Where:** Your terminal

**What to do:**
1. **Login to Firebase:**
   ```bash
   firebase login
   ```
2. **Select your project:**
   ```bash
   firebase use --add
   ```
3. **Deploy Firestore security rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```
4. **Deploy Firestore indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

---

### Step 7: Verify Production Setup

**What to do:**
1. **Start the application:**
   ```bash
   npm run build
   npm start
   ```

2. **Check the app:**
   Open http://localhost:3000 and verify login works and app boots securely.

✅ **Done! Production setup is complete.**

---

## 🔐 Security Reminders

### DO NOT:
- ❌ Commit service account JSON file to Git
- ❌ Share service account credentials publicly

### DO:
- ✅ Add `*.json` and `.env*` to `.gitignore`
- ✅ Use environment variables for credentials
