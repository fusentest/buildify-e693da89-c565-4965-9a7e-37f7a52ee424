
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, UserPreferences } from '../types/auth';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string }) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updatePreferences: (preferences: UserPreferences) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setIsAdmin(user.role === 'admin');
    }
    setIsLoading(false);
  }, []);

  // Simulated login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to your auth service
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = storedUsers.find((u: any) => 
        u.email === email && u.password === password
      );
      
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = user;
      
      setCurrentUser(userWithoutPassword);
      setIsAdmin(userWithoutPassword.role === 'admin');
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulated signup function
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call to your auth service
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (storedUsers.some((u: any) => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Check if this is the first user - make them admin
      const isFirstUser = storedUsers.length === 0;
      
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name,
        role: isFirstUser ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };
      
      // Store user in localStorage
      localStorage.setItem('users', JSON.stringify([...storedUsers, newUser]));
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = newUser;
      
      setCurrentUser(userWithoutPassword);
      setIsAdmin(userWithoutPassword.role === 'admin');
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
  };
  
  // Update profile information
  const updateProfile = async (data: { name?: string }) => {
    if (!currentUser) {
      return Promise.reject(new Error('No user is logged in'));
    }
    
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update user data
      const updatedUser = {
        ...storedUsers[userIndex],
        ...data
      };
      
      storedUsers[userIndex] = updatedUser;
      localStorage.setItem('users', JSON.stringify(storedUsers));
      
      // Update current user state
      const { password: _, ...userWithoutPassword } = updatedUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };
  
  // Update email
  const updateEmail = async (email: string) => {
    if (!currentUser) {
      return Promise.reject(new Error('No user is logged in'));
    }
    
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email is already in use
      if (storedUsers.some((u: any) => u.email === email && u.id !== currentUser.id)) {
        throw new Error('Email is already in use');
      }
      
      const userIndex = storedUsers.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update email
      storedUsers[userIndex].email = email;
      localStorage.setItem('users', JSON.stringify(storedUsers));
      
      // Update current user state
      const { password: _, ...userWithoutPassword } = storedUsers[userIndex];
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };
  
  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      return Promise.reject(new Error('No user is logged in'));
    }
    
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = storedUsers.findIndex((u: any) => u.id === currentUser.id);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Verify current password
      if (storedUsers[userIndex].password !== currentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      storedUsers[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(storedUsers));
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };
  
  // Update user preferences
  const updatePreferences = async (preferences: UserPreferences) => {
    if (!currentUser) {
      return Promise.reject(new Error('No user is logged in'));
    }
    
    try {
      // Store preferences in localStorage
      localStorage.setItem(`preferences_${currentUser.id}`, JSON.stringify(preferences));
      
      // Apply preferences if needed (e.g., dark mode)
      if (preferences.darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    updateEmail,
    updatePassword,
    updatePreferences,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};