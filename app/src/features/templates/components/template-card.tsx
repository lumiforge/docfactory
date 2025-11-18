import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Calendar,
  FileText,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DOCUMENT_TYPES } from '@/constants/document-types';
import { LABELS } from '@/constants/labels';
import { usePermissions } from '@/lib/permissions';
import type { Template } from '@/types/template.types';
import { useDeleteTemplate, useDuplicateTemplate } from '../hooks/use-template-mutations';
import { useTemplatesPrefetch } from '../hooks/use-templates';
import { Badge } from '@/components/ui/badge';

interface TemplateCardProps {
  template: Template;
  onView?: (template: Template) => void;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
}

export function TemplateCard({ 
  template, 
  onView,
  onEdit,
  onDelete,
  onDuplicate 
}: TemplateCardProps) {
  const can = usePermissions();
  const deleteMutation = useDeleteTemplate();
  const duplicateMutation = useDuplicateTemplate();
  const { prefetchTemplate } = useTemplatesPrefetch();

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

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onMouseEnter={() => prefetchTemplate(template.id)}
    >
      {/* Thumbnail preview */}
      <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-50">
        {template.thumbnail_url ? (
          <Image
            src={template.thumbnail_url}
            alt={template.name}
            className="w-full h-full object-cover"
            width={300}
            height={192}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Status overlay */}
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
        <Badge 
          variant={DOCUMENT_TYPES[template.document_type].color as any}
          className="mb-2"
        >
          {DOCUMENT_TYPES[template.document_type].label}
        </Badge>
        
        {/* Title */}
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {template.name}
        </h3>
        
        {/* Description */}
        {template.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {template.description}
          </p>
        )}
        
        {/* Metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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
          {/* Primary action - Edit or View */}
          {can.update() && !template.deleted_at ? (
            <Button 
              size="sm" 
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              {LABELS.templates.edit}
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleView}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
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
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  {LABELS.templates.edit}
                </DropdownMenuItem>
              )}
              
              {/* Duplicate */}
              {can.duplicate() && !template.deleted_at && (
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  {LABELS.templates.duplicate}
                </DropdownMenuItem>
              )}
              
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
  );
}