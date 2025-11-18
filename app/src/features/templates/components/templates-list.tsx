import { useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Table2, Plus, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { LABELS } from '@/constants/labels';
import { usePermissions } from '@/lib/permissions';
import type {
  Template,
  TemplatesFilters as FiltersType,
  SortField,
  ViewMode
} from '@/types/template.types';
import { useTemplates } from '../hooks/use-templates';
import { BulkActionsToolbar } from './bulk-operations/bulk-actions-toolbar';
import { TemplateCardEnhanced } from './template-card-enhanced';
import { TemplateImportDialog } from './template-import/template-import-dialog';
import { TemplateTable } from './template-table';
import { TemplatesFilters } from './templates-filters';
import { TemplatesPagination } from './templates-pagination';

interface TemplatesListProps {
  initialFilters?: Partial<FiltersType>;
  showCreateButton?: boolean;
  onCreateNew?: () => void;
}

const DEFAULT_FILTERS: FiltersType = {
  search: '',
  document_type: [],
  sort: 'updated_at',
  order: 'desc',
  page: 1,
  limit: 20,
};

export function TemplatesList({
  initialFilters = {},
  showCreateButton = true,
  onCreateNew
}: TemplatesListProps) {
  const router = useRouter();
  const can = usePermissions();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<FiltersType>({ ...DEFAULT_FILTERS, ...initialFilters });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Fetch templates
  const { data, error, isLoading, isFetching } = useTemplates(filters);

  // Handle filters change
  const handleFiltersChange = (newFilters: Partial<FiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Handle page change
  const handlePageChange = (page: number, limit?: number) => {
    handleFiltersChange({ page, limit });
  };

  // Handle sort
  const handleSort = (field: SortField, order: 'asc' | 'desc') => {
    handleFiltersChange({ sort: field, order, page: 1 }); // Reset to first page on sort
  };

  // Handle template actions
  const handleViewTemplate = (template: Template) => {
    router.push(`/dashboard/templates/${template.id}`);
  };

  const handleEditTemplate = (template: Template) => {
    router.push(`/dashboard/templates/${template.id}/edit`);
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      router.push('/dashboard/templates/create');
    }
  };

  // Handle import
  const handleImportSuccess = () => {
    setIsImportDialogOpen(false);
    // Invalidate templates query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['templates'] });
  };

  // Handle selection
  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  // Handle bulk selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!data?.data) return;
    
    const allIds = data.data.map(template => template.id);
    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  // Handle bulk operations
  const handleBulkOperationComplete = () => {
    setSelectedIds([]);
    queryClient.invalidateQueries({ queryKey: ['templates'] });
  };

  // Reset selection when filters change
  const prevFiltersRef = useRef(filters);
  
  useEffect(() => {
    // Only reset selection if filters actually changed (not on initial render)
    if (prevFiltersRef.current !== filters) {
      // Use setTimeout to defer the setState call and avoid cascading renders
      setTimeout(() => setSelectedIds([]), 0);
      prevFiltersRef.current = filters;
    }
  }, [filters]);

  // Render loading state
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        {/* Filters skeleton */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </div>

        {/* Grid skeleton */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table skeleton */}
        {viewMode === 'table' && (
          <div className="border rounded-md">
            <div className="p-4 space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-10 w-10 rounded" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {LABELS.templates.loadError}: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const templates = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{LABELS.templates.title}</h1>
        
        <div className="flex items-center gap-4">
          {/* Import button */}
          {can.create() && (
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </Button>
          )}

          {/* View mode toggle */}
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => value && setViewMode(value as ViewMode)}
          >
            <ToggleGroupItem value="grid" aria-label={LABELS.templates.gridView}>
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label={LABELS.templates.tableView}>
              <Table2 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Create button */}
          {showCreateButton && can.create() && (
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              {LABELS.templates.create}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <TemplatesFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        isLoading={isFetching}
      />

      {/* Select all checkbox */}
      {templates.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.length === templates.length}
              indeterminate={selectedIds.length > 0 && selectedIds.length < templates.length}
              onChange={handleSelectAll}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              Выбрать все ({templates.length})
            </span>
          </div>
          
          {selectedIds.length > 0 && (
            <span className="text-sm text-blue-600 font-medium">
              Выбрано: {selectedIds.length}
            </span>
          )}
        </div>
      )}

      {/* Templates list */}
      {templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {filters.search || filters.document_type?.length
              ? LABELS.templates.noSearchResults
              : LABELS.templates.empty
            }
          </div>
          {showCreateButton && can.create() && !filters.search && !filters.document_type?.length && (
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              {LABELS.templates.createFirst}
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCardEnhanced
                  key={template.id}
                  template={template}
                  isSelected={selectedIds.includes(template.id)}
                  onToggleSelect={() => handleToggleSelect(template.id)}
                  onView={handleViewTemplate}
                  onEdit={handleEditTemplate}
                />
              ))}
            </div>
          )}

          {/* Table view */}
          {viewMode === 'table' && (
            <TemplateTable
              templates={templates}
              isLoading={isFetching}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onSort={handleSort}
              currentSort={{ 
                field: filters.sort as SortField, 
                order: filters.order as 'asc' | 'desc' 
              }}
              onView={handleViewTemplate}
              onEdit={handleEditTemplate}
            />
          )}
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <TemplatesPagination
          pagination={pagination}
          onPageChange={handlePageChange}
          isLoading={isFetching}
        />
      )}

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
          onComplete={handleBulkOperationComplete}
        />
      )}

      {/* Import Dialog */}
      <TemplateImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}