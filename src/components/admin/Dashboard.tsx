
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { DashboardStats, User } from '../../types/auth';
import { Message } from '../../types/chat';
import { useAuth } from '../../context/AuthContext';
import UserManagement from './UserManagement';
import PermissionGuard from '../auth/PermissionGuard';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { hasPermission } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'messages'>('overview');
  
  useEffect(() => {
    // Simulate loading data from API/localStorage
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Get users from localStorage
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const usersWithoutPasswords = storedUsers.map((user: any) => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });
        
        setUsers(usersWithoutPasswords);
        
        // Get messages from localStorage (if any)
        const storedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        
        // Calculate stats
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oneWeekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000).getTime();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime();
        
        const newUsersToday = usersWithoutPasswords.filter(
          (user: User) => new Date(user.createdAt).getTime() >= today
        ).length;
        
        const newUsersThisWeek = usersWithoutPasswords.filter(
          (user: User) => new Date(user.createdAt).getTime() >= oneWeekAgo
        ).length;
        
        const newUsersThisMonth = usersWithoutPasswords.filter(
          (user: User) => new Date(user.createdAt).getTime() >= oneMonthAgo
        ).length;
        
        // Generate sample data for charts if no real data exists
        const messagesByDay = generateMessagesByDayData(storedMessages);
        const popularTopics = generatePopularTopicsData(storedMessages);
        
        setStats({
          userStats: {
            totalUsers: usersWithoutPasswords.length,
            activeUsers: Math.floor(usersWithoutPasswords.length * 0.7), // Simulated active users
            newUsersToday,
            newUsersThisWeek,
            newUsersThisMonth
          },
          chatStats: {
            totalMessages: storedMessages.length,
            messagesPerUser: storedMessages.length > 0 ? 
              Math.round((storedMessages.length / usersWithoutPasswords.length) * 10) / 10 : 0,
            averageResponseTime: 1.2, // Simulated response time in seconds
            popularTopics,
            messagesByDay
          }
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Helper function to generate sample data for messages by day
  const generateMessagesByDayData = (messages: any[]) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // If we have real messages, use them
    if (messages.length > 0) {
      const last7Days = Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: days[(dayOfWeek + i + 1) % 7],
          count: messages.filter((msg: any) => {
            const msgDate = new Date(msg.timestamp);
            return msgDate.getDate() === date.getDate() &&
                   msgDate.getMonth() === date.getMonth() &&
                   msgDate.getFullYear() === date.getFullYear();
          }).length
        };
      });
      return last7Days;
    }
    
    // Otherwise generate sample data
    return Array(7).fill(0).map((_, i) => ({
      date: days[(dayOfWeek + i + 1) % 7],
      count: Math.floor(Math.random() * 50) + 10
    }));
  };
  
  // Helper function to generate sample data for popular topics
  const generatePopularTopicsData = (messages: any[]) => {
    // Sample topics if no real data
    const sampleTopics = [
      { topic: 'Greetings', count: 35 },
      { topic: 'Help', count: 25 },
      { topic: 'Weather', count: 18 },
      { topic: 'Jokes', count: 15 },
      { topic: 'Other', count: 7 }
    ];
    
    // If we have real messages, we could analyze them here
    // For now, just return sample data
    return sampleTopics;
  };
  
  if (!hasPermission('view_dashboard')) {
    return (
      <div className="permission-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view the dashboard.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
  }
  
  if (!stats) {
    return <div className="dashboard-error">Error loading dashboard data</div>;
  }
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <PermissionGuard permission="manage_users">
            <button 
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          </PermissionGuard>
          <PermissionGuard permission="view_analytics">
            <button 
              className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
          </PermissionGuard>
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="dashboard-overview">
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.userStats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Active Users</h3>
              <p className="stat-value">{stats.userStats.activeUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Messages</h3>
              <p className="stat-value">{stats.chatStats.totalMessages}</p>
            </div>
            <div className="stat-card">
              <h3>Avg. Response Time</h3>
              <p className="stat-value">{stats.chatStats.averageResponseTime}s</p>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart-card">
              <h3>New Users</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      { name: 'Today', value: stats.userStats.newUsersToday },
                      { name: 'This Week', value: stats.userStats.newUsersThisWeek },
                      { name: 'This Month', value: stats.userStats.newUsersThisMonth }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4a6fa5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Messages by Day</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={stats.chatStats.messagesByDay}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#4a6fa5" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart-card">
              <h3>Popular Topics</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stats.chatStats.popularTopics}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.chatStats.popularTopics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card">
              <h3>User Activity</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={[
                      { name: 'Messages/User', value: stats.chatStats.messagesPerUser },
                      { name: 'Active Rate', value: stats.userStats.activeUsers / stats.userStats.totalUsers * 100 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4fc3f7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'users' && (
        <PermissionGuard 
          permission="manage_users"
          fallback={<div className="permission-denied">You don't have permission to manage users.</div>}
        >
          <UserManagement />
        </PermissionGuard>
      )}
      
      {activeTab === 'messages' && (
        <PermissionGuard 
          permission="view_analytics"
          fallback={<div className="permission-denied">You don't have permission to view message analytics.</div>}
        >
          <div className="dashboard-messages">
            <div className="messages-header">
              <h2>Message Analytics</h2>
              <p>Total Messages: {stats.chatStats.totalMessages}</p>
            </div>
            
            <div className="chart-container">
              <div className="chart-card full-width">
                <h3>Messages by Day</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={stats.chatStats.messagesByDay}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#4a6fa5" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="chart-container">
              <div className="chart-card">
                <h3>Popular Topics</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.chatStats.popularTopics}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {stats.chatStats.popularTopics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="chart-card">
                <h3>Topic Distribution</h3>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={stats.chatStats.popularTopics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="topic" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4fc3f7" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </PermissionGuard>
      )}
    </div>
  );
};

export default Dashboard;