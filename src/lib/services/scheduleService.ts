
import { Schedule } from "../types";
import { fetchWithTimeout } from "../utils/fetchUtils";
import { getMockSchedule } from "./mockData";
import { mergeConsecutiveJobs } from "../scheduleUtils";

// Cache management
let cachedSchedule: Schedule | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5000; // 5 seconds

export const fetchSchedule = async (skipCache = false, useMock = false): Promise<Schedule> => {
  const now = Date.now();
  if (!skipCache && cachedSchedule && (now - lastFetchTime < CACHE_TTL)) {
    return cachedSchedule;
  }

  try {
    const response = await fetchWithTimeout('/api/schedule');
    const data = await response.json();
    
    console.log("Original jobs before merging:", data.jobs.length);
    
    // Count jobs per line before merging
    const lineCountBefore: Record<string, number> = {};
    const dueDateCountBefore: Record<string, number> = {};
    
    data.jobs.forEach((job: any) => {
      if (job.line) {
        const lineId = job.line.id;
        lineCountBefore[lineId] = (lineCountBefore[lineId] || 0) + 1;
        
        // Count by due date
        if (job.dueDateTime) {
          const dueDate = new Date(job.dueDateTime).toISOString();
          dueDateCountBefore[dueDate] = (dueDateCountBefore[dueDate] || 0) + 1;
        }
      }
    });
    console.log("Jobs per line before merging:", lineCountBefore);
    console.log("Jobs per due date before merging:", dueDateCountBefore);
    
    const mergedJobs = mergeConsecutiveJobs(data.jobs);
    
    console.log("Merged jobs after processing:", mergedJobs.length);
    
    const lineCountAfter: Record<string, number> = {};
    const dueDateCountAfter: Record<string, number> = {};
    
    mergedJobs.forEach((job: any) => {
      if (job.line) {
        const lineId = job.line.id;
        lineCountAfter[lineId] = (lineCountAfter[lineId] || 0) + 1;
        
        // Count by due date
        if (job.dueDateTime) {
          const dueDate = new Date(job.dueDateTime).toISOString();
          dueDateCountAfter[dueDate] = (dueDateCountAfter[dueDate] || 0) + 1;
        }
      }
    });
    console.log("Jobs per line after merging:", lineCountAfter);
    console.log("Jobs per due date after merging:", dueDateCountAfter);
    
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
    await fetchWithTimeout('/api/schedule/solve', {
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
    await fetchWithTimeout('/api/schedule/stopSolving', {
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
    await fetchWithTimeout('/api/schedule/reset', {
      method: "POST",
    });
    cachedSchedule = null;
  } catch (error) {
    console.error("Failed to reset schedule:", error);
    throw error;
  }
};

export const putBackExcludedJobs = async (jobIds: string[]): Promise<void> => {
  try {
    await fetchWithTimeout('/api/schedule/putBackExcludedJob', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobIds),
    });
    cachedSchedule = null; // Clear cache to get updated data after putting back jobs
  } catch (error) {
    console.error("Failed to put back excluded jobs:", error);
    throw error;
  }
};

export const setNightshift = async (enabled: boolean): Promise<void> => {
  try {
    await fetchWithTimeout('/api/schedule/setNightshift', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enabled),
    });
    cachedSchedule = null; // Clear cache to get updated data after setting nightshift
  } catch (error) {
    console.error("Failed to set nightshift:", error);
    throw error;
  }
};
