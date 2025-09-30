import { useCallback } from 'react';
import { useRoleBasedApi } from '../../middleware/AuthenticationProvider';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { RequestMetadata } from '../../middleware/apiClient';

/**
 * Enhanced API hooks that integrate with Azure authentication and role-based access control
 */


interface UseAuthenticatedApiMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
  requiredRoles?: string[];
  skipRoleValidation?: boolean;
}

/**
 * Hook for making authenticated API calls with role-based access control
 */
export const useAuthenticatedApi = () => {
  const api = useRoleBasedApi();

  const makeRequest = useCallback(async <T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    options: {
      config?: AxiosRequestConfig;
      requiredRoles?: string[];
      skipRoleValidation?: boolean;
    } = {}
  ): Promise<AxiosResponse<T>> => {
    const { config = {}, requiredRoles = [], skipRoleValidation = false } = options;

    const metadata: RequestMetadata = {
      requiresAuth: true,
      requiredRoles,
      skipRoleValidation
    };

    const requestConfig = {
      ...config,
      metadata
    };

    switch (method) {
      case 'GET':
        return api.get<T>(endpoint, requestConfig);
      case 'POST':
        return api.post<T>(endpoint, data, requestConfig);
      case 'PUT':
        return api.put<T>(endpoint, data, requestConfig);
      case 'DELETE':
        return api.delete<T>(endpoint, requestConfig);
      case 'PATCH':
        return api.patch<T>(endpoint, data, requestConfig);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }, [api]);

  // Convenience methods for different HTTP verbs
  const get = useCallback(<T = any>(
    endpoint: string,
    options: {
      config?: AxiosRequestConfig;
      requiredRoles?: string[];
      skipRoleValidation?: boolean;
    } = {}
  ): Promise<AxiosResponse<T>> => {
    return makeRequest<T>('GET', endpoint, undefined, options);
  }, [makeRequest]);

  const post = useCallback(<T = any>(
    endpoint: string,
    data?: any,
    options: {
      config?: AxiosRequestConfig;
      requiredRoles?: string[];
      skipRoleValidation?: boolean;
    } = {}
  ): Promise<AxiosResponse<T>> => {
    return makeRequest<T>('POST', endpoint, data, options);
  }, [makeRequest]);

  const put = useCallback(<T = any>(
    endpoint: string,
    data?: any,
    options: {
      config?: AxiosRequestConfig;
      requiredRoles?: string[];
      skipRoleValidation?: boolean;
    } = {}
  ): Promise<AxiosResponse<T>> => {
    return makeRequest<T>('PUT', endpoint, data, options);
  }, [makeRequest]);

  const del = useCallback(<T = any>(
    endpoint: string,
    options: {
      config?: AxiosRequestConfig;
      requiredRoles?: string[];
      skipRoleValidation?: boolean;
    } = {}
  ): Promise<AxiosResponse<T>> => {
    return makeRequest<T>('DELETE', endpoint, undefined, options);
  }, [makeRequest]);

  const patch = useCallback(<T = any>(
    endpoint: string,
    data?: any,
    options: {
      config?: AxiosRequestConfig;
      requiredRoles?: string[];
      skipRoleValidation?: boolean;
    } = {}
  ): Promise<AxiosResponse<T>> => {
    return makeRequest<T>('PATCH', endpoint, data, options);
  }, [makeRequest]);

  // Role-based convenience methods that explicitly require roles
  const getWithRoles = useCallback(<T = any>(
    endpoint: string,
    requiredRoles: string[],
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return api.getWithRoles<T>(endpoint, requiredRoles, config);
  }, [api]);

  const postWithRoles = useCallback(<T = any>(
    endpoint: string,
    data: any,
    requiredRoles: string[],
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return api.postWithRoles<T>(endpoint, data, requiredRoles, config);
  }, [api]);

  const putWithRoles = useCallback(<T = any>(
    endpoint: string,
    data: any,
    requiredRoles: string[],
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return api.putWithRoles<T>(endpoint, data, requiredRoles, config);
  }, [api]);

  const deleteWithRoles = useCallback(<T = any>(
    endpoint: string,
    requiredRoles: string[],
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    return api.deleteWithRoles<T>(endpoint, requiredRoles, config);
  }, [api]);

  return {
    // Standard authenticated methods
    get,
    post,
    put,
    delete: del,
    patch,

    // Role-based methods
    getWithRoles,
    postWithRoles,
    putWithRoles,
    deleteWithRoles,

    // Utilities
    uploadFile: api.uploadFile,
    getAuthStatus: api.getAuthStatus,
    healthCheck: api.healthCheck,

    // Raw API access for complex scenarios
    raw: api
  };
};

/**
 * Hook for role-based API mutations with enhanced error handling
 * This extends the existing useApiMutation with role validation
 */
export const useAuthenticatedMutation = <T = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  options: UseAuthenticatedApiMutationOptions = {}
) => {
  const api = useAuthenticatedApi();
  const {
    onSuccess,
    onError,
    onSettled,
    requiredRoles = [],
    skipRoleValidation = false
  } = options;

  const mutate = useCallback(async (data?: any): Promise<T> => {
    try {
      let response: AxiosResponse<T>;

      const requestOptions = {
        requiredRoles,
        skipRoleValidation
      };

      switch (method) {
        case 'POST':
          response = await api.post<T>(endpoint, data, requestOptions);
          break;
        case 'PUT':
          response = await api.put<T>(endpoint, data, requestOptions);
          break;
        case 'PATCH':
          response = await api.patch<T>(endpoint, data, requestOptions);
          break;
        case 'DELETE':
          response = await api.delete<T>(endpoint, requestOptions);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';

      if (onError) {
        onError(errorMessage);
      }

      throw error;
    } finally {
      if (onSettled) {
        onSettled();
      }
    }
  }, [api, endpoint, method, onSuccess, onError, onSettled, requiredRoles, skipRoleValidation]);

  return {
    mutate
  };
};

/**
 * Helper hook to check if user has required roles for an action
 */
export const useRoleCheck = () => {
  const api = useRoleBasedApi();

  const hasRoles = useCallback((requiredRoles: string[]): boolean => {
    const authStatus = api.getAuthStatus();

    if (!authStatus.userRoles || !requiredRoles.length) {
      return true; // No roles required or no roles available
    }

    return requiredRoles.some(role => authStatus.userRoles!.includes(role));
  }, [api]);

  const checkPermission = useCallback((requiredRoles: string[]): {
    hasPermission: boolean;
    userRoles: string[] | null;
    missingRoles: string[];
  } => {
    const authStatus = api.getAuthStatus();
    const userRoles = authStatus.userRoles || [];

    const hasPermission = hasRoles(requiredRoles);
    const missingRoles = requiredRoles.filter(role => !userRoles.includes(role));

    return {
      hasPermission,
      userRoles: authStatus.userRoles,
      missingRoles
    };
  }, [api, hasRoles]);

  return {
    hasRoles,
    checkPermission,
    getAuthStatus: api.getAuthStatus
  };
};

export default useAuthenticatedApi;