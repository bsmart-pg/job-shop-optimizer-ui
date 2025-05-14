
import { fetchWithTimeout } from "../utils/fetchUtils";

export const uploadFiles = async (files: File[]): Promise<string> => {
  const formData = new FormData();
  files.forEach(file => {
    if (file) {
      formData.append("files", file);
    }
  });

  try {
    const response = await fetchWithTimeout('/api/schedule/uploadFiles', {
      method: "POST",
      body: formData,
    }, 60000);
    
    return await response.text();
  } catch (error) {
    console.error("Failed to upload files:", error);
    throw error;
  }
};

export const setTimeframe = async (startDate: string, endDate: string): Promise<void> => {
  try {
    const response = await fetchWithTimeout('/api/schedule/setTimeframe', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to set timeframe');
    }
  } catch (error) {
    console.error("Failed to set timeframe:", error);
    throw error;
  }
};

export const putBackExcludedJobs = async (jobIds: string[]): Promise<void> => {
  try {
    const response = await fetchWithTimeout('/api/schedule/putBackExcludedJob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobIds),
    });
    
    if (!response.ok) {
      throw new Error('Failed to put back excluded jobs');
    }
  } catch (error) {
    console.error("Failed to put back excluded jobs:", error);
    throw error;
  }
};
