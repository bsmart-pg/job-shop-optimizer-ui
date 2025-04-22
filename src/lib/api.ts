import { Schedule } from "./types";
import { mergeConsecutiveJobs } from "./scheduleUtils";

// Remove the API_BASE_URL as we'll use relative URLs with the proxy
// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// Keep the timeoutPromise helper
const timeoutPromise = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
  });
};

// Update fetchWithTimeout to use relative URLs
const fetchWithTimeout = async (url: string, options?: RequestInit, timeout = 30000) => {
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
      throw new Error('Network error: Could not connect to the backend server. Please ensure the backend server is running.');
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
  const now = Date.now();
  if (!skipCache && cachedSchedule && (now - lastFetchTime < CACHE_TTL)) {
    return cachedSchedule;
  }

  try {
    const response = await fetchWithTimeout('/schedule');
    const data = await response.json();
    
    console.log("Original jobs before merging:", data.jobs.length);
    
    // Count jobs per line before merging
    const lineCountBefore: Record<string, number> = {};
    data.jobs.forEach((job: any) => {
      if (job.line) {
        const lineId = job.line.id;
        lineCountBefore[lineId] = (lineCountBefore[lineId] || 0) + 1;
      }
    });
    console.log("Jobs per line before merging:", lineCountBefore);
    
    const mergedJobs = mergeConsecutiveJobs(data.jobs);
    
    console.log("Merged jobs after processing:", mergedJobs.length);
    
    const lineCountAfter: Record<string, number> = {};
    mergedJobs.forEach((job: any) => {
      if (job.line) {
        const lineId = job.line.id;
        lineCountAfter[lineId] = (lineCountAfter[lineId] || 0) + 1;
      }
    });
    console.log("Jobs per line after merging:", lineCountAfter);
    
    const processedData = {
      ...data,
      jobs: mergedJobs
    };
    
    cachedSchedule = processedData;
    lastFetchTime = Date.now();
    
    return processedData;
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    if (useMock) {
      console.warn("Backend server not available, using mock data");
      return getMockSchedule();
    }
    throw error;
  }
};

export const startSolving = async (): Promise<void> => {
  try {
    await fetchWithTimeout('/schedule/solve', {
      method: "POST",
    });
    cachedSchedule = null;
  } catch (error) {
    console.error("Failed to start solving:", error);
    throw error;
  }
};

export const stopSolving = async (): Promise<void> => {
  try {
    await fetchWithTimeout('/schedule/stopSolving', {
      method: "POST",
    });
    cachedSchedule = null;
  } catch (error) {
    console.error("Failed to stop solving:", error);
    throw error;
  }
};

export const resetSchedule = async (): Promise<void> => {
  try {
    await fetchWithTimeout('/schedule/reset', {
      method: "POST",
    });
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
    const response = await fetchWithTimeout('/schedule/uploadFiles', {
      method: "POST",
      body: formData,
    }, 60000);
    
    cachedSchedule = null;
    return await response.text();
  } catch (error) {
    console.error("Failed to upload files:", error);
    throw error;
  }
};

export const setTimeframe = async (startDate: string, endDate: string): Promise<void> => {
  try {
    const response = await fetchWithTimeout('/schedule/setTimeframe', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate
      })
    });
    
    cachedSchedule = null;
    
    if (!response.ok) {
      throw new Error('Failed to set timeframe');
    }
  } catch (error) {
    console.error("Failed to set timeframe:", error);
    throw error;
  }
};
