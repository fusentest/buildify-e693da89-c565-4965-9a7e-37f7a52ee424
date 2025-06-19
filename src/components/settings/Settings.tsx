
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';

type ActiveTab = 'profile' | 'preferences' | 'security';

const Settings: React.FC = () => {
  const { currentUser, updateProfile, updateEmail, updatePassword, updatePreferences } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Security form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Preferences form state
  const [preferences, setPreferences] = useState({
    enableNotifications: true,
    darkMode: false,
    messageSound: true,
    autoScroll: true,
    fontSize: 'medium'
  });
  
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      
      // Load preferences from localStorage if available
      const storedPreferences = localStorage.getItem(`preferences_${currentUser.id}`);
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences));
      }
    }
  }, [currentUser]);
  
  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setErrorMessage('');
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Update profile information
      if (name !== currentUser.name) {
        await updateProfile({ name });
      }
      
      // Update email if changed
      if (email !== currentUser.email) {
        await updateEmail(email);
      }
      
      showMessage('Profile updated successfully');
    } catch (error) {
      showMessage('Failed to update profile. Please try again.', true);
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', true);
      return;
    }
    
    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters', true);
      return;
    }
    
    setIsLoading(true);
    try {
      await updatePassword(currentPassword, newPassword);
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      showMessage('Password updated successfully');
    } catch (error) {
      showMessage('Failed to update password. Please check your current password.', true);
      console.error('Error updating password:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      await updatePreferences(preferences);
      showMessage('Preferences updated successfully');
    } catch (error) {
      showMessage('Failed to update preferences', true);
      console.error('Error updating preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  if (!currentUser) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>
      
      {(successMessage || errorMessage) && (
        <div className={`settings-message ${errorMessage ? 'error' : 'success'}`}>
          {successMessage || errorMessage}
        </div>
      )}
      
      <div className="settings-content">
        <div className="settings-sidebar">
          <button 
            className={`sidebar-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`sidebar-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button 
            className={`sidebar-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>
        
        <div className="settings-main">
          {activeTab === 'profile' && (
            <div className="settings-tab-content">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileSubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="settings-button" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}
          
          {activeTab === 'preferences' && (
            <div className="settings-tab-content">
              <h2>Chat Preferences</h2>
              <form onSubmit={handlePreferencesSubmit} className="settings-form">
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="enableNotifications"
                    checked={preferences.enableNotifications}
                    onChange={(e) => handlePreferenceChange('enableNotifications', e.target.checked)}
                  />
                  <label htmlFor="enableNotifications">Enable Notifications</label>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="darkMode"
                    checked={preferences.darkMode}
                    onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                  />
                  <label htmlFor="darkMode">Dark Mode</label>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="messageSound"
                    checked={preferences.messageSound}
                    onChange={(e) => handlePreferenceChange('messageSound', e.target.checked)}
                  />
                  <label htmlFor="messageSound">Message Sound</label>
                </div>
                
                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    id="autoScroll"
                    checked={preferences.autoScroll}
                    onChange={(e) => handlePreferenceChange('autoScroll', e.target.checked)}
                  />
                  <label htmlFor="autoScroll">Auto-scroll to New Messages</label>
                </div>
                
                <div className="form-group">
                  <label htmlFor="fontSize">Font Size</label>
                  <select
                    id="fontSize"
                    value={preferences.fontSize}
                    onChange={(e) => handlePreferenceChange('fontSize', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>
                
                <button 
                  type="submit" 
                  className="settings-button" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div className="settings-tab-content">
              <h2>Security</h2>
              <form onSubmit={handleSecuritySubmit} className="settings-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="settings-button" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;