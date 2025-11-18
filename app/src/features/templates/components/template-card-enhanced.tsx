import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Calendar,
  FileText,
  MoreVertical,
  Edit,
  Copy,
  Download,
  Trash2,
  History,
  Eye,
  Checkbox,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DOCUMENT_TYPES } from '@/constants/document-types';
import { LABELS } from '@/constants/labels';
import { usePermissions } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import type { Template } from '@/types/template.types';
import { useDeleteTemplate, useDuplicateTemplate } from '../hooks/use-template-mutations';
import { useTemplatesPrefetch } from '../hooks/use-templates';
// Sprint 5 components
import { EnhancedDuplicateDialog } from './enhanced-duplicate-dialog';
import { ThumbnailPreview } from './template-preview/thumbnail-generator';
import { VersionHistoryPanel } from './version-history/version-history-panel';
import { Badge } from '@/components/ui/badge';

interface TemplateCardEnhancedProps {
  template: Template;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onView?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  showBulkActions?: boolean;
  className?: string;
}

export function TemplateCardEnhanced({
  template,
  isSelected = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  showBulkActions = false,
  className,
}: TemplateCardEnhancedProps) {
  const can = usePermissions();
  const deleteMutation = useDeleteTemplate();
  const duplicateMutation = useDuplicateTemplate();
  const { prefetchTemplate } = useTemplatesPrefetch();

  // Sprint 5 state
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);

  const handleDelete = () => {
    if (window.confirm(LABELS.templates.deleteConfirm)) {
      deleteMutation.mutate(template.id);
      onDelete?.(template);
    }
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(template.id);
    onDuplicate?.(template);
  };

  const handleEdit = () => {
    onEdit?.(template);
  };

  const handleView = () => {
    onView?.(template);
  };

  const handleSelect = () => {
    onSelect?.(!isSelected);
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/v1/templates/${template.id}/export`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <>
      <Card
        className={cn(
          "relative hover:shadow-lg transition-all cursor-pointer group",
          isSelected && "ring-2 ring-blue-500",
          className
        )}
        onMouseEnter={() => prefetchTemplate(template.id)}
      >
        {/* Bulk selection checkbox */}
        {showBulkActions && (
          <div className="absolute top-3 left-3 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleSelect}
              aria-label={`Выбрать ${template.name}`}
            />
          </div>
        )}

        {/* Version badge */}
        {template.version > 1 && (
          <Badge
            variant="secondary"
            className="absolute top-3 right-3"
          >
            v{template.version}
          </Badge>
        )}

        {/* Thumbnail preview */}
        <div className="relative w-full h-48 bg-gray-100">
          <ThumbnailPreview
            template={template}
            size="card"
            className="w-full h-full"
          />
          
          {/* Deleted overlay */}
          {template.deleted_at && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive">
                {LABELS.templates.deleted}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Type badge */}
          <Badge variant={DOCUMENT_TYPES[template.document_type].color as any}>
            {DOCUMENT_TYPES[template.document_type].label}
          </Badge>

          {/* Title */}
          <h3 className="font-semibold text-lg mt-2 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {template.name}
          </h3>

          {/* Description */}
          {template.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {template.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(template.updated_at), 'dd MMM yyyy', { locale: ru })}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {template.documents_count}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {/* Primary action */}
            {can.update() && !template.deleted_at ? (
              <Button
                size="sm"
                className="flex-1"
                onClick={handleEdit}
                asChild
              >
                <Link href={`/templates/${template.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {LABELS.templates.edit}
                </Link>
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handleView}
              >
                <Eye className="h-4 w-4 mr-2" />
                {LABELS.templates.view}
              </Button>
            )}

            {/* Dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* View */}
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="h-4 w-4 mr-2" />
                  {LABELS.templates.view}
                </DropdownMenuItem>

                {/* Edit */}
                {can.update() && !template.deleted_at && (
                  <DropdownMenuItem onClick={handleEdit} asChild>
                    <Link href={`/templates/${template.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      {LABELS.templates.edit}
                    </Link>
                  </DropdownMenuItem>
                )}

                {/* Sprint 5: Version History */}
                <DropdownMenuItem onClick={() => setIsVersionHistoryOpen(true)}>
                  <History className="h-4 w-4 mr-2" />
                  История версий
                </DropdownMenuItem>

                {/* Sprint 5: Enhanced Duplicate */}
                <DropdownMenuItem onClick={() => setIsDuplicateDialogOpen(true)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Дублировать
                </DropdownMenuItem>

                {/* Sprint 5: Export */}
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Экспортировать
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Delete/Restore */}
                {can.delete() && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {template.deleted_at ? LABELS.templates.restore : LABELS.templates.delete}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Sprint 5: Version History Dialog */}
      <VersionHistoryPanel
        templateId={template.id}
        open={isVersionHistoryOpen}
        onOpenChange={setIsVersionHistoryOpen}
      />

      {/* Sprint 5: Enhanced Duplicate Dialog */}
      <EnhancedDuplicateDialog
        template={template}
        open={isDuplicateDialogOpen}
        onOpenChange={setIsDuplicateDialogOpen}
        onDuplicateSuccess={(newTemplate) => {
          onDuplicate?.(newTemplate);
        }}
      />
    </>
  );
}