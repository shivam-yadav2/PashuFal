import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../types/domain';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone: string;
  title: string;
  loggedInAt: string;
}

interface AuthContextType {
  role: UserRole;
  userName: string;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isOwner: boolean;
  isManager: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'champa_dairy_auth_session';

// Production credentials registry for Champa Dairy & Pashu Kendra
const VALID_CREDENTIALS: Record<string, { pass: string; role: UserRole; name: string; phone: string; title: string }> = {
  parmeshwar: {
    pass: 'admin123',
    role: 'OWNER',
    name: 'Parmeshwar Kushwaha',
    phone: '9792820684',
    title: 'Farm Owner & Managing Director',
  },
  owner: {
    pass: '9792820684',
    role: 'OWNER',
    name: 'Parmeshwar Kushwaha',
    phone: '9792820684',
    title: 'Farm Owner & Managing Director',
  },
  manager: {
    pass: 'lar2026',
    role: 'MANAGER',
    name: 'Ramesh Kumar',
    phone: '9838123456',
    title: 'Farm & Dispatch Operations Manager',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const role: UserRole = currentUser ? currentUser.role : 'PUBLIC';

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to persist auth session:', e);
    }
  }, [currentUser]);

  const login = (usernameInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const username = usernameInput.trim().toLowerCase();
    const cred = VALID_CREDENTIALS[username];

    if (!cred) {
      return { success: false, error: 'अमान्य यूज़रनेम। कृपया सही यूज़रनेम दर्ज करें।' };
    }

    if (cred.pass !== passwordInput.trim()) {
      return { success: false, error: 'अमान्य पासवर्ड। कृपया सही पासवर्ड दर्ज करें।' };
    }

    const user: AuthUser = {
      id: username,
      username,
      name: cred.name,
      role: cred.role,
      phone: cred.phone,
      title: cred.title,
      loggedInAt: new Date().toISOString(),
    };

    setCurrentUser(user);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const userName = currentUser ? `${currentUser.name} (${currentUser.role === 'OWNER' ? 'Owner' : 'Manager'})` : 'Public Visitor';

  return (
    <AuthContext.Provider
      value={{
        role,
        userName,
        currentUser,
        isAuthenticated: !!currentUser,
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
