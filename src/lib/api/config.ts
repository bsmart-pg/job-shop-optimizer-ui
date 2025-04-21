
// API base URL configuration
export const API_BASE_URL = process.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Request timeout utility
export const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};

// Enhanced fetch with timeout and better error handling
export const fetchWithTimeout = async (url: string, options?: RequestInit, timeout = 30000) => {
  try {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    console.log(`----------------------------------------`);
    console.log(`API REQUEST: ${options?.method || 'GET'} ${fullUrl}`);
    if (options?.body) {
      console.log(`REQUEST BODY:`, options.body);
    }
    if (options?.headers) {
      console.log(`REQUEST HEADERS:`, options.headers);
    }
    
    const response = await Promise.race([
      fetch(fullUrl, {
        ...options,
        headers: {
          ...options?.headers,
          'Content-Type': options?.headers?.['Content-Type'] || 'application/json',
        },
        // Enable CORS
        mode: 'cors',
        credentials: 'include',
      }),
      timeoutPromise(timeout)
    ]);
    
    console.log(`API RESPONSE: ${response.status} for ${fullUrl}`);
    
    // Log response headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log(`RESPONSE HEADERS:`, headers);
    
    if (!response.ok) {
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error(`JSON ERROR RESPONSE:`, errorData);
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        } else {
          const text = await response.text();
          console.error(`NON-JSON ERROR RESPONSE:`, text);
          throw new Error(`HTTP error ${response.status}`);
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes('HTTP error')) {
          throw e;
        }
        throw new Error(`HTTP error ${response.status}`);
      }
    }
    
    console.log(`----------------------------------------`);
    return response;
  } catch (error) {
    console.error("API REQUEST FAILED:", error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Network error: Could not connect to server at ${API_BASE_URL}. Please ensure the backend server is running and CORS is properly configured.`);
    }
    throw error;
  }
};
