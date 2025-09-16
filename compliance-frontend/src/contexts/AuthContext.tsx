import React, { createContext, useContext, ReactNode } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { useMsal, useAccount } from '@azure/msal-react';

type AccountInfo = {
  homeAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  localAccountId: string;
  name?: string;
  idTokenClaims?: any;
};

type Configuration = {
  auth: {
    clientId: string;
    authority?: string;
    redirectUri?: string;
  };
  cache?: {
    cacheLocation?: string;
    storeAuthStateInCookie?: boolean;
  };
};

type SilentRequest = {
  scopes: string[];
  account: AccountInfo;
};

type PopupRequest = {
  scopes: string[];
};

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '2a339fbf-acaf-474d-b84a-fd259ef15860',
    authority: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/7313ad10-b885-4b50-9c75-9dbbd975618f',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'openid', 'profile'],
};

// Create MSAL instance
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
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const isAuthenticated = account !== null;

  const login = async () => {
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    instance.logoutPopup({
      postLogoutRedirectUri: window.location.origin,
    });
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!account) {
      return null;
    }

    console.log(account)
    const silentRequest: SilentRequest = {
      scopes: loginRequest.scopes,
      account: account,
    };

    try {
      const response = await instance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (error) {
      console.error('Silent token acquisition failed:', error);
      try {
        const response = await instance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      } catch (popupError) {
        console.error('Popup token acquisition failed:', popupError);
        return null;
      }
    }
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