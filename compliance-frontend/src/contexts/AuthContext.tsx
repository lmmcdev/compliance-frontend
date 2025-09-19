import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { PublicClientApplication, AuthError as MsalAuthError } from '@azure/msal-browser';
import { useMsal, useAccount } from '@azure/msal-react';

// ----------------------
// Types
// ----------------------
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

interface AuthError {
  code: string;
  message: string;
  timestamp: Date;
}

interface AuthContextType {
  account: AccountInfo | null;
  isAuthenticated: boolean;
  authError: AuthError | null;
  accessToken: string | null;
  userRoles: string[] | null;
  tokenPayload: any | null;
  login: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

// ----------------------
// MSAL Config
// ----------------------
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

// Solo login básico + Graph
export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'User.Read'],
};

// Token para tu API → solo .default
export const apiRequest: PopupRequest = {
  scopes: ['api://6eb9fc3a-5198-4cf2-81b9-a4b799ed543e/.default'],
};

export const msalInstance = new PublicClientApplication(msalConfig);

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------
// Provider
// ----------------------
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[] | null>(null);
  const [tokenPayload, setTokenPayload] = useState<any | null>(null);

  const isAuthenticated = !!account;

  const handleAuthError = useCallback((error: any) => {
    const authError: AuthError = {
      code: error.errorCode || error.code || 'UNKNOWN_ERROR',
      message: error.errorMessage || error.message || 'An unknown error occurred',
      timestamp: new Date(),
    };
    console.error('Authentication error:', authError);
    setAuthError(authError);
  }, []);

  const clearError = () => setAuthError(null);

  // Helper function to decode and store JWT token information
  const processAccessToken = useCallback((token: string) => {
    try {
      console.log('=== PROCESSING ACCESS TOKEN ===');
      console.log('Full access token:', token);

      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));

        console.log('=== JWT PAYLOAD DECODED ===');
        console.log('Full payload object:', payload);
        console.log('Audience (aud):', payload.aud);
        console.log('Issuer (iss):', payload.iss);
        console.log('Subject (sub):', payload.sub);
        console.log('Scopes (scp):', payload.scp);
        console.log('Roles:', payload.roles);
        console.log('Groups:', payload.groups);
        console.log('App roles:', payload.app_roles);
        console.log('Tenant ID (tid):', payload.tid);
        console.log('Object ID (oid):', payload.oid);
        console.log('Issued at (iat):', new Date(payload.iat * 1000));
        console.log('Expires at (exp):', new Date(payload.exp * 1000));
        console.log('Not before (nbf):', new Date(payload.nbf * 1000));
        console.log('===========================');

        // Store the token information in state
        setAccessToken(token);
        setTokenPayload(payload);
        setUserRoles(payload.roles || []);

        // Export to window for easy debugging
        (window as any).currentAccessToken = token;
        (window as any).currentTokenPayload = payload;
        (window as any).currentUserRoles = payload.roles || [];

        console.log('✅ Token information exported to window:');
        console.log('  - window.currentAccessToken');
        console.log('  - window.currentTokenPayload');
        console.log('  - window.currentUserRoles');

        return payload;
      }
    } catch (error) {
      console.error('❌ Failed to decode access token:', error);
      setAccessToken(null);
      setTokenPayload(null);
      setUserRoles(null);
    }
    return null;
  }, []);

  const login = async () => {
    try {
      clearError();
      const loginResponse = await instance.loginPopup(loginRequest);
      console.log('Login response:', loginResponse);
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  const logout = () => {
    instance.logoutPopup({ postLogoutRedirectUri: window.location.origin });
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (!account) {
      console.log('❌ No account available for token acquisition');
      return null;
    }

    console.log('🔄 Getting access token for API calls...');
    const silentRequest: SilentRequest = { scopes: apiRequest.scopes, account };

    try {
      console.log('Attempting silent token acquisition...');
      const response = await instance.acquireTokenSilent(silentRequest);

      console.log('✅ Silent token acquisition successful');
      console.log('Token scopes:', response.scopes);
      console.log('Token expires on:', response.expiresOn);

      // Process and store the token
      processAccessToken(response.accessToken);
      return response.accessToken;

    } catch (error) {
      console.warn('⚠️ Silent token acquisition failed, trying popup...', error);

      try {
        const response = await instance.acquireTokenPopup(apiRequest);
        console.log('✅ Popup token acquisition successful');
        console.log('Popup token scopes:', response.scopes);

        // Process and store the token
        processAccessToken(response.accessToken);
        return response.accessToken;

      } catch (popupError) {
        console.error('❌ Popup token acquisition failed:', popupError);
        handleAuthError(popupError);
        return null;
      }
    }
  };

  // Function to refresh the access token
  const refreshToken = async (): Promise<void> => {
    console.log('🔄 Refreshing access token...');
    await getAccessToken();
  };

  // Automatically get access token when user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && account && !accessToken) {
      console.log('🚀 User authenticated, automatically getting access token...');
      getAccessToken();
    }
  }, [isAuthenticated, account, accessToken]);

  return (
    <AuthContext.Provider
      value={{
        account,
        isAuthenticated,
        authError,
        accessToken,
        userRoles,
        tokenPayload,
        login,
        logout,
        getAccessToken,
        refreshToken,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ----------------------
// Hook
// ----------------------
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
