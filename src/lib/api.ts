
import { Schedule } from "./types";

// You can change this in production
const API_BASE_URL = "http://localhost:8080";

// Add a request timeout function to prevent hanging requests
const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};

// Enhanced fetch with timeout and better error handling
const fetchWithTimeout = async (url: string, options?: RequestInit, timeout = 30000) => {
  try {
    const response = await Promise.race([
      fetch(url, options),
      timeoutPromise(timeout)
    ]);
    
    if (!response.ok) {
      // Try to parse error message from response
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      } catch (e) {
        throw new Error(`HTTP error ${response.status}`);
      }
    }
    
    return response;
  } catch (error) {
    // Enhance error message for network failures
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Network error: Could not connect to server at ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Cached data for improved performance
let cachedSchedule: Schedule | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5000; // 5 seconds

export const fetchSchedule = async (skipCache = false): Promise<Schedule> => {
  // Return cached data if available and fresh
  const now = Date.now();
  if (!skipCache && cachedSchedule && (now - lastFetchTime < CACHE_TTL)) {
    return cachedSchedule;
  }
  
  const response = await fetchWithTimeout(`${API_BASE_URL}/schedule`);
  const data = await response.json();
  
  // Update cache
  cachedSchedule = data;
  lastFetchTime = now;
  
  return data;
};

export const startSolving = async (): Promise<void> => {
  await fetchWithTimeout(`${API_BASE_URL}/schedule/solve`, {
    method: "POST",
  });
  
  // Invalidate cache when starting solving
  cachedSchedule = null;
};

export const stopSolving = async (): Promise<void> => {
  await fetchWithTimeout(`${API_BASE_URL}/schedule/stopSolving`, {
    method: "POST",
  });
  
  // Invalidate cache when stopping solving
  cachedSchedule = null;
};

export const resetSchedule = async (): Promise<void> => {
  await fetchWithTimeout(`${API_BASE_URL}/schedule/reset`, {
    method: "POST",
  });
  
  // Invalidate cache when resetting schedule
  cachedSchedule = null;
};

export const uploadFiles = async (files: File[]): Promise<string> => {
  const formData = new FormData();
  files.forEach(file => {
    if (file) {
      formData.append("files", file);
    }
  });

  const response = await fetchWithTimeout(`${API_BASE_URL}/schedule/uploadFiles`, {
    method: "POST",
    body: formData,
  }, 60000); // Longer timeout for uploads

  // Invalidate cache when uploading files
  cachedSchedule = null;
  
  return await response.text();
};
