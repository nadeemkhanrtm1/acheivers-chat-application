# 🚀 Quick Start Guide

## ⚡ 3-Minute Setup

### Step 1: Firebase (2 minutes)
1. Go to https://console.firebase.google.com/
2. Click "Add project" → Name it → Create
3. Click "Firestore Database" → "Create database" → "Test mode" → Enable
4. Click ⚙️ Settings → Scroll down → Click `</>` web icon
5. Copy the config values

### Step 2: Configure (30 seconds)
Open `.env.local` and paste your Firebase values:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 3: Run (30 seconds)
```bash
# If not already running:
pnpm dev
```

If the server is already running, restart it (Ctrl+C, then `pnpm dev`)

### Step 4: Test! 🎉
1. Open http://localhost:3000
2. Enter your name → Join Chat
3. Send a message
4. Open in another browser/incognito tab
5. Login with different name
6. See messages sync in real-time! ✨

---

## 📱 How to Chat with a Friend

### Option 1: Same Network
1. Find your local IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
2. Share: `http://YOUR_IP:3000`
3. Friend opens that URL
4. Both use the same room ID

### Option 2: Deploy to Vercel (Free)
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repo
4. Add environment variables
5. Deploy!
6. Share the Vercel URL with your friend

---

## 🎯 Common Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Install new package
pnpm add package-name
```

---

## 🆘 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
→ Update `.env.local` and restart server

### Messages not appearing
→ Check Firebase Console → Firestore Database → Verify data is being written

### "Permission denied"
→ Ensure Firestore is in "test mode"

### Changes not showing
→ Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

---

## 📚 Documentation

- **Full Setup**: See `FIREBASE_SETUP.md`
- **Features**: See `PROJECT_SUMMARY.md`
- **General Info**: See `README.md`

---

**Need help?** Check the browser console (F12) for error messages!
