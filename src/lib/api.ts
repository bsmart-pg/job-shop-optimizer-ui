import { Schedule } from "./types";

// You can change this in production using VITE_BACKEND_URL environment variable
const API_BASE_URL = '/api';

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
    console.error("API request failed:", error);
    // Enhance error message for network failures
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Network error: Could not connect to server at ${API_BASE_URL}. Please ensure the backend server is running.`);
    }
    throw error;
  }
};

// Cached data for improved performance
let cachedSchedule: Schedule | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5000; // 5 seconds

// Mock data for development when backend is not available
const getMockSchedule = (): Schedule => ({
  solverStatus: "NOT_SOLVING",
  score: "0hard/0soft",
  lines: [
    { id: "line1", name: "Line 1", machineTypeDisplayName: "Type A" },
    { id: "line2", name: "Line 2", machineTypeDisplayName: "Type B" }
  ],
  jobs: [
    {
      id: "job1",
      name: "Job 1",
      product: {
        id: "prod1",
        name: "Product 1",
        compatibleMachines: ["Type A"]
      },
      duration: 7200, // 2 hours
      readyDateTime: new Date().toISOString(),
      idealEndDateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
      dueDateTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours later
      line: null,
      startCleaningDateTime: null,
      startProductionDateTime: null,
      endDateTime: null
    }
  ],
  excludedJobs: [], // Add the missing excludedJobs property as an empty array
  workCalendar: {
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] // tomorrow
  }
});

export const fetchSchedule = async (skipCache = false, useMock = false): Promise<Schedule> => {
  // Return cached data if available and fresh
  const now = Date.now();
  if (!skipCache && cachedSchedule && (now - lastFetchTime < CACHE_TTL)) {
    return cachedSchedule;
  }
  
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/schedule`);
    const data = await response.json();
    
    // Update cache
    cachedSchedule = data;
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    // Fallback to mock data if specified
    if (error instanceof Error && error.message.includes("Could not connect to server")) {
      console.warn("Backend server not available, using mock data");
      return getMockSchedule();
    }
    throw error;
  }
};

export const startSolving = async (): Promise<void> => {
  try {
    await fetchWithTimeout(`${API_BASE_URL}/schedule/solve`, {
      method: "POST",
    });
    
    // Invalidate cache when starting solving
    cachedSchedule = null;
  } catch (error) {
    console.error("Failed to start solving:", error);
    throw error;
  }
};

export const stopSolving = async (): Promise<void> => {
  try {
    await fetchWithTimeout(`${API_BASE_URL}/schedule/stopSolving`, {
      method: "POST",
    });
    
    // Invalidate cache when stopping solving
    cachedSchedule = null;
  } catch (error) {
    console.error("Failed to stop solving:", error);
    throw error;
  }
};

export const resetSchedule = async (): Promise<void> => {
  try {
    await fetchWithTimeout(`${API_BASE_URL}/schedule/reset`, {
      method: "POST",
    });
    
    // Invalidate cache when resetting schedule
    cachedSchedule = null;
  } catch (error) {
    console.error("Failed to reset schedule:", error);
    throw error;
  }
};

export const uploadFiles = async (files: File[]): Promise<string> => {
  const formData = new FormData();
  files.forEach(file => {
    if (file) {
      formData.append("files", file);
    }
  });

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/schedule/uploadFiles`, {
      method: "POST",
      body: formData,
    }, 60000); // Longer timeout for uploads

    // Invalidate cache when uploading files
    cachedSchedule = null;
    
    return await response.text();
  } catch (error) {
    console.error("Failed to upload files:", error);
    throw error;
  }
};

export const setTimeframe = async (startDate: string, endDate: string): Promise<void> => {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/schedule/setTimeframe`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate
      })
    });
    
    // Invalidate cache when changing timeframe
    cachedSchedule = null;
    
    if (!response.ok) {
      throw new Error('Failed to set timeframe');
    }
  } catch (error) {
    console.error("Failed to set timeframe:", error);
    throw error;
  }
};
