# Firebase Setup Guide

This guide will help you set up Firebase for the CODO backend.

## Quick Start (Local Development)

For local development, we recommend using the Firebase Emulator Suite:

### 1. Install Firebase Tools

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Configure Environment

Copy the example environment file and enable emulator settings:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and uncomment these lines:

```env
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

### 4. Start Firebase Emulators

In one terminal:

```bash
npm run emulator
```

This starts:
- **Firestore Emulator**: `localhost:8080`
- **Auth Emulator**: `localhost:9099`
- **Emulator UI**: `localhost:4000` (view and manage test data)

### 5. Start Backend Server

In another terminal:

```bash
cd backend
npm run dev
```

The backend will automatically connect to the emulators.

### 6. Access Emulator UI

Open your browser to `http://localhost:4000` to:
- View Firestore data
- Manage test users
- Monitor authentication
- Clear data between tests

## Production Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "codo-production")
4. Follow the setup wizard

### 2. Enable Firestore

1. In Firebase Console, navigate to "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a database location (closest to your users)

### 3. Enable Authentication

1. Navigate to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save changes

### 4. Generate Service Account

1. Go to Project Settings (gear icon)
2. Navigate to "Service Accounts" tab
3. Click "Generate new private key"
4. Save the JSON file securely

**⚠️ SECURITY WARNING:** Never commit this file to version control!

### 5. Configure Environment Variables

Extract values from the downloaded JSON file and add to `.env`:

```env
NODE_ENV=production
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

**Important Notes:**
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Preserve the `\n` characters in the private key
- Do NOT remove emulator settings; comment them out instead

### 6. Deploy Security Rules and Indexes

```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### 7. Verify Connection

Start your backend:

```bash
npm run dev
```

Check the logs for:
```
Firebase Admin SDK initialized successfully
```

## Firestore Security Rules

Security rules are defined in `firebase/firestore.rules`. Key features:

- **Authentication Required**: All operations require authentication
- **User Data Protection**: Users can only access their own data
- **Admin Controls**: Only admins can manage challenges and lessons
- **Guild Permissions**: Guild owners control their guild settings
- **Submission Privacy**: Users can only view their own submissions

## Firestore Indexes

Composite indexes in `firebase/firestore.indexes.json` optimize:

- **Leaderboards**: Fast ranking queries
- **User History**: Efficient submission filtering
- **Challenge Discovery**: Quick filtering by difficulty/category
- **Notifications**: Fast unread notification queries

## Emulator Data Persistence

### Export Data

Save emulator data for later use:

```bash
npm run emulator:export
```

Data is saved to `./firebase-data/`

### Import Data

Start emulators with previously exported data:

```bash
npm run emulator:import
```

## Testing with Emulators

### Benefits

- **No Production Impact**: Test freely without affecting real data
- **Fast Iteration**: Instant resets and data manipulation
- **Offline Development**: Work without internet connection
- **Free**: No Firebase usage costs
- **Consistent State**: Export/import data for reproducible tests

### Test User Creation

In the Emulator UI (`localhost:4000`):

1. Go to "Authentication" tab
2. Click "Add user"
3. Enter email and password
4. User is immediately available for testing

### Firestore Data Manipulation

In the Emulator UI:

1. Go to "Firestore" tab
2. Browse collections
3. Add/edit/delete documents
4. View real-time updates

## Troubleshooting

### Emulator Won't Start

**Error**: Port already in use

**Solution**: 
```bash
# Kill processes on emulator ports
lsof -ti:8080 | xargs kill -9
lsof -ti:9099 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

Or change ports in `firebase.json`:

```json
{
  "emulators": {
    "firestore": { "port": 8081 },
    "auth": { "port": 9100 },
    "ui": { "port": 4001 }
  }
}
```

### Backend Can't Connect to Emulator

**Check**:
1. Emulators are running (`npm run emulator`)
2. Environment variables are set correctly in `.env`
3. No firewall blocking localhost connections

**Verify**:
```bash
curl http://localhost:8080
# Should return Firestore emulator info
```

### Production Connection Fails

**Common Issues**:

1. **Invalid Private Key Format**
   - Ensure `\n` characters are preserved
   - Keep quotes around the entire key
   - No extra spaces or line breaks

2. **Wrong Project ID**
   - Verify `FIREBASE_PROJECT_ID` matches Firebase Console
   - Check `.firebaserc` file

3. **Service Account Permissions**
   - Ensure service account has "Firebase Admin SDK Administrator Service Agent" role
   - Check IAM permissions in Google Cloud Console

4. **Firestore Not Enabled**
   - Enable Firestore in Firebase Console
   - Wait a few minutes for provisioning

### Security Rules Deployment Fails

**Error**: Permission denied

**Solution**:
```bash
# Re-authenticate
firebase login --reauth

# Verify project
firebase use --add

# Deploy again
firebase deploy --only firestore:rules
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | Yes | Firebase project ID | `codo-dev` |
| `FIREBASE_PRIVATE_KEY` | Production | Service account private key | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `FIREBASE_CLIENT_EMAIL` | Production | Service account email | `firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com` |
| `FIREBASE_DATABASE_URL` | No | Realtime Database URL | `https://project.firebaseio.com` |
| `FIRESTORE_EMULATOR_HOST` | Development | Firestore emulator address | `localhost:8080` |
| `FIREBASE_AUTH_EMULATOR_HOST` | Development | Auth emulator address | `localhost:9099` |

## Best Practices

### Development

1. **Always use emulators** for local development
2. **Export data regularly** to save test scenarios
3. **Clear emulator data** between test runs for consistency
4. **Use Emulator UI** to inspect and debug data

### Production

1. **Never commit** service account keys
2. **Use environment variables** for all credentials
3. **Deploy security rules** before going live
4. **Monitor Firebase usage** in console
5. **Set up billing alerts** to avoid surprises
6. **Enable audit logging** for security

### Security

1. **Rotate service account keys** regularly
2. **Use least privilege** for service accounts
3. **Review security rules** periodically
4. **Enable App Check** for production
5. **Monitor authentication** for suspicious activity

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review Firebase Console for errors
3. Check backend logs for detailed error messages
4. Consult Firebase documentation
5. Ask in the project's issue tracker
