import { User, Group, Message, AuthResponse } from '../types';

// Initial Dummy Data
const USERS_STORAGE_KEY = 'violet_chat_users';
const GROUPS_STORAGE_KEY = 'violet_chat_groups';
const MESSAGES_STORAGE_KEY = 'violet_chat_messages';

const INITIAL_USERS: User[] = [
  { _id: '1', username: 'Alice (HR)', email: 'alice@company.com', online_status: true, last_seen: new Date().toISOString() },
  { _id: '2', username: 'Bob (Eng)', email: 'bob@company.com', online_status: false, last_seen: new Date(Date.now() - 3600000).toISOString() },
  { _id: '3', username: 'Charlie (Product)', email: 'charlie@company.com', online_status: true, last_seen: new Date().toISOString() },
  { _id: '4', username: 'David (Sales)', email: 'david@company.com', online_status: true, last_seen: new Date().toISOString() },
];

const INITIAL_GROUPS: Group[] = [
  { _id: 'g1', name: 'General Team', members: ['1', '2', '3', '4'], created_by: '1', created_at: new Date().toISOString() },
  { _id: 'g2', name: 'Engineering', members: ['2', '3'], created_by: '2', created_at: new Date().toISOString() }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockBackendService {
  private users: User[];
  private groups: Group[];
  private messages: Message[];

  constructor() {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    this.users = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;

    const storedGroups = localStorage.getItem(GROUPS_STORAGE_KEY);
    this.groups = storedGroups ? JSON.parse(storedGroups) : INITIAL_GROUPS;

    const storedMessages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    this.messages = storedMessages ? JSON.parse(storedMessages) : [];
  }

  private save() {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(this.groups));
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(this.messages));
  }

  async login(email: string): Promise<AuthResponse> {
    await delay(500);
    const user = this.users.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    
    // Simulate updating online status
    user.online_status = true;
    this.save();
    
    return { token: 'mock-jwt-token', user };
  }

  async register(username: string, email: string): Promise<AuthResponse> {
    await delay(500);
    if (this.users.find(u => u.email === email)) throw new Error('User already exists');
    
    const newUser: User = {
      _id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      online_status: true,
      last_seen: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    this.save();
    return { token: 'mock-jwt-token', user: newUser };
  }

  async getUsers(currentUserId: string): Promise<User[]> {
    await delay(300);
    // Return all users except self
    return this.users.filter(u => u._id !== currentUserId);
  }

  async createGroup(name: string, memberIds: string[], creatorId: string): Promise<Group> {
    await delay(400);
    const newGroup: Group = {
      _id: 'g' + Math.random().toString(36).substr(2, 9),
      name,
      members: [...memberIds, creatorId], // Ensure creator is included
      created_by: creatorId,
      created_at: new Date().toISOString()
    };
    this.groups.push(newGroup);
    this.save();
    return newGroup;
  }

  async getGroups(userId: string): Promise<Group[]> {
    await delay(300);
    return this.groups.filter(g => g.members.includes(userId));
  }

  async getHistory(userId: string, otherId: string, isGroup: boolean): Promise<Message[]> {
    await delay(300);
    if (isGroup) {
      return this.messages
        .filter(m => m.group_id === otherId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else {
      return this.messages
        .filter(m => 
          (m.sender_id === userId && m.receiver_id === otherId) ||
          (m.sender_id === otherId && m.receiver_id === userId)
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
  }

  async getUnreadCounts(currentUserId: string): Promise<Record<string, number>> {
    await delay(200);
    const counts: Record<string, number> = {};
    
    this.messages.forEach(m => {
        // Direct Messages: Sent to me, not read
        if (m.receiver_id === currentUserId && m.status !== 'read') {
            const sender = m.sender_id;
            counts[sender] = (counts[sender] || 0) + 1;
        }
        // Group Messages: In a group I belong to, sent by someone else, not read (simplified for mock)
        if (m.group_id && m.sender_id !== currentUserId && m.status !== 'read') {
             // Check if user is in group (simplified: assuming yes if we are calling this)
             // In a real app we'd check membership here or filter beforehand
             counts[m.group_id] = (counts[m.group_id] || 0) + 1;
        }
    });
    return counts;
  }

  // Socket Simulation Methods
  saveMessage(message: Message) {
    this.messages.push(message);
    this.save();
  }

  updateMessageStatus(messageId: string, status: 'delivered' | 'read') {
    const msg = this.messages.find(m => m._id === messageId);
    if (msg) {
      // Only upgrade status (sent -> delivered -> read)
      if (status === 'read') msg.status = 'read';
      else if (status === 'delivered' && msg.status === 'sent') msg.status = 'delivered';
      this.save();
    }
  }

  markAllRead(targetId: string, currentUserId: string, isGroup: boolean) {
    let updated = false;
    this.messages.forEach(m => {
      if (isGroup) {
         // Mark all messages in group as read (mock simplification)
         if (m.group_id === targetId && m.status !== 'read' && m.sender_id !== currentUserId) {
             m.status = 'read';
             updated = true;
         }
      } else {
         // Mark all messages from specific sender as read
         if (m.sender_id === targetId && m.receiver_id === currentUserId && m.status !== 'read') {
            m.status = 'read';
            updated = true;
         }
      }
    });
    if (updated) this.save();
  }
}

export const mockBackend = new MockBackendService();