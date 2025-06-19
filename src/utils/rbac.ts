
import { Role, Permission, RoleDefinition } from '../types/auth';

// Define role configurations with their permissions
export const roleDefinitions: RoleDefinition[] = [
  {
    name: 'admin',
    displayName: 'Administrator',
    description: 'Full access to all features and settings',
    permissions: [
      'view_dashboard',
      'manage_users',
      'delete_messages',
      'edit_settings',
      'view_analytics',
      'export_data',
      'manage_roles'
    ]
  },
  {
    name: 'moderator',
    displayName: 'Moderator',
    description: 'Can moderate content and manage some settings',
    permissions: [
      'view_dashboard',
      'delete_messages',
      'view_analytics'
    ]
  },
  {
    name: 'user',
    displayName: 'User',
    description: 'Standard user with basic access',
    permissions: []
  }
];

// Get permissions for a specific role
export const getPermissionsForRole = (role: Role): Permission[] => {
  const roleDefinition = roleDefinitions.find(r => r.name === role);
  return roleDefinition ? roleDefinition.permissions : [];
};

// Check if a role has a specific permission
export const hasPermission = (role: Role, permission: Permission): boolean => {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
};

// Get all available roles
export const getAllRoles = (): RoleDefinition[] => {
  return roleDefinitions;
};

// Get role definition by name
export const getRoleByName = (roleName: Role): RoleDefinition | undefined => {
  return roleDefinitions.find(role => role.name === roleName);
};