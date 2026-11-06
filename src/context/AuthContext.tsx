import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types/domain';
import { authApi } from '../services/api';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone: string;
}

interface AuthContextType {
  role: UserRole;
  userName: string;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isOwner: boolean;
  isManager: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(data: { id: string; username: string; fullName: string; role: UserRole; phone: string }): AuthUser {
  return { id: data.id, username: data.username, name: data.fullName, role: data.role, phone: data.phone };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  // True until the initial /api/auth/me check completes, so the UI doesn't
  // flash "logged out" before we know whether a valid session cookie exists.
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((data) => setCurrentUser(toAuthUser(data)))
      .catch(() => setCurrentUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  const role: UserRole = currentUser ? currentUser.role : 'PUBLIC';

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await authApi.login(username, password);
      setCurrentUser(toAuthUser(data));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid username or password.' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setCurrentUser(null);
    }
  };

  const userName = currentUser ? `${currentUser.name} (${currentUser.role === 'OWNER' ? 'Owner' : 'Manager'})` : 'Public Visitor';

  return (
    <AuthContext.Provider
      value={{
        role,
        userName,
        currentUser,
        isAuthenticated: !!currentUser,
        isCheckingSession,
        login,
        logout,
        isOwner: role === 'OWNER',
        isManager: role === 'MANAGER',
        isStaff: role === 'OWNER' || role === 'MANAGER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
