
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Line, Job } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PaginationControls } from './pagination/PaginationControls';
import { TimelineContainer } from './timeline/TimelineContainer';
import { JobDetails } from './timeline/JobDetails';

interface TimelineProps {
  lines: Line[];
  jobs: Job[];
  view: 'byLine' | 'byJob';
  workCalendarFromDate: string;
  loading?: boolean;
}

export function TimelineView({ lines, jobs, view, workCalendarFromDate, loading = false }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height] = useState('500px');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Pagination for job view
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 20;
  
  // Get paginated jobs if viewing by job
  const paginatedJobs = view === 'byJob' 
    ? jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage) 
    : jobs;
    
  // Calculate total pages for job view
  const totalPages = view === 'byJob' 
    ? Math.ceil(jobs.length / jobsPerPage)
    : 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedJob(null); // Reset selected job when changing pages
  };

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  return (
    <div className="space-y-4">
      <Card className="w-full mb-2 overflow-hidden border">
        <ScrollArea className="h-[600px]" type="always">
          <TimelineContainer
            containerRef={containerRef}
            height={height}
            lines={lines}
            jobs={view === 'byJob' ? paginatedJobs : jobs}
            view={view}
            workCalendarFromDate={workCalendarFromDate}
            onJobSelect={handleJobSelect}
          />
        </ScrollArea>
        
        {view === 'byJob' && totalPages > 1 && (
          <div className="border-t border-border">
            <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
      
      {selectedJob && <JobDetails job={selectedJob} />}
    </div>
  );
}
