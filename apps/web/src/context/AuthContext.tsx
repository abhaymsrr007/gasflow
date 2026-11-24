'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
interface User {
  id: string;
  fullName: string;  
  email: string;    
  role: string;
  tenantId: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Page load hone par localStorage se user uthao
  useEffect(() => {
    const storedUser = localStorage.getItem('gasflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem('gasflow_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('gasflow_user');
    }
  };

  const logout = () => {
    handleSetUser(null);
    // Future: API call to /auth/logout
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}