
import { useState, useMemo, useCallback } from 'react';
import { Job } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { PaginationControls } from './pagination/PaginationControls';
import { Skeleton } from './ui/skeleton';
import { ClockIcon } from 'lucide-react';

interface DelayedJobsProps {
  jobs: Job[];
}

export function DelayedJobs({ jobs }: DelayedJobsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  const delayedJobs = useMemo(() => {
    const delayed = jobs.filter(job => {
      if (!job.endDateTime) return false;
      return new Date(job.endDateTime) > new Date(job.dueDateTime);
    });
    
    // Sort by delay (end date - due date) in descending order
    return delayed.sort((a, b) => {
      const aDelay = new Date(a.endDateTime!).getTime() - new Date(a.dueDateTime).getTime();
      const bDelay = new Date(b.endDateTime!).getTime() - new Date(b.dueDateTime).getTime();
      return bDelay - aDelay;
    });
  }, [jobs]);
  
  const totalPages = Math.ceil(delayedJobs.length / itemsPerPage);
  
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return delayedJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [delayedJobs, currentPage, itemsPerPage]);
  
  const formatDuration = useCallback((durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return `${hours} h ${minutes} min`;
  }, []);
  
  const calculateDelay = useCallback((endDate: string, dueDate: string) => {
    const end = new Date(endDate);
    const due = new Date(dueDate);
    const diffInHours = Math.round((end.getTime() - due.getTime()) / (1000 * 60 * 60));
    return `${diffInHours} Stunden`;
  }, []);
  
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-destructive" />
          <span>Verspätete Jobs ({delayedJobs.length})</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {delayedJobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Keine verspäteten Jobs.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paginatedJobs.map((job) => (
                <Card key={job.id} className="border border-destructive/50">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-2">{job.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Kunde:</span>{' '}
                        {job.customerName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Bestell-Nr.:</span>{' '}
                        {job.orderNumber || 'N/A'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Verspätung:</span>{' '}
                        <span className="text-destructive font-medium">
                          {calculateDelay(job.endDateTime!, job.dueDateTime)}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Produktionsdauer:</span>{' '}
                        {formatDuration(job.duration)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Fälligkeitsdatum:</span>{' '}
                        {format(parseISO(job.dueDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Tatsächliches Ende:</span>{' '}
                        {format(parseISO(job.endDateTime!), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {paginatedJobs.length > 0 && paginatedJobs.length < itemsPerPage && (
                Array.from({ length: itemsPerPage - paginatedJobs.length }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="hidden md:block">
                    <Skeleton className="h-64" />
                  </div>
                ))
              )}
            </div>
            
            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
