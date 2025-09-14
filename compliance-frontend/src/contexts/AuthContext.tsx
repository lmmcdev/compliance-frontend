import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mock MSAL configuration for testing
export const msalConfig = {
  auth: {
    clientId: 'mock-client-id',
    authority: 'mock-authority',
    redirectUri: window.location.origin,
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile'],
};

interface AuthContextType {
  account: any | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Mock authentication - always authenticated for testing
  const [account] = useState<any>({ 
    name: 'Test User',
    username: 'test@company.com' 
  });
  const [isAuthenticated] = useState(true);

  const login = async () => {
    console.log('Mock login - already authenticated for testing');
  };

  const logout = () => {
    console.log('Mock logout - refresh page to test login flow');
  };

  const getAccessToken = async (): Promise<string | null> => {
    return 'mock-access-token-for-testing';
  };

  return (
    <AuthContext.Provider
      value={{
        account,
        isAuthenticated,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};