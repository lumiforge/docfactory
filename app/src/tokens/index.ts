import {
  referenceColors as colorsReference,
  semanticTokens as colorsSemantic,
  componentTokens as colorsComponent
} from './colors.tokens';
import {
  referenceSpacing as spacingReference,
  semanticTokens as spacingSemantic
} from './spacing.tokens';
import {
  referenceFonts as typographyReference,
  semanticTokens as typographySemantic
} from './typography.tokens';

// Re-export commonly used tokens for convenience
export const tokens = {
  colors: {
    primary: '#268bff',
    primaryHover: '#1f70cc',
    secondary: '#4b5563',
    success: '#10b981',
    error: '#ef4444',
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
    },
    border: {
      default: '#e5e7eb',
      hover: '#d1d5db',
      focus: '#268bff',
    },
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
} as const;

// Explicit exports to avoid conflicts
export { referenceColors, semanticTokens as colorSemanticTokens, componentTokens as colorComponentTokens } from './colors.tokens';
export { referenceFonts, semanticTokens as typographySemanticTokens } from './typography.tokens';
export { referenceSpacing, semanticTokens as spacingSemanticTokens } from './spacing.tokens';
export { componentTokens } from './component.tokens';