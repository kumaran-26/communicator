import React, { useState } from 'react';
import { Search, Plus, Users as UsersIcon, User as UserIcon } from 'lucide-react';
import { useSocket } from '../context/SocketContext.jsx';

const UserList = ({ users, groups, selectedId, onSelect, onCreateGroup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { onlineUsers, unreadCounts } = useSocket();
  const [activeTab, setActiveTab] = useState('users');

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-3 border-b border-gray-100">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('users')}
             className={`flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'users' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             <UserIcon size={16} className="mr-1.5" /> People
           </button>
           <button 
             onClick={() => setActiveTab('groups')}
             className={`flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'groups' ? 'bg-white text-violet-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             <UsersIcon size={16} className="mr-1.5" /> Groups
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'groups' && (
           <div className="p-3">
              <button 
                onClick={onCreateGroup}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center font-medium text-sm"
              >
                 <Plus size={18} className="mr-2" /> Create New Group
              </button>
           </div>
        )}

        {activeTab === 'users' ? (
          filteredUsers.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No users found.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredUsers.map(user => {
                const isOnline = onlineUsers.has(user._id);
                const isSelected = selectedId === user._id;
                const unread = unreadCounts[user._id] || 0;
                
                return (
                  <button
                    key={user._id}
                    onClick={() => onSelect(user._id, false)}
                    className={`w-full px-4 py-3 flex items-center hover:bg-gray-50 transition-colors duration-150 ${
                      isSelected ? 'bg-violet-50 hover:bg-violet-50' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg border-2 border-white shadow-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="ml-3 flex-1 text-left min-w-0">
                      <div className="flex justify-between items-center">
                          <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-violet-900' : 'text-gray-900'}`}>
                            {user.username}
                          </h3>
                          {unread > 0 && (
                             <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                {unread}
                             </span>
                          )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{isOnline ? 'Active now' : 'Offline'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          // Groups List
          <div className="divide-y divide-gray-50">
            {filteredGroups.length === 0 && !searchTerm && (
                <div className="p-6 text-center text-sm text-gray-500">You haven't joined any groups yet.</div>
            )}
            {filteredGroups.map(group => {
              const isSelected = selectedId === group._id;
              const unread = unreadCounts[group._id] || 0;

              return (
                <button
                  key={group._id}
                  onClick={() => onSelect(group._id, true)}
                  className={`w-full px-4 py-3 flex items-center hover:bg-gray-50 transition-colors duration-150 ${
                    isSelected ? 'bg-violet-50 hover:bg-violet-50' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-lg border-2 border-white shadow-sm">
                      <UsersIcon size={20} />
                    </div>
                  </div>
                  <div className="ml-3 flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center">
                        <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-violet-900' : 'text-gray-900'}`}>
                          {group.name}
                        </h3>
                        {unread > 0 && (
                             <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                {unread}
                             </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{group.members.length} members</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;