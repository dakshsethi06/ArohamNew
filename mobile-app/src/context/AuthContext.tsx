import React, { createContext, useContext, useState } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'astrologer';
}

interface AuthContextType {
  user: UserProfile | null;
  login: (name: string, email: string, role?: 'user' | 'astrologer') => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = (name: string, email: string, role: 'user' | 'astrologer' = 'user') => {
    const id = role === 'astrologer' ? 'astro-1' : 'user-' + email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    setUser({ id, name, email, role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
