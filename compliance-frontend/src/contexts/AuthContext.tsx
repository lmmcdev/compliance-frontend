import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/your-tenant-id',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile'],
};

export const msalInstance = new PublicClientApplication(msalConfig);

interface AuthContextType {
  account: AccountInfo | null;
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
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async () => {
    try {
      const result = await msalInstance.loginPopup(loginRequest);
      setAccount(result.account);
      setIsAuthenticated(true);
      
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = () => {
    msalInstance.logoutPopup();
    setAccount(null);
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!account) return null;

    try {
      const result: AuthenticationResult = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });
      
      localStorage.setItem('accessToken', result.accessToken);
      return result.accessToken;
    } catch (error) {
      console.error('Failed to acquire token silently:', error);
      try {
        const result = await msalInstance.acquireTokenPopup(loginRequest);
        localStorage.setItem('accessToken', result.accessToken);
        return result.accessToken;
      } catch (popupError) {
        console.error('Failed to acquire token via popup:', popupError);
        return null;
      }
    }
  };

  return (
    <MsalProvider instance={msalInstance}>
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
    </MsalProvider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};