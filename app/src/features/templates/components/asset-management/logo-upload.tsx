import { Upload, X, Loader2, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { optimizeImage, validateImageDimensions, type ImageValidationResult } from '@/lib/image-optimization';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils/template-naming';
import type { LogoUploadProps } from '@/types/template-sprint5.types';
import { Label } from '@/components/ui/label';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
};

const RECOMMENDED_DIMENSIONS = {
  minWidth: 100,
  minHeight: 100,
  maxWidth: 2000,
  maxHeight: 2000,
};

export function LogoUpload({
  value,
  onChange,
  onRemove,
  maxSize = MAX_FILE_SIZE,
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [optimizationInfo, setOptimizationInfo] = useState<{
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  } | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setValidationError(null);
    setOptimizationInfo(null);
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Validate file
      const validation = await validateFile(file);
      if (!validation.valid) {
        setValidationError(validation.error || 'Ошибка валидации файла');
        return;
      }
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      // Optimize image
      setUploadProgress(90);
      const optimizedFile = await optimizeImage(file);
      
      // Calculate optimization info
      const compressionRatio = ((file.size - optimizedFile.size) / file.size) * 100;
      setOptimizationInfo({
        originalSize: file.size,
        optimizedSize: optimizedFile.size,
        compressionRatio,
      });
      
      setUploadProgress(100);
      
      // Call onChange with optimized file
      onChange(optimizedFile);
      
      toast.success('Логотип загружен', `Файл оптимизирован: ${compressionRatio.toFixed(1)}%`);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка загрузки логотипа', error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize,
    multiple: false,
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection?.errors[0]?.code === 'file-too-large') {
        toast.error('Файл слишком большой', `Максимум ${formatFileSize(maxSize)}`);
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        toast.error('Неподдерживаемый формат', 'Поддерживаются PNG, JPEG, WebP, SVG');
      } else {
        toast.error('Ошибка загрузки', rejection?.errors[0]?.message || 'Неизвестная ошибка');
      }
    },
  });

  const validateFile = async (file: File): Promise<ImageValidationResult> => {
    // SVG files don't need dimension validation
    if (file.type === 'image/svg+xml') {
      return { valid: true };
    }
    
    // Validate dimensions for raster images
    return validateImageDimensions(file, 
      RECOMMENDED_DIMENSIONS.minWidth,
      RECOMMENDED_DIMENSIONS.minHeight,
      RECOMMENDED_DIMENSIONS.maxWidth,
      RECOMMENDED_DIMENSIONS.maxHeight
    );
  };

  const handleRemove = () => {
    setValidationError(null);
    setOptimizationInfo(null);
    onRemove();
  };

  const formatCompressionRatio = (ratio: number): string => {
    return ratio > 0 ? `-${ratio.toFixed(1)}%` : '0%';
  };

  return (
    <div className="space-y-4">
      <Label>Логотип</Label>
      
      {value ? (
        // Preview existing logo
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <Image
                  src={value}
                  alt="Логотип"
                  className="max-h-32 max-w-full object-contain"
                  width={128}
                  height={128}
                />
              </div>
              
              {/* Remove button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
              
              {/* Optimization info */}
              {optimizationInfo && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Оптимизация завершена</span>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-green-700">
                    <div className="flex justify-between">
                      <span>Оригинал:</span>
                      <span>{formatFileSize(optimizationInfo.originalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Оптимизирован:</span>
                      <span>{formatFileSize(optimizationInfo.optimizedSize)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Сжатие:</span>
                      <span>{formatCompressionRatio(optimizationInfo.compressionRatio)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
        </Card>
      ) : (
        // Upload dropzone
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
            // Uploading state
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Загрузка...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-gray-600">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            // Default state
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="font-medium">
                  {isDragActive
                    ? 'Отпустите файл здесь'
                    : 'Перетащите логотип или нажмите для выбора'
                  }
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPEG, WebP, SVG до {formatFileSize(maxSize)}
                </p>
              </div>
              
              {/* File requirements */}
              <div className="text-xs text-gray-600 space-y-1">
                <p>• Рекомендуемый размер: 100x100 - 500x500px</p>
                <p>• Максимальный размер: 2000x2000px</p>
                <p>• SVG файлы оптимизируются автоматически</p>
                <p>• Изображения конвертируются в WebP для лучшей производительности</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Validation error */}
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      
      {/* General info */}
      <Alert>
        <ImageIcon className="h-4 w-4" />
        <AlertDescription>
          Изображения автоматически оптимизируются и конвертируются в WebP для лучшей производительности
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Helper component for file size display
function FileSizeDisplay({ size }: { size: number }) {
  return <span className="text-xs text-gray-500">{formatFileSize(size)}</span>;
}

// Helper component for image dimensions display
function ImageDimensions({ file }: { file: File }) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  
  useState(() => {
    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    }
  });
  
  if (!dimensions) return null;
  
  return (
    <span className="text-xs text-gray-500">
      {dimensions.width} × {dimensions.height}px
    </span>
  );
}