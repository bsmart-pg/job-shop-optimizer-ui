
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
    return cachedSchedule;
  }
  
  if (useMock) {
    return getMockSchedule();
  }
  
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/schedule`);
    
    // Check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error(`Invalid response format (not JSON): ${text}`);
      throw new Error("Invalid response format received from server (not JSON)");
    }
    
    const data = await response.json();
    
    cachedSchedule = data;
    lastFetchTime = now;
    
    return data;
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
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
    cachedSchedule = null;
  } catch (error) {
    console.error("Failed to reset schedule:", error);
    throw error;
  }
};
