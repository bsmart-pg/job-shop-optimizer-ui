
import { Job } from "@/lib/types";
import { useState } from "react";
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface TimelineItemProps {
  job: Job;
  view: 'byLine' | 'byJob';
  onSelect: (job: Job) => void;
}

export function TimelineItem({ job, view, onSelect }: TimelineItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const displayText = view === 'byLine' ? job.name : (job.line ? job.line.name : "Unassigned");

  const handleSelect = () => {
    onSelect(job);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`timeline-item-content cursor-pointer ${isHovered ? 'timeline-item-selected' : ''}`}
            onClick={handleSelect}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <span className="timeline-item-text">{displayText}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="z-[100] max-w-xs">
          {displayText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
