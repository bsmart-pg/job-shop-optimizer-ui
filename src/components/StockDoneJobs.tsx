
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
import { Package } from "lucide-react";
import { PaginationControls } from "./pagination/PaginationControls";
import { Skeleton } from "@/components/ui/skeleton";

interface StockDoneJobsProps {
  jobs: Job[];
}

export const StockDoneJobs = ({ jobs }: StockDoneJobsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Same as other job display components
  
  // Filter out empty data
  const stockDoneJobs = useMemo(() => {
    return jobs || [];
  }, [jobs]);
  
  const totalPages = Math.ceil(stockDoneJobs.length / itemsPerPage);
  
  // Reset to first page when jobs count changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);
  
  // Calculate paginated jobs efficiently
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return stockDoneJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [stockDoneJobs, currentPage, itemsPerPage]);
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (!stockDoneJobs || stockDoneJobs.length === 0) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <span>Stock Done Jobs ({stockDoneJobs.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stockDoneJobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No stock done jobs available.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {paginatedJobs.map((job) => (
                <Card key={job.id} className="border">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-lg mb-2">{job.name}</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Customer:</span>{' '}
                        {job.customerName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Product:</span>{' '}
                        {job.product.name}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Used Stock:</span>{' '}
                        <span className="font-semibold">{job.usedStock !== undefined ? job.usedStock : "N/A"}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Due Date:</span>{' '}
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
