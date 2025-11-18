<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Детальные ответы на вопросы по Phase 3 Sprint 4

## API и Backend

### 1. API эндпоинты

**REST API структура** для операций с шаблонами:[^1][^2]

```typescript
// services/templates.api.ts
export const templatesAPI = {
  // Список шаблонов с пагинацией и фильтрами
  list: (params: TemplateListParams) => 
    apiClient.get<PaginatedResponse<Template>>('/api/v1/templates', { params }),
  
  // Получить один шаблон
  getById: (id: string) => 
    apiClient.get<Template>(`/api/v1/templates/${id}`),
  
  // Создать шаблон
  create: (data: CreateTemplateDto) => 
    apiClient.post<Template>('/api/v1/templates', data),
  
  // Обновить шаблон
  update: (id: string, data: UpdateTemplateDto) => 
    apiClient.put<Template>(`/api/v1/templates/${id}`, data),
  
  // Частичное обновление
  patch: (id: string, data: Partial<UpdateTemplateDto>) => 
    apiClient.patch<Template>(`/api/v1/templates/${id}`, data),
  
  // Удалить шаблон (soft delete)
  delete: (id: string) => 
    apiClient.delete(`/api/v1/templates/${id}`),
  
  // Восстановить удаленный шаблон
  restore: (id: string) => 
    apiClient.post(`/api/v1/templates/${id}/restore`),
  
  // Дублировать шаблон
  duplicate: (id: string) => 
    apiClient.post<Template>(`/api/v1/templates/${id}/duplicate`),
  
  // Получить версии шаблона
  getVersions: (id: string) => 
    apiClient.get<TemplateVersion[]>(`/api/v1/templates/${id}/versions`),
};

interface TemplateListParams {
  page: number;
  limit: number;
  sort?: 'name' | 'created_at' | 'updated_at' | 'document_type';
  order?: 'asc' | 'desc';
  search?: string;
  document_type?: DocumentType[];
  include_deleted?: boolean; // для просмотра удаленных
}
```


### 2. Структура данных Template

**Полная TypeScript спецификация**:

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
  // Основные поля
  id: string; // UUID
  tenant_id: string; // для multi-tenancy
  name: string; // обязательное, 3-100 символов
  description: string | null; // опциональное, max 500 символов
  document_type: DocumentType; // обязательное
  
  // Настройки страницы
  page_size: PageSize; // обязательное
  orientation: Orientation; // обязательное
  
  // JSON-схема шаблона
  json_schema_url: string; // ссылка на Object Storage
  thumbnail_url: string | null; // preview изображение
  
  // Метаданные
  version: number; // текущая версия
  created_by: string; // user_id создателя
  updated_by: string | null; // user_id последнего редактора
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  deleted_at: string | null; // для soft delete
  
  // Статистика
  documents_count: number; // количество сгенерированных документов
  last_used_at: string | null; // когда последний раз использовался
}

// DTO для создания
export interface CreateTemplateDto {
  name: string;
  description?: string;
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
  // json_schema загружается отдельно в редакторе
}

// DTO для обновления
export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  document_type?: DocumentType;
  page_size?: PageSize;
  orientation?: Orientation;
}

// Пагинированный ответ
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


### 3. Типы документов

**4 основных типа с переводами**:

```typescript
// constants/document-types.ts
export const DOCUMENT_TYPES = {
  [DocumentType.WARRANTY]: {
    value: DocumentType.WARRANTY,
    label: {
      ru: 'Гарантийный талон',
      en: 'Warranty Certificate',
    },
    icon: 'Shield',
    color: 'blue',
    description: {
      ru: 'Официальный документ гарантии на товар',
      en: 'Official product warranty document',
    },
  },
  [DocumentType.INSTRUCTION]: {
    value: DocumentType.INSTRUCTION,
    label: {
      ru: 'Инструкция по эксплуатации',
      en: 'User Manual',
    },
    icon: 'Book',
    color: 'green',
    description: {
      ru: 'Руководство по использованию товара',
      en: 'Product usage guide',
    },
  },
  [DocumentType.CERTIFICATE]: {
    value: DocumentType.CERTIFICATE,
    label: {
      ru: 'Сертификат',
      en: 'Certificate',
    },
    icon: 'Award',
    color: 'purple',
    description: {
      ru: 'Сертификат соответствия или качества',
      en: 'Compliance or quality certificate',
    },
  },
  [DocumentType.LABEL]: {
    value: DocumentType.LABEL,
    label: {
      ru: 'Этикетка',
      en: 'Label',
    },
    icon: 'Tag',
    color: 'orange',
    description: {
      ru: 'Информационная этикетка для товара',
      en: 'Product information label',
    },
  },
} as const;
```


### 4. Стратегия пагинации

**Offset-based pagination** для стабильных данных:[^3][^2][^4][^1]

