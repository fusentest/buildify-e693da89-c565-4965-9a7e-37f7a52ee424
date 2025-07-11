
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PermissionGuard from './auth/PermissionGuard';
import './Header.css';

const Header: React.FC = () => {
  const { currentUser, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if we're on the admin panel page
  const isAdminPanel = location.pathname === '/admin/panel';

  return (
    <header className={`header ${isAdminPanel ? 'admin-panel-mode' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>ChatBot</h1>
        </Link>
        
        {currentUser ? (
          <div className="user-menu">
            <span className="user-name">Hello, {currentUser.name}</span>
            
            <PermissionGuard permission="view_dashboard">
              <Link 
                to={location.pathname.includes('/admin') ? '/' : '/admin'} 
                className="admin-link"
              >
                {location.pathname.includes('/admin') ? 'Chat' : 'Dashboard'}
              </Link>
            </PermissionGuard>
            
            <Link to="/settings" className="settings-link">
              Settings
            </Link>
            
            <Link to="/payment" className="settings-link">
              Payment
            </Link>
            
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="auth-link">Login</Link>
            <Link to="/signup" className="auth-link signup">Sign Up</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;