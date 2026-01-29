# 🔥 Firebase Setup Guide

This guide will walk you through setting up Firebase for your chat application.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter a project name (e.g., "Chat App")
4. (Optional) Enable Google Analytics
5. Click **"Create project"**

## Step 2: Enable Firestore Database

1. In your Firebase project, click **"Build"** in the left sidebar
2. Click **"Firestore Database"**
3. Click **"Create database"**
4. Choose **"Start in test mode"** (for development)
   - ⚠️ **Note**: Test mode allows anyone to read/write. Update rules before production!
5. Select your preferred Cloud Firestore location
6. Click **"Enable"**

## Step 3: Get Your Firebase Configuration

1. In the Firebase Console, click the **⚙️ (Settings)** icon
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>`) to add a web app
5. Register your app:
   - App nickname: "Chat App Web"
   - (Optional) Check "Also set up Firebase Hosting"
   - Click **"Register app"**
6. Copy the `firebaseConfig` object

It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 4: Update Your .env.local File

1. Open `.env.local` in your project root
2. Replace the values with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

3. Save the file

## Step 5: Restart Your Development Server

If your dev server is running, restart it to load the new environment variables:

```bash
# Stop the server (Ctrl+C)
# Then start it again
pnpm dev
```

## Step 6: Test Your Setup

1. Open [http://localhost:3000](http://localhost:3000)
2. Enter your name and login
3. Send a test message
4. Open the app in another browser/tab
5. Login with a different name
6. You should see messages sync in real-time!

## Step 7: Verify in Firebase Console

1. Go to Firebase Console → Firestore Database
2. You should see a `chatRooms` collection
3. Inside, you'll see your room with messages

## 🔒 Security Rules (Important!)

### Development (Current)

Your database is in **test mode**, which means:
- ✅ Easy to develop and test
- ❌ Anyone can read/write your data
- ⚠️ **Expires after 30 days**

### Production

Before deploying, update your Firestore rules:

1. Go to Firebase Console → Firestore Database → **Rules**
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chat rooms
    match /chatRooms/{roomId} {
      // Anyone can read rooms (for simplicity)
      allow read: if true;
      
      // Anyone can create/update rooms
      allow create, update: if true;
      
      // Messages in rooms
      match /messages/{messageId} {
        // Anyone can read messages
        allow read: if true;
        
        // Anyone can create messages
        allow create: if true;
        
        // Only prevent deletion
        allow delete: if false;
      }
    }
  }
}
```

3. Click **"Publish"**

### Even More Secure (Optional)

If you want to add authentication later:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chatRooms/{roomId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      
      match /messages/{messageId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null && 
          request.resource.data.senderId == request.auth.uid;
        allow delete: if false;
      }
    }
  }
}
```

## 🎯 Database Structure

Your Firestore database will have this structure:

```
chatRooms (collection)
  └── {roomId} (document)
      ├── id: string
      ├── participants: array
      ├── createdAt: timestamp
      └── messages (subcollection)
          └── {messageId} (document)
              ├── text: string
              ├── senderId: string
              ├── senderName: string
              └── timestamp: timestamp
```

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure you've updated `.env.local` with your actual Firebase config
- Restart your dev server after updating `.env.local`

### Messages not syncing
- Check Firebase Console → Firestore Database
- Verify the `chatRooms` collection exists
- Check browser console for errors
- Ensure Firestore is enabled in Firebase Console

### "Permission denied" errors
- Check your Firestore security rules
- Make sure you're in test mode for development
- Verify the rules allow read/write access

### Environment variables not loading
- Make sure the file is named `.env.local` (not `.env`)
- All variables must start with `NEXT_PUBLIC_`
- Restart the dev server after changes

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

**Need help?** Check the Firebase Console for detailed error messages and logs.
