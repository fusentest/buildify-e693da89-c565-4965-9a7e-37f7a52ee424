
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Permission } from '../../types/auth';
import { hasPermission } from '../../utils/rbac';

interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children, 
  fallback = null 
}) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <>{fallback}</>;
  }
  
  const hasRequiredPermission = hasPermission(currentUser.role, permission);
  
  return <>{hasRequiredPermission ? children : fallback}</>;
};

export default PermissionGuard;