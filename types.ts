export interface User {
  _id: string;
  username: string;
  email: string;
  online_status: boolean;
  last_seen: string;
  avatar?: string;
}

export interface Group {
  _id: string;
  name: string;
  members: string[]; // User IDs
  created_by: string;
  created_at: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  _id: string;
  sender_id: string;
  receiver_id?: string; // Optional for group messages
  group_id?: string;    // Optional for direct messages
  message: string;
  timestamp: string;
  status: MessageStatus;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ChatSession {
  userId: string;
  unreadCount: number;
  lastMessage?: Message;
}