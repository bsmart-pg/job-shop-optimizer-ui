
import { useMemo } from 'react';
import { Job } from '@/lib/types';
import { PackagingView } from './PackagingView';
import { CarrierView } from './CarrierView';
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
      <PackagingView requirements={packagingRequirements} />
      <CarrierView requirements={carrierRequirements} />
    </div>
  );
}
