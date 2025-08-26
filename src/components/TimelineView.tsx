import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline';
import moment from 'moment';
import { Line, Job } from '@/lib/types';
import { createTimelineGroups, createTimelineItems } from './timeline/timelineUtils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PaginationControls } from './pagination/PaginationControls';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon, ClockIcon, AlertTriangleIcon, CheckIcon } from "lucide-react";

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
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Pagination for both views
  const [currentPage, setCurrentPage] = useState(1);
  const [linesCurrentPage, setLinesCurrentPage] = useState(1);
  const jobsPerPage = 20; // Number of jobs to show per page
  const linesPerPage = 10; // Number of lines to show per page
  
  // Get paginated data based on view
  const paginatedJobs = view === 'byJob' 
    ? jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage) 
    : jobs;
    
  const paginatedLines = view === 'byLine'
    ? lines.slice((linesCurrentPage - 1) * linesPerPage, linesCurrentPage * linesPerPage)
    : lines;
    
  // Calculate total pages
  const totalPages = view === 'byJob' 
    ? Math.ceil(jobs.length / jobsPerPage)
    : Math.ceil(lines.length / linesPerPage);

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
      
      // Add click event listener to the timeline
      if (containerRef.current) {
        timelineRef.current.on('click', (properties) => {
          if (properties.item) {
            // Get the clicked item ID
            const itemId = properties.item;
            
            // If it's a cleaning item (ends with _cleaning), get the actual job ID
            const jobId = itemId.toString().endsWith('_cleaning')
              ? itemId.toString().replace('_cleaning', '')
              : itemId.toString();
            
            // Find the job with this ID
            const job = jobs.find(j => j.id === jobId);
            if (job) {
              setSelectedJob(job);
            }
          }
        });
      }

      // Add CSS styles for unavailable lines
      const style = document.createElement('style');
      style.textContent = `
        .vis-labelset .vis-label.timeline-group-unavailable {
          opacity: 0.4;
          background-color: #f5f5f5 !important;
        }
        .vis-labelset .vis-label.timeline-group-unavailable .timeline-group-content {
          opacity: 0.5;
        }
        .vis-panel.vis-left .vis-label.timeline-group-unavailable {
          background-color: #f8f8f8 !important;
          color: #999 !important;
        }
      `;
      document.head.appendChild(style);

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
  }, [jobs]);

  useEffect(() => {
    // Reset to page 1 when view changes
    setCurrentPage(1);
    setLinesCurrentPage(1);
    // Clear selected job when view changes
    setSelectedJob(null);
    
    // Clear timeline data when switching views to free memory
    if (groupsRef.current && itemsRef.current) {
      groupsRef.current.clear();
      itemsRef.current.clear();
    }
  }, [view]);

  useEffect(() => {
    if (loading || !timelineRef.current || !groupsRef.current || !itemsRef.current) return;

    // Clear existing data
    groupsRef.current.clear();
    itemsRef.current.clear();

    // Create groups and items using paginated data
    createTimelineGroups(groupsRef.current, paginatedLines, view === 'byJob' ? paginatedJobs : jobs, view);
    createTimelineItems(itemsRef.current, view === 'byJob' ? paginatedJobs : jobs, view);

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
  }, [paginatedLines, paginatedJobs, view, workCalendarFromDate, loading, currentPage, linesCurrentPage]);

  const handlePageChange = (page: number) => {
    if (view === 'byJob') {
      setCurrentPage(page);
    } else {
      setLinesCurrentPage(page);
    }
  };

  const formatDuration = (durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return `${hours} h ${minutes} min`;
  };

  const isBeforeReady = selectedJob?.startProductionDateTime && 
    new Date(selectedJob.startProductionDateTime) < new Date(selectedJob.readyDateTime);
    
  const isAfterDue = selectedJob?.endDateTime && 
    new Date(selectedJob.endDateTime) > new Date(selectedJob.dueDateTime);

  return (
    <div className="space-y-4">
      <Card className="w-full mb-2 overflow-hidden border">
        <ScrollArea className="h-[600px]" type="always">
          <div 
            ref={containerRef} 
            style={{ height, minHeight: '500px' }} 
            className="timeline-container w-full"
          />
        </ScrollArea>
        
        {totalPages > 1 && (
          <div className="border-t border-border">
            <div className="space-y-2 p-4">
              <p className="text-sm text-muted-foreground text-center">
                Seiten durchblättern um weitere den Plan für weitere Linien zu sehen
              </p>
              <PaginationControls 
                currentPage={view === 'byJob' ? currentPage : linesCurrentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}
      </Card>
      
      {selectedJob && (
        <Card className="w-full border">
          <CardHeader className="pb-3">
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-1">
              <h3 className="font-medium text-lg mb-2">{selectedJob.name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  {selectedJob.orderNumber && (
                    <p className="flex items-center">
                      <span className="text-muted-foreground mr-1">Bestell-Nr.:</span>
                      <span>{selectedJob.orderNumber}</span>
                    </p>
                  )}
                  
                  {selectedJob.recipient && (
                    <p className="flex items-center">
                      <span className="text-muted-foreground mr-1">Warenempfänger:</span>
                      <span>{selectedJob.recipient}</span>
                    </p>
                  )}
                
                  {view === 'byLine' && selectedJob.product && (
                    <p className="flex items-center">
                      <span className="text-muted-foreground mr-1">Produkt:</span>
                      <span>{selectedJob.product.name}</span>
                    </p>
                  )}
                  
                  {view === 'byJob' && selectedJob.line && (
                    <p className="flex items-center">
                      <span className="text-muted-foreground mr-1">Linie:</span>
                      <span>{selectedJob.line.name}</span>
                    </p>
                  )}

                  {selectedJob.product && (
                    <p className="flex items-center">
                      <span className="text-muted-foreground mr-1">Kompatible Maschinentypen:</span>
                      <span>{selectedJob.product.compatibleMachines.join(', ')}</span>
                    </p>
                  )}
                  
                  <p className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Produktionsdauer:</span>
                    <span>{formatDuration(selectedJob.duration)}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Bereit ab:</span>
                    <span>{format(parseISO(selectedJob.readyDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                  </p>
                  
                  <p className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Ideales Enddatum:</span>
                    <span>{format(parseISO(selectedJob.idealEndDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                  </p>
                  
                  <p className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground mr-1">Fälligkeitsdatum:</span>
                    <span>{format(parseISO(selectedJob.dueDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                  </p>

                  {selectedJob.startProductionDateTime && (
                    <p className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Produktionsstart:</span>
                      <span>{format(parseISO(selectedJob.startProductionDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                    </p>
                  )}

                  {selectedJob.endDateTime && (
                    <p className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground mr-1">Produktionsende:</span>
                      <span>{format(parseISO(selectedJob.endDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-x-1">
                {isBeforeReady && (
                  <span className="inline-flex items-center text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 rounded-full px-2 py-0.5">
                    <AlertTriangleIcon className="h-3 w-3 mr-1" />
                    Zu früh gestartet
                  </span>
                )}
                {isAfterDue && (
                  <span className="inline-flex items-center text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">
                    <AlertTriangleIcon className="h-3 w-3 mr-1" />
                    Zu spät beendet
                  </span>
                )}
                {!isBeforeReady && !isAfterDue && selectedJob.endDateTime && (
                  <span className="inline-flex items-center text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded-full px-2 py-0.5">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    Optimal geplant
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
