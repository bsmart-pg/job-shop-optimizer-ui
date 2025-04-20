
import { useState } from 'react';
import { Line, Job } from '@/lib/types';
import { TimelineContainer } from './timeline/TimelineContainer';
import { JobDetailsCard } from './timeline/JobDetailsCard';
import 'vis-timeline/styles/vis-timeline-graph2d.css';

interface TimelineViewProps {
  lines: Line[];
  jobs: Job[];
  view: 'byLine' | 'byJob';
  workCalendarFromDate: string;
  loading?: boolean;
}

export function TimelineView({ lines, jobs, view, workCalendarFromDate, loading = false }: TimelineViewProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 20;
  
  const paginatedJobs = view === 'byJob' 
    ? jobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage) 
    : jobs;
    
  const totalPages = view === 'byJob' 
    ? Math.ceil(jobs.length / jobsPerPage)
    : 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleJobSelect = (job: Job) => {
    console.log("Job selected in TimelineView:", job);
    setSelectedJob(job);
  };

  return (
    <div className="space-y-4">
      <TimelineContainer 
        lines={lines}
        jobs={paginatedJobs}
        view={view}
        workCalendarFromDate={workCalendarFromDate}
        loading={loading}
        onJobSelect={handleJobSelect}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      
      {selectedJob && (
        <JobDetailsCard job={selectedJob} />
      )}
    </div>
  );
}
