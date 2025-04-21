
import { Schedule } from "../types";
import { API_BASE_URL, fetchWithTimeout } from "./config";
import { getMockSchedule } from "./mockData";

// Cached data for improved performance
let cachedSchedule: Schedule | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5000; // 5 seconds

export const fetchSchedule = async (skipCache = false, useMock = false): Promise<Schedule> => {
  const now = Date.now();
  if (!skipCache && cachedSchedule && (now - lastFetchTime < CACHE_TTL)) {
    console.log("Using cached schedule data");
    return cachedSchedule;
  }
  
  if (useMock) {
    console.log("Using mock schedule data");
    return getMockSchedule();
  }
  
  try {
    console.log(`Fetching schedule from ${API_BASE_URL}/schedule`);
    const response = await fetchWithTimeout(`/schedule`);
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    console.log(`Response content type: ${contentType}`);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Invalid response format (not JSON): ${text.substring(0, 500)}${text.length > 500 ? '...' : ''}`);
      console.log("Falling back to mock data due to invalid response format");
      return getMockSchedule();
    }
    
    const data = await response.json();
    console.log("Schedule data received successfully");
    
    cachedSchedule = data;
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    if (error instanceof Error && error.message.includes("Could not connect to server")) {
      console.warn("Backend server not available, using mock data");
      return getMockSchedule();
    }
    console.warn("Using mock data due to error");
    return getMockSchedule();
  }
};

export const startSolving = async (): Promise<void> => {
  try {
    await fetchWithTimeout(`/schedule/solve`, {
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
    await fetchWithTimeout(`/schedule/stopSolving`, {
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
    await fetchWithTimeout(`/schedule/reset`, {
      method: "POST",
    });
    cachedSchedule = null;
  } catch (error) {
    console.error("Failed to reset schedule:", error);
    throw error;
  }
};
