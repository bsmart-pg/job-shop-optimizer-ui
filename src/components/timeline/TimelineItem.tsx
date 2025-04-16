
import { Job, Line } from "@/lib/types";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface TimelineItemProps {
  job: Job;
  view: 'byLine' | 'byJob';
}

export function TimelineItem({ job, view }: TimelineItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isBeforeReady = job.startProductionDateTime && new Date(job.startProductionDateTime) < new Date(job.readyDateTime);
  const isAfterDue = job.endDateTime && new Date(job.endDateTime) > new Date(job.dueDateTime);
  
  const displayText = view === 'byLine' ? job.name : (job.line ? job.line.name : "Unassigned");
  const fullContent = (
    <div className="p-1">
      <p className="font-semibold">{view === 'byLine' ? job.name : job.line?.name}</p>
      <p className="text-sm">Duration: {Math.floor(job.duration / 3600)}h {Math.floor((job.duration % 3600) / 60)}m</p>
      {isBeforeReady && <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Too early</span>}
      {isAfterDue && <span className="inline-block mt-1 ml-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Too late</span>}
    </div>
  );

  // Provide both hover and click interactions
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <HoverCard>
        <PopoverTrigger asChild>
          <HoverCardTrigger asChild>
            <div 
              className="timeline-item-content truncate cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              {displayText}
            </div>
          </HoverCardTrigger>
        </PopoverTrigger>
        
        <HoverCardContent side="top">
          {fullContent}
        </HoverCardContent>
        
        <PopoverContent side="top">
          {fullContent}
        </PopoverContent>
      </HoverCard>
    </Popover>
  );
}