```typescript
// Golang backend implementation (для справки)
type TemplateListRequest struct {
    Page   int    `query:"page" default:"1" minimum:"1"`
    Limit  int    `query:"limit" default:"20" minimum:"1" maximum:"100"`
    Sort   string `query:"sort" default:"updated_at"`
    Order  string `query:"order" default:"desc" enum:"asc,desc"`
    Search string `query:"search"`
    Types  []string `query:"document_type"`
}

type PaginationMeta struct {
    Page       int  `json:"page"`
    Limit      int  `json:"limit"`
    Total      int  `json:"total"`
    TotalPages int  `json:"total_pages"`
    HasNext    bool `json:"has_next"`
    HasPrev    bool `json:"has_prev"`
}

type TemplateListResponse struct {
    Data       []Template      `json:"data"`
    Pagination PaginationMeta  `json:"pagination"`
}
```

**Frontend React Query implementation**:

```typescript
// hooks/use-templates.ts
import { useQuery, keepPreviousData } from '@tanstack/react-query';

export function useTemplates(params: TemplateListParams) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesAPI.list(params),
    placeholderData: keepPreviousData, // Smooth transition between pages[web:86]
    staleTime: 5 * 60 * 1000, // 5 minutes - данные стабильны
  });
}
```

**Преимущества offset-based**:[^2][^4][^1]

- ✅ Простота реализации
- ✅ Поддержка прыжков на любую страницу
- ✅ Подходит для данных с редкими изменениями
- ✅ Легкая индексация в БД (YDB)

**Best practices**:[^5][^3][^2]

- Дефолтный limit: 20 элементов
- Максимальный limit: 100 элементов
- Всегда включать metadata (total, has_next, has_prev)
- Использовать consistent параметры (?page, ?limit)


### 5. Поиск и фильтрация

**Полнотекстовый поиск** по следующим полям:[^6]

```typescript
// Поля для полнотекстового поиска
const SEARCHABLE_FIELDS = ['name', 'description'];

// YDB query (для справки)
SELECT * FROM templates 
WHERE tenant_id = @tenant_id
  AND deleted_at IS NULL
  AND (
    LOWER(name) LIKE LOWER(@search_query) OR 
    LOWER(description) LIKE LOWER(@search_query)
  )
ORDER BY updated_at DESC
LIMIT @limit OFFSET @offset;
```

**Доступные фильтры**:

```typescript
// components/templates/templates-filters.tsx
interface TemplatesFilters {
  // Поиск
  search: string; // по name и description
  
  // Тип документа (multiple select)
  document_type: DocumentType[];
  
  // Статус
  status: 'active' | 'deleted' | 'all';
  
  // Дата создания
  created_from?: Date;
  created_to?: Date;
  
  // Автор (для админов)
  created_by?: string;
  
  // Сортировка
  sort: 'name' | 'created_at' | 'updated_at' | 'document_type' | 'documents_count';
  order: 'asc' | 'desc';
}

// URL query params structure
// /templates?search=гарантия&document_type=warranty,certificate&sort=updated_at&order=desc
```

**Компонент фильтров**:

```typescript
export function TemplatesFilters({ 
  filters, 
  onFiltersChange 
}: TemplatesFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Search input */}
      <Input
        type="search"
        placeholder="Поиск по названию или описанию..."
        value={filters.search}
        onChange={(e) => onFiltersChange({ search: e.target.value })}
        leftIcon={<Search />}
        className="flex-1 min-w-[300px]"
      />
      
      {/* Document type filter */}
      <MultiSelect
        options={Object.values(DOCUMENT_TYPES)}
        value={filters.document_type}
        onChange={(types) => onFiltersChange({ document_type: types })}
        placeholder="Тип документа"
      />
      
      {/* Status filter */}
      <Select
        options={[
          { value: 'active', label: 'Активные' },
          { value: 'deleted', label: 'Удаленные' },
          { value: 'all', label: 'Все' },
        ]}
        value={filters.status}
        onChange={(status) => onFiltersChange({ status })}
      />
      
      {/* Sort */}
      <Select
        options={[
          { value: 'updated_at', label: 'По дате изменения' },
          { value: 'created_at', label: 'По дате создания' },
          { value: 'name', label: 'По названию' },
          { value: 'documents_count', label: 'По популярности' },
        ]}
        value={filters.sort}
        onChange={(sort) => onFiltersChange({ sort })}
      />
      
      {/* Clear filters button */}
      <Button 
        variant="ghost" 
        onClick={() => onFiltersChange(DEFAULT_FILTERS)}
      >
        Сбросить
      </Button>
    </div>
  );
}
```


## UI/UX

### 6. Отображение списка

**Переключаемый режим** (таблица + карточки) — best practice для SaaS:[^7][^8]

```typescript
// components/templates/templates-list.tsx
type ViewMode = 'grid' | 'table';

export function TemplatesList() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  return (
    <div>
      {/* View mode toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Шаблоны</h2>
        <ToggleGroup value={viewMode} onValueChange={setViewMode}>
          <ToggleGroupItem value="grid">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table">
            <Table2 className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {viewMode === 'grid' ? (
        <TemplatesGrid templates={templates} />
      ) : (
        <TemplatesTable templates={templates} />
      )}
    </div>
  );
}
```

