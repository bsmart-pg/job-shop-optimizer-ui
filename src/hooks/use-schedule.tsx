import { useState, useEffect } from "react";
import { Schedule } from "@/lib/types";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

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

  const refreshSchedule = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.fetchSchedule();
      setSchedule(data);
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
		setSolving(true);
		try {
			await api.startSolving();
		} catch (error) {
			console.error("Error starting solving:", error);
			toast({
				title: "Error",
				description: "Failed to start solving.",
				variant: "destructive",
			});
			setSolving(false);
		}
	};

	const stopSolving = async () => {
		setSolving(false);
		try {
			await api.stopSolving();
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
      await api.resetSchedule();
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
