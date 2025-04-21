
// API base URL configuration
export const API_BASE_URL = '/api';

// Request timeout utility
export const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};

// Enhanced fetch with timeout and better error handling
export const fetchWithTimeout = async (url: string, options?: RequestInit, timeout = 30000) => {
  try {
    console.log(`Making request to: ${url}`);
    const response = await Promise.race([
      fetch(url, options),
      timeoutPromise(timeout)
    ]);
    
    console.log(`Response status: ${response.status} for ${url}`);
    
    if (!response.ok) {
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error ${response.status}`);
        } else {
          const text = await response.text();
          console.error(`Non-JSON error response: ${text}`);
          throw new Error(`HTTP error ${response.status}`);
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes('HTTP error')) {
          throw e;
        }
        throw new Error(`HTTP error ${response.status}`);
      }
    }
    
    return response;
  } catch (error) {
    console.error("API request failed:", error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Network error: Could not connect to server at ${API_BASE_URL}. Please ensure the backend server is running.`);
    }
    throw error;
  }
};
