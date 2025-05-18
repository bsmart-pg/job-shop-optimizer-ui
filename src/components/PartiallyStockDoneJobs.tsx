
import React, { useState, useMemo, useCallback } from "react";
import { Job } from "@/lib/types";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { PackageCheck } from "lucide-react";
import { PaginationControls } from "./pagination/PaginationControls";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface PartiallyStockDoneJobsProps {
  jobs: Job[];
}

export const PartiallyStockDoneJobs = ({ jobs }: PartiallyStockDoneJobsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Same as other job display components
  
  console.log("PartiallyStockDoneJobs component received jobs:", jobs);
  
  // Filter out empty data and sort by due date
  const partiallyStockDoneJobs = useMemo(() => {
    // First ensure we have valid jobs data
    if (!jobs || jobs.length === 0) return [];
    
    // Sort jobs by due date (ascending)
    return [...jobs].sort((a, b) => {
      if (!a.dueDateTime && !b.dueDateTime) return 0;
      if (!a.dueDateTime) return 1; // null values go to the end
      if (!b.dueDateTime) return -1;
      return new Date(a.dueDateTime).getTime() - new Date(b.dueDateTime).getTime();
    });
  }, [jobs]);
  
  const totalPages = Math.ceil(partiallyStockDoneJobs.length / itemsPerPage);
  
  // Reset to first page when jobs count changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  
  // Calculate paginated jobs efficiently
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return partiallyStockDoneJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [partiallyStockDoneJobs, currentPage, itemsPerPage]);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Remove this condition to always render the component
  // if (!partiallyStockDoneJobs || partiallyStockDoneJobs.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5" />
          <span>Teilweise durch Lagerbestand abgedeckte Jobs ({partiallyStockDoneJobs.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {partiallyStockDoneJobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Keine Jobs teilweise durch Lagerbestand abgedeckt.</p>
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
                        <span className="text-muted-foreground">Produkt:</span>{' '}
                        {job.product.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Beanspruchter Bestand:</span>{' '}
                        <span className="font-semibold">{job.usedStock !== undefined ? job.usedStock : "N/A"}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Benötigte Menge:</span>{' '}
                        <Badge variant="secondary" className="ml-1">{job.quantity !== undefined ? job.quantity : "N/A"}</Badge>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Fälligkeitsdatum:</span>{' '}
                        {job.dueDateTime 
                          ? format(parseISO(job.dueDateTime), "dd.MM.yyyy HH:mm", { locale: de })
                          : "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add skeleton loading placeholders for partially filled rows */}
              {paginatedJobs.length > 0 && paginatedJobs.length < itemsPerPage && (
                Array.from({ length: itemsPerPage - paginatedJobs.length }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="hidden md:block">
                    <Skeleton className="h-40" />
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
};
