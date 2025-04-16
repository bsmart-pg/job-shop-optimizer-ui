
import { Job } from "@/lib/types";
import { useState } from "react";

interface TimelineItemProps {
  job: Job;
  view: 'byLine' | 'byJob';
}

export function TimelineItem({ job, view }: TimelineItemProps) {
  const isBeforeReady = job.startProductionDateTime && new Date(job.startProductionDateTime) < new Date(job.readyDateTime);
  const isAfterDue = job.endDateTime && new Date(job.endDateTime) > new Date(job.dueDateTime);
  
  const displayText = view === 'byLine' ? job.name : (job.line ? job.line.name : "Unassigned");
  
  return (
    <div 
      className="timeline-item-content"
      title={displayText} // Simple native browser tooltip
    >
      <span className="timeline-item-text">{displayText}</span>
      {isBeforeReady && (
        <span className="timeline-warning timeline-warning-early">Early</span>
      )}
      {isAfterDue && (
        <span className="timeline-warning timeline-warning-late">Late</span>
      )}
    </div>
  );
}

