import { useState, useEffect } from "react";
import { Schedule } from "@/lib/types";
import * as apiModule from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UseScheduleReturn {
  schedule: Schedule | null;
  loading: boolean;
  error: string | null;
  solving: boolean;
  refreshSchedule: () => Promise<void>;
  startSolving: () => Promise<void>;
  stopSolving: () => Promise<void>;
  resetSchedule: () => Promise<void>;
}

const useSchedule = (): UseScheduleReturn => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [solving, setSolving] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    refreshSchedule();
  }, []);

  // Poll for updates when solving is in progress
  useEffect(() => {
    let intervalId: number | null = null;
    
    if (solving) {
      // Start polling when solving
      intervalId = window.setInterval(async () => {
        try {
          const data = await apiModule.fetchSchedule(true); // Skip cache when polling
          
          // If solver is no longer solving, update state and show final result
          if (data.solverStatus !== "SOLVING") {
            setSolving(false);
            setSchedule(data);
            toast({
              title: "Calculation Complete",
              description: `Final score: ${data.score}`,
            });
            
            // Clear the interval when solving is complete
            if (intervalId) {
              window.clearInterval(intervalId);
            }
          } else {
            // We're still solving, keep the intermediate result but don't display it yet
            // Just update the data without changing the solving state
            setSchedule(data);
          }
        } catch (err) {
          console.error("Error polling schedule:", err);
        }
      }, 2000); // Poll every 2 seconds
    }
    
    // Clean up interval on unmount or when solving changes
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [solving, toast]);

  const refreshSchedule = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiModule.fetchSchedule();
      setSchedule(data);
      
      // Update solving state based on solver status
      setSolving(data.solverStatus === "SOLVING");
    } catch (err) {
      console.error("Error fetching schedule:", err);
      toast({
        title: "Error",
        description: "Could not connect to the backend server. Please ensure it's running at http://localhost:8080",
        variant: "destructive"
      });
      setError("Could not connect to the backend server. Please ensure it's running at http://localhost:8080");
    } finally {
      setLoading(false);
    }
  };

  const startSolving = async () => {
    try {
      await apiModule.startSolving();
      setSolving(true);
      toast({
        title: "Calculation Started",
        description: "The schedule optimization is now in progress.",
      });
    } catch (error) {
      console.error("Error starting solving:", error);
      toast({
        title: "Error",
        description: "Failed to start solving.",
        variant: "destructive",
      });
    }
  };

  const stopSolving = async () => {
    try {
      await apiModule.stopSolving();
      setSolving(false);
      refreshSchedule(); // Get the latest schedule after stopping
      toast({
        title: "Calculation Stopped",
        description: "The schedule optimization has been stopped.",
      });
    } catch (error) {
      console.error("Error stopping solving:", error);
      toast({
        title: "Error",
        description: "Failed to stop solving.",
        variant: "destructive",
      });
    }
  };

  const resetSchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      await apiModule.resetSchedule();
      refreshSchedule();
    } catch (error) {
      console.error("Error resetting schedule:", error);
      toast({
        title: "Error",
        description: "Failed to reset schedule.",
        variant: "destructive",
      });
      setError("Failed to reset schedule.");
    } finally {
      setLoading(false);
    }
  };

  return {
    schedule,
    loading,
    error,
    solving,
    refreshSchedule,
    startSolving,
    stopSolving,
    resetSchedule,
  };
};

export { useSchedule };
