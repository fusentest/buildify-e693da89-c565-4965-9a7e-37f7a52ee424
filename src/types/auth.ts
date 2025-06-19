
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: Role;
  permissions?: Permission[];
}

export type Role = 'admin' | 'moderator' | 'user';

export type Permission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'delete_messages'
  | 'edit_settings'
  | 'view_analytics'
  | 'export_data'
  | 'manage_roles';

export interface UserPreferences {
  enableNotifications: boolean;
  darkMode: boolean;
  messageSound: boolean;
  autoScroll: boolean;
  fontSize: 'small' | 'medium' | 'large';
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

export interface RoleDefinition {
  name: Role;
  displayName: string;
  description: string;
  permissions: Permission[];
}