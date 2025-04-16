
import { useState, useEffect, useCallback } from 'react';
import { fetchSchedule, startSolving, stopSolving, resetSchedule } from '@/lib/api';
import { Schedule } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';

export function useSchedule() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solving, setSolving] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const refreshSchedule = useCallback(async (useMockOnFailure = true) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchedule(false, useMockOnFailure);
      setSchedule(data);
      setSolving(data.solverStatus !== null && data.solverStatus !== "NOT_SOLVING");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch schedule';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Also show a more visible toast for network errors
      if (errorMessage.includes('Network error')) {
        sonnerToast.error("Backend Connection Issue", 
          "Could not connect to the backend server. Please ensure it's running at http://localhost:8080");
      }
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleStartSolving = useCallback(async () => {
    try {
      await startSolving();
      setSolving(true);
      toast({
        title: "Success",
        description: "Solving started"
      });
      await refreshSchedule();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start solving';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [refreshSchedule, toast]);

  const handleStopSolving = useCallback(async () => {
    try {
      await stopSolving();
      setSolving(false);
      toast({
        title: "Success",
        description: "Solving stopped"
      });
      await refreshSchedule();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop solving';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [refreshSchedule, toast]);

  const handleReset = useCallback(async () => {
    try {
      await resetSchedule();
      toast({
        title: "Success",
        description: "Schedule reset"
      });
      await refreshSchedule();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset schedule';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [refreshSchedule, toast]);

  useEffect(() => {
    refreshSchedule();
    // Clean up any existing interval
    return () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
      }
    };
  }, [refreshSchedule]);

  useEffect(() => {
    if (solving && !autoRefreshInterval) {
      const interval = setInterval(refreshSchedule, 30000); // 30 seconds
      setAutoRefreshInterval(interval);
    } else if (!solving && autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
  }, [solving, autoRefreshInterval, refreshSchedule]);

  return {
    schedule,
    loading,
    error,
    solving,
    refreshSchedule,
    startSolving: handleStartSolving,
    stopSolving: handleStopSolving,
    resetSchedule: handleReset
  };
}
