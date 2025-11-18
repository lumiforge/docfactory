# Детальные ответы на вопросы по Phase 3 Sprint 5

## 1. Template Versions History

### Структура данных версий

**TypeScript типы**:[1][2]

```typescript
// types/template-version.types.ts
export interface TemplateVersion {
  id: string; // UUID версии
  template_id: string; // FK к основному шаблону
  version_number: number; // 1, 2, 3...
  
  // Snapshot данных на момент версии
  name: string;
  description: string | null;
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
  json_schema_url: string; // snapshot JSON-схемы
  
  // Метаданные версии
  created_at: string; // ISO 8601
  created_by: string; // user_id
  change_summary: string | null; // Краткое описание изменений
  is_current: boolean; // Текущая активная версия
  
  // Diff metadata (опционально)
  diff_stats?: {
    elements_added: number;
    elements_removed: number;
    elements_modified: number;
  };
}

// API response для списка версий
export interface VersionsListResponse {
  data: TemplateVersion[];
  current_version: number;
  total_versions: number;
}
```

### API эндпоинты для версий

```typescript
// services/template-versions.api.ts
export const templateVersionsAPI = {
  // Получить все версии шаблона
  list: (templateId: string) =>
    apiClient.get<VersionsListResponse>(`/api/v1/templates/${templateId}/versions`),
  
  // Получить конкретную версию
  getVersion: (templateId: string, versionNumber: number) =>
    apiClient.get<TemplateVersion>(
      `/api/v1/templates/${templateId}/versions/${versionNumber}`
    ),
  
  // Сравнить две версии (diff)
  compare: (templateId: string, fromVersion: number, toVersion: number) =>
    apiClient.get<VersionDiff>(
      `/api/v1/templates/${templateId}/versions/compare`,
      { params: { from: fromVersion, to: toVersion } }
    ),
  
  // Откатиться к версии (создает новую версию с содержимым старой)
  restore: (templateId: string, versionNumber: number) =>
    apiClient.post<Template>(
      `/api/v1/templates/${templateId}/versions/${versionNumber}/restore`
    ),
  
  // Создать новую версию (при сохранении изменений)
  create: (templateId: string, data: CreateVersionDto) =>
    apiClient.post<TemplateVersion>(
      `/api/v1/templates/${templateId}/versions`,
      data
    ),
};

interface CreateVersionDto {
  change_summary?: string; // Что изменилось
  json_schema_url: string; // Новая схема
}
```

### Сравнение версий (Diff)[2][1]

