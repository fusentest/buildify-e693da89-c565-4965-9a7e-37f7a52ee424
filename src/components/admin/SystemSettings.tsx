
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './SystemSettings.css';

interface SystemSettingsState {
  chatSettings: {
    maxMessagesPerUser: number;
    messageRetentionDays: number;
    profanityFilter: boolean;
    autoModeration: boolean;
    allowImageUploads: boolean;
  };
  securitySettings: {
    maxLoginAttempts: number;
    sessionTimeoutMinutes: number;
    requireEmailVerification: boolean;
    passwordMinLength: number;
    twoFactorAuthRequired: boolean;
  };
  notificationSettings: {
    enableEmailNotifications: boolean;
    adminAlertOnFlaggedContent: boolean;
    dailyReportEmail: boolean;
    userInactivityReminders: boolean;
  };
  uiSettings: {
    defaultTheme: 'light' | 'dark' | 'system';
    primaryColor: string;
    accentColor: string;
    enableAnimations: boolean;
  };
}

const defaultSettings: SystemSettingsState = {
  chatSettings: {
    maxMessagesPerUser: 100,
    messageRetentionDays: 30,
    profanityFilter: true,
    autoModeration: true,
    allowImageUploads: false
  },
  securitySettings: {
    maxLoginAttempts: 5,
    sessionTimeoutMinutes: 60,
    requireEmailVerification: true,
    passwordMinLength: 8,
    twoFactorAuthRequired: false
  },
  notificationSettings: {
    enableEmailNotifications: true,
    adminAlertOnFlaggedContent: true,
    dailyReportEmail: false,
    userInactivityReminders: false
  },
  uiSettings: {
    defaultTheme: 'light',
    primaryColor: '#4a6fa5',
    accentColor: '#4fc3f7',
    enableAnimations: true
  }
};

