export const referenceColors = {
  blue: {
    50: '#e6f2ff',
    100: '#bfddff',
    200: '#99c9ff',
    300: '#73b4ff',
    400: '#4da0ff',
    500: '#268bff', // primary blue
    600: '#1f70cc',
    700: '#185599',
    800: '#113b66',
    900: '#0a2033',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: {
    500: '#ef4444',
    600: '#dc2626',
  },
  green: {
    500: '#10b981',
    600: '#059669',
  },
} as const;

export const semanticTokens = {
  color: {
    primary: referenceColors.blue[500],
    primaryHover: referenceColors.blue[600],
    secondary: referenceColors.gray[600],
    success: referenceColors.green[500],
    error: referenceColors.red[500],
    text: {
      primary: referenceColors.gray[900],
      secondary: referenceColors.gray[600],
      tertiary: referenceColors.gray[400],
      inverse: '#ffffff',
    },
    background: {
      primary: '#ffffff',
      secondary: referenceColors.gray[50],
      tertiary: referenceColors.gray[100],
    },
    border: {
      default: referenceColors.gray[200],
      hover: referenceColors.gray[300],
      focus: referenceColors.blue[500],
    },
  },
} as const;

export const componentTokens = {
  button: {
    primary: {
      background: semanticTokens.color.primary,
      backgroundHover: semanticTokens.color.primaryHover,
      text: semanticTokens.color.text.inverse,
      borderRadius: '0.375rem',
      paddingX: '1rem',
      paddingY: '0.75rem',
    },
    secondary: {
      background: 'transparent',
      backgroundHover: semanticTokens.color.background.secondary,
      text: semanticTokens.color.text.primary,
      border: semanticTokens.color.border.default,
      borderRadius: '0.375rem',
      paddingX: '1rem',
      paddingY: '0.75rem',
    },
    ghost: {
      background: 'transparent',
      backgroundHover: semanticTokens.color.background.secondary,
      text: semanticTokens.color.text.secondary,
    },
    destructive: {
      background: semanticTokens.color.error,
      backgroundHover: '#dc2626',
      text: semanticTokens.color.text.inverse,
      borderRadius: '0.375rem',
      paddingX: '1rem',
      paddingY: '0.75rem',
    },
    outline: {
      background: 'transparent',
      backgroundHover: semanticTokens.color.background.secondary,
      text: semanticTokens.color.primary,
      border: semanticTokens.color.primary,
      borderRadius: '0.375rem',
      paddingX: '1rem',
      paddingY: '0.75rem',
    },
  },
  input: {
    background: semanticTokens.color.background.primary,
    border: semanticTokens.color.border.default,
    borderHover: semanticTokens.color.border.hover,
    borderFocus: semanticTokens.color.border.focus,
    text: semanticTokens.color.text.primary,
    placeholder: semanticTokens.color.text.tertiary,
    paddingX: '0.75rem',
    paddingY: '0.75rem',
    borderRadius: '0.375rem',
  },
  modal: {
    background: semanticTokens.color.background.primary,
    overlay: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    maxWidth: '32rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  toast: {
    background: semanticTokens.color.background.primary,
    border: semanticTokens.color.border.default,
    borderRadius: '0.375rem',
    padding: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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