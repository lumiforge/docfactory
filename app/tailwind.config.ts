import type { Config } from 'tailwindcss';
import { referenceColors, semanticTokens as colorSemanticTokens } from './src/tokens/colors.tokens';
import { referenceSpacing, semanticTokens as spacingSemanticTokens } from './src/tokens/spacing.tokens';
import { referenceFonts } from './src/tokens/typography.tokens';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ...referenceColors,
        primary: colorSemanticTokens.color.primary,
        secondary: colorSemanticTokens.color.secondary,
        success: colorSemanticTokens.color.success,
        error: colorSemanticTokens.color.error,
        text: colorSemanticTokens.color.text,
        background: colorSemanticTokens.color.background,
        border: colorSemanticTokens.color.border,
      },
      spacing: referenceSpacing,
      fontFamily: referenceFonts.fontFamily,
      fontSize: referenceFonts.fontSize,
      fontWeight: referenceFonts.fontWeight,
      lineHeight: referenceFonts.lineHeight,
      borderRadius: {
        ...spacingSemanticTokens.radius,
      },
      boxShadow: {
        ...spacingSemanticTokens.shadow,
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class', // Use class strategy for better compatibility
    }),
  ],
} satisfies Config;