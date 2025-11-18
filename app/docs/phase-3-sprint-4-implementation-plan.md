# Phase 3 Sprint 4 - Implementation Plan

## Порядок реализации

### Этап 1: Infrastructure Setup (1-2 дня)

#### 1.1 Установка зависимостей
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zod react-hook-form @hookform/resolvers
npm install @radix-ui/react-dropdown-menu @radix-ui/react-toggle-group
npm install date-fns
```

#### 1.2 Создание типов и интерфейсов
**Файл**: `src/types/template.types.ts`
```typescript
export enum DocumentType {
  WARRANTY = 'warranty',
  INSTRUCTION = 'instruction',
  CERTIFICATE = 'certificate',
  LABEL = 'label',
}

export enum PageSize {
  A4 = 'A4',
  A5 = 'A5',
  LETTER = 'Letter',
}

export enum Orientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export interface Template {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
  json_schema_url: string;
  thumbnail_url: string | null;
  version: number;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  documents_count: number;
  last_used_at: string | null;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  document_type?: DocumentType;
  page_size?: PageSize;
  orientation?: Orientation;
}

export interface TemplateListParams {
  page: number;
  limit: number;
  sort?: 'name' | 'created_at' | 'updated_at' | 'document_type';
  order?: 'asc' | 'desc';
  search?: string;
  document_type?: DocumentType[];
  include_deleted?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
```

#### 1.3 Настройка Tanstack Query
**Файл**: `src/lib/query-client.ts`
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

**Файл**: `src/app/providers.tsx`
```typescript
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Обновить**: `src/app/layout.tsx`
```typescript
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Этап 2: API Layer (1 день)

#### 2.1 API Client
**Файл**: `src/lib/api/client.ts`
```typescript
import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle auth error
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

#### 2.2 Templates API Service
**Файл**: `src/lib/api/templates.api.ts`
```typescript
import { apiClient } from './client';
import { 
  Template, 
  CreateTemplateDto, 
  UpdateTemplateDto, 
  TemplateListParams,
  PaginatedResponse 
} from '@/types/template.types';

export const templatesAPI = {
  list: (params: TemplateListParams) => 
    apiClient.get<PaginatedResponse<Template>>('/templates', { params }),
  
  getById: (id: string) => 
    apiClient.get<Template>(`/templates/${id}`),
  
  create: (data: CreateTemplateDto) => 
    apiClient.post<Template>('/templates', data),
  
  update: (id: string, data: UpdateTemplateDto) => 
    apiClient.put<Template>(`/templates/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/templates/${id}`),
  
  restore: (id: string) => 
    apiClient.post(`/templates/${id}/restore`),
  
  duplicate: (id: string) => 
    apiClient.post<Template>(`/templates/${id}/duplicate`),
};
```

### Этап 3: Validation & Constants (1 день)

#### 3.1 Zod Schemas
**Файл**: `src/schemas/template.schema.ts`
```typescript
import { z } from 'zod';
import { DocumentType, PageSize, Orientation } from '@/types/template.types';

export const templateSchema = z.object({
  name: z
    .string()
    .min(3, 'Название должно содержать минимум 3 символа')
    .max(100, 'Максимальная длина названия 100 символов')
    .regex(
      /^[a-zA-Zа-яА-ЯёЁ0-9\s\-_.()]+$/,
      'Название может содержать только буквы, цифры, пробелы и символы: - _ . ( )'
    ),
  
  description: z
    .string()
    .max(500, 'Максимальная длина описания 500 символов')
    .optional()
    .or(z.literal('')),
  
  document_type: z.nativeEnum(DocumentType, {
    errorMap: () => ({ message: 'Выберите тип документа' }),
  }),
  
  page_size: z.nativeEnum(PageSize),
  orientation: z.nativeEnum(Orientation),
});

export type TemplateFormData = z.infer<typeof templateSchema>;
```

#### 3.2 UI Constants
**Файл**: `src/constants/labels.ts`
```typescript
export const LABELS = {
  templates: {
    title: 'Шаблоны',
    create: 'Создать шаблон',
    edit: 'Редактировать',
    delete: 'Удалить',
    duplicate: 'Дублировать',
    restore: 'Восстановить',
    search: 'Поиск по названию или описанию...',
    empty: 'Шаблоны не найдены',
    emptyDescription: 'Создайте первый шаблон для начала работы',
    filters: {
      documentType: 'Тип документа',
      status: 'Статус',
      sort: 'Сортировка',
      clear: 'Сбросить',
    },
    pagination: {
      page: 'Страница',
      of: 'из',
      itemsPerPage: 'элементов на странице',
      previous: 'Назад',
      next: 'Вперед',
    },
    actions: {
      confirmDelete: 'Удалить шаблон?',
      confirmDeleteDescription: 'Это действие можно отменить в течение 30 дней',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
    },
  },
} as const;
```

**Файл**: `src/constants/document-types.ts`
```typescript
import { DocumentType } from '@/types/template.types';

export const DOCUMENT_TYPES = {
  [DocumentType.WARRANTY]: {
    value: DocumentType.WARRANTY,
    label: 'Гарантийный талон',
    icon: 'Shield',
    color: 'blue',
  },
  [DocumentType.INSTRUCTION]: {
    value: DocumentType.INSTRUCTION,
    label: 'Инструкция по эксплуатации',
    icon: 'Book',
    color: 'green',
  },
  [DocumentType.CERTIFICATE]: {
    value: DocumentType.CERTIFICATE,
    label: 'Сертификат',
    icon: 'Award',
    color: 'purple',
  },
  [DocumentType.LABEL]: {
    value: DocumentType.LABEL,
    label: 'Этикетка',
    icon: 'Tag',
    color: 'orange',
  },
} as const;
```

### Этап 4: Hooks & State Management (1-2 дня)

#### 4.1 Templates Hooks
**Файл**: `src/hooks/use-templates.ts`
```typescript
'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { templatesAPI } from '@/lib/api/templates.api';
import { TemplateListParams, Template } from '@/types/template.types';
import { toast } from '@/lib/toast';

export function useTemplates(params: TemplateListParams) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesAPI.list(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesAPI.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: templatesAPI.create,
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.setQueryData(['templates', newTemplate.id], newTemplate);
      toast.success('Шаблон создан', 'Теперь вы можете настроить его дизайн');
    },
    onError: (error: any) => {
      toast.error('Ошибка создания', error.response?.data?.message || error.message);
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      templatesAPI.update(id, data),
    onSuccess: (updatedTemplate) => {
      queryClient.setQueryData(['templates', updatedTemplate.id], updatedTemplate);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон обновлен');
    },
    onError: (error: any) => {
      toast.error('Ошибка обновления', error.response?.data?.message || error.message);
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: templatesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон удален', 'Вы можете восстановить его в течение 30 дней');
    },
    onError: (error: any) => {
      toast.error('Ошибка удаления', error.response?.data?.message || error.message);
    },
  });
}

export function useRestoreTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: templatesAPI.restore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон восстановлен');
    },
    onError: (error: any) => {
      toast.error('Ошибка восстановления', error.response?.data?.message || error.message);
    },
  });
}

export function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: templatesAPI.duplicate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон дублирован');
    },
    onError: (error: any) => {
      toast.error('Ошибка дублирования', error.response?.data?.message || error.message);
    },
  });
}
```

#### 4.2 UI State Store (Zustand)
**Файл**: `src/stores/templates-ui.store.ts`
```typescript
import { create } from 'zustand';
import { TemplateListParams } from '@/types/template.types';

interface TemplatesUIState {
  viewMode: 'grid' | 'table';
  selectedIds: string[];
  filters: TemplateListParams;
  
  setViewMode: (mode: 'grid' | 'table') => void;
  toggleSelection: (id: string) => void;
  setFilters: (filters: Partial<TemplateListParams>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: TemplateListParams = {
  page: 1,
  limit: 20,
  sort: 'updated_at',
  order: 'desc',
  search: '',
  document_type: [],
  include_deleted: false,
};

export const useTemplatesUI = create<TemplatesUIState>((set) => ({
  viewMode: 'grid',
  selectedIds: [],
  filters: DEFAULT_FILTERS,
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((_id) => _id !== id)
      : [...state.selectedIds, id],
  })),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
```

#### 4.3 RBAC Hook
**Файл**: `src/hooks/use-permissions.ts`
```typescript
import { useAuth } from '@/hooks/use-auth';

export function usePermissions() {
  const { user } = useAuth();
  
  const can = {
    createTemplate: ['owner', 'admin', 'editor'].includes(user?.role || ''),
    editTemplate: ['owner', 'admin', 'editor'].includes(user?.role || ''),
    deleteTemplate: ['owner', 'admin', 'editor'].includes(user?.role || ''),
    restoreTemplate: ['owner', 'admin'].includes(user?.role || ''),
    viewTemplate: true, // все могут просматривать
  };
  
  return { user, can };
}
```

### Этап 5: Components (3-4 дня)

#### 5.1 Template Card Component
**Файл**: `src/components/templates/template-card.tsx`
```typescript
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Calendar, FileText, Edit, Trash2, Copy } from 'lucide-react';
import { Template } from '@/types/template.types';
import { DOCUMENT_TYPES } from '@/constants/document-types';
import { LABELS } from '@/constants/labels';
import { formatDate } from '@/lib/utils';
import { usePermissions } from '@/hooks/use-permissions';

interface TemplateCardProps {
  template: Template;
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onRestore?: (template: Template) => void;
}

export const TemplateCard = React.memo(function TemplateCard({ 
  template, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onRestore 
}: TemplateCardProps) {
  const { can } = usePermissions();
  
  return (
    <Card className="hover:shadow-lg transition-shadow group">
      {/* Thumbnail preview */}
      <div className="aspect-[4/3] bg-gray-100 rounded-t-lg overflow-hidden">
        {template.thumbnail_url ? (
          <img 
            src={template.thumbnail_url} 
            alt={template.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        {/* Type badge */}
        <Badge variant={DOCUMENT_TYPES[template.document_type].color as any}>
          {DOCUMENT_TYPES[template.document_type].label}
        </Badge>
        
        {/* Title */}
        <h3 className="font-semibold text-lg mt-2 truncate">
          {template.name}
        </h3>
        
        {/* Description */}
        {template.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {template.description}
          </p>
        )}
        
        {/* Metadata */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(template.updated_at)}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            {template.documents_count}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {can.editTemplate && (
            <Button 
              size="sm" 
              onClick={() => onEdit?.(template)}
              className="flex-1"
            >
              Редактировать
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {can.editTemplate && (
                <DropdownMenuItem onClick={() => onEdit?.(template)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {LABELS.templates.edit}
                </DropdownMenuItem>
              )}
              
              {can.deleteTemplate && (
                <DropdownMenuItem onClick={() => onDelete?.(template)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {LABELS.templates.delete}
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem onClick={() => onDuplicate?.(template)}>
                <Copy className="h-4 w-4 mr-2" />
                {LABELS.templates.duplicate}
              </DropdownMenuItem>
              
              {template.deleted_at && can.restoreTemplate && (
                <DropdownMenuItem onClick={() => onRestore?.(template)}>
                  <Copy className="h-4 w-4 mr-2" />
                  {LABELS.templates.restore}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
});
```

#### 5.2 Templates Grid Component
**Файл**: `src/components/templates/templates-grid.tsx`
```typescript
'use client';

import React from 'react';
import { Template } from '@/types/template.types';
import { TemplateCard } from './template-card';

interface TemplatesGridProps {
  templates: Template[];
  onEdit?: (template: Template) => void;
  onDelete?: (template: Template) => void;
  onDuplicate?: (template: Template) => void;
  onRestore?: (template: Template) => void;
}

export function TemplatesGrid({ 
  templates, 
  onEdit, 
  onDelete, 
  onDuplicate,
  onRestore 
}: TemplatesGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{LABELS.templates.empty}</p>
        <p className="text-gray-400 text-sm mt-2">{LABELS.templates.emptyDescription}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}
```

#### 5.3 Templates Table Component
**Файл**: `src/components/templates/templates-table.tsx`
```typescript
'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Template } from '@/types/template.types';
import { DOCUMENT_TYPES } from '@/constants/document-types';
import { formatDate } from '@/lib/utils';

interface TemplatesTableProps {
  templates: Template[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function TemplatesTable({ 
  templates, 
  selectedIds, 
  onSelectionChange 
}: TemplatesTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(templates.map(t => t.id));
    } else {
      onSelectionChange([]);
    }
  };
  
  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedIds.length === templates.length}
              onCheckedChange={handleSelectAll}
            />
          </TableHead>
          <TableHead>Название</TableHead>
          <TableHead>Тип</TableHead>
          <TableHead>Документов</TableHead>
          <TableHead>Обновлен</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.id}>
            <TableCell>
              <Checkbox
                checked={selectedIds.includes(template.id)}
                onCheckedChange={(checked) => handleSelectOne(template.id, checked as boolean)}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                {template.thumbnail_url && (
                  <img 
                    src={template.thumbnail_url}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div>
                  <div className="font-medium">{template.name}</div>
                  {template.description && (
                    <div className="text-sm text-gray-500 truncate max-w-md">
                      {template.description}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={DOCUMENT_TYPES[template.document_type].color as any}>
                {DOCUMENT_TYPES[template.document_type].label}
              </Badge>
            </TableCell>
            <TableCell>{template.documents_count}</TableCell>
            <TableCell>{formatDate(template.updated_at)}</TableCell>
            <TableCell>
              <TemplateRowActions template={template} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Этап 6: Pages (1-2 дня)

#### 6.1 Templates List Page
**Файл**: `src/app/(dashboard)/templates/page.tsx`
```typescript
'use client';

import React, { useState } from 'react';
import { TemplatesList } from '@/components/templates/templates-list';
import { CreateTemplateModal } from '@/components/templates/create-template-modal';
import { LABELS } from '@/constants/labels';

export default function TemplatesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{LABELS.templates.title}</h1>
        <CreateTemplateModal />
      </div>
      
