
import { useRef, useEffect } from 'react';
import { Timeline } from 'vis-timeline';
import { DataSet } from 'vis-data';
import moment from 'moment';
import { Line, Job } from '@/lib/types';
import { createTimelineGroups, createTimelineItems } from './timelineUtils';

interface TimelineContainerProps {
  containerRef: React.RefObject<HTMLDivElement>;
  height: string;
  lines: Line[];
  jobs: Job[];
  view: 'byLine' | 'byJob';
  workCalendarFromDate: string;
  onJobSelect: (job: Job) => void;
}

export function TimelineContainer({
  containerRef,
  height,
  lines,
  jobs,
  view,
  workCalendarFromDate,
  onJobSelect
}: TimelineContainerProps) {
  const timelineRef = useRef<Timeline | null>(null);
  const groupsRef = useRef<DataSet<any> | null>(null);
  const itemsRef = useRef<DataSet<any> | null>(null);

  useEffect(() => {
    // Clear existing timeline if any
    if (containerRef.current && containerRef.current.hasChildNodes()) {
      containerRef.current.innerHTML = '';
    }
    
    if (containerRef.current) {
      const groups = new DataSet<any, any>();
      const items = new DataSet<any, any>();
      groupsRef.current = groups;
      itemsRef.current = items;

      moment.locale('de');

      timelineRef.current = new Timeline(
        containerRef.current,
        items as any,
        groups as any,
        {
          timeAxis: { scale: "hour" },
          orientation: { axis: "top" },
          stack: false,
          zoomMin: 1000 * 60 * 60 * 12,
          locale: 'de',
          moment: (date) => moment(date),
          tooltip: {
            followMouse: false,
            overflowMethod: 'cap'
          }
        }
      );

      // Create the groups and items
      createTimelineGroups(groups, lines, jobs, view);
      createTimelineItems(items, jobs, view);

      // Set up click handler
      containerRef.current.addEventListener('click', (event) => {
        if (!timelineRef.current) return;
        
        const target = event.target as HTMLElement;
        const itemContainer = target.closest('[data-job-id]');
        
        if (itemContainer) {
          const jobId = itemContainer.getAttribute('data-job-id');
          if (jobId) {
            const job = jobs.find(j => j.id === jobId);
            if (job) {
              onJobSelect(job);
            }
          }
        }
      });

      // Set initial window
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
    }

    // Cleanup function
    return () => {
      if (timelineRef.current) {
        try {
          // @ts-ignore - vis-timeline doesn't export proper types for destroy
          timelineRef.current.destroy();
          timelineRef.current = null;
        } catch (error) {
          console.error('Error destroying timeline:', error);
        }
      }
    };
  }, [containerRef, lines, jobs, view, workCalendarFromDate, onJobSelect]);

  useEffect(() => {
    // Force redraw when needed
    if (timelineRef.current) {
      try {
        timelineRef.current.redraw();
      } catch (error) {
        console.error('Error redrawing timeline:', error);
      }
    }
  }, [view]);

  return (
    <div 
      ref={containerRef}
      style={{ height, minHeight: '500px' }}
      className="timeline-container w-full"
    />
  );
}
