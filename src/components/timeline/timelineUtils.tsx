
import { Job, Line } from '@/lib/types';
import { DataSet } from 'vis-data';
import { TimelineItem } from './TimelineItem';
import { renderToString } from 'react-dom/server';

export function createTimelineGroups(groups: DataSet<any>, lines: Line[], jobs: Job[], view: 'byLine' | 'byJob') {
  if (view === 'byLine') {
    // Line view groups
    lines.forEach(line => {
      groups.add({
        id: line.id,
        content: `<div>
          <h5 class="font-medium">${line.name}</h5>
          <p class="text-sm text-muted-foreground">${line.machineTypeDisplayName}</p>
        </div>`
      });
    });
  } else {
    // Job view groups
    jobs.forEach(job => {
      groups.add({
        id: job.id,
        content: job.name
      });
    });
  }
}

export function createTimelineItems(items: DataSet<any>, jobs: Job[], view: 'byLine' | 'byJob') {
  jobs.forEach(job => {
    if (view === 'byJob') {
      // Add background items for job timeline to indicate ready-ideal-due ranges
      items.add({
        id: `${job.id}_readyToIdealEnd`,
        group: job.id,
        start: job.readyDateTime,
        end: job.idealEndDateTime,
        type: "background",
        className: "bg-green-100/50 dark:bg-green-900/20"
      });
      
      items.add({
        id: `${job.id}_idealEndToDue`,
        group: job.id,
        start: job.idealEndDateTime,
        end: job.dueDateTime,
        type: "background",
        className: "bg-amber-100/50 dark:bg-amber-900/20"
      });
    }

    if (job.line && job.startCleaningDateTime && job.startProductionDateTime && job.endDateTime) {
      // Job is assigned and scheduled
      
      // Add cleaning item
      items.add({
        id: `${job.id}_cleaning`,
        group: view === 'byLine' ? job.line.id : job.id,
        content: "Rüsten",
        start: job.startCleaningDateTime,
        end: job.startProductionDateTime,
        className: "cleaning-item"
      });
      
      // Generate the timeline item content
      const timelineItemContent = renderToString(
        <TimelineItem job={job} view={view} />
      );
      
      // Add production item with truncated text and tooltip
      items.add({
        id: job.id,
        group: view === 'byLine' ? job.line.id : job.id,
        content: timelineItemContent,
        start: job.startProductionDateTime,
        end: job.endDateTime,
        className: isJobOutOfBounds(job) 
          ? "timeline-item error-item" 
          : "timeline-item normal-item"
      });
    } else if (view === 'byJob') {
      // Unassigned job - only show in job view
      const estimatedEndTime = new Date(job.readyDateTime);
      estimatedEndTime.setSeconds(estimatedEndTime.getSeconds() + job.duration);
      
      const timelineItemContent = renderToString(
        <TimelineItem job={job} view={view} />
      );

      items.add({
        id: job.id,
        group: job.id,
        content: timelineItemContent,
        start: job.readyDateTime,
        end: estimatedEndTime.toISOString(),
        className: "timeline-item unassigned-item"
      });
    }
  });
}

function isJobOutOfBounds(job: Job): boolean {
  if (!job.startProductionDateTime || !job.endDateTime) return false;
  
  const isBeforeReady = new Date(job.startProductionDateTime) < new Date(job.readyDateTime);
  const isAfterDue = new Date(job.endDateTime) > new Date(job.dueDateTime);
  
  return isBeforeReady || isAfterDue;
}
