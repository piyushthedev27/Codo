# CODO Deployment Guide

This guide details the steps to deploy the CODO Next.js backend to Vercel and configure the accompanying Firebase infrastructure.

## 1. Firebase Project Setup

CODO relies on Firebase Auth and Firestore. You must deploy these services before launching the application.

### Prerequisites
- Active Google account
- Firebase CLI installed (`npm install -g firebase-tools`)

### Setup Instructions
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g., `codo-production`).
2. **Enable Firestore**: In the console menu, go to Firestore Database and click "Create database" (choose production rules).
3. **Enable Authentication**: In the console menu, go to Authentication, click "Get started", and enable the **Email/Password** provider.
4. **Generate Service Account Key**:
   - Go to Project Settings > Service Accounts.
   - Click "Generate new private key".
   - Download the JSON file (keep this secure, do not commit it).

### Deploying Firestore Security Rules and Indexes
From the root of the CODO codebase, run:
```bash
firebase login
firebase use codo-production
firebase deploy --only firestore
```
*(This ensures `firestore.rules` and `firestore.indexes.json` are applied).*

---

## 2. Environment Configuration

The CODO backend requires strict environment configuration (handled by `lib/config/env.ts`).

Prepare the following environment variables:

| Variable | Description | Example |
|---|---|---|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | `codo-production` |
| `FIREBASE_CLIENT_EMAIL` | From the service account JSON | `firebase-adminsdk-...@...` |
| `FIREBASE_PRIVATE_KEY` | From the service account JSON | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | For client-side auth | `AIzaSyB...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | For client-side auth | `codo-production.firebaseapp.com` |

> Alternatively, you can supply `FIREBASE_SERVICE_ACCOUNT_KEY` with the stringified JSON file.

---

## 3. Vercel Deployment

CODO is built with Next.js, meaning Vercel is the optimal hosting platform.

### Deployment Steps
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Log into [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your CODO repository.
4. Expand **Environment Variables**:
   - Add all the variables listed in the configuration section above.
   - **Important**: When pasting `FIREBASE_PRIVATE_KEY`, ensure the `\n` characters are properly preserved (do not wrap in extra quotes).
5. Click **Deploy**.

Vercel will automatically run `npm run build` and output the deployment URL.

---

## 4. Post-Deployment Verification
1. Navigate to the Vercel deployment URL.
2. Go to `https://<YOUR-VERCEL-URL>/api-docs` to access the Swagger API Explorer.
3. Test a public endpoint (e.g., Global Leaderboards) or attempt to log in using the frontend to verify database connectivity.
