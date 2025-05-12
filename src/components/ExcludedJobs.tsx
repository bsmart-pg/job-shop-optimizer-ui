
import { useState, useMemo, useCallback } from 'react';
import { Job } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { PaginationControls } from './pagination/PaginationControls';
import { Skeleton } from './ui/skeleton';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { putBackExcludedJobs } from '@/lib/services/scheduleService';
import { useToast } from '@/hooks/use-toast';
import { mergeConsecutiveJobs } from '@/lib/scheduleUtils';

interface ExcludedJobsProps {
  jobs: Job[];
  onJobsUpdated?: () => void;
}

export function ExcludedJobs({ jobs, onJobsUpdated }: ExcludedJobsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobs, setSelectedJobs] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const itemsPerPage = 9;
  
  // Memoize the filtered and merged jobs list
  const excludedJobs = useMemo(() => {
    const filtered = jobs.filter(job => job.line === null || !job.startProductionDateTime);
    return mergeConsecutiveJobs(filtered);
  }, [jobs]);
  
  const totalPages = Math.ceil(excludedJobs.length / itemsPerPage);
  
  // Reset to first page when excluded jobs count changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  
  // Calculate paginated jobs efficiently
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return excludedJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [excludedJobs, currentPage, itemsPerPage]);
  
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
  
  // Handle job selection
  const handleJobSelection = useCallback((jobId: string) => {
    setSelectedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  }, []);
  
  // Get selected job count
  const selectedJobCount = useMemo(() => {
    return Object.values(selectedJobs).filter(Boolean).length;
  }, [selectedJobs]);
  
  // Handle put back selected jobs
  const handlePutBackSelectedJobs = async () => {
    const selectedJobIds = Object.entries(selectedJobs)
      .filter(([_, isSelected]) => isSelected)
      .map(([jobId]) => jobId);
    
    if (selectedJobIds.length === 0) {
      toast({
        title: "Keine Jobs ausgewählt",
        description: "Bitte wählen Sie mindestens einen Job aus.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await putBackExcludedJobs(selectedJobIds);
      
      toast({
        title: "Erfolg",
        description: `${selectedJobIds.length} Job(s) wurden zurück in den Produktionsplan übernommen.`,
      });
      
      // Reset selection after successful submission
      setSelectedJobs({});
      
      // Trigger schedule refresh if callback is provided
      if (onJobsUpdated) {
        onJobsUpdated();
      }
      
    } catch (error) {
      console.error("Failed to put back jobs:", error);
      toast({
        title: "Fehler",
        description: "Die Jobs konnten nicht zurückgegeben werden. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Ausgeschlossene Jobs ({excludedJobs.length})</span>
          {selectedJobCount > 0 && (
            <span className="text-sm font-normal">
              {selectedJobCount} Job(s) ausgewählt
            </span>
          )}
        </CardTitle>
        <CardDescription className="text-lg">
          Für Produkte dieser Jobs beträgt die Produktionszeit für das akkumulierte Auftragsvolumen weniger als 2h.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {excludedJobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Keine ausgeschlossenen Jobs.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paginatedJobs.map((job) => (
                <Card key={job.id} className="border relative">
                  <div className="absolute top-2 right-2">
                    <Checkbox 
                      id={`job-${job.id}`}
                      checked={!!selectedJobs[job.id]}
                      onCheckedChange={() => handleJobSelection(job.id)}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-2">{job.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Kunde:</span>{' '}
                        {job.customerName}
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
      
      {excludedJobs.length > 0 && (
        <CardFooter className="flex justify-end">
          <Button 
            variant="default" 
            onClick={handlePutBackSelectedJobs}
            disabled={selectedJobCount === 0 || isSubmitting}
          >
            {isSubmitting ? 'Wird bearbeitet...' : 'Ausgewählte Jobs zurücklegen'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
