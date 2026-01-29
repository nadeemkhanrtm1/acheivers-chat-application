'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    limit,
    doc,
    setDoc,
    updateDoc,
    getDoc,
} from 'firebase/firestore';
import { Message } from '@/types/chat';

interface ChatBoxProps {
    roomId: string;
    currentUserId: string;
    currentUserName: string;
}

export default function ChatBox({ roomId, currentUserId, currentUserName }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Listen to messages in real-time
    useEffect(() => {
        const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData: Message[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                messagesData.push({
                    id: doc.id,
                    text: data.text,
                    senderId: data.senderId,
                    senderName: data.senderName,
                    timestamp: data.timestamp?.toMillis() || Date.now(),
                    createdAt: data.timestamp?.toDate() || new Date(),
                });
            });
            setMessages(messagesData);
        });

        return () => unsubscribe();
    }, [roomId]);

    // Listen to typing indicator
    useEffect(() => {
        const typingRef = doc(db, 'chatRooms', roomId, 'typing', 'status');

        const unsubscribe = onSnapshot(typingRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                // Check if someone else is typing
                if (data.userId && data.userId !== currentUserId && data.isTyping) {
                    setOtherUserTyping(true);
                } else {
                    setOtherUserTyping(false);
                }
            }
        });

        return () => unsubscribe();
    }, [roomId, currentUserId]);

    // Handle typing indicator
    const handleTyping = async (typing: boolean) => {
        try {
            const typingRef = doc(db, 'chatRooms', roomId, 'typing', 'status');
            await setDoc(typingRef, {
                userId: currentUserId,
                userName: currentUserName,
                isTyping: typing,
                timestamp: serverTimestamp(),
            }, { merge: true });
        } catch (error) {
            console.error('Error updating typing status:', error);
        }
    };

    // Handle input change with typing indicator
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Set typing indicator
        if (!isTyping) {
            setIsTyping(true);
            handleTyping(true);
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            handleTyping(false);
        }, 2000);
    };

    // Mark messages as read when vendor opens the chat
    useEffect(() => {
        const markAsRead = async () => {
            try {
                const roomRef = doc(db, 'chatRooms', roomId);
                const roomDoc = await getDoc(roomRef);

                if (roomDoc.exists()) {
                    const data = roomDoc.data();
                    // Only reset unread count if current user is the vendor
                    // (vendor ID is stored in the room data)
                    if (data.vendorId === currentUserId && data.unreadCount && data.unreadCount > 0) {
                        await updateDoc(roomRef, {
                            unreadCount: 0,
                        });
                    }
                }
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        };

        if (messages.length > 0) {
            markAsRead();
        }
    }, [messages, roomId, currentUserId]);

    // Cleanup typing indicator on unmount
    useEffect(() => {
        return () => {
            handleTyping(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim()) return;

        setIsLoading(true);
        try {
            const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
            await addDoc(messagesRef, {
                text: newMessage.trim(),
                senderId: currentUserId,
                senderName: currentUserName,
                timestamp: serverTimestamp(),
            });

            // Update chatRoom with last message
            const roomRef = doc(db, 'chatRooms', roomId);
            const roomDoc = await getDoc(roomRef);
            const roomData = roomDoc.data();
            const currentUnreadCount = roomData?.unreadCount || 0;

            // Only increment unread count if sender is NOT the vendor
            // (i.e., customer is sending the message)
            const isVendor = roomData?.vendorId === currentUserId;

            await updateDoc(roomRef, {
                lastMessage: newMessage.trim(),
                lastMessageTime: serverTimestamp(),
                // Increment unread count only if customer is sending
                unreadCount: isVendor ? currentUnreadCount : currentUnreadCount + 1,
            });

            // Stop typing indicator
            handleTyping(false);
            setIsTyping(false);

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-400 text-center">
                            No messages yet. Start the conversation! 👋
                        </p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isCurrentUser = message.senderId === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-md transition-all hover:shadow-lg ${isCurrentUser
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'
                                        }`}
                                >
                                    {!isCurrentUser && (
                                        <p className="text-xs font-semibold mb-1 text-slate-600 dark:text-slate-300">
                                            {message.senderName}
                                        </p>
                                    )}
                                    <p className="text-sm break-words">{message.text}</p>
                                    <p
                                        className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-slate-400'
                                            }`}
                                    >
                                        {formatTime(message.timestamp)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {otherUserTyping && (
                    <div className="flex justify-start animate-fadeIn">
                        <div className="bg-white dark:bg-slate-700 rounded-2xl px-4 py-3 shadow-md rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">typing...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form
                onSubmit={sendMessage}
                className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg"
            >
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 rounded-full border border-slate-300 dark:border-slate-600 
                     bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !newMessage.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full
                     font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105
                     active:scale-95"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </span>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
