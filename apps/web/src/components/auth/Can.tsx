'use client';

import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface CanProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode; // Agar permission na ho toh kya dikhana hai (optional)
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { user } = useAuth();

  // Agar user hi nahi hai, toh kuch mat dikhao
  if (!user) return <>{fallback}</>;

  // Owner ke paas '*' (sab kuch) hota hai
  if (user.permissions.includes('*')) {
    return <>{children}</>;
  }

  // Check karo ki user ke paas specific permission hai ya nahi
  const hasPermission = user.permissions.includes(permission);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}