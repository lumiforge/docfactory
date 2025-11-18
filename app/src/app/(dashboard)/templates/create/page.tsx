import React from 'react';
import { TemplateForm } from '@/features/templates/components/template-form';
import type { Template } from '@/types/template.types';

export default function CreateTemplatePage() {
  const handleSuccess = (template: Template) => {
    // Success is handled in the form component
    // This callback can be used for additional actions if needed
  };

  return (
    <div className="container mx-auto py-6">
      <TemplateForm onSuccess={handleSuccess} />
    </div>
  );
}

export const metadata = {
  title: 'Создание шаблона - DocFactory',
  description: 'Создание нового шаблона документа',
};