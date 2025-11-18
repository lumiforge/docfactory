import { Search, X, Filter } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DOCUMENT_TYPES } from '@/constants/document-types';
import { LABELS } from '@/constants/labels';
import type {
  TemplatesFilters,
  DocumentType,
  SortField
} from '@/types/template.types';
import { Badge } from '@/components/ui/badge';

interface TemplatesFiltersProps {
  filters: TemplatesFilters;
  onFiltersChange: (filters: Partial<TemplatesFilters>) => void;
  isLoading?: boolean;
}

export function TemplatesFilters({ 
  filters, 
  onFiltersChange, 
  isLoading = false 
}: TemplatesFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle search change with debounce
  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  // Handle document type filter
  const handleDocumentTypeChange = (types: DocumentType[]) => {
    onFiltersChange({ document_type: types });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-');
    onFiltersChange({ 
      sort: field as SortField, 
      order: order as 'asc' | 'desc' 
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      document_type: [],
      sort: 'updated_at',
      order: 'desc',
    });
  };

  // Toggle document type
  const toggleDocumentType = (type: DocumentType) => {
    const currentTypes = filters.document_type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    handleDocumentTypeChange(newTypes);
  };

  // Get selected document types count
  const selectedTypesCount = filters.document_type?.length || 0;

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder={LABELS.templates.searchPlaceholder}
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-10"
          disabled={isLoading}
        />
        {filters.search && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => handleSearchChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Document type filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {LABELS.templates.type}
              {selectedTypesCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedTypesCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            {Object.values(DocumentType).map((type) => (
              <DropdownMenuCheckboxItem
                key={type}
                checked={filters.document_type?.includes(type) || false}
                onCheckedChange={() => toggleDocumentType(type)}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-3 h-3 rounded-full bg-${DOCUMENT_TYPES[type].color}-500`}
                  />
                  {DOCUMENT_TYPES[type].label}
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <Select
          value={`${filters.sort || 'updated_at'}-${filters.order || 'desc'}`}
          onValueChange={handleSortChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={LABELS.templates.sort} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at-desc">
              {LABELS.templates.sortByUpdatedDesc}
            </SelectItem>
            <SelectItem value="updated_at-asc">
              {LABELS.templates.sortByUpdatedAsc}
            </SelectItem>
            <SelectItem value="created_at-desc">
              {LABELS.templates.sortByCreatedDesc}
            </SelectItem>
            <SelectItem value="created_at-asc">
              {LABELS.templates.sortByCreatedAsc}
            </SelectItem>
            <SelectItem value="name-asc">
              {LABELS.templates.sortByNameAsc}
            </SelectItem>
            <SelectItem value="name-desc">
              {LABELS.templates.sortByNameDesc}
            </SelectItem>
            <SelectItem value="documents_count-desc">
              {LABELS.templates.sortByPopularDesc}
            </SelectItem>
            <SelectItem value="documents_count-asc">
              {LABELS.templates.sortByPopularAsc}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {(filters.search || selectedTypesCount > 0) && (
          <Button 
            variant="ghost" 
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            {LABELS.templates.clearFilters}
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {(filters.search || selectedTypesCount > 0) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              {LABELS.templates.search}: {filters.search}
              <Button
                size="icon"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {selectedTypesCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              {LABELS.templates.type}: {selectedTypesCount} {LABELS.templates.selected}
              <Button
                size="icon"
                variant="ghost"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleDocumentTypeChange([])}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}