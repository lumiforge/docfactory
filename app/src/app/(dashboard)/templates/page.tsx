import React from 'react';
import { TemplatesList } from '@/features/templates/components/templates-list';

export default function TemplatesPage() {
  return (
    <div className="container mx-auto py-6">
      <TemplatesList />
    </div>
  );
}

export const metadata = {
  title: 'Шаблоны - DocFactory',
  description: 'Управление шаблонами документов',
};