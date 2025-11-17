import { useState } from 'react';

export interface Template {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  return { templates, loading, loadTemplates };
}