const SystemSettings: React.FC = () => {
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<SystemSettingsState>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'chat' | 'security' | 'notifications' | 'ui'>('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = () => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call to get system settings
      // Here we're simulating by getting settings from localStorage
      const storedSettings = localStorage.getItem('systemSettings');
      
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        // Use default settings if none are stored
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setErrorMessage('Failed to load system settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = () => {
    try {
      // In a real app, this would be an API call to save system settings
      // Here we're simulating by saving settings to localStorage
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      
      setSuccessMessage('Settings saved successfully');
      setHasChanges(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Failed to save system settings');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };
  
  const handleResetSettings = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };
  
  const updateChatSetting = (key: keyof SystemSettingsState['chatSettings'], value: any) => {
    setSettings(prev => ({
      ...prev,
      chatSettings: {
        ...prev.chatSettings,
        [key]: value
      }
    }));
    setHasChanges(true);
  };
  
  const updateSecuritySetting = (key: keyof SystemSettingsState['securitySettings'], value: any) => {
    setSettings(prev => ({
      ...prev,
      securitySettings: {
        ...prev.securitySettings,
        [key]: value
      }
    }));
    setHasChanges(true);
  };
  
  const updateNotificationSetting = (key: keyof SystemSettingsState['notificationSettings'], value: any) => {
    setSettings(prev => ({
      ...prev,
      notificationSettings: {
        ...prev.notificationSettings,
        [key]: value
      }
    }));
    setHasChanges(true);
  };
  
  const updateUISetting = (key: keyof SystemSettingsState['uiSettings'], value: any) => {
    setSettings(prev => ({
      ...prev,
      uiSettings: {
        ...prev.uiSettings,
        [key]: value
      }
    }));
    setHasChanges(true);
  };
  
  if (isLoading) {
    return <div className="loading">Loading settings...</div>;
  }
  
  return (
    <div className="system-settings">
      <div className="settings-header">
        <h2>System Settings</h2>
        <p>Configure global system settings</p>
      </div>
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
      
      <div className="settings-tabs">
        <button 
          className={`settings-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button 
          className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button 
          className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button 
          className={`settings-tab ${activeTab === 'ui' ? 'active' : ''}`}
          onClick={() => setActiveTab('ui')}
        >
          UI
        </button>
      </div>
      
      <div className="settings-content">
        {activeTab === 'chat' && (
          <div className="settings-section">
            <h3>Chat Settings</h3>
            
            <div className="setting-item">
              <label htmlFor="maxMessagesPerUser">Maximum Messages Per User</label>
              <input
                type="number"
                id="maxMessagesPerUser"
                value={settings.chatSettings.maxMessagesPerUser}
                onChange={(e) => updateChatSetting('maxMessagesPerUser', parseInt(e.target.value))}
                min="1"
              />
              <p className="setting-description">
                Maximum number of messages a user can send per day
              </p>
            </div>
            
            <div className="setting-item">
              <label htmlFor="messageRetentionDays">Message Retention (Days)</label>
              <input
                type="number"
                id="messageRetentionDays"
                value={settings.chatSettings.messageRetentionDays}
                onChange={(e) => updateChatSetting('messageRetentionDays', parseInt(e.target.value))}
                min="1"
              />
              <p className="setting-description">
                Number of days to keep messages before automatic deletion
              </p>
            </div>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="profanityFilter"
                checked={settings.chatSettings.profanityFilter}
                onChange={(e) => updateChatSetting('profanityFilter', e.target.checked)}
              />
              <label htmlFor="profanityFilter">Enable Profanity Filter</label>
              <p className="setting-description">
                Automatically filter out profanity from messages
              </p>
            </div>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="autoModeration"
                checked={settings.chatSettings.autoModeration}
                onChange={(e) => updateChatSetting('autoModeration', e.target.checked)}
              />
              <label htmlFor="autoModeration">Enable Auto-Moderation</label>
              <p className="setting-description">
                Automatically flag potentially inappropriate messages for review
              </p>
            </div>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="allowImageUploads"
                checked={settings.chatSettings.allowImageUploads}
                onChange={(e) => updateChatSetting('allowImageUploads', e.target.checked)}
              />
              <label htmlFor="allowImageUploads">Allow Image Uploads</label>
              <p className="setting-description">
                Allow users to upload and share images in chat
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="settings-section">
            <h3>Security Settings</h3>
            
            <div className="setting-item">
              <label htmlFor="maxLoginAttempts">Maximum Login Attempts</label>
              <input
                type="number"
                id="maxLoginAttempts"
                value={settings.securitySettings.maxLoginAttempts}
                onChange={(e) => updateSecuritySetting('maxLoginAttempts', parseInt(e.target.value))}
                min="1"
              />
              <p className="setting-description">
                Number of failed login attempts before account lockout
              </p>
            </div>
            
            <div className="setting-item">
              <label htmlFor="sessionTimeoutMinutes">Session Timeout (Minutes)</label>
              <input
                type="number"
                id="sessionTimeoutMinutes"
                value={settings.securitySettings.sessionTimeoutMinutes}
                onChange={(e) => updateSecuritySetting('sessionTimeoutMinutes', parseInt(e.target.value))}
                min="1"
              />
              <p className="setting-description">
                Time in minutes before an inactive session expires
              </p>
            </div>
            
            <div className="setting-item">
              <label htmlFor="passwordMinLength">Minimum Password Length</label>
              <input
                type="number"
                id="passwordMinLength"
                value={settings.securitySettings.passwordMinLength}
                onChange={(e) => updateSecuritySetting('passwordMinLength', parseInt(e.target.value))}
                min="6"
              />
              <p className="setting-description">
                Minimum number of characters required for passwords
              </p>
            </div>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="requireEmailVerification"
                checked={settings.securitySettings.requireEmailVerification}
                onChange={(e) => updateSecuritySetting('requireEmailVerification', e.target.checked)}
              />
              <label htmlFor="requireEmailVerification">Require Email Verification</label>
              <p className="setting-description">
                Require users to verify their email address before accessing the system
              </p>
            </div>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="twoFactorAuthRequired"
                checked={settings.securitySettings.twoFactorAuthRequired}
                onChange={(e) => updateSecuritySetting('twoFactorAuthRequired', e.target.checked)}
              />
              <label htmlFor="twoFactorAuthRequired">Require Two-Factor Authentication</label>
              <p className="setting-description">
                Require all users to set up two-factor authentication
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h3>Notification Settings</h3>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="enableEmailNotifications"
                checked={settings.notificationSettings.enableEmailNotifications}
                onChange={(e) => updateNotificationSetting('enableEmailNotifications', e.target.checked)}
              />
              <label htmlFor="enableEmailNotifications">Enable Email Notifications</label>
              <p className="setting-description">
                Send email notifications for important events
              </p>
            </div>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="adminAlertOnFlaggedContent"
                checked={settings.notificationSettings.adminAlertOnFlaggedContent}
                onChange={(e) => updateNotificationSetting('adminAlertOnFlaggedContent', e.target.checked)}
              />
              <label htmlFor="adminAlertOnFlaggedContent">Admin Alerts for Flagged Content</label>
              <p className="setting-description">
                Send alerts to administrators when content is flagged
              </p>
            </div>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="dailyReportEmail"
                checked={settings.notificationSettings.dailyReportEmail}
                onChange={(e) => updateNotificationSetting('dailyReportEmail', e.target.checked)}
              />
              <label htmlFor="dailyReportEmail">Daily Report Emails</label>
              <p className="setting-description">
                Send daily activity reports to administrators
              </p>
            </div>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="userInactivityReminders"
                checked={settings.notificationSettings.userInactivityReminders}
                onChange={(e) => updateNotificationSetting('userInactivityReminders', e.target.checked)}
              />
              <label htmlFor="userInactivityReminders">User Inactivity Reminders</label>
              <p className="setting-description">
                Send reminders to users who haven't logged in recently
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'ui' && (
          <div className="settings-section">
            <h3>UI Settings</h3>
            
            <div className="setting-item">
              <label htmlFor="defaultTheme">Default Theme</label>
              <select
                id="defaultTheme"
                value={settings.uiSettings.defaultTheme}
                onChange={(e) => updateUISetting('defaultTheme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Preference</option>
              </select>
              <p className="setting-description">
                Default theme for new users
              </p>
            </div>
            
            <div className="setting-item">
              <label htmlFor="primaryColor">Primary Color</label>
              <input
                type="color"
                id="primaryColor"
                value={settings.uiSettings.primaryColor}
                onChange={(e) => updateUISetting('primaryColor', e.target.value)}
              />
              <p className="setting-description">
                Primary color for buttons and headers
              </p>
            </div>
            
            <div className="setting-item">
              <label htmlFor="accentColor">Accent Color</label>
              <input
                type="color"
                id="accentColor"
                value={settings.uiSettings.accentColor}
                onChange={(e) => updateUISetting('accentColor', e.target.value)}
              />
              <p className="setting-description">
                Accent color for highlights and secondary elements
              </p>
            </div>
            
            <div className="setting-item checkbox">
              <input
                type="checkbox"
                id="enableAnimations"
                checked={settings.uiSettings.enableAnimations}
                onChange={(e) => updateUISetting('enableAnimations', e.target.checked)}
              />
              <label htmlFor="enableAnimations">Enable Animations</label>
              <p className="setting-description">
                Enable UI animations throughout the application
              </p>
            </div>
            
            <div className="color-preview">
              <h4>Color Preview</h4>
              <div 
                className="preview-primary"
                style={{ backgroundColor: settings.uiSettings.primaryColor }}
              >
                Primary Color
              </div>
              <div 
                className="preview-accent"
                style={{ backgroundColor: settings.uiSettings.accentColor }}
              >
                Accent Color
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="settings-actions">
        <button 
          className="reset-button"
          onClick={handleResetSettings}
        >
          Reset to Defaults
        </button>
        <button 
          className="save-button"
          onClick={handleSaveSettings}
          disabled={!hasChanges}
        >
          {hasChanges ? 'Save Changes' : 'No Changes'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;