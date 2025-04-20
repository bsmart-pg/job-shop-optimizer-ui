
import { useEffect, useRef, useState } from 'react';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline';
import moment from 'moment';
import { Line, Job } from '@/lib/types';
import { createTimelineGroups, createTimelineItems } from './timelineUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { PaginationControls } from '../pagination/PaginationControls';

interface TimelineContainerProps {
  lines: Line[];
  jobs: Job[];
  view: 'byLine' | 'byJob';
  workCalendarFromDate: string;
  loading?: boolean;
  onJobSelect: (job: Job) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TimelineContainer({
  lines,
  jobs,
  view,
  workCalendarFromDate,
  loading = false,
  onJobSelect,
  currentPage,
  totalPages,
  onPageChange
}: TimelineContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const groupsRef = useRef<DataSet<any> | null>(null);
  const itemsRef = useRef<DataSet<any> | null>(null);
  const [height, setHeight] = useState('500px');

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
        containerRef.current.addEventListener('click', handleTimelineClick);
      }

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
  }, [jobs]);

  const handleTimelineClick = (event: MouseEvent) => {
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
  };

  useEffect(() => {
    if (loading || !timelineRef.current || !groupsRef.current || !itemsRef.current) return;

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

    const groupCount = groupsRef.current.length;
    const dynamicHeight = Math.max(500, groupCount * 65);
    setHeight(`${dynamicHeight}px`);

    timelineRef.current.redraw();
  }, [lines, jobs, view, workCalendarFromDate, loading]);

  return (
    <Card className="w-full mb-2 overflow-hidden border">
      <ScrollArea className="h-[600px]" type="always">
        <div 
          ref={containerRef} 
          style={{ height, minHeight: '500px' }} 
          className="timeline-container w-full"
        />
      </ScrollArea>
      
      {view === 'byJob' && totalPages > 1 && (
        <div className="border-t border-border">
          <PaginationControls 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </Card>
  );
}
