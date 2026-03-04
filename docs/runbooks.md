# CODO Operational Runbooks

This guide documents routine operational tasks, maintenance, and troubleshooting procedures for the CODO platform.

## 1. Orphan Cleanup (`integrityChecker.ts`)

Occasionally, challenges might be deleted by administrators after users have already submitted code against them. This leaves "orphaned" submissions or leaderboards.

### Running Orphan Cleanup
We have built an `integrityChecker` module located in `lib/firebase/integrityChecker.ts`.
In a production environment, this should be executed via a secure cron job (e.g., using a Google Cloud Scheduler hitting an authenticated admin endpoint) or triggered manually via a script running in the Google Cloud Shell containing the Firebase Admin credentials.

```typescript
// Example usage:
import { deleteOrphanedSubmissions } from './lib/firebase/integrityChecker';

async function runMaintenance() {
   const count = await deleteOrphanedSubmissions();
   console.log(`Deleted ${count} orphaned submissions.`);
}
```

---

## 2. Cascade User Deletion

When a user requests account deletion (GDPR/CCPA compliance), ensure ALL data is removed. `integrityChecker.ts` also contains `deleteUserData(userId)` which cascades deletes across:
- `submissions`
- `notifications`
- `mistakeAnalysis`
- `progress`
- `users`

---

## 3. Database Backups

Firestore supports automated managed exports.

### Setting up Scheduled Backups
You can use **Google Cloud Scheduler** and **Cloud Functions** to trigger nightly exports of the Firestore database into a Cloud Storage bucket:

1. Create a Google Cloud Storage bucket (e.g., `gs://codo-firestore-backups`).
2. Follow the [GCP Schedule Exports guide](https://firebase.google.com/docs/firestore/manage-data/export-import).
3. Ensure the service account writing the backup has `Owner` or `Datastore Import Export Admin` roles.

---

## 4. Troubleshooting Common Issues

### Issue: Firebase Admin SDK Auth Errors (`auth/argument-error`)
- **Cause:** The `FIREBASE_PRIVATE_KEY` has malformed newline characters (`\n`).
- **Fix:** In Vercel, ensure the environment variable doesn't have literal escaped string `\n`. It should be stored securely. Alternatively, use the `FIREBASE_SERVICE_ACCOUNT_KEY` JSON string method which avoids the newline parsing issues entirely.

### Issue: Rate Limiting (429 Too Many Requests)
- **Cause:** A user reached the 100 req/min (or 10 req/min for submissions) window.
- **Fix:** If occurring frequently on normal flows, the thresholds in `lib/middleware/rateLimiter.ts` might be too aggressive. Adjust `STANDARD_RATE_LIMIT` accordingly.

### Issue: "Firebase App named '[DEFAULT]' already exists"
- **Cause:** Next.js Hot Module Replacement (HMR) attempts to re-initialize the Firebase Admin SDK.
- **Fix:** Assure you use `getApps().length > 0 ? getApps()[0] : initializeApp()` standard — currently implemented correctly in `lib/firebase/admin.ts` and `lib/firebase/client.ts`.
