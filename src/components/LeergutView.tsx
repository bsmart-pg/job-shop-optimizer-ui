import { useMemo, useState } from 'react';
import { Job } from '@/lib/types';
import { PackagingView } from './PackagingView';
import { CarrierView } from './CarrierView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateDailyPackagingNeeds, calculateDailyCarrierNeeds } from '@/lib/utils/packagingUtils';
import { isWithinInterval, parseISO, isSameDay, startOfDay, endOfDay } from 'date-fns';

interface LeergutViewProps {
  jobs: Job[];
}

export function LeergutView({ jobs }: LeergutViewProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const filteredJobs = useMemo(() => {
    if (!startDate || !endDate) {
      return jobs;
    }

    return jobs.filter(job => {
      if (!job.startProductionDateTime) {
        return false;
      }

      const jobDate = parseISO(job.startProductionDateTime);
      
      // If start and end dates are the same, check if job is on that specific day
      if (isSameDay(startDate, endDate)) {
        return isSameDay(jobDate, startDate);
      }
      
      // Otherwise, check if job is within the date range (inclusive)
      return isWithinInterval(jobDate, { 
        start: startOfDay(startDate), 
        end: endOfDay(endDate) 
      });
    });
  }, [jobs, startDate, endDate]);

  const packagingRequirements = useMemo(() => {
    return calculateDailyPackagingNeeds(filteredJobs);
  }, [filteredJobs]);

  const carrierRequirements = useMemo(() => {
    return calculateDailyCarrierNeeds(filteredJobs);
  }, [filteredJobs]);

  return (
    <Tabs defaultValue="packaging" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="packaging">Packmittel</TabsTrigger>
        <TabsTrigger value="carrier">Versandeinheiten</TabsTrigger>
      </TabsList>
      <TabsContent value="packaging">
        <PackagingView 
          requirements={packagingRequirements}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </TabsContent>
      <TabsContent value="carrier">
        <CarrierView 
          requirements={carrierRequirements}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </TabsContent>
    </Tabs>
  );
}
