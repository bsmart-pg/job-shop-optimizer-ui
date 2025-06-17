
import { Job, Line } from '@/lib/types';
import { DataSet } from 'vis-data';
import { TimelineItem } from './TimelineItem';
import { renderToString } from 'react-dom/server';

export function createTimelineGroups(groups: DataSet<any>, lines: Line[], jobs: Job[], view: 'byLine' | 'byJob') {
  if (view === 'byLine') {
    // Line view groups
    lines.forEach(line => {
      const unavailableClass = line.lineAvailable === false ? ' timeline-group-unavailable' : '';
      groups.add({
        id: line.id,
        content: `<div class="timeline-group-content${unavailableClass}">
          <h5 class="font-medium">${line.name}</h5>
          <p class="text-xs text-muted-foreground">${line.machineTypeDisplayName}</p>
        </div>`,
        className: line.lineAvailable === false ? 'timeline-group-unavailable' : ''
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
        content: `<div class="timeline-item-content"><span class="timeline-item-text">Rüsten</span></div>`,
        start: job.startCleaningDateTime,
        end: job.startProductionDateTime,
        className: "cleaning-item",
        dataAttributes: {
          'data-start': job.startCleaningDateTime,
          'data-end': job.startProductionDateTime
        }
      });
      
      // Add production item
      items.add({
        id: job.id,
        group: view === 'byLine' ? job.line.id : job.id,
        content: `<div class="timeline-item-content cursor-pointer" data-job-id="${job.id}">
          <span class="timeline-item-text">${view === 'byLine' ? job.name : (job.line ? job.line.name : "Unassigned")}</span>
        </div>`,
        start: job.startProductionDateTime,
        end: job.endDateTime,
        className: isJobOutOfBounds(job) 
          ? "timeline-item error-item" 
          : "timeline-item normal-item",
        dataAttributes: {
          'data-start': job.startProductionDateTime,
          'data-end': job.endDateTime
        }
      });
    } else if (view === 'byJob') {
      // Unassigned job - only show in job view
      const estimatedEndTime = new Date(job.readyDateTime);
      estimatedEndTime.setSeconds(estimatedEndTime.getSeconds() + job.duration);
      
      // Similarly, use HTML string instead of renderToString
      items.add({
        id: job.id,
        group: job.id,
        content: `<div class="timeline-item-content cursor-pointer" data-job-id="${job.id}">
          <span class="timeline-item-text">${job.name}</span>
        </div>`,
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
