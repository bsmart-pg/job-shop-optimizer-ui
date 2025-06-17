
import { useMemo } from 'react';
import { Job } from '@/lib/types';
import { PackagingView } from './PackagingView';
import { CarrierView } from './CarrierView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateDailyPackagingNeeds, calculateDailyCarrierNeeds } from '@/lib/utils/packagingUtils';

interface LeergutViewProps {
  jobs: Job[];
}

export function LeergutView({ jobs }: LeergutViewProps) {
  const packagingRequirements = useMemo(() => {
    return calculateDailyPackagingNeeds(jobs);
  }, [jobs]);

  const carrierRequirements = useMemo(() => {
    return calculateDailyCarrierNeeds(jobs);
  }, [jobs]);

  return (
    <div className="space-y-6">
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
