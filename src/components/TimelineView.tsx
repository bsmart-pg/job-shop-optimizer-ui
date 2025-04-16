
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline';
import moment from 'moment';
import { Line, Job } from '@/lib/types';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

// Add to index.css later
import 'vis-timeline/styles/vis-timeline-graph2d.css';

interface TimelineProps {
  lines: Line[];
  jobs: Job[];
  view: 'byLine' | 'byJob';
  workCalendarFromDate: string;
}

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
          moment: moment // Use moment directly instead of custom implementation
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
          className: "cleaning-item"
        });
        
        // Add production item with truncated text and hover data attributes
        let content, tooltipContent;
        
        if (view === 'byLine') {
          content = job.name;
          tooltipContent = `<div class="tooltip-content">
            <p class="font-medium">${job.name}</p>
            ${isBeforeReady ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu früh</span>' : ''}
            ${isAfterDue ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu spät</span>' : ''}
          </div>`;
        } else {
          content = job.line.name;
          tooltipContent = `<div class="tooltip-content">
            <p class="font-medium">${job.line.name}</p>
            ${isBeforeReady ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu früh</span>' : ''}
            ${isAfterDue ? '<span class="text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">Zu spät</span>' : ''}
          </div>`;
        }
        
        itemsRef.current?.add({
          id: job.id,
          group: view === 'byLine' ? job.line.id : job.id,
          content: `<div class="timeline-item-content" data-tooltip="${encodeURIComponent(tooltipContent)}">${content}</div>`,
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

    // Set up tooltip functionality after items are rendered
    setTimeout(() => {
      const items = document.querySelectorAll('.timeline-item-content');
      items.forEach(item => {
        item.addEventListener('mouseenter', showTooltip);
        item.addEventListener('mouseleave', hideTooltip);
      });
    }, 100);
  }, [lines, jobs, view, workCalendarFromDate]);

  // Functions to handle tooltip display
  const showTooltip = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const tooltipContent = target.getAttribute('data-tooltip');
    
    if (tooltipContent) {
      const tooltip = document.createElement('div');
      tooltip.className = 'timeline-tooltip';
      tooltip.innerHTML = decodeURIComponent(tooltipContent);
      
      const rect = target.getBoundingClientRect();
      tooltip.style.position = 'absolute';
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
      
      document.body.appendChild(tooltip);
      target.setAttribute('data-tooltip-active', 'true');
    }
  };

  const hideTooltip = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    target.removeAttribute('data-tooltip-active');
    
    const tooltips = document.querySelectorAll('.timeline-tooltip');
    tooltips.forEach(tooltip => tooltip.remove());
  };

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
