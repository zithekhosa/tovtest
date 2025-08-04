import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Enhanced error handling for API responses
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    
    try {
      // Try to parse the response as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await res.json();
        errorMessage = jsonResponse.message || jsonResponse.error || JSON.stringify(jsonResponse);
      } else {
        // Fall back to text if not JSON
        const text = await res.text();
        errorMessage = text || res.statusText;
      }
    } catch (parseError) {
      console.error('Error parsing error response:', parseError);
      // If parsing fails, just use the status text
      errorMessage = res.statusText;
    }
    
    // Create an error with status code and message
    const error = new Error(`${res.status}: ${errorMessage}`);
    (error as any).status = res.status;
    throw error;
  }
}

// Enhanced API request function with better error handling
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  try {
    console.log(`API Request: ${method} ${url}`, { data });
    
    const headers: Record<string, string> = {};
    if (data) {
      headers["Content-Type"] = "application/json";
    }
    
    // For now, rely on session cookies for authentication
    // The backend uses express-session, not JWT tokens
    console.log('Using session-based authentication');

    console.log('Request headers:', headers);
    console.log('Request URL:', url);

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));

    await throwIfResNotOk(res);
    
    // Try to parse JSON response
    try {
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonResponse = await res.json();
        console.log('JSON Response:', jsonResponse);
        return jsonResponse;
      } else {
        const textResponse = await res.text();
        console.log('Text Response:', textResponse);
        return textResponse;
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return res;
    }
  } catch (error: any) {
    // Log the error for debugging
    console.error(`API Request failed (${method} ${url}):`, error);
    
    // Re-throw the error with additional context
    const enhancedError = new Error(`API Request failed: ${error.message}`);
    (enhancedError as any).status = error.status;
    (enhancedError as any).method = method;
    (enhancedError as any).url = url;
    throw enhancedError;
  }
}

// Utility function to format currency
export function formatCurrency(amount: number, currency: string = 'BWP'): string {
  return new Intl.NumberFormat('en-BW', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// Utility function to format dates
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-BW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(dateObj);
}

// Utility function to format date and time
export function formatDateTime(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-BW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }).format(dateObj);
}

// Utility function to validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to debounce function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Utility function to throttle function calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Utility function to generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Utility function to safely access nested object properties
export function getNestedValue(obj: any, path: string, defaultValue: any = undefined): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
}

// Utility function to deep clone objects
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

// Utility function to get initials from name
export function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName && !lastName) return '?';
  
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  
  return first + last;
}
