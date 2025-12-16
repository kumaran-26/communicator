import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Group } from '../types';
import { useSocket } from '../context/SocketContext';
import { mockBackend } from '../services/mockBackend';
import { Send, Check, CheckCheck, ArrowLeft, MoreVertical, Phone, Video, Users as UsersIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  currentUserId: string;
  selectedId: string;
  isGroup: boolean;
  selectedUser?: User;
  selectedGroup?: Group;
  allUsers: User[]; // Needed to look up sender names in groups
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
    currentUserId, selectedId, isGroup, selectedUser, selectedGroup, allUsers, onBack 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { sendMessage, markAsRead, lastMessage, onlineUsers } = useSocket();

  // Load history
  useEffect(() => {
    setLoading(true);
    mockBackend.getHistory(currentUserId, selectedId, isGroup).then(msgs => {
      setMessages(msgs);
      setLoading(false);
      markAsRead(selectedId, isGroup); // Clear unread count when opening window
      scrollToBottom();
    });
  }, [currentUserId, selectedId, isGroup]);

  // Listen for new messages
  useEffect(() => {
    if (lastMessage) {
      let isRelevant = false;
      
      if (isGroup) {
          if (lastMessage.group_id === selectedId) isRelevant = true;
      } else {
          // Direct Message Logic
          if (
             (lastMessage.sender_id === currentUserId && lastMessage.receiver_id === selectedId) ||
             (lastMessage.sender_id === selectedId && lastMessage.receiver_id === currentUserId)
          ) {
              isRelevant = true;
          }
      }
      
      if (isRelevant) {
        setMessages(prev => {
          // Avoid duplicates if we optimistically added it
          if (prev.find(m => m._id === lastMessage._id)) {
            return prev.map(m => m._id === lastMessage._id ? lastMessage : m);
          }
          return [...prev, lastMessage];
        });
        
        // If message is from others and I am looking at it, mark read
        if (lastMessage.sender_id !== currentUserId) {
            markAsRead(selectedId, isGroup);
        }
        scrollToBottom();
      }
    }
  }, [lastMessage, selectedId, isGroup]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(selectedId, inputText, isGroup);
    setInputText('');
  };

  // Helper to get sender name
  const getSenderName = (senderId: string) => {
      if (senderId === currentUserId) return 'You';
      const user = allUsers.find(u => u._id === senderId);
      return user ? user.username.split(' ')[0] : 'Unknown';
  };

  const getSenderColor = (senderId: string) => {
      const colors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-orange-500', 'text-purple-500'];
      const index = parseInt(senderId.substring(senderId.length - 1), 16) || 0;
      return colors[index % colors.length];
  };

  const isOnline = selectedUser && onlineUsers.has(selectedUser._id);
  const title = isGroup ? selectedGroup?.name : selectedUser?.username;
  const subtitle = isGroup 
      ? `${selectedGroup?.members.length} members` 
      : (isOnline ? 'Online' : 'Last seen recently');

  if (!title) return <div className="flex-1" />;

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">
      {/* Header */}
      <div className="h-16 px-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center">
          <button onClick={onBack} className="md:hidden p-2 -ml-2 mr-1 text-gray-600">
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
             {isGroup ? (
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 border border-violet-200">
                    <UsersIcon size={20} />
                </div>
             ) : (
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold border border-violet-200">
                    {title.charAt(0).toUpperCase()}
                </div>
             )}
             {!isGroup && isOnline && (
               <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
             )}
          </div>
          
          <div className="ml-3">
            <div className="flex items-center">
               <h2 className="text-sm font-semibold text-gray-900 mr-2">{title}</h2>
               <span className="hidden md:block px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">KiteHub</span>
            </div>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-violet-600">
           <button className="p-2 hover:bg-violet-50 rounded-full transition-colors">
              <Phone size={20} />
           </button>
           <button className="p-2 hover:bg-violet-50 rounded-full transition-colors">
              <Video size={20} />
           </button>
           <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <MoreVertical size={20} />
           </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
        {loading ? (
           <div className="flex justify-center items-center h-full">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
           </div>
        ) : messages.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <span className="bg-white/50 px-4 py-2 rounded-full text-sm shadow-sm">No messages yet. Start the conversation on KiteHub!</span>
           </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId;
            // Group specific styling for incoming messages
            const showSenderName = isGroup && !isMe;
            
            return (
              <div 
                key={msg._id} 
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
              >
                <div 
                  className={`relative max-w-[70%] md:max-w-[60%] px-3 py-2 shadow-sm text-sm ${
                    isMe 
                      ? 'bg-violet-600 text-white rounded-l-xl rounded-tr-xl rounded-br-sm' 
                      : 'bg-white text-gray-800 border border-gray-100 rounded-r-xl rounded-tl-xl rounded-bl-sm'
                  }`}
                >
                  {showSenderName && (
                      <p className={`text-[11px] font-bold mb-0.5 ${getSenderColor(msg.sender_id)}`}>
                          {getSenderName(msg.sender_id)}
                      </p>
                  )}
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                  <div className={`flex items-center justify-end space-x-1 mt-1 select-none ${isMe ? 'text-violet-200' : 'text-gray-400'}`}>
                    <span className="text-[10px]">
                      {format(new Date(msg.timestamp), 'h:mm a')}
                    </span>
                    {isMe && (
                      <span className="ml-1">
                        {msg.status === 'sent' && <Check size={14} />}
                        {msg.status === 'delivered' && <CheckCheck size={14} />}
                        {msg.status === 'read' && <CheckCheck size={14} className="text-blue-300" />}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 text-gray-900 placeholder-gray-500 border-0 rounded-full px-5 py-3 focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="p-3 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors shadow-md transform active:scale-95"
          >
            <Send size={20} className={inputText.trim() ? "ml-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;