**Grid View** (дефолтный):

```typescript
// components/templates/templates-grid.tsx
export function TemplatesGrid({ templates }: TemplatesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      {/* Thumbnail preview */}
      {template.thumbnail_url ? (
        <img 
          src={template.thumbnail_url} 
          alt={template.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      ) : (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <FileText className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      <CardContent className="p-4">
        {/* Type badge */}
        <Badge variant={DOCUMENT_TYPES[template.document_type].color}>
          {DOCUMENT_TYPES[template.document_type].label.ru}
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
        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={() => router.push(`/editor/${template.id}`)}>
            Редактировать
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                Дублировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(template.id)}>
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Table View**:

```typescript
// components/templates/templates-table.tsx
export function TemplatesTable({ templates }: TemplatesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox />
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
              <Checkbox />
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
              <Badge variant={DOCUMENT_TYPES[template.document_type].color}>
                {DOCUMENT_TYPES[template.document_type].label.ru}
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


### 7. Сортировка

**Доступные поля сортировки**:

```typescript
export const SORT_OPTIONS = [
  {
    value: 'updated_at',
    label: 'Дата изменения',
    defaultOrder: 'desc',
  },
  {
    value: 'created_at',
    label: 'Дата создания',
    defaultOrder: 'desc',
  },
  {
    value: 'name',
    label: 'Название (А-Я)',
    defaultOrder: 'asc',
  },
  {
    value: 'document_type',
    label: 'Тип документа',
    defaultOrder: 'asc',
  },
  {
    value: 'documents_count',
    label: 'Популярность',
    defaultOrder: 'desc',
  },
] as const;
```

**Sortable table headers**:

```typescript
function SortableHeader({ 
  column, 
  currentSort, 
  onSort 
}: SortableHeaderProps) {
  const isActive = currentSort.field === column;
  const nextOrder = isActive && currentSort.order === 'asc' ? 'desc' : 'asc';
  
  return (
    <TableHead 
      className="cursor-pointer select-none hover:bg-gray-50"
      onClick={() => onSort(column, nextOrder)}
    >
      <div className="flex items-center gap-2">
        {column}
        {isActive ? (
          currentSort.order === 'asc' ? <ArrowUp /> : <ArrowDown />
        ) : (
          <ArrowUpDown className="text-gray-400" />
        )}
      </div>
    </TableHead>
  );
}
```


### 8. Масштабирование (1000+ шаблонов)

**Стратегия**: Пагинация с оптимизацией:[^3][^5]

```typescript
// Рекомендуемый подход для больших объемов
const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100, // защита от abuse[web:81]
  enableInfiniteScroll: false, // только для мобильных
};

// components/templates/templates-pagination.tsx
export function TemplatesPagination({ 
  pagination, 
  onPageChange 
}: TemplatesPaginationProps) {
  const { page, total_pages, has_next, has_prev } = pagination;
  
  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Page info */}
      <div className="text-sm text-gray-600">
        Страница {page} из {total_pages}
      </div>
      
      {/* Page controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!has_prev}
        >
          <ChevronLeft />
          Назад
        </Button>
        
        {/* Page numbers */}
        <PageNumbers 
          currentPage={page}
          totalPages={total_pages}
          onPageChange={onPageChange}
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!has_next}
        >
          Вперед
          <ChevronRight />
        </Button>
      </div>
      
      {/* Page size selector */}
      <Select
        value={pagination.limit}
        onChange={(limit) => onPageChange(1, limit)}
        options={PAGINATION_CONFIG.pageSizeOptions.map(size => ({
          value: size,
          label: `${size} на странице`,
        }))}
      />
    </div>
  );
}
```

**Оптимизации производительности**:

- Virtual scrolling для table view (react-window)
- Debounced search (300ms)
- Мемоизация компонентов карточек
- Lazy loading изображений thumbnails


### 9. Mobile версия

**Responsive breakpoints**:[^8]

```typescript
// Breakpoints (Tailwind)
const BREAKPOINTS = {
  sm: '640px',  // Mobile landscape
  md: '768px',  // Tablet
  lg: '1024px', // Desktop
};

// Mobile-specific adaptations
export function TemplatesListMobile() {
  return (
    <>
      {/* Mobile: Stack layout */}
      <div className="block md:hidden">
        <TemplatesStackView templates={templates} />
      </div>
      
      {/* Desktop: Grid layout */}
      <div className="hidden md:block">
        <TemplatesGrid templates={templates} />
      </div>
    </>
  );
}

// Mobile stack view (вертикальный список)
function TemplatesStackView({ templates }: TemplatesStackViewProps) {
  return (
    <div className="space-y-3 p-4">
      {templates.map((template) => (
        <Card key={template.id} className="p-3">
          <div className="flex gap-3">
            {/* Thumbnail */}
            <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
              {template.thumbnail_url ? (
                <img src={template.thumbnail_url} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <Badge size="sm" variant={DOCUMENT_TYPES[template.document_type].color}>
                {DOCUMENT_TYPES[template.document_type].label.ru}
              </Badge>
              <h3 className="font-semibold text-sm mt-1 truncate">
                {template.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(template.updated_at)}
              </p>
            </div>
            
            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              {/* ... menu items ... */}
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

**Mobile-specific features**:

- Swipe actions (delete, duplicate)
- Bottom sheet для фильтров
- Pull-to-refresh
- Touch-optimized tap targets (min 44x44px)


### 10. Локализация

**i18n setup** для Sprint 4:

```typescript
// lib/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

i18n.use(initReactI18next).init({
  resources: {
    ru: {
      translation: {
        templates: {
          title: 'Шаблоны',
          create: 'Создать шаблон',
          search: 'Поиск по названию или описанию...',
          filters: {
            documentType: 'Тип документа',
            status: 'Статус',
            sort: 'Сортировка',
          },
          actions: {
            edit: 'Редактировать',
            duplicate: 'Дублировать',
            delete: 'Удалить',
            restore: 'Восстановить',
          },
          empty: 'Шаблоны не найдены',
          emptyDescription: 'Создайте первый шаблон для начала работы',
        },
      },
    },
    en: {
      translation: {
        templates: {
          title: 'Templates',
          create: 'Create Template',
          search: 'Search by name or description...',
          // ... English translations
        },
      },
    },
  },
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
});

// Usage
import { useTranslation } from 'react-i18next';

function TemplatesHeader() {
  const { t } = useTranslation();
  
  return (
    <h1>{t('templates.title')}</h1>
  );
}
```


## Бизнес-логика

### 11. Права доступа (RBAC)

**Permission matrix для CRUD операций**:

```typescript
// lib/permissions/templates.permissions.ts
import { UserRole } from '@/types/auth.types';

export const TemplatePermissions = {
  create: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR],
  read: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
  update: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR],
  delete: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR],
  restore: [UserRole.OWNER, UserRole.ADMIN],
  viewDeleted: [UserRole.OWNER, UserRole.ADMIN],
} as const;

