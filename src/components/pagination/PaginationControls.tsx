
import { Button } from "@/components/ui/button";
import { 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight 
} from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange,
  disabled = false
}: PaginationControlsProps) {
  // Don't render pagination if only one page
  if (totalPages <= 1) return null;

  const goToFirstPage = () => onPageChange(1);
  const goToPreviousPage = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const goToLastPage = () => onPageChange(totalPages);

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={goToFirstPage}
        disabled={currentPage === 1 || disabled}
        aria-label="Go to first page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousPage}
        disabled={currentPage === 1 || disabled}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center space-x-1">
        <span className="px-2">
          Seite {currentPage} von {totalPages}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goToNextPage}
        disabled={currentPage === totalPages || disabled}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={goToLastPage}
        disabled={currentPage === totalPages || disabled}
        aria-label="Go to last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
