import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * Unified Azure Functions HTTP Client
 *
 * This client provides a standardized way to interact with Azure Functions APIs
 * across the application, following the same pattern as the existing API client.
 */

interface AzureFunctionsConfig {
  baseURL: string;
  functionKey: string;
  timeout?: number;
}

class AzureFunctionsClient {
  private client: AxiosInstance;
  private config: AzureFunctionsConfig;

  constructor(config: AzureFunctionsConfig) {
    this.config = config;

    // Create Axios instance with Azure Functions specific configuration
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': config.functionKey,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token if available (for user context)
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[Azure Functions] Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error: AxiosError) => {
        console.error('[Azure Functions] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[Azure Functions] Response received from ${response.config.url}:`, response.status);
        return response;
      },
      (error: AxiosError) => {
        console.error('[Azure Functions] Response interceptor error:', error);

        // Handle different error scenarios
        if (error.response?.status === 401) {
          console.error('[Azure Functions] Unauthorized - invalid function key or token');
        }

        if (error.response?.status === 403) {
          console.error('[Azure Functions] Forbidden - insufficient permissions');
        }

        if (error.response?.status === 404) {
          console.error('[Azure Functions] Function not found - check endpoint URL');
        }

        if ((error.response?.status ?? 0) >= 500) {
          console.error('[Azure Functions] Server error - Azure Functions may be down');
        }

        // Handle network errors
        if (!error.response && error.code === 'ECONNABORTED') {
          console.error('[Azure Functions] Request timeout');
        }

        return Promise.reject(error);
      }
    );
  }

  // Standard HTTP methods following the same pattern as existing services
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
  updateConfig(newConfig: Partial<AzureFunctionsConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Update base configuration
    if (newConfig.baseURL) {
      this.client.defaults.baseURL = newConfig.baseURL;
    }

    if (newConfig.functionKey) {
      this.client.defaults.headers['x-functions-key'] = newConfig.functionKey;
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

  // Get current configuration (without sensitive data)
  getConfig(): Omit<AzureFunctionsConfig, 'functionKey'> {
    return {
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
    };
  }
}

// Create the default Azure Functions client instance
const azureFunctionsConfig: AzureFunctionsConfig = {
  baseURL: import.meta.env.VITE_AZURE_FUNCTIONS_URL || 'https://compliance-api-fybjasdddtcxhqfw.eastus2-01.azurewebsites.net/api/v1',
  functionKey: import.meta.env.VITE_AZURE_FUNCTIONS_KEY || '',
  timeout: 30000,
};

// Validate configuration
if (!azureFunctionsConfig.baseURL || azureFunctionsConfig.baseURL.includes('your-function-app')) {
  console.warn('[Azure Functions] VITE_AZURE_FUNCTIONS_URL not configured properly');
}

if (!azureFunctionsConfig.functionKey) {
  console.warn('[Azure Functions] VITE_AZURE_FUNCTIONS_KEY not configured');
}

// Export the default client instance
export const azureFunctionsClient = new AzureFunctionsClient(azureFunctionsConfig);

// Export the class for creating additional instances if needed
export { AzureFunctionsClient };
export type { AzureFunctionsConfig };

export default azureFunctionsClient;