export function canPerformAction(
  action: keyof typeof TemplatePermissions,
  userRole: UserRole
): boolean {
  return TemplatePermissions[action].includes(userRole);
}

// Usage in components
function TemplateActions({ template }: TemplateActionsProps) {
  const { user } = useAuth();
  
  return (
    <>
      {canPerformAction('update', user.role) && (
        <Button onClick={() => handleEdit(template.id)}>
          Редактировать
        </Button>
      )}
      
      {canPerformAction('delete', user.role) && (
        <Button onClick={() => handleDelete(template.id)}>
          Удалить
        </Button>
      )}
    </>
  );
}
```


### 12. Валидация

**Правила валидации с Zod**:

```typescript
// schemas/template.schema.ts
import { z } from 'zod';

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

// Usage with React Hook Form
function TemplateForm() {
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      document_type: DocumentType.WARRANTY,
      page_size: PageSize.A4,
      orientation: Orientation.PORTRAIT,
    },
  });
  
  // ... form implementation
}
```


### 13. Удаление (Soft Delete)

**Soft delete strategy**:[^9][^10][^11]

```typescript
// Soft delete - DELETE /api/v1/templates/:id
// Backend: устанавливает deleted_at = NOW(), сохраняет запись в БД
export async function deleteTemplate(id: string) {
  const { mutate } = useMutation({
    mutationFn: () => templatesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон удален', 'Вы можете восстановить его в течение 30 дней');
    },
  });
  
  return mutate;
}

// Restore - POST /api/v1/templates/:id/restore
export async function restoreTemplate(id: string) {
  const { mutate } = useMutation({
    mutationFn: () => templatesAPI.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон восстановлен');
    },
  });
  
  return mutate;
}

