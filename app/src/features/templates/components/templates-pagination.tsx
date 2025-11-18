import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LABELS } from '@/constants/labels';
import type { PaginationMeta } from '@/types/template.types';

interface TemplatesPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number, limit?: number) => void;
  isLoading?: boolean;
  pageSizeOptions?: number[];
}

export function TemplatesPagination({
  pagination,
  onPageChange,
  isLoading = false,
  pageSizeOptions = [10, 20, 50, 100],
}: TemplatesPaginationProps) {
  const { page, limit, total, total_pages, has_next, has_prev } = pagination;

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= total_pages && !isLoading) {
      onPageChange(newPage, limit);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newLimit: number) => {
    // Reset to first page when changing page size
    onPageChange(1, newLimit);
  };

  // Generate page numbers to show
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show
    
    if (total_pages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart range around current page
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, page - half);
      let end = Math.min(total_pages, start + maxVisible - 1);
      
      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
      {/* Page info */}
      <div className="text-sm text-gray-600">
        {LABELS.pagination.showing.replace('{start}', String((page - 1) * limit + 1))
          .replace('{end}', String(Math.min(page * limit, total)))
          .replace('{total}', String(total))}
      </div>

      <div className="flex items-center gap-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={!has_prev || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          {LABELS.pagination.previous}
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {/* First page if not visible */}
          {pageNumbers[0] > 1 && (
            <>
              <Button
                variant={page === 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={isLoading}
              >
                1
              </Button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 text-gray-400">...</span>
              )}
            </>
          )}

          {/* Visible page range */}
          {pageNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              variant={page === pageNum ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(pageNum)}
              disabled={isLoading}
            >
              {pageNum}
            </Button>
          ))}

          {/* Last page if not visible */}
          {pageNumbers[pageNumbers.length - 1] < total_pages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < total_pages - 1 && (
                <span className="px-2 text-gray-400">...</span>
              )}
              <Button
                variant={page === total_pages ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(total_pages)}
                disabled={isLoading}
              >
                {total_pages}
              </Button>
            </>
          )}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={!has_next || isLoading}
        >
          {LABELS.pagination.next}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {LABELS.pagination.itemsPerPage}
        </span>
        <Select
          value={String(limit)}
          onValueChange={(value) => handlePageSizeChange(Number(value))}
          disabled={isLoading}
        >
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}