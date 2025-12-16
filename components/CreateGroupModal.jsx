import React, { useState } from 'react';
import { X, Users, Check } from 'lucide-react';

const CreateGroupModal = ({ users, onClose, onCreate }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());

  const toggleMember = (userId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.size === 0) return;
    onCreate(groupName, Array.from(selectedMembers));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Create New Group</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex flex-col h-[500px]">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <div className="relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
               </div>
               <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                placeholder="e.g. Marketing Team"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Add Members ({selectedMembers.size})</label>
          </div>
          
          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
            {users.map(user => {
              const isSelected = selectedMembers.has(user._id);
              return (
                <div 
                  key={user._id} 
                  onClick={() => toggleMember(user._id)}
                  className={`flex items-center p-3 cursor-pointer transition-colors ${isSelected ? 'bg-violet-50' : 'hover:bg-gray-50'}`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${isSelected ? 'bg-violet-600 border-violet-600' : 'border-gray-300'}`}>
                    {isSelected && <Check size={14} className="text-white" />}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-sm ${isSelected ? 'font-medium text-violet-900' : 'text-gray-700'}`}>
                    {user.username}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!groupName.trim() || selectedMembers.size === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;