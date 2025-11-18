import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DOCUMENT_TYPES } from '@/constants/document-types';
import { LABELS } from '@/constants/labels';
import { templatesSprint5API } from '@/lib/api/templates-sprint5.api';
import { templateSchema } from '@/schemas/template.schema';
import type {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  DocumentType,
  PageSize,
  Orientation
} from '@/types/template.types';
import { useCreateTemplate, useUpdateTemplate } from '../hooks/use-template-mutations';
import { useTemplate } from '../hooks/use-templates';
import { ColorPicker } from './asset-management/color-picker';
import { LogoUpload } from './asset-management/logo-upload';

interface TemplateFormProps {
  templateId?: string; // If provided, form is in edit mode
  onSuccess?: (template: Template) => void;
  onCancel?: () => void;
}

// Form schema with validation
const formSchema = templateSchema;

export function TemplateForm({ templateId, onSuccess, onCancel }: TemplateFormProps) {
  const router = useRouter();
  const isEdit = !!templateId;
  
  // Sprint 5 state
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#666666');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  
  // Fetch template for edit mode
  const { data: template, isLoading: isLoadingTemplate } = useTemplate(templateId || '');
  
  // Mutations
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();
  
  const isLoading = createMutation.isPending || updateMutation.isPending || isUploadingLogo;

  // Form setup
  const form = useForm<CreateTemplateDto>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      document_type: DocumentType.WARRANTY,
      page_size: PageSize.A4,
      orientation: Orientation.PORTRAIT,
    },
  });

  // Populate form when template data is loaded (edit mode)
  useEffect(() => {
    if (template && isEdit) {
      form.reset({
        name: template.name,
        description: template.description || '',
        document_type: template.document_type,
        page_size: template.page_size,
        orientation: template.orientation,
      });
      
      // Load Sprint 5 specific data
      setPrimaryColor((template as any).primary_color || '#000000');
      setSecondaryColor((template as any).secondary_color || '#666666');
      setLogoUrl((template as any).logo_url || null);
    }
  }, [template, isEdit, form]);

  // Handle logo upload
  const handleLogoUpload = async (file: File) => {
    if (!templateId && !isEdit) {
      // For new templates, we'll store the file locally and upload after creation
      setLogoFile(file);
      return;
    }

    setIsUploadingLogo(true);
    try {
      const response = await templatesSprint5API.uploadAsset(templateId!, file, 'logo');
      setLogoUrl(response.url);
      setLogoFile(null);
    } catch (error) {
      console.error('Logo upload failed:', error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoRemove = () => {
    setLogoUrl(null);
    setLogoFile(null);
  };

  // Handle form submission
  const onSubmit = async (data: CreateTemplateDto) => {
    try {
      let result: Template;
      
      // Enhanced data with Sprint 5 fields
      const enhancedData = {
        ...data,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      } as any;
      
      if (isEdit && templateId) {
        result = await updateMutation.mutateAsync({ id: templateId, data: enhancedData });
      } else {
        result = await createMutation.mutateAsync(enhancedData);
        
        // Upload logo for new template
        if (logoFile) {
          await handleLogoUpload(logoFile);
        }
      }
      
      onSuccess?.(result);
      
      // Redirect to editor after successful creation/update
      router.push(`/dashboard/editor/${result.id}`);
    } catch (error) {
      // Error is handled by mutations
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEdit ? LABELS.templates.editTitle : LABELS.templates.createTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LABELS.templates.name} *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={LABELS.templates.namePlaceholder}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{LABELS.templates.description}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={LABELS.templates.descriptionPlaceholder}
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Document Type */}
              <FormField
                control={form.control}
                name="document_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{LABELS.templates.type} *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={LABELS.templates.selectType} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(DocumentType).map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center gap-2">
                              <div 
                                className={`w-3 h-3 rounded-full bg-${DOCUMENT_TYPES[type].color}-500`}
                              />
                              {DOCUMENT_TYPES[type].label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Page Size */}
              <FormField
                control={form.control}
                name="page_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{LABELS.templates.pageSize} *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={LABELS.templates.selectPageSize} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PageSize.A4}>A4</SelectItem>
                        <SelectItem value={PageSize.A5}>A5</SelectItem>
                        <SelectItem value={PageSize.LETTER}>Letter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Orientation */}
              <FormField
                control={form.control}
                name="orientation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{LABELS.templates.orientation} *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={LABELS.templates.selectOrientation} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={Orientation.PORTRAIT}>
                          {LABELS.templates.portrait}
                        </SelectItem>
                        <SelectItem value={Orientation.LANDSCAPE}>
                          {LABELS.templates.landscape}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sprint 5: Branding Section */}
            <div className="space-y-6 pt-6 border-t">
              <h3 className="text-lg font-medium">Брендинг</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Upload */}
                <div>
                  <LogoUpload
                    value={logoUrl}
                    onChange={handleLogoUpload}
                    onRemove={handleLogoRemove}
                  />
                </div>
                
                {/* Color Pickers */}
                <div className="space-y-4">
                  <ColorPicker
                    value={primaryColor}
                    onChange={setPrimaryColor}
                    label="Основной цвет"
                  />
                  
                  <ColorPicker
                    value={secondaryColor}
                    onChange={setSecondaryColor}
                    label="Дополнительный цвет"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {LABELS.common.cancel}
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={isLoading || isLoadingTemplate}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? LABELS.templates.update : LABELS.templates.create}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}