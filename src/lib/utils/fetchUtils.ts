
// Helper function for timing out requests
export const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};

export const fetchWithTimeout = async (url: string, options?: RequestInit, timeout = 30000) => {
  try {
    console.log(`Fetching from: ${url}`);
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
      throw new Error('Network error: Could not connect to the backend server. Please ensure the backend server is running.');
    }
    throw error;
  }
};
