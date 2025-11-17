import { semanticTokens } from './colors.tokens';

// Base tokens
const radius = {
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
} as const;

const shadow = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
} as const;

const spacing = {
  xs: '0.5rem',
  sm: '0.75rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const;

export const componentTokens = {
  radius,
  shadow,
  spacing,
  animation: {
    fast: { duration: '0.15s', ease: 'ease-out' },
    normal: { duration: '0.25s', ease: 'ease-in-out' },
    slow: { duration: '0.4s', ease: 'ease-in-out' },
  },
  modal: {
    background: semanticTokens.color.background.primary,
    overlay: 'rgba(0, 0, 0, 0.5)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxWidth: '32rem',
    boxShadow: shadow.lg,
  },
  toast: {
    background: semanticTokens.color.background.primary,
    border: semanticTokens.color.border.default,
    borderRadius: radius.md,
    padding: spacing.md,
    boxShadow: shadow.md,
    success: {
      background: '#f0fdf4',
      border: '#bbf7d0',
      text: '#166534',
    },
    error: {
      background: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
    },
  },
} as const;