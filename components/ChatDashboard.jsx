import React, { useState, useEffect } from 'react';
import UserList from './UserList.jsx';
import ChatWindow from './ChatWindow.jsx';
import CreateGroupModal from './CreateGroupModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, MessageSquare } from 'lucide-react';
import { mockBackend } from '../services/mockBackend.js';

const ChatDashboard = () => {
  const { user, logout } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [availableUsers, setAvailableUsers] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const fetchData = async () => {
    if (user) {
        const [users, groups] = await Promise.all([
            mockBackend.getUsers(user._id),
            mockBackend.getGroups(user._id)
        ]);
        setAvailableUsers(users);
        setMyGroups(groups);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSelect = (id, isGroup) => {
    setSelectedId(id);
    setIsGroupChat(isGroup);
    setIsMobileMenuOpen(false);
  };

  const handleCreateGroup = async (name, memberIds) => {
    if (user) {
        await mockBackend.createGroup(name, memberIds, user._id);
        setShowCreateGroup(false);
        fetchData(); // Refresh list
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 bg-violet-600 text-white shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
               <MessageSquare size={20} className="text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">KiteHub</span>
          </div>
          <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Logout">
            <LogOut size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          <UserList 
            users={availableUsers}
            groups={myGroups}
            selectedId={selectedId}
            onSelect={handleSelect}
            onCreateGroup={() => setShowCreateGroup(true)}
          />
        </div>
        
        {/* Current User Profile Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center font-bold text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
              <p className="text-xs text-green-600 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        {/* Mobile Header Toggle */}
        <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 shrink-0 shadow-sm z-20">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 mr-2 text-violet-600 hover:bg-violet-50 rounded-md transition-colors"
          >
            <MessageSquare size={24} />
          </button>
          <span className="font-semibold text-violet-900 text-lg">KiteHub</span>
        </div>

        {selectedId ? (
          <ChatWindow 
            currentUserId={user._id} 
            selectedId={selectedId}
            isGroup={isGroupChat}
            selectedUser={!isGroupChat ? availableUsers.find(u => u._id === selectedId) : undefined}
            selectedGroup={isGroupChat ? myGroups.find(g => g._id === selectedId) : undefined}
            allUsers={availableUsers}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 flex-col text-gray-400 p-8 text-center">
            <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <MessageSquare className="w-12 h-12 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to KiteHub</h3>
            <p className="max-w-sm text-gray-500">Select a colleague or group from the sidebar to start a real-time conversation.</p>
          </div>
        )}
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Modals */}
      {showCreateGroup && (
        <CreateGroupModal 
            users={availableUsers} 
            onClose={() => setShowCreateGroup(false)} 
            onCreate={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default ChatDashboard;