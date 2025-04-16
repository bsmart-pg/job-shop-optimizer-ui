
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline';
import moment from 'moment';
import { Line, Job } from '@/lib/types';
import { Spinner } from '@/components/Spinner';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Add to index.css later
import 'vis-timeline/styles/vis-timeline-graph2d.css';

interface TimelineProps {
  lines: Line[];
  jobs: Job[];
  view: 'byLine' | 'byJob';
  workCalendarFromDate: string;
  loading?: boolean;
}

export function TimelineView({ lines, jobs, view, workCalendarFromDate, loading = false }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const groupsRef = useRef<DataSet<any> | null>(null);
  const itemsRef = useRef<DataSet<any> | null>(null);
  const [height, setHeight] = useState('500px');

  useEffect(() => {
    // Only create timeline if it doesn't exist yet
    if (!timelineRef.current && containerRef.current) {
      // Create datasets
      const groups = new DataSet<any, any>();
      const items = new DataSet<any, any>();
      groupsRef.current = groups;
      itemsRef.current = items;

      // Set moment's locale and configuration for vis-timeline
      moment.locale('de');

      // Create timeline with appropriate type casting to avoid TS errors
      timelineRef.current = new Timeline(
        containerRef.current, 
        items as any, 
        groups as any, 
        {
          timeAxis: { scale: "hour" },
          orientation: { axis: "top" },
          stack: false,
          zoomMin: 1000 * 60 * 60 * 12, // Half day in milliseconds
          locale: 'de',
          moment: (date) => moment(date), // Use moment directly with proper wrapper function
        }
      );

      // Set height based on number of groups
      const updateHeight = () => {
        const groupCount = groupsRef.current?.length || 0;
        setHeight(`${Math.max(500, groupCount * 60)}px`);
      };

      // Listen for window resize
      const handleResize = () => {
        if (timelineRef.current) {
          timelineRef.current.redraw();
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (timelineRef.current) {
          // @ts-ignore - vis-timeline doesn't export proper types for destroy
          timelineRef.current.destroy();
          timelineRef.current = null;
        }
      };
    }
  }, []);

  useEffect(() => {
    if (loading || !timelineRef.current || !groupsRef.current || !itemsRef.current) return;

    // Clear existing data
    groupsRef.current.clear();
    itemsRef.current.clear();

    // Create groups based on view
    if (view === 'byLine') {
      // Line view groups
      lines.forEach(line => {
        groupsRef.current?.add({
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
        groupsRef.current?.add({
          id: job.id,
          content: job.name
        });
      });
    }

    // Create timeline items
    jobs.forEach(job => {
      if (view === 'byJob') {
        // Add background items for job timeline to indicate ready-ideal-due ranges
        itemsRef.current?.add({
          id: `${job.id}_readyToIdealEnd`,
          group: job.id,
          start: job.readyDateTime,
          end: job.idealEndDateTime,
          type: "background",
          className: "bg-green-100/50 dark:bg-green-900/20"
        });
        
        itemsRef.current?.add({
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
        const isBeforeReady = new Date(job.startProductionDateTime) < new Date(job.readyDateTime);
        const isAfterDue = new Date(job.endDateTime) > new Date(job.dueDateTime);
        
        // Add cleaning item
        itemsRef.current?.add({
          id: `${job.id}_cleaning`,
          group: view === 'byLine' ? job.line.id : job.id,
          content: "Rüsten",
          start: job.startCleaningDateTime,
          end: job.startProductionDateTime,
          className: "cleaning-item"
        });
        
        // Add production item with truncated text and title for tooltip
        let content, tooltipContent;
        
        if (view === 'byLine') {
          content = `<div class="timeline-item-content" data-tooltip-id="${job.id}">${job.name}</div>`;
          tooltipContent = `
            <div>${job.name}</div>
            ${isBeforeReady ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu früh</span>' : ''}
            ${isAfterDue ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu spät</span>' : ''}
          `;
        } else {
          content = `<div class="timeline-item-content" data-tooltip-id="${job.id}">${job.line.name}</div>`;
          tooltipContent = `
            <div>${job.line.name}</div>
            ${isBeforeReady ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu früh</span>' : ''}
            ${isAfterDue ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu spät</span>' : ''}
          `;
        }
        
        itemsRef.current?.add({
          id: job.id,
          group: view === 'byLine' ? job.line.id : job.id,
          content: content,
          title: tooltipContent, // Native vis-timeline tooltip
          start: job.startProductionDateTime,
          end: job.endDateTime,
          className: (isBeforeReady || isAfterDue) 
            ? "timeline-item error-item" 
            : "timeline-item normal-item"
        });
      } else if (view === 'byJob') {
        // Unassigned job - only show in job view
        const estimatedEndTime = new Date(job.readyDateTime);
        estimatedEndTime.setSeconds(estimatedEndTime.getSeconds() + job.duration);
        
        itemsRef.current?.add({
          id: job.id,
          group: job.id,
          content: "<div class='timeline-item-content'>Nicht zugewiesen</div>",
          title: "Nicht zugewiesen", // Native vis-timeline tooltip
          start: job.readyDateTime,
          end: estimatedEndTime.toISOString(),
          className: "timeline-item unassigned-item"
        });
      }
    });

    // Set window to show the schedule
    if (workCalendarFromDate) {
      const startDate = new Date(workCalendarFromDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      try {
        timelineRef.current.setWindow(startDate, endDate);
      } catch (error) {
        console.error('Error setting timeline window:', error);
      }
    }

    // Update height based on number of groups
    const groupCount = groupsRef.current.length;
    setHeight(`${Math.max(500, groupCount * 60)}px`);

    // Redraw timeline
    timelineRef.current.redraw();
  }, [lines, jobs, view, workCalendarFromDate, loading]);

  if (loading) {
    return (
      <Card className="w-full mb-6 overflow-hidden border flex items-center justify-center" style={{ height }}>
        <div className="flex flex-col items-center p-8">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Verarbeite Zeitplan...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-6 overflow-hidden border">
      <div 
        ref={containerRef} 
        style={{ height }} 
        className="timeline-container w-full"
      />
    </Card>
  );
}
