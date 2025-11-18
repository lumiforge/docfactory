import { useState, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import 'react-colorful/dist/index.css';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ColorPickerProps } from '@/types/template-sprint5.types';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Default color presets
const DEFAULT_COLOR_PRESETS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00',
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#808080', '#C0C0C0', '#800000', '#808000',
  '#008000', '#800080', '#008080', '#000080',
];

// Recent colors storage keys
const RECENT_COLORS_KEY = 'recent-colors';
const MAX_RECENT_COLORS = 8;

export function ColorPicker({
  value,
  onChange,
  presets = DEFAULT_COLOR_PRESETS,
  label,
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(RECENT_COLORS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load recent colors:', error);
      return [];
    }
  });

  // Save color to recent colors
  const saveRecentColor = (color: string) => {
    try {
      const updated = [color, ...recentColors.filter(c => c !== color)].slice(0, MAX_RECENT_COLORS);
      setRecentColors(updated);
      localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save recent color:', error);
    }
  };

  const handleColorChange = (color: string) => {
    onChange(color);
    saveRecentColor(color);
  };

  const handlePresetClick = (preset: string) => {
    handleColorChange(preset);
  };

  const handleRecentColorClick = (color: string) => {
    handleColorChange(color);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="color-picker" className="text-sm font-medium">
          {label}
        </Label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="color-picker"
            variant="outline"
            className="w-full justify-start h-10"
            role="combobox"
            aria-expanded={isOpen}
            aria-label={`Выбрать цвет. Текущий цвет: ${value}`}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded border border-gray-300"
                style={{ backgroundColor: value }}
              />
              <span className="font-mono text-sm">{value}</span>
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-3" align="start" sideOffset={4}>
          <div className="space-y-4">
            {/* Color picker */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Выбор цвета</Label>
              <HexColorPicker 
                color={value} 
                onChange={handleColorChange}
                className="w-full"
              />
            </div>
            
            {/* Hex input */}
            <div className="space-y-2">
              <Label htmlFor="hex-input" className="text-xs font-medium">
                HEX код
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">#</span>
                <HexColorInput
                  id="hex-input"
                  color={value}
                  onChange={handleColorChange}
                  className="flex-1 px-2 py-1 border rounded text-sm font-mono"
                  prefixed={false}
                  aria-label="Введите HEX код цвета"
                />
              </div>
            </div>
            
            {/* Color presets */}
            {presets.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Быстрый выбор</Label>
                <div className="grid grid-cols-8 gap-1">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={cn(
                        "h-6 w-6 rounded border border-gray-300 hover:scale-110 transition-transform",
                        value === preset && "ring-2 ring-blue-500 ring-offset-1"
                      )}
                      style={{ backgroundColor: preset }}
                      onClick={() => handlePresetClick(preset)}
                      aria-label={`Выбрать цвет ${preset}`}
                      title={preset}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Recent colors */}
            {recentColors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium">Недавние цвета</Label>
                <div className="grid grid-cols-8 gap-1">
                  {recentColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "h-6 w-6 rounded border border-gray-300 hover:scale-110 transition-transform",
                        value === color && "ring-2 ring-blue-500 ring-offset-1"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => handleRecentColorClick(color)}
                      aria-label={`Выбрать недавний цвет ${color}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Color info */}
            <div className="pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>RGB:</span>
                  <span className="font-mono">
                    {hexToRgb(value)?.r}, {hexToRgb(value)?.g}, {hexToRgb(value)?.b}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>HSL:</span>
                  <span className="font-mono">
                    {hexToHsl(value)?.h}°, {hexToHsl(value)?.s}%, {hexToHsl(value)?.l}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Helper functions for color conversion
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Color validation utilities
export const colorUtils = {
  isValidHex: (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
  },
  
  getContrastColor: (hex: string): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return '#000000';
    
    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
  },
  
  getLighterShade: (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = 1 + percent / 100;
    const r = Math.min(255, Math.round(rgb.r * factor));
    const g = Math.min(255, Math.round(rgb.g * factor));
    const b = Math.min(255, Math.round(rgb.b * factor));
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },
  
  getDarkerShade: (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    
    const factor = 1 - percent / 100;
    const r = Math.max(0, Math.round(rgb.r * factor));
    const g = Math.max(0, Math.round(rgb.g * factor));
    const b = Math.max(0, Math.round(rgb.b * factor));
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  },
};

// Preset color palettes for different use cases
export const colorPalettes = {
  primary: [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
  ],
  neutral: [
    '#F9FAFB', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151'
  ],
  brand: [
    '#0052CC', '#0066FF', '#3385FF', '#6699FF', '#99BBFF', '#CCE0FF'
  ],
  success: [
    '#064E3B', '#047857', '#059669', '#10B981', '#34D399', '#6EE7B7'
  ],
  warning: [
    '#78350F', '#92400E', '#B45309', '#D97706', '#F59E0B', '#FCD34D'
  ],
  error: [
    '#7F1D1D', '#991B1B', '#B91C1C', '#DC2626', '#EF4444', '#F87171'
  ],
};