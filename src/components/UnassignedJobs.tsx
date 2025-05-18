import { useState, useMemo, useCallback } from 'react';
import { Job } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { PaginationControls } from './pagination/PaginationControls';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { mergeUnassignedJobs } from '@/lib/scheduleUtils';

interface UnassignedJobsProps {
  jobs: Job[];
}

export function UnassignedJobs({ jobs }: UnassignedJobsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Changed from 6 to 9 items per page
  
  // Memoize the filtered and merged jobs list to prevent unnecessary recomputation
  const unassignedJobs = useMemo(() => {
    // Filter unassigned jobs
    const filtered = jobs.filter(job => job.line === null || !job.startProductionDateTime);
    
    // Merge similar unassigned jobs
    const merged = mergeUnassignedJobs(filtered);
    
    // Sort by due date (ascending)
    return merged.sort((a, b) => {
      return new Date(a.dueDateTime).getTime() - new Date(b.dueDateTime).getTime();
    });
  }, [jobs]);
  
  const totalPages = Math.ceil(unassignedJobs.length / itemsPerPage);
  
  // Reset to first page when unassigned jobs count changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  
  // Calculate paginated jobs efficiently
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return unassignedJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [unassignedJobs, currentPage, itemsPerPage]);
  
  // Memoize format function to improve performance
  const formatDuration = useCallback((durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return `${hours} h ${minutes} min`;
  }, []);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Offene Jobs ({unassignedJobs.length})</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {unassignedJobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Keine offenen Jobs.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paginatedJobs.map((job) => (
                <Card key={job.id} className="border">
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
                        <span className="text-muted-foreground">Warenempfänger:</span>{' '}
                        {job.recipient || 'N/A'}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Menge:</span>{' '}
                        <Badge variant="secondary" className="ml-1">{job.quantity !== undefined ? job.quantity : "N/A"}</Badge>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Kompatible Maschinentypen:</span>{' '}
                        {job.product.compatibleMachines.join(', ')}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Geschätze Produktionsdauer:</span>{' '}
                        {formatDuration(job.duration)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Bereit ab:</span>{' '}
                        {format(parseISO(job.readyDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Ideales Enddatum:</span>{' '}
                        {format(parseISO(job.idealEndDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Fälligkeitsdatum:</span>{' '}
                        {format(parseISO(job.dueDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add skeleton loading placeholders for partially filled rows */}
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
