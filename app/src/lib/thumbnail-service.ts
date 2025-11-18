import type { TemplateElement, ThumbnailOptions } from '@/types/template-sprint5.types';
import type { Template, PageSize, Orientation } from '@/types/template.types';

export class ThumbnailService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Generate thumbnail from template JSON schema
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

    // Set canvas dimensions
    this.canvas.width = width;
    this.canvas.height = height;

    try {
      // Load JSON schema (in real implementation, this would fetch from template.json_schema_url)
      const schema = await this.loadSchema(template.json_schema_url);
      
      // Render template to canvas
      await this.renderTemplateToCanvas(schema, width, height);
      
      // Convert to blob
      return new Promise((resolve, reject) => {
        this.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate blob'));
            }
          },
          format,
          quality
        );
      });
    } catch (error) {
      // Fallback to placeholder
      this.renderPlaceholder(0, 0, width, height, template.name);
      return new Promise((resolve) => {
        this.canvas.toBlob(
          (blob) => resolve(blob!),
          format,
          quality
        );
      });
    }
  }

  /**
   * Render template elements to canvas
   */
  private async renderTemplateToCanvas(
    schema: any,
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    // Clear canvas
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate scale factor
    const pageWidth = this.getPageWidth(schema.page_size);
    const pageHeight = this.getPageHeight(schema.page_size);
    
    let scaleX = canvasWidth / pageWidth;
    let scaleY = canvasHeight / pageHeight;
    
    // Swap for landscape
    if (schema.orientation === 'landscape') {
      [scaleX, scaleY] = [scaleY, scaleX];
    }
    
    const scale = Math.min(scaleX, scaleY);

    // Render each element
    if (schema.elements && Array.isArray(schema.elements)) {
      for (const element of schema.elements) {
        await this.renderElement(element, scale);
      }
    }
  }

  /**
   * Render individual element
   */
  private async renderElement(
    element: TemplateElement,
    scale: number
  ): Promise<void> {
    const x = element.position.x * scale;
    const y = element.position.y * scale;
    const width = element.size.width * scale;
    const height = element.size.height * scale;

    // Apply rotation if needed
    if (element.rotation !== 0) {
      this.ctx.save();
      this.ctx.translate(x + width / 2, y + height / 2);
      this.ctx.rotate((element.rotation * Math.PI) / 180);
      this.ctx.translate(-(x + width / 2), -(y + height / 2));
    }

    // Apply styles
    this.applyElementStyles(element.style);

    switch (element.type) {
      case 'text':
        this.renderText(element, x, y, scale);
        break;
      case 'image':
        await this.renderImage(element, x, y, width, height);
        break;
      case 'qr_code':
        this.renderQRCode(element, x, y, width, height);
        break;
      case 'shape':
        this.renderShape(element, x, y, width, height);
        break;
      case 'dynamic_field':
        this.renderDynamicField(element, x, y, width, height, scale);
        break;
      case 'table':
        this.renderTable(element, x, y, width, height, scale);
        break;
    }

    // Restore rotation state
    if (element.rotation !== 0) {
      this.ctx.restore();
    }
  }

  /**
   * Apply element styles to canvas context
   */
  private applyElementStyles(style: any): void {
    if (!style) return;

    // Text styles
    if (style.font) {
      this.ctx.font = `${style.bold ? 'bold' : 'normal'} ${style.italic ? 'italic' : ''} ${style.size || 12}px ${style.font}`;
    }
    if (style.color) {
      this.ctx.fillStyle = style.color;
    }
    if (style.align) {
      this.ctx.textAlign = style.align as CanvasTextAlign;
    }

    // Border styles
    if (style.borderColor) {
      this.ctx.strokeStyle = style.borderColor;
    }
    if (style.borderWidth) {
      this.ctx.lineWidth = style.borderWidth;
    }

    // Background
    if (style.backgroundColor) {
      this.ctx.fillStyle = style.backgroundColor;
    }

    // Shadow
    if (style.shadowColor) {
      this.ctx.shadowColor = style.shadowColor;
      this.ctx.shadowBlur = style.shadowBlur || 0;
      this.ctx.shadowOffsetX = style.shadowOffsetX || 0;
      this.ctx.shadowOffsetY = style.shadowOffsetY || 0;
    }
  }

  /**
   * Render text element
   */
  private renderText(
    element: TemplateElement,
    x: number,
    y: number,
    scale: number
  ): void {
    const fontSize = (element.style?.size || 12) * scale;
    const content = element.data?.content || 'Text';
    
    this.ctx.font = `${element.style?.bold ? 'bold' : 'normal'} ${element.style?.italic ? 'italic' : ''} ${fontSize}px ${element.style?.font || 'Arial'}`;
    this.ctx.fillStyle = element.style?.color || '#000000';
    this.ctx.textAlign = (element.style?.align || 'left') as CanvasTextAlign;
    
    // Handle multiline text
    const lines = content.split('\n');
    const lineHeight = fontSize * 1.2;
    
    lines.forEach((line: string, index: number) => {
      this.ctx.fillText(line, x, y + fontSize + (index * lineHeight));
    });
  }

  /**
   * Render image element
   */
  private async renderImage(
    element: TemplateElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<void> {
    try {
      const imageUrl = element.data?.url || element.data?.asset_url;
      if (!imageUrl) {
        this.renderPlaceholder(x, y, width, height, 'IMG');
        return;
      }

      const img = await this.loadImage(imageUrl);
      this.ctx.drawImage(img, x, y, width, height);
    } catch (error) {
      // Fallback to placeholder
      this.renderPlaceholder(x, y, width, height, 'IMG');
    }
  }

  /**
   * Render QR code element
   */
  private renderQRCode(
    element: TemplateElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    // For now, render a placeholder
    this.renderPlaceholder(x, y, width, height, 'QR');
  }

  /**
   * Render shape element
   */
  private renderShape(
    element: TemplateElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const shape = element.data?.shape || 'rectangle';
    
    this.ctx.strokeStyle = element.style?.borderColor || '#000000';
    this.ctx.lineWidth = element.style?.borderWidth || 1;
    
    if (element.style?.backgroundColor) {
      this.ctx.fillStyle = element.style.backgroundColor;
    }

    switch (shape) {
      case 'rectangle':
        if (element.style?.backgroundColor) {
          this.ctx.fillRect(x, y, width, height);
        }
        this.ctx.strokeRect(x, y, width, height);
        break;
        
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, 2 * Math.PI);
        if (element.style?.backgroundColor) {
          this.ctx.fill();
        }
        this.ctx.stroke();
        break;
        
      case 'triangle':
        this.ctx.beginPath();
        this.ctx.moveTo(x + width / 2, y);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.closePath();
        if (element.style?.backgroundColor) {
          this.ctx.fill();
        }
        this.ctx.stroke();
        break;
        
      case 'line':
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.stroke();
        break;
        
      default:
        this.renderPlaceholder(x, y, width, height, 'SHAPE');
    }
  }

  /**
   * Render dynamic field element
   */
  private renderDynamicField(
    element: TemplateElement,
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number
  ): void {
    // Render as a bordered text field
    this.ctx.strokeStyle = '#007acc';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.setLineDash([]);
    
    // Render field name
    const fieldName = element.data?.field_name || 'Field';
    const fontSize = 10 * scale;
    
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = '#007acc';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(fieldName, x + width / 2, y + height / 2);
  }

  /**
   * Render table element
   */
  private renderTable(
    element: TemplateElement,
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number
  ): void {
    const rows = element.data?.rows || 3;
    const columns = element.data?.columns || 3;
    
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    
    this.ctx.strokeStyle = element.data?.style?.border_color || '#000000';
    this.ctx.lineWidth = element.data?.style?.border_width || 1;
    
    // Draw grid
    for (let i = 0; i <= rows; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, y + (i * cellHeight));
      this.ctx.lineTo(x + width, y + (i * cellHeight));
      this.ctx.stroke();
    }
    
    for (let j = 0; j <= columns; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + (j * cellWidth), y);
      this.ctx.lineTo(x + (j * cellWidth), y + height);
      this.ctx.stroke();
    }
  }

  /**
   * Render placeholder for missing content
   */
  private renderPlaceholder(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string = 'PLACEHOLDER'
  ): void {
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(x, y, width, height);
    
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);
    
    this.ctx.fillStyle = '#666666';
    this.ctx.font = `${Math.min(width, height) / 3}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(label, x + width / 2, y + height / 2);
  }

  /**
   * Load image from URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Load template schema from URL
   */
  private async loadSchema(url: string): Promise<any> {
    // In a real implementation, this would fetch from the URL
    // For now, return a mock schema
    return {
      page_size: 'A4',
      orientation: 'portrait',
      elements: [],
    };
  }

  /**
   * Get page width in mm
   */
  private getPageWidth(pageSize: PageSize): number {
    const sizes = { A4: 210, A5: 148, Letter: 216 };
    return sizes[pageSize];
  }

  /**
   * Get page height in mm
   */
  private getPageHeight(pageSize: PageSize): number {
    const sizes = { A4: 297, A5: 210, Letter: 279 };
    return sizes[pageSize];
  }
}

// Singleton instance
export const thumbnailService = new ThumbnailService();

// Thumbnail size presets
export const THUMBNAIL_SIZES = {
  card: {
    width: 300,
    height: 424, // A4: 210x297mm → ratio 1:1.414
    quality: 0.8,
  },
  
  small: {
    width: 150,
    height: 212,
    quality: 0.7,
  },
  
  large: {
    width: 600,
    height: 848,
    quality: 0.9,
  },
} as const;

export type ThumbnailSizeKey = keyof typeof THUMBNAIL_SIZES;