// Hard delete - выполняется автоматически через 30 дней
// или вручную админом через специальный эндпоинт
// DELETE /api/v1/templates/:id?hard=true (только для OWNER)
```

**UI для работы с удаленными шаблонами**:

```typescript
function DeletedTemplatesView() {
  const { data } = useTemplates({ 
    include_deleted: true,
    status: 'deleted' 
  });
  
  return (
    <div>
      <Alert variant="info">
        Удаленные шаблоны хранятся 30 дней и затем удаляются безвозвратно
      </Alert>
      
      {data?.data.map((template) => (
        <Card key={template.id} className="opacity-60">
          {/* Template info */}
          <Button onClick={() => restoreTemplate(template.id)}>
            Восстановить
          </Button>
        </Card>
      ))}
    </div>
  );
}
```

**Преимущества soft delete**:[^10][^11]

- ✅ Защита от случайного удаления
- ✅ Возможность восстановления
- ✅ Audit trail (история операций)
- ✅ Сохранение связей с документами


### 14. Категоризация

**В Sprint 4: НЕТ** — оставляем на будущее (Phase 7 - Полировка).

**В Sprint 4 используем**:

- Фильтрация по типу документа (warranty, instruction, certificate, label)
- Полнотекстовый поиск по name и description
- Сортировка

**Для будущего** (опционально):

```typescript
// Возможное расширение
interface Template {
  // ... existing fields
  tags?: string[]; // ['электроника', 'бытовая техника']
  category?: string; // 'Товары народного потребления'
}
```


## Технические вопросы

### 15. State Management

**Tanstack Query (React Query)** — рекомендуемый подход:[^12][^13]

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      gcTime: 10 * 60 * 1000, // 10 минут (ранее cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

// hooks/use-templates.ts
export function useTemplates(params: TemplateListParams) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesAPI.list(params),
    placeholderData: keepPreviousData, // Smooth pagination[web:86]
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => templatesAPI.getById(id),
    enabled: !!id,
  });
}

// Mutations
export function useCreateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: templatesAPI.create,
    onSuccess: (newTemplate) => {
      // Invalidate list
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      
      // Set new template in cache
      queryClient.setQueryData(['templates', newTemplate.id], newTemplate);
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) =>
      templatesAPI.update(id, data),
    onSuccess: (updatedTemplate) => {
      // Update specific template in cache
      queryClient.setQueryData(['templates', updatedTemplate.id], updatedTemplate);
      
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: templatesAPI.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.removeQueries({ queryKey: ['templates', deletedId] });
    },
  });
}
```

**Почему НЕ Zustand для списка шаблонов**:

- Tanstack Query управляет server state лучше (кэширование, инвалидация, refetch)
- Zustand лучше для UI state (модалки, фильтры, view mode)

**Комбинированный подход**:

```typescript
// stores/templates-ui.store.ts (Zustand для UI state)
import { create } from 'zustand';

interface TemplatesUIState {
  viewMode: 'grid' | 'table';
  selectedIds: string[];
  filters: TemplatesFilters;
  
  setViewMode: (mode: 'grid' | 'table') => void;
  toggleSelection: (id: string) => void;
  setFilters: (filters: Partial<TemplatesFilters>) => void;
  resetFilters: () => void;
}

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


### 16. Кэширование (Tanstack Query)

**Стратегия кэширования**:[^12]

```typescript
// Query configuration
const CACHE_CONFIG = {
  templates: {
    list: {
      staleTime: 5 * 60 * 1000, // 5 минут - данные считаются свежими
      gcTime: 10 * 60 * 1000, // 10 минут - хранение в памяти
      refetchOnWindowFocus: false, // не перезапрашивать при фокусе
    },
    single: {
      staleTime: 10 * 60 * 1000, // 10 минут - один шаблон дольше актуален
      gcTime: 15 * 60 * 1000,
    },
  },
};

// Prefetching для лучшего UX
export function useTemplatesPrefetch() {
  const queryClient = useQueryClient();
  
  // Prefetch next page
  const prefetchNextPage = async (currentPage: number, params: TemplateListParams) => {
    await queryClient.prefetchQuery({
      queryKey: ['templates', { ...params, page: currentPage + 1 }],
      queryFn: () => templatesAPI.list({ ...params, page: currentPage + 1 }),
    });
  };
  
  // Prefetch template details on hover
  const prefetchTemplate = async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['templates', id],
      queryFn: () => templatesAPI.getById(id),
    });
  };
  
  return { prefetchNextPage, prefetchTemplate };
}

// Usage in TemplateCard
function TemplateCard({ template }: TemplateCardProps) {
  const { prefetchTemplate } = useTemplatesPrefetch();
  
  return (
    <Card
      onMouseEnter={() => prefetchTemplate(template.id)}
      onClick={() => router.push(`/editor/${template.id}`)}
    >
      {/* ... */}
    </Card>
  );
}
```

**Cache invalidation strategies**:[^12]

- После создания → invalidate list queries
- После обновления → update specific + invalidate list
- После удаления → remove specific + invalidate list


### 17. Оптимистические обновления

**Да, используем для лучшего UX**:[^13][^12]

```typescript
// hooks/use-update-template-optimistic.ts
export function useUpdateTemplateOptimistic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateDto }) =>
      templatesAPI.update(id, data),
    
    // Optimistic update[web:89]
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['templates', id] });
      
      // Snapshot previous value
      const previousTemplate = queryClient.getQueryData<Template>(['templates', id]);
      
      // Optimistically update cache
      if (previousTemplate) {
        queryClient.setQueryData<Template>(['templates', id], {
          ...previousTemplate,
          ...data,
          updated_at: new Date().toISOString(),
        });
      }
      
      // Return context with snapshot
      return { previousTemplate };
    },
    
    // Rollback on error[web:89]
    onError: (err, variables, context) => {
      if (context?.previousTemplate) {
        queryClient.setQueryData(
          ['templates', variables.id],
          context.previousTemplate
        );
      }
      toast.error('Ошибка обновления', err.message);
    },
    
    // Always refetch after error or success[web:89]
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['templates', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

// Delete with optimistic update
export function useDeleteTemplateOptimistic() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: templatesAPI.delete,
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['templates'] });
      
      const previousTemplates = queryClient.getQueryData<PaginatedResponse<Template>>(['templates']);
      
      // Optimistically remove from list
      if (previousTemplates) {
        queryClient.setQueryData<PaginatedResponse<Template>>(['templates'], {
          ...previousTemplates,
          data: previousTemplates.data.filter(t => t.id !== id),
        });
      }
      
      return { previousTemplates };
    },
    
    onError: (err, id, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(['templates'], context.previousTemplates);
      }
      toast.error('Ошибка удаления');
    },
    
    onSuccess: () => {
      toast.success('Шаблон удален');
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
```


### 18. Error Handling

**Трехуровневая система**:[^14][^15]

```typescript
// lib/error-handler.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// API client error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    
    // Network error[web:99]
    if (!error.response) {
      throw new APIError(0, 'Ошибка сети. Проверьте подключение к интернету');
    }
    
    // Server errors
    if (status >= 500) {
      throw new APIError(status, 'Ошибка сервера. Попробуйте позже');
    }
    
    // Validation errors
    if (status === 400) {
      throw new APIError(
        status,
        data.message || 'Некорректные данные',
        'VALIDATION_ERROR',
        data.errors
      );
    }
    
    // Not found
    if (status === 404) {
      throw new APIError(status, 'Шаблон не найден', 'NOT_FOUND');
    }
    
    // Permission denied
    if (status === 403) {
      throw new APIError(status, 'Недостаточно прав', 'FORBIDDEN');
    }
    
    throw error;
  }
);

