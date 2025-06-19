
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserManagement from './UserManagement';
import ContentModeration from './ContentModeration';
import SystemSettings from './SystemSettings';
import PermissionGuard from '../auth/PermissionGuard';
import './AdminPanel.css';

type AdminTab = 'users' | 'content' | 'settings' | 'dashboard';

const AdminPanel: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const navigate = useNavigate();

  // Redirect to dashboard tab
  const handleDashboardClick = () => {
    navigate('/admin');
  };

  if (!currentUser || !hasPermission('view_dashboard')) {
    return (
      <div className="admin-panel-error">
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="admin-panel-container">
      <div className="admin-panel-sidebar">
        <div className="admin-panel-logo">
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="admin-panel-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={handleDashboardClick}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            Dashboard
          </button>
          
          <PermissionGuard permission="manage_users">
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              User Management
            </button>
          </PermissionGuard>
          
          <PermissionGuard permission="delete_messages">
            <button 
              className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Content Moderation
            </button>
          </PermissionGuard>
          
          <PermissionGuard permission="edit_settings">
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              System Settings
            </button>
          </PermissionGuard>
        </nav>
        
        <div className="admin-panel-user">
          <div className="user-avatar">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <div className="user-name">{currentUser.name}</div>
            <div className="user-role">{currentUser.role}</div>
          </div>
        </div>
      </div>
      
      <div className="admin-panel-content">
        {activeTab === 'users' && (
          <PermissionGuard 
            permission="manage_users"
            fallback={<div className="permission-denied">You don't have permission to manage users.</div>}
          >
            <UserManagement />
          </PermissionGuard>
        )}
        
        {activeTab === 'content' && (
          <PermissionGuard 
            permission="delete_messages"
            fallback={<div className="permission-denied">You don't have permission to moderate content.</div>}
          >
            <ContentModeration />
          </PermissionGuard>
        )}
        
        {activeTab === 'settings' && (
          <PermissionGuard 
            permission="edit_settings"
            fallback={<div className="permission-denied">You don't have permission to edit system settings.</div>}
          >
            <SystemSettings />
          </PermissionGuard>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;