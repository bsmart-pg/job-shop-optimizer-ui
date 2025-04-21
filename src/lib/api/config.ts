
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
    const response = await Promise.race([
      fetch(url, options),
      timeoutPromise(timeout)
    ]);
    
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      } catch (e) {
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
