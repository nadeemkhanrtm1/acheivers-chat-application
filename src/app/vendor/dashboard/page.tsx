'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, orderBy, limit } from 'firebase/firestore';
import ChatBox from '@/components/ChatBox';

interface Vendor {
    id: string;
    email: string;
    name: string;
}

interface Conversation {
    id: string;
    customerId: string;
    customerName: string;
    lastMessage: string;
    lastMessageTime: number;
    unreadCount: number;
}

export default function VendorDashboard() {
    const router = useRouter();
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [chatLink, setChatLink] = useState<string>('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [copiedLink, setCopiedLink] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if vendor is logged in
        const vendorData = localStorage.getItem('vendor');
        if (!vendorData) {
            router.push('/vendor/login');
            return;
        }

        const parsedVendor = JSON.parse(vendorData);
        setVendor(parsedVendor);

        // Generate vendor's unique chat link
        const link = `${window.location.origin}/chat/${parsedVendor.id}`;
        setChatLink(link);

        // Load conversations
        loadConversations(parsedVendor.id);
    }, [router]);

    const loadConversations = async (vendorId: string) => {
        try {
            // Listen to all chat rooms where this vendor is involved
            const roomsRef = collection(db, 'chatRooms');
            const q = query(roomsRef, where('vendorId', '==', vendorId));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const convos: Conversation[] = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();

                    // Handle both Firebase Timestamp and number timestamps
                    let timestamp = Date.now();
                    if (data.lastMessageTime) {
                        if (typeof data.lastMessageTime === 'number') {
                            timestamp = data.lastMessageTime;
                        } else if (data.lastMessageTime.toMillis) {
                            // Firebase Timestamp object
                            timestamp = data.lastMessageTime.toMillis();
                        }
                    }

                    convos.push({
                        id: doc.id,
                        customerId: data.customerId || '',
                        customerName: data.customerName || 'Unknown Customer',
                        lastMessage: data.lastMessage || 'No messages yet',
                        lastMessageTime: timestamp,
                        unreadCount: data.unreadCount || 0,
                    });
                });

                // Sort by last message time
                convos.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
                setConversations(convos);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error('Error loading conversations:', error);
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(chatLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem('vendor');
        router.push('/vendor/login');
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (!vendor) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-lg border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-base sm:text-xl font-bold text-slate-800 dark:text-white truncate">
                                    Vendor Dashboard
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">
                                    Welcome, <span className="font-semibold text-purple-600 dark:text-purple-400">{vendor.name}</span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg 
                       hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg 
                       font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0"
                        >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar - Conversations List */}
                <div className={`
                    ${selectedConversation ? 'hidden md:flex' : 'flex'}
                    w-full md:w-96 bg-white dark:bg-slate-800 
                    border-r border-slate-200 dark:border-slate-700 
                    flex-col
                `}>
                    {/* Your Chat Link */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-700">
                        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your Chat Link</h2>
                        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                            <code className="text-xs font-mono text-slate-700 dark:text-slate-300 flex-1 truncate">
                                {chatLink}
                            </code>
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                                title="Copy link"
                            >
                                {copiedLink ? (
                                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                            Share this link with customers to start conversations
                        </p>
                    </div>

                    {/* Conversations Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                            Conversations ({conversations.length})
                        </h2>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-2">No conversations yet</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                    Share your chat link with customers to start receiving messages
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                {conversations.map((conv) => (
                                    <button
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${selectedConversation?.id === conv.id
                                            ? 'bg-indigo-50 dark:bg-slate-700 border-l-4 border-indigo-500'
                                            : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
                                                {conv.customerName}
                                            </h3>
                                            <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                                                {formatTime(conv.lastMessageTime)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                            {conv.lastMessage}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <div className="mt-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                                                    {conv.unreadCount} new
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`
                    ${selectedConversation ? 'flex' : 'hidden md:flex'}
                    flex-1 flex-col bg-slate-100 dark:bg-slate-900
                    absolute md:relative inset-0 md:inset-auto
                    z-10 md:z-auto
                `}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* Back Button for Mobile */}
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors -ml-2"
                                            aria-label="Back to conversations"
                                        >
                                            <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>

                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                            {selectedConversation.customerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-slate-800 dark:text-white">
                                                {selectedConversation.customerName}
                                            </h2>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">Customer</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-hidden">
                                <ChatBox
                                    roomId={selectedConversation.id}
                                    currentUserId={vendor.id}
                                    currentUserName={vendor.name}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                                    Select a conversation
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                    Choose a customer from the list to view and respond to messages
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