// React Query error handling
export function useTemplatesWithErrorHandling(params: TemplateListParams) {
  return useQuery({
    queryKey: ['templates', params],
    queryFn: () => templatesAPI.list(params),
    retry: (failureCount, error) => {
      // Retry network errors up to 3 times[web:99]
      if (error instanceof APIError && error.statusCode === 0) {
        return failureCount < 3;
      }
      // Don't retry client/validation errors
      if (error instanceof APIError && error.statusCode < 500) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff[web:99]
  });
}

// Component error handling
function TemplatesList() {
  const { data, error, isLoading, isError } = useTemplates(params);
  
  if (isError) {
    if (error instanceof APIError) {
      if (error.statusCode === 0) {
        return <NetworkError onRetry={() => refetch()} />;
      }
      if (error.statusCode === 403) {
        return <PermissionDenied />;
      }
    }
    return <GenericError error={error} />;
  }
  
  // ... normal render
}

// Error components
function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="error">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Ошибка сети</AlertTitle>
      <AlertDescription>
        Не удалось загрузить шаблоны. Проверьте подключение к интернету.
      </AlertDescription>
      <Button onClick={onRetry} className="mt-2">
        Повторить попытку
      </Button>
    </Alert>
  );
}
```


## Интеграция

### 19. Навигация после создания

**Рекомендуемый flow**:

```typescript
// После создания шаблона → редирект в редактор
function CreateTemplateForm() {
  const router = useRouter();
  const createMutation = useCreateTemplate();
  
  const handleSubmit = async (data: TemplateFormData) => {
    try {
      const newTemplate = await createMutation.mutateAsync(data);
      
      toast.success('Шаблон создан', 'Теперь вы можете настроить его дизайн');
      
      // Redirect to editor
      router.push(`/dashboard/editor/${newTemplate.id}`);
    } catch (error) {
      toast.error('Ошибка создания шаблона');
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {/* ... form fields ... */}
    </Form>
  );
}

// После обновления метаданных → остаемся на текущей странице
// После дублирования → редирект в редактор копии
// После удаления → остаемся в списке
```


### 20. Preview

**В Sprint 4: Thumbnail preview в карточках** (готов)

**В Sprint 5: Полноценный preview modal**:

```typescript
// components/templates/template-preview-modal.tsx (Sprint 5)
function TemplatePreviewModal({ templateId }: TemplatePreviewModalProps) {
  const { data: template } = useTemplate(templateId);
  
  return (
    <Dialog>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>
        
        {/* PDF/Canvas preview */}
        <div className="aspect-[210/297] bg-white border rounded">
          <TemplateRenderer templateId={templateId} />
        </div>
        
        <DialogFooter>
          <Button onClick={() => router.push(`/editor/${templateId}`)}>
            Редактировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```


### 21. Экспорт/импорт

**В Sprint 4: НЕТ** — переносим на Sprint 5.

**Sprint 5 scope**:

- Экспорт шаблона в JSON
- Импорт шаблона из JSON файла
- Bulk импорт/экспорт


## Тестирование

### 22. Тестовые данные

**Mock data generator**:

```typescript
// __mocks__/templates.mock.ts
import { faker } from '@faker-js/faker';

export function generateMockTemplate(overrides?: Partial<Template>): Template {
  return {
    id: faker.string.uuid(),
    tenant_id: 'tenant-001',
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    document_type: faker.helpers.arrayElement(Object.values(DocumentType)),
    page_size: PageSize.A4,
    orientation: Orientation.PORTRAIT,
    json_schema_url: `https://storage.yandexcloud.net/templates/${faker.string.uuid()}.json`,
    thumbnail_url: faker.image.url(),
    version: 1,
    created_by: faker.string.uuid(),
    updated_by: null,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    deleted_at: null,
    documents_count: faker.number.int({ min: 0, max: 100 }),
    last_used_at: faker.date.recent().toISOString(),
    ...overrides,
  };
}

export function generateMockTemplateList(count: number = 20): Template[] {
  return Array.from({ length: count }, () => generateMockTemplate());
}

// MSW handlers for development
export const templatesHandlers = [
  rest.get('/api/v1/templates', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page')) || 1;
    const limit = Number(req.url.searchParams.get('limit')) || 20;
    
    const allTemplates = generateMockTemplateList(100);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = allTemplates.slice(startIndex, endIndex);
    
    return res(
      ctx.status(200),
      ctx.json({
        data,
        pagination: {
          page,
          limit,
          total: allTemplates.length,
          total_pages: Math.ceil(allTemplates.length / limit),
          has_next: endIndex < allTemplates.length,
          has_prev: page > 1,
        },
      })
    );
  }),
  
  rest.post('/api/v1/templates', async (req, res, ctx) => {
    const body = await req.json();
    const newTemplate = generateMockTemplate(body);
    
    return res(ctx.status(201), ctx.json(newTemplate));
  }),
  
  // ... other handlers
];
```


### 23. E2E сценарии

**Playwright test suite**:[^16][^17]

```typescript
// e2e/templates.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Templates CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Navigate to templates
    await page.goto('/dashboard/templates');
  });
  
  test('should display list of templates', async ({ page }) => {
    // Wait for templates to load
    await page.waitForSelector('[data-testid="templates-grid"]');
    
    // Check that templates are rendered
    const templateCards = page.locator('[data-testid="template-card"]');
    await expect(templateCards).toHaveCount(await templateCards.count());
  });
  
  test('should create new template', async ({ page }) => {
    // Click create button
    await page.click('[data-testid="create-template-button"]');
    
    // Fill form
    await page.fill('[name="name"]', 'E2E Test Template');
    await page.fill('[name="description"]', 'Created by Playwright');
    await page.selectOption('[name="document_type"]', 'warranty');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to editor
    await page.waitForURL(/\/editor\/.+/);
    
    // Check success toast
    await expect(page.locator('.toast')).toContainText('Шаблон создан');
  });
  
  test('should update template name', async ({ page }) => {
    // Click first template
    const firstTemplate = page.locator('[data-testid="template-card"]').first();
    await firstTemplate.hover();
    await firstTemplate.locator('[data-testid="edit-button"]').click();
    
    // Wait for form modal
    await page.waitForSelector('[data-testid="edit-template-modal"]');
    
    // Update name
    const nameInput = page.locator('[name="name"]');
    await nameInput.clear();
    await nameInput.fill('Updated Template Name');
    
    // Save
    await page.click('[data-testid="save-button"]');
    
    // Check updated name in list
    await expect(firstTemplate).toContainText('Updated Template Name');
  });
  
  test('should delete and restore template', async ({ page }) => {
    // Delete first template
    const firstTemplate = page.locator('[data-testid="template-card"]').first();
    const templateName = await firstTemplate.locator('h3').textContent();
    
    await firstTemplate.hover();
    await firstTemplate.locator('[data-testid="more-actions"]').click();
    await page.click('[data-testid="delete-action"]');
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]');
    
    // Check toast
    await expect(page.locator('.toast')).toContainText('Шаблон удален');
    
    // Navigate to deleted templates
    await page.click('[data-testid="show-deleted-toggle"]');
    
    // Find deleted template
    const deletedTemplate = page.locator('[data-testid="template-card"]', {
      hasText: templateName,
    });
    await expect(deletedTemplate).toBeVisible();
    
    // Restore
    await deletedTemplate.locator('[data-testid="restore-button"]').click();
    await expect(page.locator('.toast')).toContainText('Шаблон восстановлен');
  });
  
  test('should filter templates by document type', async ({ page }) => {
    // Open filters
    await page.click('[data-testid="filters-button"]');
    
    // Select warranty type
    await page.click('[data-testid="document-type-filter"]');
    await page.click('[data-value="warranty"]');
    
    // Apply filters
    await page.click('[data-testid="apply-filters"]');
    
    // Wait for filtered results
    await page.waitForLoadState('networkidle');
    
    // Check that all visible templates are warranty type
    const templateTypes = page.locator('[data-testid="template-type-badge"]');
    const count = await templateTypes.count();
    
    for (let i = 0; i < count; i++) {
      await expect(templateTypes.nth(i)).toContainText('Гарантийный талон');
    }
  });
  
  test('should search templates', async ({ page }) => {
    // Type search query
    await page.fill('[data-testid="search-input"]', 'гарантия');
    
    // Wait for debounce and results
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');
    
    // Check that search results contain query
    const templateCards = page.locator('[data-testid="template-card"]');
    const count = await templateCards.count();
    
    for (let i = 0; i < count; i++) {
      const text = await templateCards.nth(i).textContent();
      expect(text.toLowerCase()).toContain('гарант');
    }
  });
  
  test('should paginate through templates', async ({ page }) => {
    // Wait for first page
    await page.waitForSelector('[data-testid="templates-grid"]');
    
    // Get first template name
    const firstPageFirstTemplate = await page
      .locator('[data-testid="template-card"]')
      .first()
      .locator('h3')
      .textContent();
    
    // Click next page
    await page.click('[data-testid="next-page-button"]');
    await page.waitForLoadState('networkidle');
    
    // Get first template name on page 2
    const secondPageFirstTemplate = await page
      .locator('[data-testid="template-card"]')
      .first()
      .locator('h3')
      .textContent();
    
    // Names should be different
    expect(firstPageFirstTemplate).not.toBe(secondPageFirstTemplate);
    
    // Check page indicator
    await expect(page.locator('[data-testid="page-indicator"]')).toContainText('2');
  });
});
```


### 24. Performance Requirements

**Метрики производительности**:

```typescript
// Performance targets
export const PERFORMANCE_TARGETS = {
  // API response time
  api: {
    listTemplates: 500, // ms - загрузка списка
    getTemplate: 200, // ms - получение одного шаблона
    createTemplate: 1000, // ms - создание
    updateTemplate: 500, // ms - обновление
    deleteTemplate: 300, // ms - удаление
  },
  
  // Frontend metrics
  frontend: {
    firstContentfulPaint: 1500, // ms
    timeToInteractive: 3000, // ms
    totalBlockingTime: 300, // ms
    cumulativeLayoutShift: 0.1,
  },
  
  // Component render time
  components: {
    templateCard: 16, // ms - должна рендериться за 1 frame (60fps)
    templatesList: 100, // ms - весь список
  },
};

