
import { Job } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockIcon } from "lucide-react";

interface OnTimeRateProps {
  jobs: Job[];
}

export function OnTimeRate({ jobs }: OnTimeRateProps) {
  // Calculate on-time rate
  const calculateOnTimeRate = () => {
    if (!jobs.length) return 0;
    
    const onTimeJobs = jobs.filter(job => {
      if (!job.endDateTime) return false;
      return new Date(job.endDateTime) <= new Date(job.dueDateTime);
    });
    
    return (onTimeJobs.length / jobs.length) * 100;
  };

  const onTimeRate = calculateOnTimeRate();

  return (
    <Card className="mb-8">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-muted-foreground" />
          Pünktlichkeitsrate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <span className="text-4xl font-bold">
            {onTimeRate.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
