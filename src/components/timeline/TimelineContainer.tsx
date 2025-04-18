
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
    if (!timelineRef.current && containerRef.current) {
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

      if (containerRef.current) {
        const container = containerRef.current;
        container.addEventListener('click', (event) => {
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
      }
    }

    return () => {
      if (timelineRef.current) {
        // @ts-ignore - vis-timeline doesn't export proper types for destroy
        timelineRef.current.destroy();
        timelineRef.current = null;
      }
    };
  }, [jobs, onJobSelect]);

  useEffect(() => {
    if (!timelineRef.current || !groupsRef.current || !itemsRef.current) return;

    groupsRef.current.clear();
    itemsRef.current.clear();

    createTimelineGroups(groupsRef.current, lines, jobs, view);
    createTimelineItems(itemsRef.current, jobs, view);

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

    timelineRef.current.redraw();
  }, [lines, jobs, view, workCalendarFromDate]);

  return (
    <div 
      ref={containerRef}
      style={{ height, minHeight: '500px' }}
      className="timeline-container w-full"
    />
  );
}