// Performance monitoring
export function measureRenderTime(componentName: string) {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (duration > PERFORMANCE_TARGETS.components[componentName]) {
      console.warn(
        `${componentName} render took ${duration.toFixed(2)}ms (target: ${PERFORMANCE_TARGETS.components[componentName]}ms)`
      );
    }
  };
}

// Usage
function TemplateCard({ template }: TemplateCardProps) {
  const endMeasure = measureRenderTime('templateCard');
  
  useEffect(() => {
    endMeasure();
  });
  
  return <Card>...</Card>;
}

// Lighthouse CI configuration
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/dashboard/templates'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'interactive': ['warn', { maxNumericValue: 3000 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
      },
    },
  },
};
```

**Оптимизации для достижения целей**:

- Virtual scrolling для больших списков (react-window)
- Debounced search (300ms)
- Image lazy loading
- Code splitting по routes
- React.memo для дорогих компонентов
- useMemo для тяжелых вычислений
- Prefetching следующей страницы

Эти детализированные спецификации покрывают все аспекты Phase 3 Sprint 4 и позволяют frontend-команде приступить к реализации с полной уверенностью в требованиях.[^4][^15][^1][^2][^16][^13][^9][^10][^14][^3][^12]
<span style="display:none">[^18][^19][^20]</span>

<div align="center">⁂</div>

[^1]: https://www.speakeasy.com/api-design/pagination

[^2]: https://apidog.com/blog/rest-api-pagination/

[^3]: https://www.merge.dev/blog/api-pagination-best-practices

[^4]: https://treblle.com/blog/add-pagination-to-rest-api

[^5]: https://cybergarden.au/blog/rest-api-pagination-best-practices

[^6]: https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/

[^7]: https://tailadmin.com/blog/saas-dashboard-templates

[^8]: https://www.thealien.design/insights/saas-ui-design

[^9]: https://stackoverflow.com/questions/15839114/restful-soft-delete

[^10]: https://www.reddit.com/r/webdev/comments/wd1uos/how_do_you_design_your_apis_to_handle_soft_deletes/

[^11]: https://www.abstractapi.com/guides/api-glossary/delete-method-in-apis

[^12]: https://www.youtube.com/watch?v=LhTxERrTWPM

[^13]: https://tanstack.com/query/v5/docs/framework/react/examples/optimistic-updates-cache

[^14]: https://reviewnprep.com/blog/error-handling-in-react-best-practices-and-techniques/

[^15]: https://www.thirdrocktechkno.com/blog/react-error-handling-best-practices-for-auth-tokens-and-network-issues/

[^16]: https://blog.ag-grid.com/writing-e2e-tests-for-ag-grid-react-tables-with-playwright/

[^17]: https://stackoverflow.com/questions/76567831/how-do-i-isolate-tests-for-crud-app-in-playwright

[^18]: https://developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_deployments_techniques_deleting_data.htm

[^19]: https://docs.confluent.io/platform/current/schema-registry/schema-deletion-guidelines.html

[^20]: https://discuss.jsonapi.org/t/soft-delete-resources/1307

