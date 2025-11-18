import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  X,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { templatesSprint5API } from '@/lib/api/templates-sprint5.api';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { generateImportName, formatFileSize } from '@/lib/utils/template-naming';
import { validateImportJSON } from '@/lib/validation/template-import-schema';
import type { 
  TemplateImportData, 
  ImportState, 
  ImportOptions,
  ImportValidationResult 
} from '@/types/template-sprint5.types';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// Form validation schema
const importFormSchema = z.object({
  conflictStrategy: z.enum(['skip', 'replace', 'rename']).default('rename'),
});

type ImportFormData = z.infer<typeof importFormSchema>;

interface TemplateImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess?: (template: any) => void;
}

export function TemplateImportDialog({
  open,
  onOpenChange,
  onImportSuccess,
}: TemplateImportDialogProps) {
  const queryClient = useQueryClient();
  const [importState, setImportState] = useState<ImportState>({
    file: null,
    previewData: null,
    validationErrors: [],
    conflictStrategy: 'rename',
  });

  const form = useForm<ImportFormData>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      conflictStrategy: 'rename',
    },
  });

  // Validate import mutation
  const validateMutation = useMutation({
    mutationFn: (data: TemplateImportData) =>
      templatesSprint5API.validateImport(data),
    onSuccess: (result: ImportValidationResult) => {
      if (result.valid) {
        setImportState(prev => ({
          ...prev,
          validationErrors: [],
        }));
      } else {
        setImportState(prev => ({
          ...prev,
          validationErrors: result.errors.map(err => err.message),
        }));
      }
    },
    onError: (error) => {
      toast.error('Ошибка валидации', error.message);
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: (data: { templateData: TemplateImportData; options: ImportOptions }) =>
      templatesSprint5API.importTemplate(data.templateData, data.options),
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон импортирован', newTemplate.name);
      onImportSuccess?.(newTemplate);
      onOpenChange(false);
      resetImportState();
    },
    onError: (error) => {
      toast.error('Ошибка импорта', error.message);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate file type
    if (file.type !== 'application/json') {
      toast.error('Неверный формат файла', 'Поддерживаются только JSON файлы');
      return;
    }
    
    try {
      // Read and parse JSON
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Validate import data
      const validation = validateImportJSON(jsonData);
      
      if (validation.success) {
        setImportState({
          file,
          previewData: validation.data,
          validationErrors: [],
          conflictStrategy: 'rename',
        });
        
        // Auto-validate with backend
        validateMutation.mutate(validation.data);
      } else {
        setImportState({
          file,
          previewData: null,
          validationErrors: validation.errors?.map(err => `${err.path}: ${err.message}`) || [],
          conflictStrategy: 'rename',
        });
      }
    } catch (error) {
      toast.error('Ошибка чтения файла', 'Невалидный JSON файл');
    }
  }, [validateMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection?.errors[0]?.code === 'file-too-large') {
        toast.error('Файл слишком большой', 'Максимум 10MB');
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        toast.error('Неподдерживаемый формат', 'Поддерживаются только JSON файлы');
      }
    },
  });

  const handleImport = () => {
    if (!importState.previewData) return;
    
    const options: ImportOptions = {
      conflict_strategy: form.getValues('conflictStrategy'),
    };
    
    importMutation.mutate({
      templateData: importState.previewData,
      options,
    });
  };

  const resetImportState = () => {
    setImportState({
      file: null,
      previewData: null,
      validationErrors: [],
      conflictStrategy: 'rename',
    });
    form.reset();
  };

  const handleClose = () => {
    resetImportState();
    onOpenChange(false);
  };

  const isValid = importState.previewData && importState.validationErrors.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Импорт шаблона
          </DialogTitle>
          <DialogDescription>
            Загрузите JSON файл с экспортированным шаблоном
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!importState.file ? (
            // File upload area
            <div className="p-6">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                )}
              >
                <input {...getInputProps()} />
                
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {isDragActive
                        ? 'Отпустите JSON файл здесь'
                        : 'Перетащите JSON файл или нажмите для выбора'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Максимальный размер: 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Preview and validation
            <div className="flex h-full">
              {/* Left panel - File info and validation */}
              <div className="w-1/3 border-r p-6 space-y-4">
                {/* File info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {importState.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(importState.file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetImportState}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Validation status */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {isValid ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-700">
                              Валидация пройдена
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-700">
                              Ошибки валидации
                            </span>
                          </>
                        )}
                      </div>
                      
                      {importState.validationErrors.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-red-700">
                            Найдено ошибок: {importState.validationErrors.length}
                          </p>
                          <ScrollArea className="h-32">
                            <div className="space-y-1">
                              {importState.validationErrors.map((error, index) => (
                                <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                  {error}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Conflict strategy */}
                {isValid && (
                  <Card>
                    <CardContent className="p-4">
                      <Form {...form}>
                        <FormField
                          control={form.control}
                          name="conflictStrategy"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Если шаблон с таким именем уже существует:</FormLabel>
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="space-y-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="rename" id="rename" />
                                  <Label htmlFor="rename" className="text-sm">
                                    Переименовать новый шаблон (добавить &quot;(импорт)&quot;)
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="skip" id="skip" />
                                  <Label htmlFor="skip" className="text-sm">
                                    Пропустить импорт
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="replace" id="replace" />
                                  <Label htmlFor="replace" className="text-sm">
                                    Заменить существующий шаблон
                                  </Label>
                                </div>
                              </RadioGroup>
                            </FormItem>
                          )}
                        />
                      </Form>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right panel - Preview */}
              <div className="flex-1 p-6">
                {importState.previewData ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Предпросмотр</h3>
                    
                    {/* Template info */}
                    <Card>
                      <CardContent className="p-4">
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Название:</dt>
                            <dd className="text-sm font-semibold">
                              {importState.previewData.name}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Тип:</dt>
                            <dd className="text-sm">
                              <Badge variant="outline">
                                {importState.previewData.document_type}
                              </Badge>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Размер страницы:</dt>
                            <dd className="text-sm">
                              {importState.previewData.page_size} ({importState.previewData.orientation})
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm font-medium text-gray-600">Элементов:</dt>
                            <dd className="text-sm">
                              {importState.previewData.elements?.length || 0}
                            </dd>
                          </div>
                          {importState.previewData.assets && (
                            <div>
                              <dt className="text-sm font-medium text-gray-600">Ассетов:</dt>
                              <dd className="text-sm">
                                {importState.previewData.assets.length}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </CardContent>
                    </Card>

                    {/* Elements preview */}
                    {importState.previewData.elements && importState.previewData.elements.length > 0 && (
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-3">Элементы шаблона</h4>
                          <ScrollArea className="h-48">
                            <div className="space-y-2">
                              {importState.previewData.elements.slice(0, 10).map((element, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                  <Badge variant="outline" className="text-xs">
                                    {element.type}
                                  </Badge>
                                  <span className="text-sm truncate">
                                    {element.data?.content || `Элемент ${index + 1}`}
                                  </span>
                                </div>
                              ))}
                              {importState.previewData.elements.length > 10 && (
                                <div className="text-sm text-gray-500 text-center p-2">
                                  ... и еще {importState.previewData.elements.length - 10} элементов
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto mb-4" />
                      <p>Предпросмотр недоступен</p>
                      <p className="text-sm">Исправьте ошибки валидации</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-4 border-t">
          <div className="text-sm text-gray-600">
            {importState.file && (
              <span>Файл: {importState.file.name}</span>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={importMutation.isPending}
            >
              Отмена
            </Button>
            
            <Button
              onClick={handleImport}
              disabled={!isValid || importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Импорт...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Импортировать
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
