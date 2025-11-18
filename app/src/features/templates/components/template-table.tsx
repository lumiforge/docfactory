import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  History,
  Download
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DOCUMENT_TYPES } from '@/constants/document-types';
import { LABELS } from '@/constants/labels';
import { templatesSprint5API } from '@/lib/api/templates-sprint5.api';
import { usePermissions } from '@/lib/permissions';
import type { Template, SortField } from '@/types/template.types';
import { useDeleteTemplate, useDuplicateTemplate } from '../hooks/use-template-mutations';
import { useTemplatesPrefetch } from '../hooks/use-templates';
import { EnhancedDuplicateDialog } from './enhanced-duplicate-dialog';
import { VersionHistoryPanel } from './version-history/version-history-panel';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TemplateTableProps {
  templates: Template[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onSort: (field: SortField, order: 'asc' | 'desc') => void;
  currentSort?: { field: SortField; order: 'asc' | 'desc' };
  onView?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
}

export function TemplateTable({
  templates,
  isLoading = false,
  selectedIds,
  onSelectionChange,
  onSort,
  currentSort,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: TemplateTableProps) {
  const can = usePermissions();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteTemplate();
  const duplicateMutation = useDuplicateTemplate();
  const { prefetchTemplate } = useTemplatesPrefetch();
  
  // Sprint 5 state
  const [versionHistoryTemplate, setVersionHistoryTemplate] = useState<Template | null>(null);
  const [duplicateTemplate, setDuplicateTemplate] = useState<Template | null>(null);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(templates.map(t => t.id));
    } else {
      onSelectionChange([]);
    }
  };

  // Handle individual selection
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    const order = currentSort?.field === field && currentSort?.order === 'asc' ? 'desc' : 'asc';
    onSort(field, order);
  };

  // Sprint 5 handlers
  const handleVersionHistory = (template: Template) => {
    setVersionHistoryTemplate(template);
  };

  const handleEnhancedDuplicate = (template: Template) => {
    setDuplicateTemplate(template);
  };

  const handleExport = async (template: Template) => {
    try {
      const blob = await templatesSprint5API.bulkExport([template.id]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name.replace(/[^a-z0-9]/gi, '_')}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleDuplicateSuccess = () => {
    setDuplicateTemplate(null);
    queryClient.invalidateQueries({ queryKey: ['templates'] });
  };

  const handleVersionHistoryClose = () => {
    setVersionHistoryTemplate(null);
  };

  // Render sortable header
  const renderSortableHeader = (field: SortField, label: string) => {
    const isActive = currentSort?.field === field;
    const nextOrder = isActive && currentSort?.order === 'asc' ? 'desc' : 'asc';
    
    return (
      <TableHead 
        className="cursor-pointer select-none hover:bg-gray-50"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-2">
          {label}
          {isActive ? (
            currentSort.order === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </TableHead>
    );
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedIds.length === templates.length && templates.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Выбрать все"
              />
            </TableHead>
            {renderSortableHeader('name', LABELS.templates.name)}
            {renderSortableHeader('document_type', LABELS.templates.type)}
            {renderSortableHeader('documents_count', LABELS.templates.popularity)}
            {renderSortableHeader('updated_at', LABELS.templates.updated)}
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton rows
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                    <div>
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))
          ) : templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="text-gray-500">
                  {LABELS.templates.empty}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TableRow 
                key={template.id}
                className={`hover:bg-gray-50 ${template.deleted_at ? 'opacity-60' : ''}`}
                onMouseEnter={() => prefetchTemplate(template.id)}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(template.id)}
                    onCheckedChange={(checked) => handleSelect(template.id, checked as boolean)}
                    aria-label={`Выбрать ${template.name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {template.thumbnail_url && (
                      <Image
                        src={template.thumbnail_url}
                        alt={template.name}
                        className="w-10 h-10 rounded object-cover"
                        width={40}
                        height={40}
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{template.name}</div>
                        {/* Version badge */}
                        {(template as any).version > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            v{(template as any).version}
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {template.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={DOCUMENT_TYPES[template.document_type].color as any}
                  >
                    {DOCUMENT_TYPES[template.document_type].label}
                  </Badge>
                </TableCell>
                <TableCell>{template.documents_count}</TableCell>
                <TableCell>
                  {format(new Date(template.updated_at), 'dd MMM yyyy', { locale: ru })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* View */}
                      <DropdownMenuItem onClick={() => onView?.(template)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {LABELS.templates.view}
                      </DropdownMenuItem>
                      
                      {/* Edit */}
                      {can.update() && !template.deleted_at && (
                        <DropdownMenuItem onClick={() => onEdit?.(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {LABELS.templates.edit}
                        </DropdownMenuItem>
                      )}
                      
                      {/* Version History */}
                      {can.update() && !template.deleted_at && (
                        <DropdownMenuItem onClick={() => handleVersionHistory(template)}>
                          <History className="h-4 w-4 mr-2" />
                          История версий
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      {/* Enhanced Duplicate */}
                      {can.duplicate() && !template.deleted_at && (
                        <DropdownMenuItem onClick={() => handleEnhancedDuplicate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Дублировать
                        </DropdownMenuItem>
                      )}
                      
                      {/* Export */}
                      {can.view() && (
                        <DropdownMenuItem onClick={() => handleExport(template)}>
                          <Download className="h-4 w-4 mr-2" />
                          Экспортировать
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator />
                      
                      {/* Delete */}
                      {can.delete() && (
                        <DropdownMenuItem
                          onClick={() => {
                            if (window.confirm(LABELS.templates.deleteConfirm)) {
                              deleteMutation.mutate(template.id);
                              onDelete?.(template);
                            }
                          }}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {template.deleted_at ? LABELS.templates.restore : LABELS.templates.delete}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Version History Panel */}
      {versionHistoryTemplate && (
        <VersionHistoryPanel
          templateId={versionHistoryTemplate.id}
          open={!!versionHistoryTemplate}
          onOpenChange={(open) => !open && handleVersionHistoryClose()}
        />
      )}
      
      {/* Enhanced Duplicate Dialog */}
      {duplicateTemplate && (
        <EnhancedDuplicateDialog
          template={duplicateTemplate}
          open={!!duplicateTemplate}
          onOpenChange={(open) => !open && setDuplicateTemplate(null)}
          onSuccess={handleDuplicateSuccess}
        />
      )}
    </div>
  );
}