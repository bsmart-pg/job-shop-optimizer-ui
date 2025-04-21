
import { API_BASE_URL, fetchWithTimeout } from "./config";

export const setTimeframe = async (startDate: string, endDate: string): Promise<void> => {
  try {
    const response = await fetchWithTimeout(`/schedule/setTimeframe`, {
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
