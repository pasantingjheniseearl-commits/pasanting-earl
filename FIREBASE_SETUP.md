# Firebase Integration Guide

## Overview
Your Stock System now includes Firebase integration with fallback to demo mode. The app will work in demo mode until you configure Firebase.

## How to Get Your Firebase Config

1. **Create Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a new project"
   - Enter your project name (e.g., "Stock System")
   - Follow the setup wizard

2. **Enable Authentication:**
   - In Firebase Console, go to "Authentication"
   - Click "Get started"
   - Enable "Email/Password" method
   - Click "Save"

3. **Get Your Config:**
   - In Firebase Console, go to "Project Settings" (gear icon)
   - Under "Your apps", click "Web (< >)" if not already created
   - Copy the Firebase configuration

4. **Update app.js:**
   - Open `/workspaces/pasanting-earl/app.js`
   - Find the `firebaseConfig` object (around line 7)
   - Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

5. **Create Test Users:**
   - In Firebase Console, go to "Authentication" → "Users"
   - Click "Add user"
   - Create your test accounts, for example:
     - Email: `admin@stock.com` | Password: `admin123`
     - Email: `user@stock.com` | Password: `user123`

## Demo Mode (Default)

Until you add your Firebase config, the app uses **Demo Mode**:
- Test credentials: `admin@stock.com` / `admin123`
- No backend storage
- Data stored in browser localStorage only
- Sessions stored in sessionStorage

## Features Enabled by Firebase

Once configured, you'll get:
- ✓ Real user authentication
- ✓ Persistent user data
- ✓ Real-time database sync
- ✓ User profiles
- ✓ Transaction history storage

## Testing

**With Demo Mode (default):**
```
Email: admin@stock.com
Password: admin123
```

**With Firebase (after setup):**
Use any user account created in Firebase Authentication

## Hybrid Mode

The app automatically switches between:
1. **Firebase** (if configured and available)
2. **Demo Mode** (fallback)

If Firebase fails, it gracefully falls back to demo credentials.

## Files Modified

- `/app.js` - Firebase initialization and login handling
- `/login.html` - Added Firebase SDK scripts
- `/index.html` - Added Firebase SDK scripts

## Firebase SDK Version

Currently using: **Firebase SDK 10.7.1**

For more info: [Firebase Documentation](https://firebase.google.com/docs)
