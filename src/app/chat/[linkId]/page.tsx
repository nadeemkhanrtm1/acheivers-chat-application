'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import ChatBox from '@/components/ChatBox';
import LoginForm from '@/components/LoginForm';

interface VendorData {
    id: string;
    name: string;
    email: string;
    company: string;
}

export default function CustomerChat() {
    const params = useParams();
    const vendorId = params.linkId as string; // This is actually the vendor ID now

    const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
    const [vendorData, setVendorData] = useState<VendorData | null>(null);
    const [roomId, setRoomId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Load user from localStorage
        const savedUser = localStorage.getItem(`chatUser_${vendorId}`);
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setCurrentUser(user);
            // Restore roomId for existing user
            const restoredRoomId = `room_${vendorId}_${user.id}`;
            setRoomId(restoredRoomId);
        }

        // Load vendor data
        loadVendorData();
    }, [vendorId]);

    const loadVendorData = async () => {
        try {
            // Get vendor information
            const vendorsRef = collection(db, 'vendors');
            const vendorDoc = await getDoc(doc(vendorsRef, vendorId));

            if (!vendorDoc.exists()) {
                setError('Invalid chat link. Vendor not found.');
                setLoading(false);
                return;
            }

            const vendor = { id: vendorDoc.id, ...vendorDoc.data() } as VendorData;
            setVendorData(vendor);
            setLoading(false);
        } catch (err) {
            console.error('Error loading vendor:', err);
            setError('Failed to load chat. Please try again later.');
            setLoading(false);
        }
    };

    const handleLogin = async (userName: string) => {
        if (!vendorData) return;

        const userId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = { id: userId, name: userName };

        // Create a unique room ID for this customer-vendor pair
        const newRoomId = `room_${vendorId}_${userId}`;
        setRoomId(newRoomId);

        // Create or update chat room with metadata
        const roomRef = doc(db, 'chatRooms', newRoomId);
        const roomDoc = await getDoc(roomRef);

        if (!roomDoc.exists()) {
            await setDoc(roomRef, {
                vendorId: vendorData.id,
                vendorName: vendorData.name,
                vendorEmail: vendorData.email,
                customerId: userId,
                customerName: userName,
                createdAt: Date.now(),
                lastMessage: 'Chat started',
                lastMessageTime: Date.now(),
                unreadCount: 0,
            });
        }

        setCurrentUser(user);
        localStorage.setItem(`chatUser_${vendorId}`, JSON.stringify(user));
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setRoomId('');
        localStorage.removeItem(`chatUser_${vendorId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading chat...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Chat Not Found</h2>
                    <p className="text-slate-600 dark:text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800 p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl mb-4">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
                            Chat with {vendorData?.company || vendorData?.name}
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300">
                            Connect with <span className="font-semibold text-purple-600 dark:text-purple-400">{vendorData?.name}</span>
                        </p>
                    </div>

                    <LoginForm onLogin={handleLogin} />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 shadow-lg border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                                    Chat with {vendorData?.company || vendorData?.name}
                                </h1>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Chatting with <span className="font-semibold text-purple-600 dark:text-purple-400">{vendorData?.name}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:block text-right">
                                <p className="text-sm text-slate-600 dark:text-slate-400">You are</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{currentUser.name}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                            >
                                Leave Chat
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Chat Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 overflow-hidden">
                <div className="h-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <ChatBox
                        roomId={roomId}
                        currentUserId={currentUser.id}
                        currentUserName={currentUser.name}
                    />
                </div>
            </main>
        </div>
    );
}
