import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { Message, User } from '../types';
import { mockBackend } from '../services/mockBackend';

// Event Types
type SocketEvent = 'connect' | 'user_online' | 'user_offline' | 'receive_message' | 'message_delivered' | 'message_read';

interface SocketContextType {
  sendMessage: (targetId: string, content: string, isGroup: boolean) => void;
  markAsRead: (targetId: string, isGroup: boolean) => void;
  onlineUsers: Set<string>;
  lastMessage: Message | null;
  unreadCounts: Record<string, number>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  // Track selected chat to prevent incrementing unread if chat is open (simulated via markAsRead calls from UI)
  
  useEffect(() => {
    if (!user) return;

    // 1. Fetch initial online users
    mockBackend.getUsers(user._id).then(users => {
      const online = new Set(users.filter(u => u.online_status).map(u => u._id));
      setOnlineUsers(online);
    });

    // 2. Fetch initial unread counts
    mockBackend.getUnreadCounts(user._id).then(counts => {
        setUnreadCounts(counts);
    });

    // Simulate events
    const interval = setInterval(() => {
      // Random user presence
      if (Math.random() > 0.9) {
        mockBackend.getUsers(user._id).then(users => {
           if(users.length === 0) return;
           const randomUser = users[Math.floor(Math.random() * users.length)];
           setOnlineUsers(prev => {
             const newSet = new Set(prev);
             if (newSet.has(randomUser._id)) newSet.delete(randomUser._id);
             else newSet.add(randomUser._id);
             return newSet;
           });
        });
      }

      // Random incoming group message
      if (Math.random() > 0.95) {
         const randomSenderId = '2'; // Bob
         if (randomSenderId !== user._id) {
           const groupMsg: Message = {
             _id: Math.random().toString(36).substr(2, 9),
             sender_id: randomSenderId,
             group_id: 'g1',
             message: "Hey team, how's the progress?",
             timestamp: new Date().toISOString(),
             status: 'delivered'
           };
           mockBackend.saveMessage(groupMsg);
           setLastMessage(groupMsg);
           
           // Update unread count for group 'g1'
           setUnreadCounts(prev => ({
               ...prev,
               ['g1']: (prev['g1'] || 0) + 1
           }));
         }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = (targetId: string, content: string, isGroup: boolean) => {
    if (!user) return;

    const newMessage: Message = {
      _id: Math.random().toString(36).substr(2, 9),
      sender_id: user._id,
      message: content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      ...(isGroup ? { group_id: targetId } : { receiver_id: targetId })
    };

    mockBackend.saveMessage(newMessage);
    setLastMessage(newMessage);

    setTimeout(() => {
        mockBackend.updateMessageStatus(newMessage._id, 'delivered');
        setLastMessage({ ...newMessage, status: 'delivered' }); 

        if (!isGroup) {
          setTimeout(() => {
              mockBackend.updateMessageStatus(newMessage._id, 'read');
              setLastMessage({ ...newMessage, status: 'read' }); 
              
              if (targetId === '1') {
                  setTimeout(() => {
                     const reply: Message = {
                       _id: Math.random().toString(36).substr(2, 9),
                       sender_id: '1',
                       receiver_id: user._id,
                       message: "Thanks for the message! I'll get back to you shortly.",
                       timestamp: new Date().toISOString(),
                       status: 'sent'
                     };
                     mockBackend.saveMessage(reply);
                     setLastMessage(reply);
                     // Increment unread count for Alice ('1')
                     setUnreadCounts(prev => ({
                         ...prev,
                         ['1']: (prev['1'] || 0) + 1
                     }));
                  }, 2000);
              }
          }, Math.random() * 3000 + 1000);
        }
    }, Math.random() * 1000 + 500);
  };

  const markAsRead = (targetId: string, isGroup: boolean) => {
    if (!user) return;
    mockBackend.markAllRead(targetId, user._id, isGroup);
    
    // Clear local unread count
    setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[targetId];
        return newCounts;
    });
  };

  return (
    <SocketContext.Provider value={{ sendMessage, markAsRead, onlineUsers, lastMessage, unreadCounts }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};