import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ArrowLeft,
  Edit,
  Copy,
  Trash2,
  Eye,
  Calendar,
  FileText,
  User,
  Tag,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DOCUMENT_TYPES } from '@/constants/document-types';
import { LABELS } from '@/constants/labels';
import { useDeleteTemplate, useDuplicateTemplate } from '@/features/templates/hooks/use-template-mutations';
import { useTemplate } from '@/features/templates/hooks/use-templates';
import { usePermissions } from '@/lib/permissions';
import type { Template } from '@/types/template.types';
import { Badge } from '@/components/ui/badge';

interface TemplatePageProps {
  params: {
    id: string;
  };
}

export default function TemplatePage({ params }: TemplatePageProps) {
  const can = usePermissions();
  const { data: template, isLoading, error } = useTemplate(params.id);
  const deleteMutation = useDeleteTemplate();
  const duplicateMutation = useDuplicateTemplate();

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Загрузка шаблона...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertDescription>
            Ошибка загрузки шаблона: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Handle not found
  if (!template) {
    notFound();
  }

  // Handle actions
  const handleEdit = () => {
    window.location.href = `/dashboard/templates/${template.id}/edit`;
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(template.id);
  };

  const handleDelete = () => {
    if (window.confirm(LABELS.templates.deleteConfirm)) {
      deleteMutation.mutate(template.id);
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Back button */}
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {LABELS.common.back}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>{LABELS.templates.preview}</CardTitle>
            </CardHeader>
            <CardContent>
              {template.thumbnail_url ? (
                <Image
                  src={template.thumbnail_url}
                  alt={template.name}
                  className="w-full h-96 object-cover rounded-lg border"
                  width={800}
                  height={600}
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg border flex items-center justify-center">
                  <FileText className="h-16 w-16 text-gray-400" />
                  <p className="mt-2 text-gray-500">{LABELS.templates.noPreview}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {template.description && (
            <Card>
              <CardHeader>
                <CardTitle>{LABELS.templates.description}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {template.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Template info */}
          <Card>
            <CardHeader>
              <CardTitle>{LABELS.templates.info}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type */}
              <div>
                <div className="text-sm text-gray-500 mb-1">{LABELS.templates.type}</div>
                <Badge 
                  variant={DOCUMENT_TYPES[template.document_type].color as any}
                  className="flex items-center gap-2 w-fit"
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-${DOCUMENT_TYPES[template.document_type].color}-500`}
                  />
                  {DOCUMENT_TYPES[template.document_type].label}
                </Badge>
              </div>

              {/* Page settings */}
              <div>
                <div className="text-sm text-gray-500 mb-1">{LABELS.templates.pageSize}</div>
                <div className="font-medium">{template.page_size}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">{LABELS.templates.orientation}</div>
                <div className="font-medium">
                  {template.orientation === 'portrait' ? LABELS.templates.portrait : LABELS.templates.landscape}
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {LABELS.templates.created}
                </div>
                <div className="font-medium">
                  {format(new Date(template.created_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  {LABELS.templates.updated}
                </div>
                <div className="font-medium">
                  {format(new Date(template.updated_at), 'dd MMM yyyy, HH:mm', { locale: ru })}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  {LABELS.templates.version}
                </div>
                <div className="font-medium">v{template.version}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">
                  <FileText className="h-4 w-4 inline mr-1" />
                  {LABELS.templates.documentsCount}
                </div>
                <div className="font-medium">{template.documents_count}</div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{LABELS.templates.actions}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* View */}
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => window.open(`/editor/${template.id}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                {LABELS.templates.viewInEditor}
              </Button>

              {/* Edit */}
              {can.update() && !template.deleted_at && (
                <Button 
                  className="w-full justify-start"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {LABELS.templates.edit}
                </Button>
              )}

              {/* Duplicate */}
              {can.duplicate() && !template.deleted_at && (
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={handleDuplicate}
                  disabled={duplicateMutation.isPending}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {LABELS.templates.duplicate}
                </Button>
              )}

              {/* Delete */}
              {can.delete() && (
                <Button 
                  className="w-full justify-start"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {template.deleted_at ? LABELS.templates.restore : LABELS.templates.delete}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Детали шаблона - DocFactory',
  description: 'Просмотр деталей шаблона документа',
};