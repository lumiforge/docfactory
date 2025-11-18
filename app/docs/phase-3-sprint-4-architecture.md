# Phase 3 Sprint 4 - Templates CRUD Architecture

## Overview

Sprint 4 фокусируется на создании полнофункциональной системы управления шаблонами с CRUD операциями, пагинацией, фильтрацией и поиском.

## Технологический стек

### Core Dependencies
- **Tanstack Query** - управление server state, кэширование, мутации
- **Zod** - валидация форм и API responses
- **React Hook Form** - управление формами
- **Radix UI** - accessibility-first компоненты
- **Tailwind CSS** - стилизация
- **Lucide React** - иконки

### Новые зависимости (установить)
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install zod react-hook-form @hookform/resolvers
npm install @radix-ui/react-dropdown-menu @radix-ui/react-toggle-group
npm install date-fns
```

## Архитектура

### 1. Структура директорий

```
src/
├── app/
│   └── (dashboard)/
│       └── templates/
│           ├── page.tsx                 # Templates list page
│           ├── [id]/
│           │   └── page.tsx            # Template details page
│           └── create/
│               └── page.tsx            # Create template page
├── components/
│   └── templates/
│       ├── templates-list.tsx          # Main list component
│       ├── templates-grid.tsx          # Grid view
│       ├── templates-table.tsx         # Table view
│       ├── template-card.tsx           # Card component
│       ├── template-actions.tsx        # Action buttons
│       ├── templates-filters.tsx        # Filters component
│       ├── templates-pagination.tsx     # Pagination
│       ├── create-template-modal.tsx     # Create form modal
│       ├── edit-template-modal.tsx      # Edit form modal
│       └── delete-template-dialog.tsx   # Delete confirmation
├── constants/
│   ├── labels.ts                      # UI strings (Russian)
│   └── document-types.ts              # Document types config
├── hooks/
│   ├── use-templates.ts               # Tanstack Query hooks
│   ├── use-template-mutations.ts      # Mutations
│   └── use-auth.ts                   # Auth + RBAC
├── lib/
│   ├── query-client.ts                # Tanstack Query config
│   └── api/
│       └── templates.api.ts           # API client
├── schemas/
│   └── template.schema.ts             # Zod validation
├── services/
│   └── templates.service.ts           # Business logic
├── stores/
│   └── templates-ui.store.ts         # UI state (Zustand)
└── types/
    ├── template.types.ts              # Template interfaces
    └── auth.types.ts                # Auth types
```

### 2. Типы данных

```typescript
// types/template.types.ts
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
  id: string; // UUID
  tenant_id: string;
  name: string; // 3-100 символов
  description: string | null; // max 500 символов
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
  json_schema_url: string;
  thumbnail_url: string | null;
  version: number;
  created_by: string;
  updated_by: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
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

### 3. API Service

```typescript
// lib/api/templates.api.ts
import { apiClient } from './client';

export const templatesAPI = {
  list: (params: TemplateListParams) => 
    apiClient.get<PaginatedResponse<Template>>('/api/v1/templates', { params }),
  
  getById: (id: string) => 
    apiClient.get<Template>(`/api/v1/templates/${id}`),
  
  create: (data: CreateTemplateDto) => 
    apiClient.post<Template>('/api/v1/templates', data),
  
  update: (id: string, data: UpdateTemplateDto) => 
    apiClient.put<Template>(`/api/v1/templates/${id}`, data),
  
  delete: (id: string) => 
    apiClient.delete(`/api/v1/templates/${id}`),
  
  restore: (id: string) => 
    apiClient.post(`/api/v1/templates/${id}/restore`),
  
  duplicate: (id: string) => 
    apiClient.post<Template>(`/api/v1/templates/${id}/duplicate`),
};
```

### 4. Tanstack Query Hooks

