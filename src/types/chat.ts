export interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: number;
    createdAt: Date;
}

export interface User {
    id: string;
    name: string;
    isOnline: boolean;
    lastSeen?: number;
}

export interface ChatRoom {
    id: string;
    participants: string[];
    createdAt: number;
    lastMessage?: string;
    lastMessageTime?: number;
}
