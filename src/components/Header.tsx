
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header: React.FC = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1>ChatBot</h1>
        </Link>
        
        {currentUser ? (
          <div className="user-menu">
            <span className="user-name">Hello, {currentUser.name}</span>
            
            {isAdmin && (
              <Link 
                to={location.pathname === '/admin' ? '/' : '/admin'} 
                className="admin-link"
              >
                {location.pathname === '/admin' ? 'Chat' : 'Dashboard'}
              </Link>
            )}
            
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