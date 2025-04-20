
import { useEffect, useRef } from 'react';
import { Timeline } from 'vis-timeline';
import { DataSet } from 'vis-data';
import moment from 'moment';
import { Job } from '@/lib/types';

interface UseTimelineInstanceProps {
  onJobSelect: (job: Job) => void;
  jobs: Job[];
}

export function useTimelineInstance({ onJobSelect, jobs }: UseTimelineInstanceProps) {
  const timelineRef = useRef<Timeline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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

      const handleTimelineClick = (event: MouseEvent) => {
        if (!timelineRef.current) return;
        
        const target = event.target as HTMLElement;
        const itemContainer = target.closest('[data-job-id]');
        
        if (itemContainer) {
          const jobId = itemContainer.getAttribute('data-job-id');
          if (jobId) {
            console.log("Job click detected, ID:", jobId);
            const job = jobs.find(j => j.id === jobId);
            if (job) {
              console.log("Job found, calling onJobSelect with:", job);
              onJobSelect(job);
            } else {
              console.log("Job not found in jobs array!");
            }
          }
        } else {
          console.log("Click did not hit an element with data-job-id attribute");
        }
      };
      
      containerRef.current.addEventListener('click', handleTimelineClick);

      const handleResize = () => {
        if (timelineRef.current) {
          timelineRef.current.redraw();
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (containerRef.current) {
          containerRef.current.removeEventListener('click', handleTimelineClick);
        }
        if (timelineRef.current) {
          timelineRef.current.destroy();
          timelineRef.current = null;
        }
      };
    }
  }, [jobs, onJobSelect]);

  return {
    timelineRef,
    containerRef,
    groupsRef,
    itemsRef
  };
}
