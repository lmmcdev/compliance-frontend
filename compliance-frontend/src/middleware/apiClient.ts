import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Centralized API Client
 *
 * This client provides a standardized way to interact with all API endpoints
 * across the application, following the same pattern as the existing httpInterceptor.
 */

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;

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

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[API] Making ${config.method?.toUpperCase()} request to ${config.url}`);
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
      (error: AxiosError) => {
        console.error('[API] Response interceptor error:', error);

        // Handle different error scenarios
        if (error.response?.status === 401) {
          console.error('[API] Unauthorized - removing token and redirecting to login');
          localStorage.removeItem('accessToken');
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

  // Standard HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
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
export type { ApiClientConfig };

export default apiClient;