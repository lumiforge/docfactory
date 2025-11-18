// @ts-ignore - Temporary fix for missing types
import imageCompression from 'browser-image-compression';
import type { ImageOptimizationOptions, ImageValidationResult } from '@/types/template-sprint5.types';

/**
 * Оптимизация изображений перед загрузкой
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  // SVG не требует оптимизации
  if (file.type === 'image/svg+xml') {
    return file;
  }
  
  const defaultOptions = {
    maxSizeMB: 1, // Максимум 1MB
    maxWidthOrHeight: 1920, // Максимальные размеры
    useWebWorker: true,
    fileType: 'image/webp', // Конвертация в WebP
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  try {
    const compressed = await imageCompression(file, finalOptions);
    
    // Создаем новый File с правильным именем
    const originalName = file.name.replace(/\.[^/.]+$/, '');
    const extension = finalOptions.fileType?.split('/')[1] || 'webp';
    
    return new File(
      [compressed],
      `${originalName}.${extension}`,
      { type: finalOptions.fileType || 'image/webp' }
    );
  } catch (error) {
    console.error('Image optimization failed:', error);
    // Fallback to original
    return file;
  }
}

/**
 * Генерация thumbnail из изображения
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
): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    // SVG files don't need dimension validation
    if (file.type === 'image/svg+xml') {
      resolve({ valid: true });
      return;
    }
    
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
      
      img.onerror = () => {
        resolve({
          valid: false,
          error: 'Не удалось загрузить изображение',
        });
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      resolve({
        valid: false,
        error: 'Не удалось прочитать файл',
      });
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Получение информации об изображении
 */
export async function getImageInfo(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
}> {
  return new Promise((resolve, reject) => {
    const info = {
      width: 0,
      height: 0,
      size: file.size,
      type: file.type,
    };
    
    // For SVG files, we can't get dimensions easily
    if (file.type === 'image/svg+xml') {
      resolve(info);
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          ...info,
          width: img.width,
          height: img.height,
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Конвертация файла в WebP
 */
export async function convertToWebP(file: File): Promise<File> {
  if (file.type === 'image/webp') {
    return file;
  }
  
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.webp'),
              { type: 'image/webp' }
            );
            resolve(webpFile);
          } else {
            reject(new Error('Failed to convert to WebP'));
          }
        },
        'image/webp',
        0.8
      );
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Проверка поддержки WebP в браузере
 */
export function isWebPSupported(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Создание preview URL для файла
 */
export function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Очистка URL.createObjectURL
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

// Константы для оптимизации
export const OPTIMIZATION_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  THUMBNAIL_MAX_WIDTH: 300,
  THUMBNAIL_QUALITY: 0.8,
  WEBP_QUALITY: 0.8,
  JPEG_QUALITY: 0.85,
  
  // Рекомендуемые размеры для логотипов
  LOGO: {
    MIN_WIDTH: 100,
    MIN_HEIGHT: 100,
    MAX_WIDTH: 500,
    MAX_HEIGHT: 500,
    IDEAL_WIDTH: 200,
    IDEAL_HEIGHT: 200,
  },
  
  // Рекомендуемые размеры для изображений
  IMAGE: {
    MIN_WIDTH: 200,
    MIN_HEIGHT: 200,
    MAX_WIDTH: 2000,
    MAX_HEIGHT: 2000,
  },
  
  // Поддерживаемые форматы
  SUPPORTED_FORMATS: {
    INPUT: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'],
    OUTPUT: ['image/webp', 'image/jpeg', 'image/png'],
  },
} as const;

// Утилиты для работы с цветами изображений
export const imageColorUtils = {
  /**
   * Получение доминантного цвета изображения
   */
  getDominantColor: (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Simple color averaging
        let r = 0, g = 0, b = 0;
        const pixelCount = data.length / 4;
        
        for (let i = 0; i < data.length; i += 4) {
          r += data[i] || 0;
          g += data[i + 1] || 0;
          b += data[i + 2] || 0;
        }
        
        r = Math.floor(r / pixelCount);
        g = Math.floor(g / pixelCount);
        b = Math.floor(b / pixelCount);
        
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        resolve(hex);
      };
      
      img.src = URL.createObjectURL(file);
    });
  },
  
  /**
   * Проверка контрастности цвета с фоном
   */
  getContrastRatio: (color1: string, color2: string): number => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 1;
    
    // Calculate relative luminance
    const luminance1 = (0.299 * rgb1.r + 0.587 * rgb1.g + 0.114 * rgb1.b) / 255;
    const luminance2 = (0.299 * rgb2.r + 0.587 * rgb2.g + 0.114 * rgb2.b) / 255;
    
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },
};

// Helper function
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1] || '', 16),
    g: parseInt(result[2] || '', 16),
    b: parseInt(result[3] || '', 16)
  } : null;
}