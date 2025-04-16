
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Line, Job } from '@/lib/types';

// Add to index.css later
import 'vis-timeline/styles/vis-timeline-graph2d.css';

interface TimelineProps {
  lines: Line[];
  jobs: Job[];
  view: 'byLine' | 'byJob';
  workCalendarFromDate: string;
}

// Custom formatDate function to avoid type errors
const formatDate = (date: string | Date, formatStr: string) => {
  if (typeof date === 'string') {
    return format(parseISO(date), formatStr, { locale: de });
  }
  return format(date, formatStr, { locale: de });
};

export function TimelineView({ lines, jobs, view, workCalendarFromDate }: TimelineProps) {
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
          moment: (date: any) => {
            // Custom moment implementation that doesn't rely on toDate()
            return {
              format: (formatStr: string) => {
                try {
                  if (typeof date === 'string') {
                    return formatStr === 'YYYY-MM-DD' 
                      ? formatDate(date, 'yyyy-MM-dd')
                      : formatDate(date, 'HH:mm');
                  } else if (date instanceof Date) {
                    return formatDate(date, formatStr === 'YYYY-MM-DD' ? 'yyyy-MM-dd' : 'HH:mm');
                  } else {
                    // For any other type, convert to ISO string and format
                    const dateStr = new Date(date).toISOString();
                    return formatStr === 'YYYY-MM-DD'
                      ? formatDate(dateStr, 'yyyy-MM-dd')
                      : formatDate(dateStr, 'HH:mm');
                  }
                } catch (error) {
                  console.error('Date formatting error:', error, date);
                  return 'Invalid date';
                }
              }
            };
          }
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
    if (!timelineRef.current || !groupsRef.current || !itemsRef.current) return;

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
          className: "bg-amber-300/60 text-amber-900 dark:bg-amber-700/60 dark:text-amber-50 rounded-sm p-1"
        });
        
        // Add production item
        let content;
        if (view === 'byLine') {
          content = `<div>
            <p class="font-medium">${job.name}</p>
            ${isBeforeReady ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu früh</span>' : ''}
            ${isAfterDue ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu spät</span>' : ''}
          </div>`;
        } else {
          content = `<div>
            <p class="font-medium">${job.line.name}</p>
            ${isBeforeReady ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu früh</span>' : ''}
            ${isAfterDue ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu spät</span>' : ''}
          </div>`;
        }
        
        itemsRef.current?.add({
          id: job.id,
          group: view === 'byLine' ? job.line.id : job.id,
          content: content,
          start: job.startProductionDateTime,
          end: job.endDateTime,
          className: (isBeforeReady || isAfterDue) 
            ? "bg-red-100/80 border-l-4 border-red-500 dark:bg-red-900/30 dark:border-red-700" 
            : "bg-blue-100/80 border-l-4 border-blue-500 dark:bg-blue-900/30 dark:border-blue-700"
        });
      } else if (view === 'byJob') {
        // Unassigned job - only show in job view
        const estimatedEndTime = new Date(job.readyDateTime);
        estimatedEndTime.setSeconds(estimatedEndTime.getSeconds() + job.duration);
        
        itemsRef.current?.add({
          id: job.id,
          group: job.id,
          content: "<div><p class='font-medium'>Nicht zugewiesen</p></div>",
          start: job.readyDateTime,
          end: estimatedEndTime.toISOString(),
          className: "bg-red-200/80 text-red-800 dark:bg-red-900/50 dark:text-red-100"
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
  }, [lines, jobs, view, workCalendarFromDate]);

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