      <TemplatesList />
    </div>
  );
}
```

### Этап 7: Testing (2-3 дня)

#### 7.1 Unit Tests
**Файл**: `src/__tests__/components/templates/template-card.test.tsx`
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateCard } from '@/components/templates/template-card';
import { Template, DocumentType } from '@/types/template.types';

const mockTemplate: Template = {
  id: '1',
  tenant_id: 'tenant-1',
  name: 'Test Template',
  description: 'Test description',
  document_type: DocumentType.WARRANTY,
  page_size: 'A4',
  orientation: 'portrait',
  json_schema_url: 'https://example.com/schema.json',
  thumbnail_url: 'https://example.com/thumb.jpg',
  version: 1,
  created_by: 'user-1',
  updated_by: null,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  deleted_at: null,
  documents_count: 5,
  last_used_at: '2023-01-01T00:00:00Z',
};

describe('TemplateCard', () => {
  it('renders template information correctly', () => {
    render(<TemplateCard template={mockTemplate} />);
    
    expect(screen.getByText('Test Template')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Гарантийный талон')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<TemplateCard template={mockTemplate} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('Редактировать'));
    expect(onEdit).toHaveBeenCalledWith(mockTemplate);
  });
});
```

#### 7.2 E2E Tests
**Файл**: `e2e/templates.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Templates CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to templates
    await page.goto('/dashboard/templates');
  });
  
  test('should display list of templates', async ({ page }) => {
    await page.waitForSelector('[data-testid="templates-grid"]');
    
    const templateCards = page.locator('[data-testid="template-card"]');
    await expect(templateCards).toHaveCount(await templateCards.count());
  });
  
  test('should create new template', async ({ page }) => {
    await page.click('[data-testid="create-template-button"]');
    
    await page.fill('[name="name"]', 'E2E Test Template');
    await page.fill('[name="description"]', 'Created by Playwright');
    await page.selectOption('[name="document_type"]', 'warranty');
    
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/editor\/.+/);
    await expect(page.locator('.toast')).toContainText('Шаблон создан');
  });
});
```

