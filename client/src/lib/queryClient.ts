import { QueryClient } from "@tanstack/react-query";
import { apiRequest } from "./utils";

// Global error handler for queries
const globalErrorHandler = (error: any) => {
  console.error('Query error:', error);
  
  // Handle specific error types
  if (error?.status === 401) {
    // Handle unauthorized - could redirect to login
    console.log('Unauthorized request, user may need to login');
  } else if (error?.status === 403) {
    // Handle forbidden
    console.log('Access forbidden');
  } else if (error?.status >= 500) {
    // Handle server errors
    console.error('Server error:', error);
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long to keep data in cache
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Error handling
      onError: globalErrorHandler,
    },
    mutations: {
      // Retry failed mutations
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      
      // Error handling
      onError: globalErrorHandler,
    },
  },
});

// Enhanced getQueryFn with better error handling
export const getQueryFn = async (endpoint: string, params?: any) => {
  try {
    const response = await apiRequest("GET", endpoint, params);
    return response;
  } catch (error: any) {
    // Enhance error with endpoint information
    const enhancedError = new Error(`Failed to fetch ${endpoint}: ${error.message}`);
    (enhancedError as any).status = error.status;
    (enhancedError as any).endpoint = endpoint;
    throw enhancedError;
  }
};

// Enhanced mutation function with better error handling
export const getMutationFn = (method: string, endpoint: string) => {
  return async (data: any) => {
    try {
      const response = await apiRequest(method, endpoint, data);
      return response;
    } catch (error: any) {
      // Enhance error with endpoint information
      const enhancedError = new Error(`Failed to ${method.toLowerCase()} ${endpoint}: ${error.message}`);
      (enhancedError as any).status = error.status;
      (enhancedError as any).endpoint = endpoint;
      (enhancedError as any).method = method;
      throw enhancedError;
    }
  };
};

// Utility function to invalidate related queries
export const invalidateRelatedQueries = (queryKeys: string[]) => {
  queryKeys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};

// Utility function to prefetch data
export const prefetchQuery = async (endpoint: string, params?: any) => {
  await queryClient.prefetchQuery({
    queryKey: [endpoint, params],
    queryFn: () => getQueryFn(endpoint, params),
  });
};
