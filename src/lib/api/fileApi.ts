
import { API_BASE_URL, fetchWithTimeout } from "./config";

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
    
    return await response.text();
  } catch (error) {
    console.error("Failed to upload files:", error);
    throw error;
  }
};
