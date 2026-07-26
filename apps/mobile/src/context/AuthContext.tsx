import React from 'react';
import { AuthProvider as BaseAuthProvider, useAuth } from '@aroham/shared-auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BaseAuthProvider>{children}</BaseAuthProvider>;
};

export { useAuth };
