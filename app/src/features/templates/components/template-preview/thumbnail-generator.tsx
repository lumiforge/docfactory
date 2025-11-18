import { useMutation } from '@tanstack/react-query';
import { Loader2, Download, RefreshCw, Eye } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { templatesSprint5API } from '@/lib/api/templates-sprint5.api';
import { thumbnailService } from '@/lib/thumbnail-service';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import type { Template, ThumbnailOptions } from '@/types/template-sprint5.types';
import { Badge } from '@/components/ui/badge';

interface ThumbnailGeneratorProps {
  template: Template;
  onThumbnailGenerated?: (thumbnailUrl: string) => void;
  className?: string;
}

export function ThumbnailGenerator({
  template,
  onThumbnailGenerated,
  className,
}: ThumbnailGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate thumbnail mutation
  const generateMutation = useMutation({
    mutationFn: (options: ThumbnailOptions) =>
      templatesSprint5API.generateThumbnail(template.id, options),
    onSuccess: (response) => {
      toast.success('Превью сгенерировано');
      onThumbnailGenerated?.(response.thumbnail_url);
      setProgress(100);
    },
    onError: (error) => {
      toast.error('Ошибка генерации превью', error.message);
      setProgress(0);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // Upload custom thumbnail mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      templatesSprint5API.uploadThumbnail(template.id, file),
    onSuccess: (response) => {
      toast.success('Превью загружено');
      onThumbnailGenerated?.(response.thumbnail_url);
    },
    onError: (error) => {
      toast.error('Ошибка загрузки превью', error.message);
    },
  });

  // Client-side thumbnail generation
  const generateClientThumbnail = useCallback(async (
    options: ThumbnailOptions = {}
  ) => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const blob = await thumbnailService.generateFromTemplate(template, {
        width: options.width || 300,
        height: options.height || 424,
        quality: options.quality || 0.8,
        format: options.format || 'image/jpeg',
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Create preview URL
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      // Auto-upload after generation
      const file = new File([blob], `thumbnail-${template.id}.jpg`, {
        type: 'image/jpeg',
      });
      
      await uploadMutation.mutateAsync(file);
    } catch (error) {
      toast.error('Ошибка генерации превью', error.message);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [template, uploadMutation]);

  // Server-side thumbnail generation
  const generateServerThumbnail = useCallback((options: ThumbnailOptions = {}) => {
    setIsGenerating(true);
    setProgress(0);
    
    generateMutation.mutate(options);
  }, [generateMutation]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Неверный формат файла', 'Поддерживаются только изображения');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл слишком большой', 'Максимум 5MB');
      return;
    }

    uploadMutation.mutate(file);
  }, [uploadMutation]);

  const isProcessing = isGenerating || generateMutation.isPending || uploadMutation.isPending;

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Превью шаблона</h3>
            <Badge variant="outline">
              {template.version > 1 ? `v${template.version}` : 'Текущая'}
            </Badge>
          </div>

          {/* Current thumbnail */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Текущее превью:</p>
            <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              {template.thumbnail_url ? (
                <Image
                  src={template.thumbnail_url}
                  alt={`Превью ${template.name}`}
                  className="w-full h-full object-contain"
                  width={300}
                  height={192}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Нет превью</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generated preview */}
          {previewUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Новое превью:</p>
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Новое превью"
                  className="w-full h-full object-contain"
                  width={300}
                  height={192}
                />
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {generateMutation.isPending ? 'Генерация на сервере...' : 'Генерация...'}
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Generation options */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateClientThumbnail({ width: 300, height: 424 })}
                disabled={isProcessing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Генерировать
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => generateServerThumbnail({ width: 600, height: 848 })}
                disabled={isProcessing}
              >
                <Download className="h-4 w-4 mr-2" />
                Высокое качество
              </Button>
            </div>

            {/* File upload */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="thumbnail-upload"
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={isProcessing}
              >
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <Download className="h-4 w-4 mr-2" />
                  Загрузить изображение
                </label>
              </Button>
              
              <span className="text-xs text-gray-500">
                PNG, JPEG, WebP до 5MB
              </span>
            </div>
          </div>

          {/* Info */}
          <Alert>
            <AlertDescription className="text-sm">
              Превью автоматически генерируется из содержимого шаблона. 
              Вы также можете загрузить собственное изображение.
            </AlertDescription>
          </Alert>
        </div>

        {/* Hidden canvas for client-side generation */}
        <canvas
          ref={canvasRef}
          className="hidden"
          width={300}
          height={424}
        />
      </CardContent>
    </Card>
  );
}

// Thumbnail sizes preset component
interface ThumbnailSizesProps {
  onSizeSelect: (size: keyof ThumbnailSizes) => void;
  disabled?: boolean;
}

export function ThumbnailSizes({ onSizeSelect, disabled }: ThumbnailSizesProps) {
  const sizes = {
    card: { label: 'Карточка', size: '300x424' },
    small: { label: 'Маленькое', size: '150x212' },
    large: { label: 'Большое', size: '600x848' },
  } as const;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Размеры превью:</p>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(sizes).map(([key, { label, size }]) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => onSizeSelect(key as keyof typeof sizes)}
            disabled={disabled}
            className="text-xs"
          >
            <div className="text-center">
              <div>{label}</div>
              <div className="text-gray-500">{size}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

// Thumbnail preview component
interface ThumbnailPreviewProps {
  template: Template;
  size?: 'card' | 'small' | 'large';
  className?: string;
}

export function ThumbnailPreview({
  template,
  size = 'card',
  className,
}: ThumbnailPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeConfig = {
    card: { width: 300, height: 424 },
    small: { width: 150, height: 212 },
    large: { width: 600, height: 848 },
  }[size];

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className="bg-gray-100 rounded-lg overflow-hidden"
        style={{
          width: sizeConfig.width,
          height: sizeConfig.height,
        }}
      >
        {template.thumbnail_url ? (
          <Image
            src={template.thumbnail_url}
            alt={`Превью ${template.name}`}
            className={cn(
              'w-full h-full object-contain transition-opacity',
              isLoading && 'opacity-0'
            )}
            width={sizeConfig.width}
            height={sizeConfig.height}
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Eye className="h-8 w-8" />
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && template.thumbnail_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-red-500">
              <p className="text-sm">Ошибка загрузки</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Size badge */}
      <Badge
        variant="outline"
        className="absolute top-2 right-2 text-xs"
      >
        {size}
      </Badge>
    </div>
  );
}