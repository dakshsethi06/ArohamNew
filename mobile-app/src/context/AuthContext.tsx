import React from 'react';
import { AuthProvider as BaseAuthProvider, useAuth } from '@logic/context/AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseAuthProvider>{children}</BaseAuthProvider>;
};

export { useAuth };
