# Vendor Chat Platform

A real-time chat platform where vendors can connect with customers through unique chat links.

## 🚀 Features

- **Single Chat Link per Vendor** - Each vendor gets one unique link to share
- **Multiple Customer Conversations** - Handle unlimited customer chats simultaneously
- **Real-time Messaging** - Powered by Firebase Firestore
- **Beautiful UI** - Modern gradient design with dark mode support
- **Responsive** - Works on mobile, tablet, and desktop

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/
│   │   └── add-vendor/      # Admin panel to add new vendors
│   ├── chat/
│   │   └── [linkId]/        # Customer chat interface (accessed via vendor link)
│   ├── vendor/
│   │   ├── login/           # Vendor authentication
│   │   └── dashboard/       # Vendor dashboard with conversations
│   └── page.tsx             # Homepage with navigation
├── components/
│   ├── ChatBox.tsx          # Reusable chat component
│   └── LoginForm.tsx        # Login form component
└── lib/
    └── firebase.ts          # Firebase configuration
```

## 🔗 Routes

| Route | Purpose | Users |
|-------|---------|-------|
| `/` | Homepage with navigation | Everyone |
| `/admin/add-vendor` | Add new vendors | Admins |
| `/vendor/login` | Vendor authentication | Vendors |
| `/vendor/dashboard` | Manage conversations | Vendors |
| `/chat/[vendorId]` | Customer chat | Customers |

## 🎯 How It Works

### For Vendors:
1. Login at `/vendor/login`
2. Get your unique chat link from the dashboard
3. Share this link with customers (email, blog, social media, etc.)
4. View all customer conversations in the sidebar
5. Click on any conversation to chat

### For Customers:
1. Click on vendor's shared link
2. Enter your name
3. Start chatting instantly
4. Your conversation is private and saved

## 💾 Database Structure

### Collections:

**vendors/**
```typescript
{
  id: string;
  name: string;
  email: string;
  password: string;
  company: string;
  createdAt: number;
}
```

**chatRooms/**
```typescript
{
  id: string;              // Format: room_{vendorId}_{customerId}
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  createdAt: number;
}
```

**messages/** (subcollection of chatRooms)
- Stores individual chat messages
- Real-time sync via Firestore

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Configure Firebase:**
   - Create a Firebase project
   - Add your config to `.env.local`:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

3. **Run development server:**
   ```bash
   pnpm dev
   ```

4. **Add your first vendor:**
   - Visit `http://localhost:3000/admin/add-vendor`
   - Create a vendor account

5. **Login as vendor:**
   - Visit `http://localhost:3000/vendor/login`
   - Use the credentials you created

## 🎨 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Database:** Firebase Firestore
- **Language:** TypeScript
- **Package Manager:** pnpm

## 📝 Key Concepts

### Single Link Architecture
- Each vendor has ONE permanent chat link (based on their vendor ID)
- Multiple customers can use the same link
- Each customer-vendor pair gets a unique chat room
- Vendor sees all conversations in one dashboard

### Room ID Format
- Customer rooms: `room_{vendorId}_{customerId}`
- Ensures unique conversation per customer
- Easy to query and manage

## 🔐 Security Notes

⚠️ **Current Implementation:** Basic demo authentication

**For Production:**
- Implement Firebase Authentication
- Hash passwords (bcrypt/argon2)
- Add Firestore security rules
- Implement rate limiting
- Add input sanitization
- Use HTTPS
- Add session management

## 📚 Documentation

See `NEW_ARCHITECTURE.md` for detailed explanation of the system architecture.

## 🎊 Summary

This platform enables vendors to:
- ✅ Share ONE chat link with all customers
- ✅ Manage unlimited customer conversations
- ✅ Chat in real-time with beautiful UI
- ✅ Track conversation history
- ✅ Provide instant customer support

Perfect for customer support, sales inquiries, and customer engagement!
