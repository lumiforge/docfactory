import { http, HttpResponse } from 'msw';

interface Template {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Invoice Template',
    description: 'Standard invoice template',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  },
  {
    id: '2',
    name: 'Contract Template',
    description: 'Legal contract template',
    createdAt: '2023-01-02',
    updatedAt: '2023-01-02',
  },
];

export const templatesHandlers = [
  http.get('/api/templates', () => {
    return HttpResponse.json(templates);
  }),

  http.get('/api/templates/:id', ({ params }) => {
    const { id } = params;
    const template = templates.find(t => t.id === id);

    if (!template) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(template);
  }),

  http.post('/api/templates', async ({ request }) => {
    const newTemplate = await request.json();
    if (newTemplate && typeof newTemplate === 'object') {
      const templateToInsert: Template = {
        id: String(templates.length + 1),
        name: newTemplate.name || 'New Template',
        description: newTemplate.description || 'New template description',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newTemplate
      };
      templates.push(templateToInsert);
      return HttpResponse.json(templateToInsert, { status: 201 });
    } else {
      return new HttpResponse(null, { status: 400 });
    }
  }),

  http.put('/api/templates/:id', async ({ params, request }) => {
    const { id } = params;
    const updatedTemplate = await request.json();
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const updatedFields = updatedTemplate as Partial<Template>;
    templates[index] = { ...templates[index], ...updatedFields, updatedAt: new Date().toISOString() } as Template;

    return HttpResponse.json(templates[index]);
  }),

  http.delete('/api/templates/:id', ({ params }) => {
    const { id } = params;
    const index = templates.findIndex(t => t.id === id);

    if (index === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    templates.splice(index, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];