```typescript
// types/version-diff.types.ts
export interface VersionDiff {
  from_version: number;
  to_version: number;
  summary: {
    elements_added: number;
    elements_removed: number;
    elements_modified: number;
    properties_changed: string[]; // ['name', 'page_size']
  };
  
  // Детальные изменения
  changes: VersionChange[];
}

export interface VersionChange {
  type: 'added' | 'removed' | 'modified';
  path: string; // JSON path: 'elements[0].position.x'
  old_value?: any;
  new_value?: any;
  description: string; // "Изменена позиция элемента 'Заголовок'"
}

// Компонент сравнения версий
function VersionComparison({ 
  templateId, 
  fromVersion, 
  toVersion 
}: VersionComparisonProps) {
  const { data: diff } = useQuery({
    queryKey: ['template-versions', templateId, 'diff', fromVersion, toVersion],
    queryFn: () => templateVersionsAPI.compare(templateId, fromVersion, toVersion),
  });
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            Сравнение версий {fromVersion} → {toVersion}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Добавлено"
              value={diff.summary.elements_added}
              color="green"
              icon={<Plus />}
            />
            <StatCard
              label="Удалено"
              value={diff.summary.elements_removed}
              color="red"
              icon={<Minus />}
            />
            <StatCard
              label="Изменено"
              value={diff.summary.elements_modified}
              color="blue"
              icon={<Edit />}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Changes list */}
      <Card>
        <CardHeader>
          <CardTitle>Детальные изменения</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {diff.changes.map((change, index) => (
              <ChangeItem key={index} change={change} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Side-by-side preview */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Версия {fromVersion}</h3>
          <TemplatePreview 
            templateId={templateId} 
            version={fromVersion}
          />
        </div>
        <div>
          <h3 className="font-semibold mb-2">Версия {toVersion}</h3>
          <TemplatePreview 
            templateId={templateId} 
            version={toVersion}
          />
        </div>
      </div>
    </div>
  );
}

function ChangeItem({ change }: { change: VersionChange }) {
  const icons = {
    added: <Plus className="text-green-600" />,
    removed: <Minus className="text-red-600" />,
    modified: <Edit className="text-blue-600" />,
  };
  
  return (
    <div className="flex items-start gap-3 p-3 border rounded">
      {icons[change.type]}
      <div className="flex-1">
        <p className="font-medium">{change.description}</p>
        <p className="text-sm text-gray-600">{change.path}</p>
        {change.type === 'modified' && (
          <div className="mt-2 text-sm">
            <span className="text-red-600">- {JSON.stringify(change.old_value)}</span>
            <br />
            <span className="text-green-600">+ {JSON.stringify(change.new_value)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

### UI для версий (Version History Panel)[3][1][2]

```typescript
// components/templates/version-history-panel.tsx
function VersionHistoryPanel({ templateId }: VersionHistoryPanelProps) {
  const { data: versions } = useQuery({
    queryKey: ['template-versions', templateId],
    queryFn: () => templateVersionsAPI.list(templateId),
  });
  
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const restoreMutation = useMutation({
    mutationFn: (version: number) => 
      templateVersionsAPI.restore(templateId, version),
  });
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <History className="mr-2 h-4 w-4" />
          История версий
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[600px]">
        <SheetHeader>
          <SheetTitle>История изменений</SheetTitle>
          <SheetDescription>
            Всего версий: {versions.total_versions}
          </SheetDescription>
        </SheetHeader>
        
        {/* Compare mode */}
        {selectedVersions.length === 2 && (
          <Alert className="my-4">
            <AlertTitle>Режим сравнения</AlertTitle>
            <AlertDescription>
              <Button
                onClick={() => {
                  // Show comparison modal
                }}
              >
                Сравнить версии {selectedVersions[0]} и {selectedVersions[1]}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Timeline */}
        <ScrollArea className="h-[calc(100vh-200px)] mt-4">
          <div className="space-y-4">
            {versions.data.map((version, index) => (
              <VersionItem
                key={version.id}
                version={version}
                isLatest={index === 0}
                isCurrent={version.is_current}
                isSelected={selectedVersions.includes(version.version_number)}
                onSelect={(selected) => {
                  if (selected) {
                    setSelectedVersions([...selectedVersions, version.version_number]);
                  } else {
                    setSelectedVersions(
                      selectedVersions.filter(v => v !== version.version_number)
                    );
                  }
                }}
                onRestore={() => {
                  if (confirm('Восстановить эту версию?')) {
                    restoreMutation.mutate(version.version_number);
                  }
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function VersionItem({
  version,
  isLatest,
  isCurrent,
  isSelected,
  onSelect,
  onRestore,
}: VersionItemProps) {
  return (
    <Card className={cn(
      "relative",
      isCurrent && "border-blue-500",
      isSelected && "bg-blue-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox for comparison */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1"
          />
          
          <div className="flex-1">
            {/* Version number + badges */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                v{version.version_number}
              </Badge>
              {isCurrent && (
                <Badge variant="default">Текущая</Badge>
              )}
              {isLatest && (
                <Badge variant="secondary">Последняя</Badge>
              )}
            </div>
            
            {/* Change summary */}
            <p className="text-sm font-medium">
              {version.change_summary || 'Без описания'}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {version.created_by}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(version.created_at), {
                  addSuffix: true,
                  locale: ru,
                })}
              </span>
            </div>
            
            {/* Diff stats */}
            {version.diff_stats && (
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-green-600">
                  +{version.diff_stats.elements_added}
                </span>
                <span className="text-red-600">
                  -{version.diff_stats.elements_removed}
                </span>
                <span className="text-blue-600">
                  ~{version.diff_stats.elements_modified}
                </span>
              </div>
            )}
          </div>
          
          {/* Actions */}
          {!isCurrent && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onRestore}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Восстановить
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Предпросмотр
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Откат к версии (Restore)[1]

**Важно**: Откат НЕ перезаписывает текущую версию, а создает новую версию с содержимым старой.[1]

```typescript
// Пример: текущая версия 5, откатываемся к версии 3
// Результат: создается версия 6 с содержимым версии 3

// Backend logic (для справки)
func RestoreVersion(templateID, versionNumber int) error {
    // 1. Получить версию для восстановления
    oldVersion := getVersion(templateID, versionNumber)
    
    // 2. Получить текущую версию
    currentVersion := getCurrentVersion(templateID)
    
    // 3. Создать новую версию с содержимым старой
    newVersion := Version{
        TemplateID: templateID,
        VersionNumber: currentVersion.VersionNumber + 1,
        JSONSchemaURL: oldVersion.JSONSchemaURL, // копируем схему
        ChangeSummary: fmt.Sprintf("Восстановлена версия %d", versionNumber),
        CreatedBy: currentUserID,
        CreatedAt: time.Now(),
        IsCurrent: true,
    }
    
    // 4. Сохранить новую версию
    createVersion(newVersion)
    
    // 5. Обновить is_current флаги
    updateCurrentVersion(templateID, newVersion.VersionNumber)
    
    return nil
}
```

## 2. Duplicate Template

### Копирование шаблона[2]

```typescript
// API endpoint
export const templatesAPI = {
  // ...existing methods
  
  duplicate: (templateId: string, options?: DuplicateOptions) =>
    apiClient.post<Template>(
      `/api/v1/templates/${templateId}/duplicate`,
      options
    ),
};

interface DuplicateOptions {
  name?: string; // Новое имя (если не указано, добавляется " (копия)")
  include_versions?: boolean; // Копировать всю историю версий (default: false)
  description?: string; // Новое описание
}

// Frontend implementation
function useDuplicateTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, options }: { id: string; options?: DuplicateOptions }) =>
      templatesAPI.duplicate(id, options),
    
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success(
        'Шаблон скопирован',
        `Создана копия: ${newTemplate.name}`
      );
    },
  });
}

// UI Component
function DuplicateTemplateDialog({ 
  template, 
  open, 
  onOpenChange 
}: DuplicateTemplateDialogProps) {
  const form = useForm<DuplicateFormData>({
    defaultValues: {
      name: `${template.name} (копия)`,
      description: template.description,
      include_versions: false,
    },
  });
  
  const duplicateMutation = useDuplicateTemplate();
  
  const handleSubmit = (data: DuplicateFormData) => {
    duplicateMutation.mutate(
      { id: template.id, options: data },
      {
        onSuccess: (newTemplate) => {
          onOpenChange(false);
          router.push(`/editor/${newTemplate.id}`);
        },
      }
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Дублировать шаблон</DialogTitle>
          <DialogDescription>
            Создайте копию шаблона "{template.name}"
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название копии</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="include_versions"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel>Копировать историю версий</FormLabel>
                    <FormDescription>
                      Все {template.version} версии будут скопированы
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Отмена
              </Button>
              <Button type="submit" loading={duplicateMutation.isPending}>
                Дублировать
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### Именование копий

**Логика автоматического именования**:

```typescript
// utils/template-naming.ts
export function generateDuplicateName(
  originalName: string,
  existingNames: string[]
): string {
  // Паттерн: "Название (копия N)"
  const basePattern = /^(.*?)(?:\s*\(копия(?:\s+(\d+))?\))?$/;
  const match = originalName.match(basePattern);
  
  if (!match) return `${originalName} (копия)`;
  
  const baseName = match[1].trim();
  const currentNumber = match[2] ? parseInt(match[2]) : 0;
  
  // Найти следующий доступный номер
  let nextNumber = currentNumber + 1;
  let candidateName = `${baseName} (копия ${nextNumber})`;
  
  while (existingNames.includes(candidateName)) {
    nextNumber++;
    candidateName = `${baseName} (копия ${nextNumber})`;
  }
  
  return candidateName;
}

// Примеры:
// "Гарантийный талон" → "Гарантийный талон (копия)"
// "Гарантийный талон (копия)" → "Гарантийный талон (копия 2)"
// "Гарантийный талон (копия 2)" → "Гарантийный талон (копия 3)"
```

### Метаданные копии

```typescript
// Backend создает копию с новыми метаданными
interface DuplicatedTemplate extends Template {
  // Новые поля
  id: string; // Новый UUID
  created_at: string; // Текущее время
  created_by: string; // Текущий пользователь
  updated_at: string; // Текущее время
  version: 1; // Начинается с версии 1 (если не копируем историю)
  
  // Обнуляемые поля
  documents_count: 0; // Копия не имеет связанных документов
  last_used_at: null;
  
  // Копируемые поля
  name: string; // С модификацией
  description: string;
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
  json_schema_url: string; // Копируется JSON в Object Storage
  thumbnail_url: string; // Копируется или регенерируется
}
```

## 3. Template Preview (Thumbnail Generation)

### Генерация thumbnails[4][5]

```typescript
// services/thumbnail.service.ts
export class ThumbnailService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }
  
  /**
   * Генерация thumbnail из JSON schema шаблона
   */
  async generateFromTemplate(
    template: Template,
    options: ThumbnailOptions = {}
  ): Promise<Blob> {
    const {
      width = 300,
      height = 424, // A4 aspect ratio
      quality = 0.8,
      format = 'image/jpeg',
    } = options;
    
    // Set canvas dimensions[web:116]
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Load JSON schema
    const schema = await this.loadSchema(template.json_schema_url);
    
    // Render template to canvas
    await this.renderTemplateToCanvas(schema, width, height);
    
    // Convert to blob[web:116]
    return new Promise((resolve) => {
      this.canvas.toBlob(
        (blob) => resolve(blob!),
        format,
        quality
      );
    });
  }
  
  /**
   * Рендеринг элементов шаблона на canvas
   */
  private async renderTemplateToCanvas(
    schema: TemplateSchema,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    // Clear canvas[web:116]
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Calculate scale factor
    const scaleX = canvasWidth / this.getPageWidth(schema.page_size);
    const scaleY = canvasHeight / this.getPageHeight(schema.page_size);
    const scale = Math.min(scaleX, scaleY);
    
    // Render each element
    for (const element of schema.elements) {
      await this.renderElement(element, scale);
    }
  }
  
  /**
   * Рендеринг отдельного элемента
   */
  private async renderElement(
    element: TemplateElement,
    scale: number
  ): Promise<void> {
    const x = element.position.x * scale;
    const y = element.position.y * scale;
    const width = element.size.width * scale;
    const height = element.size.height * scale;
    
    switch (element.type) {
      case 'text':
        this.renderText(element, x, y, scale);
        break;
      case 'image':
        await this.renderImage(element, x, y, width, height);
        break;
      case 'qr_code':
        this.renderPlaceholder(x, y, width, height, 'QR');
        break;
      case 'shape':
        this.renderShape(element, x, y, width, height);
        break;
    }
  }
  
  private renderText(
    element: TextElement,
    x: number,
    y: number,
    scale: number
  ): void {
    const fontSize = (element.style.size || 12) * scale;
    this.ctx.font = `${element.style.bold ? 'bold' : 'normal'} ${fontSize}px ${element.style.font || 'Arial'}`;
    this.ctx.fillStyle = element.style.color || '#000000';
    this.ctx.textAlign = element.style.align || 'left';
    this.ctx.fillText(element.content || 'Text', x, y + fontSize);
  }
  
  private async renderImage(
    element: ImageElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    try {
      const img = await this.loadImage(element.asset_url);
      this.ctx.drawImage(img, x, y, width, height);
    } catch {
      // Fallback to placeholder
      this.renderPlaceholder(x, y, width, height, 'IMG');
    }
  }
  
  private renderShape(
    element: ShapeElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    this.ctx.strokeStyle = element.style.borderColor || '#000000';
    this.ctx.lineWidth = (element.style.borderWidth || 1);
    
    if (element.shape === 'rectangle') {
      this.ctx.strokeRect(x, y, width, height);
    } else if (element.shape === 'circle') {
      this.ctx.beginPath();
      this.ctx.arc(x + width / 2, y + height / 2, width / 2, 0, 2 * Math.PI);
      this.ctx.stroke();
    }
  }
  
  private renderPlaceholder(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string
  ): void {
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(x, y, width, height);
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.fillStyle = '#666666';
    this.ctx.font = `${Math.min(width, height) / 3}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(label, x + width / 2, y + height / 2);
  }
  
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
  
  private async loadSchema(url: string): Promise<TemplateSchema> {
    const response = await fetch(url);
    return response.json();
  }
  
  private getPageWidth(pageSize: PageSize): number {
    const sizes = { A4: 210, A5: 148, Letter: 216 };
    return sizes[pageSize];
  }
  
  private getPageHeight(pageSize: PageSize): number {
    const sizes = { A4: 297, A5: 210, Letter: 279 };
    return sizes[pageSize];
  }
}

export const thumbnailService = new ThumbnailService();
```

### Обновление thumbnails

```typescript
// hooks/use-thumbnail-generator.ts
export function useThumbnailGenerator() {
  const uploadMutation = useMutation({
    mutationFn: async ({ templateId, blob }: { templateId: string; blob: Blob }) => {
      const formData = new FormData();
      formData.append('thumbnail', blob, 'thumbnail.jpg');
      
      return apiClient.post(
        `/api/v1/templates/${templateId}/thumbnail`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
    },
  });
  
  const generateAndUpload = async (template: Template) => {
    try {
      // Generate thumbnail
      const blob = await thumbnailService.generateFromTemplate(template);
      
      // Upload to backend
      await uploadMutation.mutateAsync({
        templateId: template.id,
        blob,
      });
      
      toast.success('Превью обновлено');
    } catch (error) {
      toast.error('Ошибка генерации превью');
    }
  };
  
  return { generateAndUpload, isGenerating: uploadMutation.isPending };
}

// Auto-generate on template save
function TemplateEditor({ templateId }: TemplateEditorProps) {
  const { generateAndUpload } = useThumbnailGenerator();
  
  const handleSave = async (data: TemplateFormData) => {
    await saveTemplate(data);
    
    // Auto-generate thumbnail after save
    await generateAndUpload(template);
  };
  
  return (
    // ... editor UI
  );
}
```

### Размеры thumbnails

```typescript
// constants/thumbnail-sizes.ts
export const THUMBNAIL_SIZES = {
  // List view (карточки)
  card: {
    width: 300,
    height: 424, // A4: 210x297mm → ratio 1:1.414
    quality: 0.8,
  },
  
  // Small preview (в списке)
  small: {
    width: 150,
    height: 212,
    quality: 0.7,
  },
  
  // Large preview (модальное окно)
  large: {
    width: 600,
    height: 848,
    quality: 0.9,
  },
} as const;
```

## 4. Bulk Operations

### Типы bulk operations[6][7]

```typescript
// types/bulk-operations.types.ts
export type BulkAction =
  | 'delete'
  | 'export'
  | 'duplicate'
  | 'change_type'
  | 'archive';

export interface BulkOperationRequest {
  action: BulkAction;
  template_ids: string[];
  options?: Record<string, any>;
}

export interface BulkOperationResponse {
  success_count: number;
  failed_count: number;
  errors: BulkOperationError[];
}

export interface BulkOperationError {
  template_id: string;
  template_name: string;
  error: string;
}
```

### API для bulk operations

```typescript
// services/bulk-operations.api.ts
export const bulkOperationsAPI = {
  // Bulk delete
  deleteMultiple: (templateIds: string[]) =>
    apiClient.post<BulkOperationResponse>('/api/v1/templates/bulk/delete', {
      template_ids: templateIds,
    }),
  
  // Bulk export (возвращает ZIP с JSON)
  exportMultiple: (templateIds: string[]) =>
    apiClient.post('/api/v1/templates/bulk/export', {
      template_ids: templateIds,
    }, {
      responseType: 'blob',
    }),
  
  // Bulk duplicate
  duplicateMultiple: (templateIds: string[]) =>
    apiClient.post<BulkOperationResponse>('/api/v1/templates/bulk/duplicate', {
      template_ids: templateIds,
    }),
};
```

### UI для bulk operations[7][6]

```typescript
// components/templates/bulk-actions-toolbar.tsx
function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
}: BulkActionsToolbarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleBulkDelete = async () => {
    if (!confirm(`Удалить ${selectedIds.length} шаблонов?`)) return;
    
    setIsDeleting(true);
    try {
      const result = await bulkOperationsAPI.deleteMultiple(selectedIds);
      
      if (result.errors.length > 0) {
        toast.error(
          `Удалено ${result.success_count}, ошибок: ${result.failed_count}`
        );
      } else {
        toast.success(`Удалено шаблонов: ${result.success_count}`);
      }
      
      onClearSelection();
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (error) {
      toast.error('Ошибка bulk удаления');
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleBulkExport = async () => {
    setIsExporting(true);
    try {
      const blob = await bulkOperationsAPI.exportMultiple(selectedIds);
      
      // Download ZIP file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `templates-${Date.now()}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Шаблоны экспортированы');
    } catch (error) {
      toast.error('Ошибка экспорта');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border shadow-lg rounded-lg p-4 flex items-center gap-4 z-50">
      <div className="flex items-center gap-2">
        <Checkbox checked readOnly />
        <span className="font-medium">
          Выбрано: {selectedIds.length}
        </span>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleBulkExport}
        loading={isExporting}
      >
        <Download className="mr-2 h-4 w-4" />
        Экспорт
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => {/* Show duplicate dialog */}}
      >
        <Copy className="mr-2 h-4 w-4" />
        Дублировать
      </Button>
      
      <Button
        variant="destructive"
        size="sm"
        onClick={handleBulkDelete}
        loading={isDeleting}
      >
        <Trash className="mr-2 h-4 w-4" />
        Удалить
      </Button>
      
      <Separator orientation="vertical" className="h-6" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
      >
        <X className="mr-2 h-4 w-4" />
        Отменить
      </Button>
    </div>
  );
}

// Multi-select implementation[web:117][web:120]
function TemplatesListWithBulk() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data } = useTemplates(params);
  
  const templates = data?.data || [];
  const allIds = templates.map(t => t.id);
  
  const handleSelectAll = () => {
    if (selectedIds.length === templates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };
  
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };
  
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Checkbox
          checked={selectedIds.length === templates.length}
          indeterminate={selectedIds.length > 0 && selectedIds.length < templates.length}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm text-gray-600">
          Выбрать все
        </span>
      </div>
      
      <TemplatesGrid
        templates={templates}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />
      
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedIds={selectedIds}
          onClearSelection={() => setSelectedIds([])}
        />
      )}
    </>
  );
}
```

### Форматы экспорта

```typescript
// Backend: Bulk export создает ZIP с JSON файлами
// Structure:
// templates-export-20251117.zip
// ├── warranty-template-001.json
// ├── instruction-template-002.json
// └── manifest.json

// manifest.json содержит метаданные
interface ExportManifest {
  export_date: string;
  templates_count: number;
  exported_by: string;
  templates: Array<{
    id: string;
    filename: string;
    name: string;
    document_type: DocumentType;
  }>;
}
```

### Обработка ошибок bulk operations

```typescript
// components/bulk-operation-results-dialog.tsx
function BulkOperationResultsDialog({
  result,
  open,
  onOpenChange,
}: BulkOperationResultsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Результаты операции</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{result.success_count}</p>
                  <p className="text-sm text-gray-600">Успешно</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{result.failed_count}</p>
                  <p className="text-sm text-gray-600">Ошибок</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Errors list */}
          {result.errors.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Ошибки:</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertTitle>{error.template_name}</AlertTitle>
                      <AlertDescription>{error.error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## 5. Импорт шаблонов (JSON Upload)

### Формат JSON для импорта[8][9]

```typescript
// types/template-import.types.ts
export interface TemplateImportJSON {
  // Метаданные
  version: '1.0'; // Версия формата
  export_date?: string;
  
  // Данные шаблона
  name: string;
  description?: string;
  document_type: DocumentType;
  page_size: PageSize;
  orientation: Orientation;
  
  // JSON Schema элементов
  elements: TemplateElement[];
  
  // Assets (base64 encoded)
  assets?: Array<{
    id: string;
    type: 'image' | 'logo';
    filename: string;
    mime_type: string;
    data: string; // base64
  }>;
}

// Пример JSON файла:
/*
{
  "version": "1.0",
  "name": "Гарантийный талон",
  "description": "Шаблон для бытовой техники",
  "document_type": "warranty",
  "page_size": "A4",
  "orientation": "portrait",
  "elements": [
    {
      "type": "text",
      "content": "ГАРАНТИЙНЫЙ ТАЛОН",
      "position": { "x": 100, "y": 50 },
      "size": { "width": 400, "height": 30 },
      "style": {
        "font": "Arial",
        "size": 24,
        "color": "#000000",
        "bold": true
      }
    }
  ],
  "assets": [
    {
      "id": "logo-123",
      "type": "logo",
      "filename": "company-logo.png",
      "mime_type": "image/png",
      "data": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ]
}
*/
```

### Валидация импорта[9][8]

```typescript
// lib/validation/template-import-schema.ts
import { z } from 'zod';

export const templateImportSchema = z.object({
  version: z.literal('1.0'),
  export_date: z.string().datetime().optional(),
  
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  document_type: z.nativeEnum(DocumentType),
  page_size: z.nativeEnum(PageSize),
  orientation: z.nativeEnum(Orientation),
  
  elements: z.array(z.object({
    type: z.enum(['text', 'image', 'qr_code', 'dynamic_field', 'shape', 'table']),
    position: z.object({
      x: z.number().min(0),
      y: z.number().min(0),
    }),
    size: z.object({
      width: z.number().positive(),
      height: z.number().positive(),
    }),
    // ... other element properties
  })),
  
  assets: z.array(z.object({
    id: z.string(),
    type: z.enum(['image', 'logo']),
    filename: z.string(),
    mime_type: z.string().regex(/^image\/(png|jpeg|jpg|webp)$/),
    data: z.string().regex(/^[A-Za-z0-9+/=]+$/), // base64
  })).optional(),
});

export type TemplateImportData = z.infer<typeof templateImportSchema>;

// Validation function
export function validateImportJSON(data: unknown): {
  success: boolean;
  data?: TemplateImportData;
  errors?: z.ZodIssue[];
} {
  try {
    const validated = templateImportSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues };
    }
    return { success: false, errors: [] };
  }
}
```

### UI для импорта[10][11]

```typescript
// components/templates/template-import-dialog.tsx
function TemplateImportDialog({
  open,
  onOpenChange,
}: TemplateImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<TemplateImportData | null>(null);
  const [validationErrors, setValidationErrors] = useState<z.ZodIssue[]>([]);
  const [conflictStrategy, setConflictStrategy] = useState<'skip' | 'replace' | 'rename'>('rename');
  
  const importMutation = useMutation({
    mutationFn: (data: TemplateImportData) =>
      templatesAPI.import(data, { conflict_strategy: conflictStrategy }),
  });
  
  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    
    try {
      // Read JSON
      const text = await selectedFile.text();
      const json = JSON.parse(text);
      
      // Validate
      const validation = validateImportJSON(json);
      
      if (validation.success) {
        setPreviewData(validation.data);
        setValidationErrors([]);
      } else {
        setValidationErrors(validation.errors || []);
        toast.error('Файл содержит ошибки');
      }
    } catch (error) {
      toast.error('Невалидный JSON файл');
    }
  };
  
  const handleImport = async () => {
    if (!previewData) return;
    
    try {
      const imported = await importMutation.mutateAsync(previewData);
      toast.success(`Импортирован шаблон: ${imported.name}`);
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    } catch (error) {
      toast.error('Ошибка импорта');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Импорт шаблона</DialogTitle>
          <DialogDescription>
            Загрузите JSON файл с шаблоном
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File upload[web:107][web:110] */}
          {!file ? (
            <FileDropZone
              accept={{ 'application/json': ['.json'] }}
              onFileSelect={handleFileSelect}
            />
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFile(null);
                      setPreviewData(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTitle>Ошибки валидации:</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-4 mt-2">
                  {validationErrors.map((error, index) => (
                    <li key={index}>
                      {error.path.join('.')}: {error.message}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Preview */}
          {previewData && validationErrors.length === 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Предпросмотр
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Название:</dt>
                      <dd className="text-sm">{previewData.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Тип:</dt>
                      <dd className="text-sm">
                        {DOCUMENT_TYPES[previewData.document_type].label.ru}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-600">Элементов:</dt>
                      <dd className="text-sm">{previewData.elements.length}</dd>
                    </div>
                    {previewData.assets && (
                      <div>
                        <dt className="text-sm font-medium text-gray-600">Ассетов:</dt>
                        <dd className="text-sm">{previewData.assets.length}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
              
              {/* Conflict strategy */}
              <div>
                <Label>Если шаблон с таким именем уже существует:</Label>
                <RadioGroup
                  value={conflictStrategy}
                  onValueChange={(value) => setConflictStrategy(value as any)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rename" id="rename" />
                    <Label htmlFor="rename">
                      Переименовать новый шаблон (добавить "(импорт)")
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="skip" />
                    <Label htmlFor="skip">
                      Пропустить импорт
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="replace" id="replace" />
                    <Label htmlFor="replace">
                      Заменить существующий шаблон
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            onClick={handleImport}
            disabled={!previewData || validationErrors.length > 0}
            loading={importMutation.isPending}
          >
            Импортировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Drag & Drop file upload[web:107][web:110]
function FileDropZone({ accept, onFileSelect }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      onFileSelect(file);
    } else {
      toast.error('Загрузите JSON файл');
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };
  
  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <p className="text-lg font-medium mb-2">
        Перетащите JSON файл сюда
      </p>
      <p className="text-sm text-gray-600 mb-4">
        или
      </p>
      <Button variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
        Выбрать файл
      </Button>
      <input
        id="file-input"
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
}
```

### Обработка конфликтов

```typescript
// Backend logic (для справки)
type ConflictStrategy = 'skip' | 'replace' | 'rename';

func ImportTemplate(data ImportData, strategy ConflictStrategy) (*Template, error) {
    // Проверка существования шаблона с таким именем
    existing := findTemplateByName(data.Name)
    
    if existing != nil {
        switch strategy {
        case "skip":
            return nil, errors.New("template already exists")
        
        case "replace":
            // Удалить старый, создать новый
            deleteTemplate(existing.ID)
            return createTemplate(data), nil
        
        case "rename":
            // Добавить суффикс к имени
            data.Name = generateUniqueName(data.Name) // "Шаблон (импорт)"
            return createTemplate(data), nil
        }
    }
    
    return createTemplate(data), nil
}
```

# Phase 3 Sprint 5 — Продолжение (категории 6-10)

## 6. Компонент выбора цветов и логотипов

### Color Picker Component[1][2]

```typescript
// components/editor/color-picker.tsx
import { HexColorPicker, HexColorInput } from 'react-colorful';
import 'react-colorful/dist/index.css';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presets?: string[]; // Preset colors
  label?: string;
}

export function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_COLOR_PRESETS,
  label,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="color-picker">{label}</Label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="color-picker"
            variant="outline"
            className="w-full justify-start"
            role="combobox"
            aria-expanded={isOpen}
            aria-label={`Выбрать цвет. Текущий цвет: ${value}`}
          >
            <div
              className="h-5 w-5 rounded border"
              style={{ backgroundColor: value }}
            />
            <span className="ml-2 font-mono text-sm">{value}</span>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Color picker[web:106] */}
            <HexColorPicker color={value} onChange={onChange} />
            
            {/* Hex input */}
            <div className="flex items-center gap-2">
              <Label htmlFor="hex-input" className="text-sm">
                HEX:
              </Label>
              <HexColorInput
                id="hex-input"
                color={value}
                onChange={onChange}
                className="flex-1 px-2 py-1 border rounded text-sm font-mono"
                prefixed
                aria-label="Введите HEX код цвета"
              />
            </div>
            
            {/* Color presets */}
            <div>
              <Label className="text-sm mb-2 block">Быстрый выбор:</Label>
              <div className="grid grid-cols-8 gap-1">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={cn(
                      "h-6 w-6 rounded border hover:scale-110 transition-transform",
                      value === preset && "ring-2 ring-blue-500 ring-offset-1"
                    )}
                    style={{ backgroundColor: preset }}
                    onClick={() => onChange(preset)}
                    aria-label={`Выбрать цвет ${preset}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Recent colors */}
            <RecentColors
              recentColors={getRecentColors()}
              onSelect={onChange}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Default color presets
const DEFAULT_COLOR_PRESETS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00',
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#808080', '#C0C0C0', '#800000', '#808000',
  '#008000', '#800080', '#008080', '#000080',
];

// Recent colors storage
function getRecentColors(): string[] {
  const stored = localStorage.getItem('recent-colors');
  return stored ? JSON.parse(stored) : [];
}

function saveRecentColor(color: string): void {
  const recent = getRecentColors();
  const updated = [color, ...recent.filter(c => c !== color)].slice(0, 8);
  localStorage.setItem('recent-colors', JSON.stringify(updated));
}
```

### Logo Upload Component[3][4][5]

```typescript
// components/editor/logo-upload.tsx
import { useDropzone } from 'react-dropzone';

interface LogoUploadProps {
  value: string | null; // URL текущего логотипа
  onChange: (file: File) => void;
  onRemove: () => void;
  maxSize?: number; // bytes
}

export function LogoUpload({
  value,
  onChange,
  onRemove,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
    },
    maxSize,
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      setIsUploading(true);
      
      try {
        // Optimize image before upload[web:121][web:122]
        const optimized = await optimizeImage(file);
        onChange(optimized);
        toast.success('Логотип загружен');
      } catch (error) {
        toast.error('Ошибка загрузки логотипа');
      } finally {
        setIsUploading(false);
      }
    },
    onDropRejected: (rejections) => {
      const error = rejections[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        toast.error(`Файл слишком большой. Максимум ${maxSize / 1024 / 1024}MB`);
      } else if (error?.code === 'file-invalid-type') {
        toast.error('Поддерживаются только PNG, JPEG, WebP, SVG');
      }
    },
  });
  
  return (
    <div className="space-y-4">
      <Label>Логотип</Label>
      
      {value ? (
        // Preview existing logo
        <div className="relative border rounded-lg p-4">
          <img
            src={value}
            alt="Логотип"
            className="max-h-32 mx-auto object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onRemove}
            aria-label="Удалить логотип"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Upload dropzone[web:107]
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          )}
        >
          <input {...getInputProps()} />
          
          {isUploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">Загрузка...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <div>
                <p className="font-medium">
                  {isDragActive
                    ? 'Отпустите файл здесь'
                    : 'Перетащите логотип или нажмите для выбора'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPEG, WebP, SVG до {maxSize / 1024 / 1024}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Image optimization info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Изображения автоматически оптимизируются и конвертируются в WebP для лучшей производительности
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

### Image Optimization[4][6][3]

```typescript
// lib/image-optimization.ts
import imageCompression from 'browser-image-compression';

/**
 * Оптимизация изображений перед загрузкой[web:121][web:122][web:123]
 */
export async function optimizeImage(file: File): Promise<File> {
  // SVG не требует оптимизации
  if (file.type === 'image/svg+xml') {
    return file;
  }
  
  const options = {
    maxSizeMB: 1, // Максимум 1MB
    maxWidthOrHeight: 1920, // Максимальные размеры
    useWebWorker: true,
    fileType: 'image/webp', // Конвертация в WebP[web:122]
  };
  
  try {
    const compressed = await imageCompression(file, options);
    
    // Создаем новый File с правильным именем
    return new File(
      [compressed],
      file.name.replace(/\.[^/.]+$/, '.webp'),
      { type: 'image/webp' }
    );
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Fallback to original
    return file;
  }
}

/**
 * Генерация thumbnail из изображения[web:121]
 */
export async function generateThumbnail(
  file: File,
  maxWidth: number = 300
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate dimensions
        const ratio = img.height / img.width;
        canvas.width = maxWidth;
        canvas.height = maxWidth * ratio;
        
        // Draw scaled image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/webp',
          0.8
        );
      };
      
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Валидация размеров изображения
 */
export async function validateImageDimensions(
  file: File,
  minWidth?: number,
  minHeight?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<{ valid: boolean; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        if (minWidth && img.width < minWidth) {
          resolve({
            valid: false,
            error: `Минимальная ширина: ${minWidth}px`,
          });
          return;
        }
        
        if (minHeight && img.height < minHeight) {
          resolve({
            valid: false,
            error: `Минимальная высота: ${minHeight}px`,
          });
          return;
        }
        
        if (maxWidth && img.width > maxWidth) {
          resolve({
            valid: false,
            error: `Максимальная ширина: ${maxWidth}px`,
          });
          return;
        }
        
        if (maxHeight && img.height > maxHeight) {
          resolve({
            valid: false,
            error: `Максимальная высота: ${maxHeight}px`,
          });
          return;
        }
        
        resolve({ valid: true });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
}
```

### Назначение компонентов

**Color Picker используется для**:
- Выбор цвета текстовых элементов
- Цвет фона элементов (shapes, tables)
- Цвет границ (borders)
- Брендинг шаблона (основные цвета компании)

**Logo Upload используется для**:
- Загрузка логотипа компании в шаблон
- Загрузка дополнительных изображений (watermark, иконки)
- Asset management для редактора

## 7. Интеграция с Backend API

### Полный список API эндпоинтов для Sprint 5

```typescript
// services/templates-sprint5.api.ts

export const templatesSprint5API = {
  // ========== VERSIONS ==========
  // Список версий
  getVersions: (templateId: string) =>
    apiClient.get<VersionsListResponse>(
      `/api/v1/templates/${templateId}/versions`
    ),
  
  // Получить конкретную версию
  getVersion: (templateId: string, versionNumber: number) =>
    apiClient.get<TemplateVersion>(
      `/api/v1/templates/${templateId}/versions/${versionNumber}`
    ),
  
  // Сравнить версии
  compareVersions: (
    templateId: string,
    fromVersion: number,
    toVersion: number
  ) =>
    apiClient.get<VersionDiff>(
      `/api/v1/templates/${templateId}/versions/compare`,
      { params: { from: fromVersion, to: toVersion } }
    ),
  
  // Восстановить версию
  restoreVersion: (templateId: string, versionNumber: number) =>
    apiClient.post<Template>(
      `/api/v1/templates/${templateId}/versions/${versionNumber}/restore`
    ),
  
  // ========== DUPLICATE ==========
  duplicate: (templateId: string, options?: DuplicateOptions) =>
    apiClient.post<Template>(
      `/api/v1/templates/${templateId}/duplicate`,
      options
    ),
  
  // ========== PREVIEW/THUMBNAIL ==========
  // Upload thumbnail
  uploadThumbnail: (templateId: string, file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    return apiClient.post(
      `/api/v1/templates/${templateId}/thumbnail`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },
  
  // Generate thumbnail (backend генерирует из JSON schema)
  generateThumbnail: (templateId: string) =>
    apiClient.post(`/api/v1/templates/${templateId}/thumbnail/generate`),
  
  // Get preview (high-res)
  getPreview: (templateId: string, version?: number) =>
    apiClient.get<Blob>(
      `/api/v1/templates/${templateId}/preview`,
      {
        params: { version },
        responseType: 'blob',
      }
    ),
  
  // ========== BULK OPERATIONS ==========
  bulkDelete: (templateIds: string[]) =>
    apiClient.post<BulkOperationResponse>(
      '/api/v1/templates/bulk/delete',
      { template_ids: templateIds }
    ),
  
  bulkExport: (templateIds: string[]) =>
    apiClient.post(
      '/api/v1/templates/bulk/export',
      { template_ids: templateIds },
      { responseType: 'blob' }
    ),
  
  bulkDuplicate: (templateIds: string[]) =>
    apiClient.post<BulkOperationResponse>(
      '/api/v1/templates/bulk/duplicate',
      { template_ids: templateIds }
    ),
  
  // ========== IMPORT ==========
  importTemplate: (
    data: TemplateImportData,
    options?: ImportOptions
  ) =>
    apiClient.post<Template>(
      '/api/v1/templates/import',
      data,
      { params: options }
    ),
  
  // Validate import (dry-run)
  validateImport: (data: TemplateImportData) =>
    apiClient.post<ImportValidationResult>(
      '/api/v1/templates/import/validate',
      data
    ),
  
  // ========== ASSETS ==========
  // Upload logo/image
  uploadAsset: (templateId: string, file: File, type: 'logo' | 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return apiClient.post<Asset>(
      `/api/v1/templates/${templateId}/assets`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
  },
  
  // List assets
  listAssets: (templateId: string) =>
    apiClient.get<Asset[]>(`/api/v1/templates/${templateId}/assets`),
  
  // Delete asset
  deleteAsset: (templateId: string, assetId: string) =>
    apiClient.delete(`/api/v1/templates/${templateId}/assets/${assetId}`),
};

interface DuplicateOptions {
  name?: string;
  include_versions?: boolean;
  description?: string;
}

interface ImportOptions {
  conflict_strategy?: 'skip' | 'replace' | 'rename';
}

interface ImportValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
  warnings: Array<{ path: string; message: string }>;
  conflicts: Array<{
    existing_template_id: string;
    existing_template_name: string;
  }>;
}

interface Asset {
  id: string;
  template_id: string;
  type: 'logo' | 'image' | 'watermark';
  filename: string;
  url: string;
  storage_url: string;
  size: number;
  mime_type: string;
  created_at: string;
}
```

### Error Handling для Sprint 5 API

```typescript
// lib/api-error-handler-sprint5.ts
export class Sprint5APIError extends APIError {
  constructor(
    statusCode: number,
    message: string,
    public operation: 'version' | 'duplicate' | 'import' | 'bulk' | 'asset',
    code?: string,
    details?: unknown
  ) {
    super(statusCode, message, code, details);
  }
}

// Interceptor для специфичных ошибок Sprint 5
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const endpoint = error.config?.url || '';
    
    // Version-specific errors
    if (endpoint.includes('/versions')) {
      if (status === 404) {
        throw new Sprint5APIError(
          404,
          'Версия не найдена',
          'version',
          'VERSION_NOT_FOUND'
        );
      }
      if (status === 409) {
        throw new Sprint5APIError(
          409,
          'Невозможно восстановить текущую версию',
          'version',
          'CANNOT_RESTORE_CURRENT'
        );
      }
    }
    
    // Duplicate errors
    if (endpoint.includes('/duplicate')) {
      if (status === 409) {
        throw new Sprint5APIError(
          409,
          'Шаблон с таким именем уже существует',
          'duplicate',
          'NAME_CONFLICT',
          data
        );
      }
    }
    
    // Import errors
    if (endpoint.includes('/import')) {
      if (status === 400) {
        throw new Sprint5APIError(
          400,
          'Невалидный формат импорта',
          'import',
          'INVALID_FORMAT',
          data.errors
        );
      }
      if (status === 413) {
        throw new Sprint5APIError(
          413,
          'Файл слишком большой (максимум 10MB)',
          'import',
          'FILE_TOO_LARGE'
        );
      }
    }
    
    // Bulk operation errors
    if (endpoint.includes('/bulk')) {
      if (status === 207) {
        // Partial success (Multi-Status)
        throw new Sprint5APIError(
          207,
          'Некоторые операции завершились с ошибками',
          'bulk',
          'PARTIAL_SUCCESS',
          data
        );
      }
    }
    
    // Asset upload errors
    if (endpoint.includes('/assets')) {
      if (status === 415) {
        throw new Sprint5APIError(
          415,
          'Неподдерживаемый формат файла',
          'asset',
          'UNSUPPORTED_FORMAT'
        );
      }
      if (status === 413) {
        throw new Sprint5APIError(
          413,
          'Файл слишком большой (максимум 5MB для изображений)',
          'asset',
          'FILE_TOO_LARGE'
        );
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 8. UI/UX детали

### Расположение новых элементов

```typescript
// Макет страницы Templates с Sprint 5 функциями

<div className="container mx-auto p-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-3xl font-bold">Шаблоны</h1>
      <p className="text-gray-600 mt-1">
        Управление шаблонами документов
      </p>
    </div>
    
    <div className="flex items-center gap-3">
      {/* NEW: Import button */}
      <TemplateImportDialog>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Импорт
        </Button>
      </TemplateImportDialog>
      
      {/* Existing: Create button */}
      <Button onClick={() => router.push('/templates/new')}>
        <Plus className="mr-2 h-4 w-4" />
        Создать шаблон
      </Button>
    </div>
  </div>
  
  {/* Filters + View mode toggle */}
  <div className="mb-6">
    <TemplatesFilters
      filters={filters}
      onFiltersChange={setFilters}
    />
  </div>
  
  {/* List/Grid */}
  <TemplatesList
    templates={templates}
    viewMode={viewMode}
    selectedIds={selectedIds}
    onToggleSelect={toggleSelect}
  />
  
  {/* NEW: Bulk actions toolbar (floating) */}
  {selectedIds.length > 0 && (
    <BulkActionsToolbar
      selectedIds={selectedIds}
      onClearSelection={() => setSelectedIds([])}
    />
  )}
  
  {/* Pagination */}
  <div className="mt-6">
    <TemplatesPagination
      pagination={pagination}
      onPageChange={handlePageChange}
    />
  </div>
</div>
```

### Template Card с Sprint 5 функциями

```typescript
// components/templates/template-card-enhanced.tsx
function TemplateCardEnhanced({
  template,
  isSelected,
  onToggleSelect,
}: TemplateCardEnhancedProps) {
  return (
    <Card className={cn(
      "relative hover:shadow-lg transition-all",
      isSelected && "ring-2 ring-blue-500"
    )}>
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelect}
          aria-label={`Выбрать ${template.name}`}
        />
      </div>
      
      {/* NEW: Version badge */}
      {template.version > 1 && (
        <Badge
          variant="secondary"
          className="absolute top-3 right-3"
        >
          v{template.version}
        </Badge>
      )}
      
      {/* Thumbnail with loading state */}
      <div className="relative w-full h-48 bg-gray-100">
        {template.thumbnail_url ? (
          <img
            src={template.thumbnail_url}
            alt={template.name}
            className="w-full h-full object-cover rounded-t-lg"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      
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
          <Button
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/editor/${template.id}`)}
          >
            Редактировать
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* NEW: Version history */}
              <VersionHistoryDialog templateId={template.id}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <History className="mr-2 h-4 w-4" />
                  История версий
                </DropdownMenuItem>
              </VersionHistoryDialog>
              
              {/* NEW: Duplicate with dialog */}
              <DuplicateTemplateDialog template={template}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Copy className="mr-2 h-4 w-4" />
                  Дублировать
                </DropdownMenuItem>
              </DuplicateTemplateDialog>
              
              {/* NEW: Export single template */}
              <DropdownMenuItem onClick={() => handleExport(template.id)}>
                <Download className="mr-2 h-4 w-4" />
                Экспортировать
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDelete(template.id)}
              >
                <Trash className="mr-2 h-4 w-4" />
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

### Visual Feedback для операций

```typescript
// Progress indicators для long-running operations
function BulkExportProgress({ selectedCount }: BulkExportProgressProps) {
  const [progress, setProgress] = useState(0);
  
  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Экспорт шаблонов</DialogTitle>
          <DialogDescription>
            Подготовка {selectedCount} шаблонов для экспорта...
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Progress value={progress} />
          <p className="text-sm text-center text-gray-600">
            {progress}% завершено
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Toast notifications для успешных операций
const notificationExamples = {
  versionRestored: () =>
    toast.success('Версия восстановлена', {
      description: 'Создана новая версия с содержимым выбранной',
      action: {
        label: 'Открыть',
        onClick: () => router.push(`/editor/${templateId}`),
      },
    }),
  
  duplicateCreated: (newTemplate: Template) =>
    toast.success('Шаблон скопирован', {
      description: newTemplate.name,
      action: {
        label: 'Редактировать',
        onClick: () => router.push(`/editor/${newTemplate.id}`),
      },
    }),
  
  bulkExportComplete: (count: number) =>
    toast.success(`Экспортировано шаблонов: ${count}`, {
      description: 'ZIP файл загружен в папку "Загрузки"',
    }),
  
  importSuccess: (template: Template) =>
    toast.success('Шаблон импортирован', {
      description: template.name,
      action: {
        label: 'Открыть',
        onClick: () => router.push(`/editor/${template.id}`),
      },
    }),
};
```

## 9. Технические требования

### Производительность

```typescript
// Performance budgets для Sprint 5
export const SPRINT5_PERFORMANCE = {
  // API response times
  api: {
    getVersions: 800, // ms - может быть много версий
    compareVersions: 1500, // ms - вычисление diff
    duplicate: 2000, // ms - копирование данных
    bulkExport: 5000, // ms - подготовка ZIP
    import: 3000, // ms - валидация + создание
    uploadAsset: 2000, // ms - upload + optimization
  },
  
  // Component render times
  components: {
    versionHistoryPanel: 200, // ms
    bulkActionsToolbar: 50, // ms
    templateCardWithSelection: 20, // ms
  },
  
  // File operations
  files: {
    imageOptimization: 3000, // ms
    thumbnailGeneration: 1000, // ms
    jsonValidation: 500, // ms
  },
};

// Performance monitoring
export function measureAsyncOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  
  return operation().finally(() => {
    const duration = performance.now() - start;
    const budget = SPRINT5_PERFORMANCE.api[operationName];
    
    if (duration > budget) {
      console.warn(
        `⚠️ ${operationName} took ${duration.toFixed(0)}ms (budget: ${budget}ms)`
      );
      
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'performance_budget_exceeded', {
          operation: operationName,
          duration: Math.round(duration),
          budget,
        });
      }
    }
  });
}

// Usage
const versions = await measureAsyncOperation(
  'getVersions',
  () => templateVersionsAPI.list(templateId)
);
```

### Поддержка браузеров

```
# .browserslistrc
last 2 Chrome versions
last 2 Firefox versions
last 2 Safari versions
last 2 Edge versions
not IE 11
not dead
> 0.5%
```

**Polyfills (если нужны)**:
- File API - нативная поддержка во всех современных браузерах ✅
- Canvas API - нативная поддержка ✅
- IndexedDB (для offline) - нативная поддержка ✅
- Web Workers (для image optimization) - нативная поддержка ✅

**Feature detection**:
```typescript
// lib/feature-detection.ts
export const FEATURES = {
  webp: (() => {
    const elem = document.createElement('canvas');
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })(),
  
  fileAPI: typeof File !== 'undefined' && typeof FileReader !== 'undefined',
  
  dragDrop: 'draggable' in document.createElement('div'),
  
  clipboard: typeof navigator.clipboard !== 'undefined',
};

// Graceful degradation
function ImageUpload() {
  if (!FEATURES.dragDrop) {
    return <SimpleFileInput />; // Fallback для старых браузеров
  }
  
  return <DragDropZone />;
}
```

## 10. Тестирование

### E2E тесты для Sprint 5[7][8]

```typescript
// e2e/templates-sprint5.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Sprint 5: Version History', () => {
  test('should display version history', async ({ page }) => {
    await page.goto('/templates');
    
    // Open first template menu
    await page.locator('[data-testid="template-card"]').first().hover();
    await page.locator('[data-testid="more-actions"]').first().click();
    
    // Click version history
    await page.click('text=История версий');
    
    // Check panel opened
    await expect(page.locator('[data-testid="version-history-panel"]')).toBeVisible();
    
    // Check versions list
    const versions = page.locator('[data-testid="version-item"]');
    await expect(versions).toHaveCount(await versions.count());
  });
  
  test('should restore previous version', async ({ page }) => {
    await page.goto('/templates');
    
    // Open version history
    await page.locator('[data-testid="template-card"]').first().hover();
    await page.locator('[data-testid="more-actions"]').first().click();
    await page.click('text=История версий');
    
    // Find old version
    const oldVersion = page.locator('[data-testid="version-item"]').nth(1);
    
    // Click restore
    await oldVersion.locator('[data-testid="version-actions"]').click();
    await page.click('text=Восстановить');
    
    // Confirm
    await page.click('[data-testid="confirm-restore"]');
    
    // Check success
    await expect(page.locator('.toast')).toContainText('Версия восстановлена');
  });
  
  test('should compare two versions', async ({ page }) => {
    await page.goto('/templates');
    
    // Open version history
    await page.locator('[data-testid="template-card"]').first().hover();
    await page.locator('[data-testid="more-actions"]').first().click();
    await page.click('text=История версий');
    
    // Select two versions
    await page.locator('[data-testid="version-checkbox"]').nth(0).click();
    await page.locator('[data-testid="version-checkbox"]').nth(1).click();
    
    // Click compare
    await page.click('text=Сравнить версии');
    
    // Check comparison modal
    await expect(page.locator('[data-testid="version-comparison"]')).toBeVisible();
    await expect(page.locator('text=Сравнение версий')).toBeVisible();
  });
});

test.describe('Sprint 5: Duplicate Template', () => {
  test('should duplicate template with custom name', async ({ page }) => {
    await page.goto('/templates');
    
    // Open template menu
    await page.locator('[data-testid="template-card"]').first().hover();
    await page.locator('[data-testid="more-actions"]').first().click();
    
    // Click duplicate
    await page.click('text=Дублировать');
    
    // Fill new name
    await page.fill('[name="name"]', 'Test Template Copy');
    
    // Submit
    await page.click('[data-testid="duplicate-submit"]');
    
    // Check success
    await expect(page.locator('.toast')).toContainText('Шаблон скопирован');
    
    // Check new template in list
    await expect(page.locator('text=Test Template Copy')).toBeVisible();
  });
});

test.describe('Sprint 5: Bulk Operations', () => {
  test('should select multiple templates', async ({ page }) => {
    await page.goto('/templates');
    
    // Select first 3 templates
    await page.locator('[data-testid="template-checkbox"]').nth(0).click();
    await page.locator('[data-testid="template-checkbox"]').nth(1).click();
    await page.locator('[data-testid="template-checkbox"]').nth(2).click();
    
    // Check toolbar appeared
    await expect(page.locator('[data-testid="bulk-actions-toolbar"]')).toBeVisible();
    await expect(page.locator('text=Выбрано: 3')).toBeVisible();
  });
  
  test('should bulk export templates', async ({ page }) => {
    await page.goto('/templates');
    
    // Select templates
    await page.locator('[data-testid="template-checkbox"]').nth(0).click();
    await page.locator('[data-testid="template-checkbox"]').nth(1).click();
    
    // Click export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="bulk-export-button"]');
    const download = await downloadPromise;
    
    // Check downloaded file
    expect(download.suggestedFilename()).toMatch(/templates-\d+\.zip/);
  });
  
  test('should bulk delete templates', async ({ page }) => {
    await page.goto('/templates');
    
    // Select templates
    await page.locator('[data-testid="template-checkbox"]').nth(0).click();
    await page.locator('[data-testid="template-checkbox"]').nth(1).click();
    
    // Click delete
    await page.click('[data-testid="bulk-delete-button"]');
    
    // Confirm
    await page.click('[data-testid="confirm-bulk-delete"]');
    
    // Check success
    await expect(page.locator('.toast')).toContainText('Удалено');
  });
});

test.describe('Sprint 5: Import Template', () => {
  test('should import valid JSON template', async ({ page }) => {
    await page.goto('/templates');
    
    // Click import
    await page.click('text=Импорт');
    
    // Upload file[web:127][web:130]
    await page.setInputFiles(
      'input[type="file"]',
      './tests/fixtures/valid-template.json'
    );
    
    // Wait for preview
    await expect(page.locator('[data-testid="import-preview"]')).toBeVisible();
    
    // Submit import
    await page.click('[data-testid="import-submit"]');
    
    // Check success
    await expect(page.locator('.toast')).toContainText('импортирован');
  });
  
  test('should show validation errors for invalid JSON', async ({ page }) => {
    await page.goto('/templates');
    
    // Click import
    await page.click('text=Импорт');
    
    // Upload invalid file
    await page.setInputFiles(
      'input[type="file"]',
      './tests/fixtures/invalid-template.json'
    );
    
    // Check errors displayed
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
    await expect(page.locator('text=Ошибки валидации')).toBeVisible();
    
    // Submit button disabled
    await expect(page.locator('[data-testid="import-submit"]')).toBeDisabled();
  });
});

test.describe('Sprint 5: Asset Upload', () => {
  test('should upload logo', async ({ page }) => {
    await page.goto('/templates/new');
    
    // Upload logo[web:127]
    await page.setInputFiles(
      '[data-testid="logo-upload-input"]',
      './tests/fixtures/test-logo.png'
    );
    
    // Wait for optimization
    await page.waitForTimeout(2000);
    
    // Check preview displayed
    await expect(page.locator('[data-testid="logo-preview"]')).toBeVisible();
    
    // Check success toast
    await expect(page.locator('.toast')).toContainText('Логотип загружен');
  });
  
  test('should reject oversized file', async ({ page }) => {
    await page.goto('/templates/new');
    
    // Upload large file
    await page.setInputFiles(
      '[data-testid="logo-upload-input"]',
      './tests/fixtures/large-file.png'
    );
    
    // Check error message
    await expect(page.locator('.toast')).toContainText('слишком большой');
  });
});
```

### Unit тесты для критичных функций

```typescript
// __tests__/lib/image-optimization.test.ts
describe('Image Optimization', () => {
  it('should optimize PNG to WebP', async () => {
    const pngFile = new File(['...'], 'test.png', { type: 'image/png' });
    
    const optimized = await optimizeImage(pngFile);
    
    expect(optimized.type).toBe('image/webp');
    expect(optimized.name).toBe('test.webp');
    expect(optimized.size).toBeLessThan(pngFile.size);
  });
  
  it('should not optimize SVG files', async () => {
    const svgFile = new File(['<svg>...</svg>'], 'test.svg', {
      type: 'image/svg+xml',
    });
    
    const result = await optimizeImage(svgFile);
    
    expect(result).toBe(svgFile);
  });
});

// __tests__/lib/template-import-validation.test.ts
describe('Template Import Validation', () => {
  it('should validate correct template JSON', () => {
    const validJSON = {
      version: '1.0',
      name: 'Test Template',
      document_type: 'warranty',
      page_size: 'A4',
      orientation: 'portrait',
      elements: [],
    };
    
    const result = validateImportJSON(validJSON);
    
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });
  
  it('should reject invalid template JSON', () => {
    const invalidJSON = {
      version: '1.0',
      // missing required fields
    };
    
    const result = validateImportJSON(invalidJSON);
    
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### Coverage targets для Sprint 5

```typescript
// jest.config.js
module.exports = {
  coverageThresholds: {
    global: {
      statements: 75,
      branches: 70,
      functions: 75,
      lines: 75,
    },
    // Sprint 5 specific modules
    './lib/image-optimization.ts': {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
    './lib/validation/template-import-schema.ts': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    './hooks/use-template-*.ts': {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};
```

***

[1](https://www.telerik.com/design-system/docs/components/colorpicker/accessibility/)
[2](https://github.com/omgovich/react-colorful)
[3](https://uploadcare.com/blog/react-image-optimization-techniques/)
[4](https://www.dhiwise.com/post/how-to-use-webp-image-in-react-for-better-performance)
[5](https://www.horilla.com/blogs/how-to-implement-drag-and-drop-file-upload-in-react/)
[6](https://imagekit.io/blog/react-image-optimization/)
[7](https://www.checklyhq.com/docs/learn/playwright/testing-file-uploads/)
[8](http://wanago.io/2024/04/22/javascript-testing-e2e-playwright-files/)
[9](https://github.com/cyrilwanner/react-optimized-image)
[10](https://www.identitidesign.com/blog/convert-to-webp/)
[11](https://www.youtube.com/watch?v=BHhhHqW-Voc)
[12](https://venngage.com/tools/accessible-color-palette-generator)

[1](https://designcode.io/ui-design-handbook-sketch-version-control/)
[2](https://www.kaarwan.com/blog/ui-ux-design/benefits-of-using-version-control-in-ui-ux-design?id=394)
[3](https://applitools.com/blog/applitools-introduces-the-worlds-first-ui-version-control/)
[4](https://hacks.mozilla.org/2012/02/creating-thumbnails-with-drag-and-drop-and-html5-canvas/)
[5](https://www.youtube.com/watch?v=JId538COVW4)
[6](https://helios.hashicorp.design/patterns/table-multi-select)
[7](https://uxdesign.cc/the-bulk-experience-7fcca8080f82)
[8](https://rjsf-team.github.io/react-jsonschema-form/docs/usage/validation/)
[9](https://dev.to/kristiandupont/testing-in-production-using-json-schema-for-3rd-party-api-response-validation-46nj)
[10](https://www.horilla.com/blogs/how-to-implement-drag-and-drop-file-upload-in-react/)
[11](https://dev.to/hexshift/implementing-drag-drop-file-uploads-in-react-without-external-libraries-1d31)
[12](https://en.wikipedia.org/wiki/Comparison_of_version-control_software)
[13](https://blog.zeplin.io/design-delivery/UX-design-version-control/)
[14](https://uicollabo.com/en/design-review/)
[15](https://github.com/omgovich/react-colorful)
[16](https://prismic.io/blog/react-component-libraries)
[17](https://stackoverflow.com/questions/76557915/react-json-form-schema-validation)
[18](https://github.com/rjsf-team/react-jsonschema-form/issues/351)
[19](https://www.reddit.com/r/reactjs/comments/1nps9bj/free_visual_json_schema_builder_generate_validate/)
[20](https://habr.com/ru/articles/884862/)