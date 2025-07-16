# Hero's Ledger Setup Guide

## Prerequisites

1. **Firebase Project** - You should have created a Firebase project called "hero-s-ledger"
2. **Environment Variables** - Your `.env.local` file should be configured

## Quick Setup Checklist

### 1. Firebase Console Setup

**Enable Authentication:**
1. Go to https://console.firebase.google.com/project/hero-s-ledger/authentication
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable these providers:
   - ✅ **Email/Password**
   - ✅ **Google**

**Enable Firestore:**
1. Go to https://console.firebase.google.com/project/hero-s-ledger/firestore
2. Click "Create database"
3. Start in **"test mode"** (we'll deploy rules later)
4. Choose your region (e.g., us-central1)

### 2. Environment Variables

Your `.env.local` should contain:
```
REACT_APP_FIREBASE_API_KEY=AIzaSyBfbtxAww4AtUW_0nAVa9xFZX-CTwwu6Fw
REACT_APP_FIREBASE_AUTH_DOMAIN=hero-s-ledger.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hero-s-ledger
REACT_APP_FIREBASE_STORAGE_BUCKET=hero-s-ledger.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=559329083294
REACT_APP_FIREBASE_APP_ID=1:559329083294:web:8bffb0f49a988857ace08f
```

### 3. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Or deploy everything
npm run deploy
```

### 4. Run the Application

```bash
# Install dependencies
npm install

# Start development server
npm start
```

## Testing Steps

### Phase 1: Authentication
1. Open http://localhost:3000
2. Try signing up with email/password
3. Try signing in with Google
4. Verify user info appears in header

### Phase 2: Characters
1. Go to "Character Manager" tab
2. Create a test character
3. Set up character stats
4. Test combat tracker

### Phase 3: Campaigns
1. Go to "Campaigns" tab
2. Create a campaign (as DM)
3. Note the invite code
4. Open incognito window
5. Join campaign with invite code
6. Test character selection

### Phase 4: Notes
1. Enter a campaign
2. Create different types of notes (personal, shared, DM)
3. Test real-time updates (open multiple windows)
4. Test reactions and filtering

## Common Issues

### Firebase Connection Errors
- Check console for missing environment variables
- Verify Firebase project ID matches
- Ensure Authentication and Firestore are enabled

### Character Data Not Loading
- Check browser's localStorage
- Verify user authentication is working
- Check console for storage key errors

### Campaign Creation Fails
- Verify user has DM permissions
- Check Firestore rules are deployed
- Ensure database is in test mode initially

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firebase Console settings
3. Check network connectivity
4. Try refreshing the page
5. Clear browser cache if needed