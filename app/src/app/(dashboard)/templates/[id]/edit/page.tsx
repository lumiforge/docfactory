import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TemplateForm } from '@/features/templates/components/template-form';
import { useTemplate } from '@/features/templates/hooks/use-templates';
import type { Template } from '@/types/template.types';

interface EditTemplatePageProps {
  params: {
    id: string;
  };
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { data: template, isLoading, error } = useTemplate(params.id);

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

  const handleSuccess = (updatedTemplate: Template) => {
    // Success is handled in the form component
    // This callback can be used for additional actions if needed
  };

  return (
    <div className="container mx-auto py-6">
      <TemplateForm 
        templateId={params.id} 
        onSuccess={handleSuccess} 
      />
    </div>
  );
}

export const metadata = {
  title: 'Редактирование шаблона - DocFactory',
  description: 'Редактирование шаблона документа',
};