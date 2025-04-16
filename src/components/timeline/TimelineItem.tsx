
import { Job, Line } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimelineItemProps {
  job: Job;
  view: 'byLine' | 'byJob';
}

export function TimelineItem({ job, view }: TimelineItemProps) {
  const isBeforeReady = job.startProductionDateTime && new Date(job.startProductionDateTime) < new Date(job.readyDateTime);
  const isAfterDue = job.endDateTime && new Date(job.endDateTime) > new Date(job.dueDateTime);
  
  const getContent = () => {
    const displayText = view === 'byLine' ? job.name : (job.line ? job.line.name : "Unassigned");
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="timeline-item-content truncate">
              {displayText}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-1">
              <p className="font-semibold">{view === 'byLine' ? job.name : job.line?.name}</p>
              <p className="text-sm">Duration: {Math.floor(job.duration / 3600)}h {Math.floor((job.duration % 3600) / 60)}m</p>
              {isBeforeReady && <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Too early</span>}
              {isAfterDue && <span className="inline-block mt-1 ml-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Too late</span>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return getContent();
}