## Временные оценки

| Этап | Дней | Описание |
|-------|-------|----------|
| Infrastructure Setup | 1-2 | Установка зависимостей, настройка Tanstack Query |
| API Layer | 1 | Создание API клиента и сервисов |
| Validation & Constants | 1 | Zod схемы, константы |
| Hooks & State Management | 1-2 | Tanstack Query хуки, Zustand store |
| Components | 3-4 | Все UI компоненты |
| Pages | 1-2 | Страницы приложения |
| Testing | 2-3 | Unit и E2E тесты |
| **Итого** | **11-15** | **2-3 недели** |

## Критерии завершения

- [ ] Все CRUD операции работают
- [ ] Пагинация функциональна
- [ ] Поиск и фильтрация работают
- [ ] Мобильная версия адаптивна
- [ ] Тесты проходят (>70% coverage)
- [ ] Performance метрики достигнуты
- [ ] Error handling реализован
- [ ] Оптимистические обновления работают

## Риски и митигации

1. **Сложность Tanstack Query** - начать с базовых хуков, постепенно добавляя сложность
2. **Производительность больших списков** - реализовать virtual scrolling при необходимости
3. **Совместимость с backend** - использовать MSW для мокирования и тестирования
4. **Сложность форм** - использовать React Hook Form + Zod для валидации

Этот план обеспечивает поэтапную реализацию с четкими критериями завершения и возможностью быстрой обратной связи.