import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Centralized API Client with Azure Authentication Integration
 *
 * This client provides a standardized way to interact with all API endpoints
 * across the application, with automatic Azure AD token and role injection.
 * It integrates with the AuthContext to automatically include access tokens
 * and user roles in all API requests.
 */

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

interface AuthData {
  accessToken: string | null;
  userRoles: string[] | null;
  tokenPayload: any | null;
  getAccessToken: () => Promise<string | null>;
}

interface RequestMetadata {
  requiresAuth?: boolean;
  requiredRoles?: string[];
  skipRoleValidation?: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private authData: AuthData | null = null;

  constructor(config: ApiClientConfig) {
    this.config = config;

    // Create Axios instance with API specific configuration
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set authentication data from AuthContext
   * This should be called when the AuthContext is available
   */
  setAuthData(authData: AuthData): void {
    this.authData = authData;
    console.log('[API] Authentication data updated:', {
      hasToken: !!authData.accessToken,
      roles: authData.userRoles,
      tokenExpiry: authData.tokenPayload?.exp ? new Date(authData.tokenPayload.exp * 1000) : null
    });
  }

  /**
   * Validate if user has required roles for the request
   */
  private hasRequiredRoles(requiredRoles: string[]): boolean {
    if (!this.authData?.userRoles || !requiredRoles.length) {
      return true; // No roles required or no roles available
    }

    return requiredRoles.some(role => this.authData!.userRoles!.includes(role));
  }

  /**
   * Get fresh access token, refreshing if necessary
   */
  private async getFreshAccessToken(): Promise<string | null> {
    if (!this.authData?.getAccessToken) {
      console.warn('[API] No auth data available for token refresh');
      return null;
    }

    try {
      const token = await this.authData.getAccessToken();
      if (token) {
        console.log('[API] Successfully refreshed access token');
      }
      return token;
    } catch (error) {
      console.error('[API] Failed to refresh access token:', error);
      return null;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Extract metadata from config
        const metadata: RequestMetadata = (config as any).metadata || {};

        // Add authentication token if available
        let token = this.authData?.accessToken;

        // If no token but auth is required, try to get a fresh one
        if (!token && metadata.requiresAuth !== false) {
          token = await this.getFreshAccessToken();
        }

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add user roles to headers for backend role validation
        if (this.authData?.userRoles && config.headers) {
          config.headers['X-User-Roles'] = JSON.stringify(this.authData.userRoles);
        }

        // Add token payload for additional user context
        if (this.authData?.tokenPayload && config.headers) {
          config.headers['X-User-Context'] = JSON.stringify({
            oid: this.authData.tokenPayload.oid, // Object ID
            tid: this.authData.tokenPayload.tid, // Tenant ID
            sub: this.authData.tokenPayload.sub, // Subject
            aud: this.authData.tokenPayload.aud  // Audience
          });
        }

        // Validate roles if required
        if (metadata.requiredRoles && !metadata.skipRoleValidation) {
          if (!this.hasRequiredRoles(metadata.requiredRoles)) {
            const error = new Error(
              `Insufficient permissions. Required roles: ${metadata.requiredRoles.join(', ')}, User roles: ${this.authData?.userRoles?.join(', ') || 'none'}`
            );
            (error as any).code = 'INSUFFICIENT_PERMISSIONS';
            throw error;
          }
        }

        console.log(`[API] Making ${config.method?.toUpperCase()} request to ${config.url}`, {
          hasAuth: !!token,
          userRoles: this.authData?.userRoles,
          requiredRoles: metadata.requiredRoles
        });

        return config;
      },
      (error: AxiosError) => {
        console.error('[API] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[API] Response received from ${response.config.url}:`, response.status);
        return response;
      },
      async (error: AxiosError) => {
        console.error('[API] Response interceptor error:', error);

        // Handle different error scenarios
        if (error.response?.status === 401) {
          console.error('[API] Unauthorized - attempting token refresh');

          // Try to refresh token before redirecting
          if (this.authData?.getAccessToken) {
            try {
              const newToken = await this.authData.getAccessToken();
              if (newToken) {
                console.log('[API] Token refreshed, retrying request');
                // Update the failed request with new token
                if (error.config && error.config.headers) {
                  error.config.headers.Authorization = `Bearer ${newToken}`;
                  return this.client.request(error.config);
                }
              }
            } catch (refreshError) {
              console.error('[API] Token refresh failed:', refreshError);
            }
          }

          // If refresh fails, redirect to login
          console.error('[API] Authentication failed - redirecting to login');
          window.location.href = '/login';
        }

        if (error.response?.status === 403) {
          console.error('[API] Forbidden - insufficient permissions');
        }

        if (error.response?.status === 404) {
          console.error('[API] Resource not found - check endpoint URL');
        }

        if ((error.response?.status ?? 0) >= 500) {
          console.error('[API] Server error - API may be down');
        }

        // Handle network errors
        if (!error.response && error.code === 'ECONNABORTED') {
          console.error('[API] Request timeout');
        }

        return Promise.reject(error);
      }
    );
  }

  // Enhanced HTTP methods with role-based access control
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig & { metadata?: RequestMetadata }
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { metadata?: RequestMetadata }
  ): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { metadata?: RequestMetadata }
  ): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { metadata?: RequestMetadata }
  ): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig & { metadata?: RequestMetadata }
  ): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Utility method for uploading files (multipart/form-data)
  async uploadFile<T = any>(
    url: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    return this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        onProgress(progress);
      } : undefined,
    });
  }

  // Method to update configuration (useful for switching environments)
  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update base configuration
    if (newConfig.baseURL) {
      this.client.defaults.baseURL = newConfig.baseURL;
    }

    if (newConfig.timeout) {
      this.client.defaults.timeout = newConfig.timeout;
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      // Try to make a simple request to test connectivity
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Get current configuration
  getConfig(): ApiClientConfig {
    return {
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
    };
  }

  // Get current auth status
  getAuthStatus(): { isAuthenticated: boolean; userRoles: string[] | null; tokenExpiry: Date | null } {
    return {
      isAuthenticated: !!this.authData?.accessToken,
      userRoles: this.authData?.userRoles || null,
      tokenExpiry: this.authData?.tokenPayload?.exp
        ? new Date(this.authData.tokenPayload.exp * 1000)
        : null
    };
  }

  // Helper methods for role-based requests
  async getWithRoles<T = any>(
    url: string,
    requiredRoles: string[] = [],
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.get<T>(url, {
      ...config,
      metadata: { requiredRoles, requiresAuth: true }
    });
  }

  async postWithRoles<T = any>(
    url: string,
    data: any,
    requiredRoles: string[] = [],
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.post<T>(url, data, {
      ...config,
      metadata: { requiredRoles, requiresAuth: true }
    });
  }

  async putWithRoles<T = any>(
    url: string,
    data: any,
    requiredRoles: string[] = [],
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.put<T>(url, data, {
      ...config,
      metadata: { requiredRoles, requiresAuth: true }
    });
  }

  async deleteWithRoles<T = any>(
    url: string,
    requiredRoles: string[] = [],
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.delete<T>(url, {
      ...config,
      metadata: { requiredRoles, requiresAuth: true }
    });
  }
}

// Create the default API client instance
const apiConfig: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1',
  timeout: 30000,
};

// Validate configuration
if (!apiConfig.baseURL || apiConfig.baseURL.includes('your-api-base-url')) {
  console.warn('[API] VITE_API_BASE_URL not configured properly');
}

// Export the default client instance
export const apiClient = new ApiClient(apiConfig);

// Export the class for creating additional instances if needed
export { ApiClient };
export type { ApiClientConfig, AuthData, RequestMetadata };

export default apiClient;