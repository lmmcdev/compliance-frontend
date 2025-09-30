import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from './apiClient';

interface AuthenticationProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Middleware
 *
 * This component acts as a bridge between the AuthContext and the API client,
 * automatically updating the API client with authentication data whenever
 * the authentication state changes.
 *
 * It should be placed inside the AuthProvider but outside other contexts
 * that depend on authenticated API calls.
 */
export const AuthenticationProvider: React.FC<AuthenticationProviderProps> = ({ children }) => {
  const {
    accessToken,
    userRoles,
    tokenPayload,
    getAccessToken,
    isAuthenticated
  } = useAuth();

  // Update API client with authentication data whenever auth state changes
  useEffect(() => {
    console.log('[AuthenticationProvider] Authentication state changed:', {
      isAuthenticated,
      hasToken: !!accessToken,
      roles: userRoles,
      tokenExpiry: tokenPayload?.exp ? new Date(tokenPayload.exp * 1000) : null
    });

    // Set authentication data in the API client
    apiClient.setAuthData({
      accessToken,
      userRoles,
      tokenPayload,
      getAccessToken
    });

    // Log current auth status for debugging
    const authStatus = apiClient.getAuthStatus();
    console.log('[AuthenticationProvider] API client auth status updated:', authStatus);

  }, [accessToken, userRoles, tokenPayload, getAccessToken, isAuthenticated]);

  // Automatically refresh token if it's about to expire
  useEffect(() => {
    if (!isAuthenticated || !tokenPayload?.exp) {
      return;
    }

    const tokenExpiry = new Date(tokenPayload.exp * 1000);
    const now = new Date();
    const timeUntilExpiry = tokenExpiry.getTime() - now.getTime();

    // If token expires in less than 5 minutes, refresh it
    const refreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (timeUntilExpiry > 0 && timeUntilExpiry < refreshThreshold) {
      console.log('[AuthenticationProvider] Token expires soon, refreshing...', {
        expiry: tokenExpiry,
        timeUntilExpiry: Math.round(timeUntilExpiry / 1000 / 60) + ' minutes'
      });

      getAccessToken().catch(error => {
        console.error('[AuthenticationProvider] Failed to refresh token:', error);
      });
    }

    // Set up a timer to refresh the token before it expires
    if (timeUntilExpiry > refreshThreshold) {
      const refreshTimer = setTimeout(() => {
        console.log('[AuthenticationProvider] Refreshing token before expiry...');
        getAccessToken().catch(error => {
          console.error('[AuthenticationProvider] Scheduled token refresh failed:', error);
        });
      }, timeUntilExpiry - refreshThreshold);

      return () => clearTimeout(refreshTimer);
    }
  }, [tokenPayload?.exp, isAuthenticated, getAccessToken]);

  return <>{children}</>;
};

/**
 * Hook to get API client with current authentication
 * This ensures the API client is always synchronized with the auth state
 */
export const useAuthenticatedApiClient = () => {
  const { isAuthenticated, userRoles } = useAuth();

  return {
    apiClient,
    isAuthenticated,
    userRoles,
    authStatus: apiClient.getAuthStatus()
  };
};

/**
 * Helper hook for role-based API calls
 * Provides convenience methods for making API calls with role requirements
 */
export const useRoleBasedApi = () => {
  const { apiClient: client } = useAuthenticatedApiClient();

  return {
    // Standard authenticated calls
    get: client.get.bind(client),
    post: client.post.bind(client),
    put: client.put.bind(client),
    patch: client.patch.bind(client),
    delete: client.delete.bind(client),

    // Role-based authenticated calls
    getWithRoles: client.getWithRoles.bind(client),
    postWithRoles: client.postWithRoles.bind(client),
    putWithRoles: client.putWithRoles.bind(client),
    deleteWithRoles: client.deleteWithRoles.bind(client),

    // File upload
    uploadFile: client.uploadFile.bind(client),

    // Utilities
    getAuthStatus: client.getAuthStatus.bind(client),
    healthCheck: client.healthCheck.bind(client)
  };
};

export default AuthenticationProvider;