
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline';
import moment from 'moment';
import { Line, Job } from '@/lib/types';
import { TimelineItem } from './timeline/TimelineItem';
import { createTimelineGroups, createTimelineItems } from './timeline/timelineUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

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
          tooltip: {
            followMouse: false,
            overflowMethod: 'cap'
          }
        }
      );

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

    // Create groups and items
    createTimelineGroups(groupsRef.current, lines, jobs, view);
    createTimelineItems(itemsRef.current, jobs, view);

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

    // Calculate appropriate height based on number of groups
    // Set minimum height to 500px, but allow it to grow with number of groups
    const groupCount = groupsRef.current.length;
    const dynamicHeight = Math.max(500, groupCount * 65);
    setHeight(`${dynamicHeight}px`);

    // Redraw timeline
    timelineRef.current.redraw();
  }, [lines, jobs, view, workCalendarFromDate, loading]);

  return (
    <Card className="w-full mb-6 overflow-hidden border">
      <ScrollArea className="h-[600px]" type="always">
        <div 
          ref={containerRef} 
          style={{ height, minHeight: '500px' }} 
          className="timeline-container w-full"
        />
      </ScrollArea>
    </Card>
  );
}
