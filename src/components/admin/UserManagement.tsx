
import React, { useState, useEffect } from 'react';
import { User, Role } from '../../types/auth';
import { useAuth } from '../../context/AuthContext';
import { getAllRoles, getRoleByName } from '../../utils/rbac';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const { currentUser, hasPermission, updateUserRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('user');
  
  const roles = getAllRoles();
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  const loadUsers = () => {
    setIsLoading(true);
    try {
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const usersWithoutPasswords = storedUsers.map((user: any) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      setUsers(usersWithoutPasswords);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditRole = (userId: string, currentRole: Role) => {
    setEditingUserId(userId);
    setSelectedRole(currentRole);
  };
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(e.target.value as Role);
  };
  
  const handleSaveRole = async (userId: string) => {
    try {
      await updateUserRole(userId, selectedRole);
      setSuccessMessage(`User role updated successfully`);
      setEditingUserId(null);
      
      // Refresh user list
      loadUsers();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update user role');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingUserId(null);
  };
  
  if (!hasPermission('manage_users')) {
    return (
      <div className="permission-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to manage users.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return <div className="loading">Loading users...</div>;
  }
  
  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <p>Total Users: {users.length}</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id.substring(0, 8)}...</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  {editingUserId === user.id ? (
                    <select 
                      value={selectedRole} 
                      onChange={handleRoleChange}
                      className="role-select"
                    >
                      {roles.map(role => (
                        <option key={role.name} value={role.name}>
                          {role.displayName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className={`role-badge ${user.role}`}>
                      {getRoleByName(user.role)?.displayName || user.role}
                    </span>
                  )}
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  {editingUserId === user.id ? (
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleSaveRole(user.id)}
                        className="save-button"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleEditRole(user.id, user.role)}
                      className="edit-button"
                      disabled={user.id === currentUser?.id} // Can't edit own role
                      title={user.id === currentUser?.id ? "You cannot change your own role" : ""}
                    >
                      Edit Role
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="no-data">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;