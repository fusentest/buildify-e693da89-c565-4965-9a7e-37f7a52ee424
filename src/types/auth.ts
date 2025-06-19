
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role?: 'user' | 'admin';
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}

export interface ChatStats {
  totalMessages: number;
  messagesPerUser: number;
  averageResponseTime: number;
  popularTopics: Array<{topic: string, count: number}>;
  messagesByDay: Array<{date: string, count: number}>;
}

export interface DashboardStats {
  userStats: UserStats;
  chatStats: ChatStats;
}