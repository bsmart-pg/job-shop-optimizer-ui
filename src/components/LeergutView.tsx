
import { useMemo, useState } from 'react';
import { Job } from '@/lib/types';
import { PackagingView } from './PackagingView';
import { CarrierView } from './CarrierView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateDailyPackagingNeeds, calculateDailyCarrierNeeds } from '@/lib/utils/packagingUtils';
import { DateFilterControls } from './DateFilterControls';
import { isWithinInterval, parseISO } from 'date-fns';

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
      return isWithinInterval(jobDate, { start: startDate, end: endDate });
    });
  }, [jobs, startDate, endDate]);

  const packagingRequirements = useMemo(() => {
    return calculateDailyPackagingNeeds(filteredJobs);
  }, [filteredJobs]);

  const carrierRequirements = useMemo(() => {
    return calculateDailyCarrierNeeds(filteredJobs);
  }, [filteredJobs]);

  return (
    <div className="space-y-6">
      <DateFilterControls
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      
      <Tabs defaultValue="packaging" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packaging">Verpackungen</TabsTrigger>
          <TabsTrigger value="carrier">Ladungsträger</TabsTrigger>
        </TabsList>
        <TabsContent value="packaging">
          <PackagingView requirements={packagingRequirements} />
        </TabsContent>
        <TabsContent value="carrier">
          <CarrierView requirements={carrierRequirements} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
