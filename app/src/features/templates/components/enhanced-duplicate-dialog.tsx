import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, FileText, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { templatesSprint5API } from '@/lib/api/templates-sprint5.api';
import { toast } from '@/lib/toast';
import { generateDuplicateName } from '@/lib/utils/template-naming';
import type { Template, DuplicateFormData } from '@/types/template-sprint5.types';

interface EnhancedDuplicateDialogProps {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newTemplate: Template) => void;
}

// Form validation schema
const duplicateFormSchema = z.object({
  name: z.string().min(3, 'Название должно содержать минимум 3 символа').max(100, 'Максимум 100 символов'),
  description: z.string().max(500, 'Максимум 500 символов').optional(),
  include_versions: z.boolean().default(false),
});

type DuplicateFormData = z.infer<typeof duplicateFormSchema>;

export function EnhancedDuplicateDialog({
  template,
  open,
  onOpenChange,
  onSuccess,
}: EnhancedDuplicateDialogProps) {
  const queryClient = useQueryClient();
  const [existingNames, setExistingNames] = useState<string[]>([]);

  // Form setup
  const form = useForm<DuplicateFormData>({
    resolver: zodResolver(duplicateFormSchema),
    defaultValues: {
      name: generateDuplicateName(template.name, existingNames),
      description: template.description || '',
      include_versions: false,
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (data: DuplicateFormData) =>
      templatesSprint5API.duplicate(template.id, {
        name: data.name,
        description: data.description,
        include_versions: data.include_versions,
      }),
    onSuccess: (newTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Шаблон скопирован', `Создана копия: ${newTemplate.name}`);
      onSuccess?.(newTemplate);
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error('Ошибка дублирования', error.message);
    },
  });

  const handleSubmit = (data: DuplicateFormData) => {
    duplicateMutation.mutate(data);
  };

  const handleNameChange = (value: string) => {
    // Generate unique name if needed
    const uniqueName = generateDuplicateName(value, existingNames);
    form.setValue('name', uniqueName);
  };

  // Mock existing names (in real app, this would come from API)
  useState(() => {
    // Simulate existing template names
    const mockNames = [
      'Гарантийный талон',
      'Гарантийный талон (копия)',
      'Гарантийный талон (копия 2)',
      'Инструкция по эксплуатации',
      'Сертификат качества',
    ];
    setExistingNames(mockNames);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Дублировать шаблон
          </DialogTitle>
          <DialogDescription>
            Создайте копию шаблона "{template.name}"
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Template info */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Оригинал:</strong> {template.name}</p>
                  <p><strong>Тип:</strong> {template.document_type}</p>
                  <p><strong>Версий:</strong> {template.version}</p>
                </div>
              </AlertDescription>
            </Alert>

            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название копии</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Введите название для копии"
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Описание для копии шаблона"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Include versions checkbox */}
            <FormField
              control={form.control}
              name="include_versions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Копировать историю версий</FormLabel>
                    <p className="text-sm text-gray-500">
                      Все {template.version} версий будут скопированы
                    </p>
                  </div>
                </FormItem>
              )}
            />

            {/* Warning for large templates */}
            {template.version > 10 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  У этого шаблона много версий ({template.version}). 
                  Копирование может занять некоторое время.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={duplicateMutation.isPending}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={duplicateMutation.isPending}
              >
                {duplicateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Дублирование...
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Дублировать
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Helper function for generating unique duplicate names
export function generateDuplicateName(
  originalName: string,
  existingNames: string[]
): string {
  // Pattern: "Name (copy N)"
  const basePattern = /^(.*?)(?:\s*\(копия(?:\s+(\d+))?\))?$/;
  const match = originalName.match(basePattern);
  
  if (!match) return `${originalName} (копия)`;
  
  const baseName = match[1].trim();
  const currentNumber = match[2] ? parseInt(match[2]) : 0;
  
  // Find next available number
  let nextNumber = currentNumber + 1;
  let candidateName = `${baseName} (копия ${nextNumber})`;
  
  while (existingNames.includes(candidateName)) {
    nextNumber++;
    candidateName = `${baseName} (копия ${nextNumber})`;
  }
  
  return candidateName;
}