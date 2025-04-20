
import { useEffect, useState } from 'react';
import { Line, Job } from '@/lib/types';
import { createTimelineGroups, createTimelineItems } from './timelineUtils';
import { Card } from '@/components/ui/card';
import { PaginationControls } from '../pagination/PaginationControls';
import { TimelineScroll } from './TimelineScroll';
import { useTimelineInstance } from '@/hooks/useTimelineInstance';

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
  const [height, setHeight] = useState('500px');
  
  const { timelineRef, containerRef, groupsRef, itemsRef } = useTimelineInstance({
    onJobSelect,
    jobs
  });

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
  }, [lines, jobs, view, workCalendarFromDate, loading, timelineRef, groupsRef, itemsRef]);

  return (
    <Card className="w-full mb-2 overflow-hidden border">
      <TimelineScroll height={height}>
        <div 
          ref={containerRef} 
          style={{ height, minHeight: '500px' }} 
          className="timeline-container w-full"
        />
      </TimelineScroll>
      
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