```typescript
// hooks/use-templates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesAPI } from '@/lib/api/templates.api';
import { toast } from '@/lib/toast';

export function useTemplates(params: TemplateListParams) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesAPI.list(params),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesAPI.getById(id),
    enabled: !!id,
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
    onError: (error) => {
      toast.error('Ошибка создания', error.message);
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) =>
      templatesAPI.update(id, data),
    onSuccess: (updatedTemplate) => {
      queryClient.setQueryData(['templates', updatedTemplate.id], updatedTemplate);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон обновлен');
    },
    onError: (error) => {
      toast.error('Ошибка обновления', error.message);
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
    onError: (error) => {
      toast.error('Ошибка удаления', error.message);
    },
  });
}
```

### 5. UI Constants (Russian)

```typescript
// constants/labels.ts
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

// constants/document-types.ts
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

### 6. Упрощенный RBAC

```typescript
// hooks/use-auth.ts
import { useAuth } from '@/features/auth/hooks/use-auth';
import { UserRole } from '@/types/auth.types';

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

### 7. Zod Validation

```typescript
// schemas/template.schema.ts
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

## Component Architecture

### 1. Templates List Page

```typescript
// app/(dashboard)/templates/page.tsx
export default function TemplatesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{LABELS.templates.title}</h1>
        <CreateTemplateModal />
      </div>
      
      <TemplatesFilters />
      <TemplatesList />
    </div>
  );
}
```

### 2. Templates List Component

```typescript
// components/templates/templates-list.tsx
export function TemplatesList() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const { data, isLoading, error } = useTemplates(filters);
  
  if (isLoading) return <TemplatesListSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {/* View mode toggle */}
      <div className="flex justify-end mb-4">
        <ToggleGroup value={viewMode} onValueChange={setViewMode}>
          <ToggleGroupItem value="grid">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table">
            <Table2 className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {/* Templates */}
      {viewMode === 'grid' ? (
        <TemplatesGrid templates={data?.data || []} />
      ) : (
        <TemplatesTable templates={data?.data || []} />
      )}
      
      {/* Pagination */}
      {data?.pagination && (
        <TemplatesPagination 
          pagination={data.pagination} 
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
```

## Performance Optimizations

### 1. React.memo для компонентов карточек
```typescript
export const TemplateCard = React.memo(function TemplateCard({ template }: TemplateCardProps) {
  // component implementation
});
```

### 2. Debounced search
```typescript
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  }, 300),
  []
);
```

### 3. Virtual scrolling для больших списков (опционально)
```typescript
import { FixedSizeList as List } from 'react-window';
```

## Testing Strategy

### 1. Unit Tests (Vitest + React Testing Library)
- Компоненты рендерятся корректно
- Мутации вызываются с правильными параметрами
- Фильтры работают как ожидается
- Пагинация переключается правильно

### 2. E2E Tests (Playwright)
- Полный CRUD flow
- Поиск и фильтрация
- Пагинация
- Мобильная версия
- Error scenarios

### 3. Performance Tests
- Lighthouse CI
- Render time измерения
- Bundle size анализ

## Deployment Considerations

### 1. Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.docfactory.com
NEXT_PUBLIC_TENANT_ID=tenant-001
```

### 2. Feature Flags
```typescript
const FEATURES = {
  TEMPLATES_V2: process.env.NEXT_PUBLIC_TEMPLATES_V2 === 'true',
  ADVANCED_FILTERS: process.env.NEXT_PUBLIC_ADVANCED_FILTERS === 'true',
};
```

## Success Metrics

### 1. Performance Targets
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Template card render < 16ms
- List render < 100ms

### 2. Quality Targets
- Test coverage > 70%
- Zero critical bugs
- Lighthouse score > 90
- TypeScript strict mode

### 3. UX Targets
- Search response time < 300ms
- Filter application < 200ms
- Page transitions < 100ms
- Error recovery < 5s

## Next Steps

После завершения Sprint 4:
1. Sprint 5: Версионирование и дополнительные функции
2. Sprint 6: Drag-and-Drop редактор — Core
3. Sprint 7: Drag-and-Drop редактор — Advanced

Эта архитектура обеспечивает масштабируемость, поддерживаемость и соответствие best practices для React приложений.