<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Ответы на вопросы по Sprint 2 и Sprint 3

## Sprint 2 — Design System \& UI Components

### Brand Tokens

**Рекомендуемая структура токенов** (трехуровневая иерархия):[^1][^2]

#### Reference Tokens (сырые значения)

```typescript
// colors.tokens.ts
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

// typography.tokens.ts
export const referenceFonts = {
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// spacing.tokens.ts
export const referenceSpacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;
```


#### Semantic Tokens (смысловые значения)[^2][^1]

```typescript
// semantic.tokens.ts
export const semanticTokens = {
  color: {
    primary: referenceColors.blue[^500],
    primaryHover: referenceColors.blue[^600],
    secondary: referenceColors.gray[^600],
    success: referenceColors.green[^500],
    error: referenceColors.red[^500],
    text: {
      primary: referenceColors.gray[^900],
      secondary: referenceColors.gray[^600],
      tertiary: referenceColors.gray[^400],
      inverse: '#ffffff',
    },
    background: {
      primary: '#ffffff',
      secondary: referenceColors.gray[^50],
      tertiary: referenceColors.gray[^100],
    },
    border: {
      default: referenceColors.gray[^200],
      hover: referenceColors.gray[^300],
      focus: referenceColors.blue[^500],
    },
  },
  spacing: {
    xs: referenceSpacing[^2],
    sm: referenceSpacing[^3],
    md: referenceSpacing[^4],
    lg: referenceSpacing[^6],
    xl: referenceSpacing[^8],
  },
  radius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
} as const;
```


#### Component Tokens (специфичные для компонентов)[^1][^2]

```typescript
// component.tokens.ts
export const componentTokens = {
  button: {
    primary: {
      background: semanticTokens.color.primary,
      backgroundHover: semanticTokens.color.primaryHover,
      text: semanticTokens.color.text.inverse,
      borderRadius: semanticTokens.radius.md,
      paddingX: semanticTokens.spacing.md,
      paddingY: semanticTokens.spacing.sm,
    },
    secondary: {
      background: 'transparent',
      backgroundHover: semanticTokens.color.background.secondary,
      text: semanticTokens.color.text.primary,
      border: semanticTokens.color.border.default,
      borderRadius: semanticTokens.radius.md,
    },
    ghost: {
      background: 'transparent',
      backgroundHover: semanticTokens.color.background.secondary,
      text: semanticTokens.color.text.secondary,
    },
  },
  input: {
    background: semanticTokens.color.background.primary,
    border: semanticTokens.color.border.default,
    borderHover: semanticTokens.color.border.hover,
    borderFocus: semanticTokens.color.border.focus,
    text: semanticTokens.color.text.primary,
    placeholder: semanticTokens.color.text.tertiary,
    paddingX: semanticTokens.spacing.sm,
    paddingY: semanticTokens.spacing.sm,
    borderRadius: semanticTokens.radius.md,
  },
} as const;
```


### Component Variants \& States

**Button Component** — полная спецификация:

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // base styles
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
        secondary: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50',
        ghost: 'hover:bg-gray-100 text-gray-700',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
      state: {
        default: '',
        loading: 'cursor-wait',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      state: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, state: loading ? 'loading' : 'default' }), className)}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
```

**Interaction States** — обязательные состояния для всех интерактивных компонентов:[^1]

- **hover** — изменение цвета фона/границы
- **focus-visible** — кольцо фокуса для клавиатурной навигации (accessibility)
- **active** — состояние нажатия
- **disabled** — opacity: 0.5, cursor: not-allowed
- **loading** — spinner, disabled interaction

**Input Component** — спецификация:

```typescript
const inputVariants = cva(
  'flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white',
        error: 'border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);
```

**Select, Modal, Toast** — используйте готовые компоненты из **shadcn/ui** или **Radix UI** с вашими токенами.[^3]

### Layout Components

**Responsive Breakpoints** (стандарт Tailwind):[^1]

```typescript
export const breakpoints = {
  sm: '640px',   // mobile landscape
  md: '768px',   // tablet
  lg: '1024px',  // desktop
  xl: '1280px',  // large desktop
  '2xl': '1536px', // extra large
} as const;
```

**Container Component**:

```typescript
// components/layout/container.tsx
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
}

export const Container = ({ 
  maxWidth = 'xl', 
  centered = true, 
  className, 
  children,
  ...props 
}: ContainerProps) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'w-full px-4 md:px-6 lg:px-8',
        maxWidthClasses[maxWidth],
        centered && 'mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

**Grid \& Stack** — используйте CSS Grid и Flexbox утилиты Tailwind с вашими spacing токенами.

### Form Patterns

**Обязательные формы для Sprint 2**:[^4][^5]

#### 1. Login Form

```typescript
// schemas/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Некорректный email'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать заглавную букву')
    .regex(/[a-z]/, 'Пароль должен содержать строчную букву')
    .regex(/[0-9]/, 'Пароль должен содержать цифру'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
```


#### 2. Registration Form

```typescript
export const registrationSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Название компании должно содержать минимум 2 символа')
    .max(100, 'Максимум 100 символов'),
  email: z.string().email('Некорректный email'),
  password: z
    .string()
    .min(8, 'Минимум 8 символов')
    .regex(/[A-Z]/, 'Требуется заглавная буква')
    .regex(/[a-z]/, 'Требуется строчная буква')
    .regex(/[0-9]/, 'Требуется цифра'),
  confirmPassword: z.string(),
  acceptTerms: z
    .boolean()
    .refine(val => val === true, {
      message: 'Необходимо принять условия использования',
    }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
```


#### 3. Profile Settings Form

```typescript
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Минимум 2 символа').max(50),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Некорректный номер телефона')
    .optional()
    .or(z.literal('')),
  avatar: z
    .instanceof(File)
    .refine(file => file.size <= 5000000, 'Максимальный размер файла 5MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      'Только JPEG, PNG или WebP'
    )
    .optional(),
  timezone: z.string(),
  language: z.enum(['ru', 'en']),
});
```


#### 4. Template Create/Edit Form (для Sprint 4, но схему готовим сейчас)

```typescript
export const templateSchema = z.object({
  name: z
    .string()
    .min(3, 'Минимум 3 символа')
    .max(100, 'Максимум 100 символов'),
  description: z.string().max(500, 'Максимум 500 символов').optional(),
  documentType: z.enum(['warranty', 'instruction', 'certificate', 'label']),
  pageSize: z.enum(['A4', 'A5', 'Letter']),
  orientation: z.enum(['portrait', 'landscape']),
});
```


### Loading \& Skeletons

**Компоненты требующие скелетонов**:[^6][^7]

#### Custom Skeleton Component

```typescript
// components/ui/skeleton.tsx
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
      {...props}
    />
  );
}

// With shimmer effect
export function SkeletonWithShimmer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200',
        'before:absolute before:inset-0',
        'before:translate-x-[-100%] before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
        className
      )}
      {...props}
    />
  );
}
```

**Tailwind config для shimmer анимации**:[^6]

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
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
};
```

**Места использования скелетонов**:[^7][^6]

1. **Templates List** — скелетон карточек/строк таблицы:
```typescript
export function TemplateCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}
```

2. **User Profile** — данные профиля:
```typescript
export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
  );
}
```

3. **Forms** — состояние загрузки данных формы
4. **Navigation Menu** — при первой загрузке

**Motion Guidelines** (Framer Motion):[^1]

```typescript
export const motionConfig = {
  transition: {
    fast: { duration: 0.15, ease: 'easeOut' },
    normal: { duration: 0.25, ease: 'easeInOut' },
    slow: { duration: 0.4, ease: 'easeInOut' },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -10, opacity: 0 },
  },
} as const;
```


### Error Handling

**Трехуровневая система обработки ошибок**:

#### 1. Inline Field Errors (в формах)[^5][^4]

```typescript
// components/ui/form-field.tsx
<FormField
  control={form.control}
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input
          {...field}
          type="email"
          variant={fieldState.error ? 'error' : 'default'}
        />
      </FormControl>
      {fieldState.error && (
        <FormMessage className="text-red-500 text-sm mt-1">
          {fieldState.error.message}
        </FormMessage>
      )}
    </FormItem>
  )}
/>
```


#### 2. Toast Notifications (для операций)[^1]

```typescript
// lib/toast.ts
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description, duration: 3000 });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description, duration: 5000 });
  },
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  dismiss: (id: string | number) => {
    sonnerToast.dismiss(id);
  },
};

// Usage
try {
  const toastId = toast.loading('Сохранение шаблона...');
  await saveTemplate(data);
  toast.dismiss(toastId);
  toast.success('Шаблон сохранен', 'Изменения успешно применены');
} catch (error) {
  toast.error('Ошибка сохранения', error.message);
}
```


#### 3. Error Boundaries (для критических ошибок React)

```typescript
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service (Sentry, etc.)
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Что-то пошло не так
        </h2>
        <p className="text-gray-600 max-w-md">
          Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу или вернуться на главную.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 text-left text-xs bg-gray-100 p-4 rounded overflow-auto max-w-2xl">
            {error.message}
          </pre>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={() => reset()}>
          Попробовать снова
        </Button>
        <Button variant="secondary" onClick={() => window.location.href = '/'}>
          На главную
        </Button>
      </div>
    </div>
  );
}
```

**Global Error Banner** (для API errors, network issues):

```typescript
// components/global-error-banner.tsx
export function GlobalErrorBanner() {
  const { error, clearError } = useGlobalError();

  if (!error) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-medium">{error.title}</p>
            <p className="text-sm opacity-90">{error.message}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={clearError}
          className="text-white hover:bg-red-600"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
```


## Sprint 3 — Navigation \& Authentication

### Routing Map

**Полная структура маршрутов**:[^8][^9]

```typescript
// app/layout structure
app/
├── (auth)/                      # Auth layout group
│   ├── layout.tsx              # Centered auth layout
│   ├── login/
│   │   └── page.tsx            # /login
│   ├── register/
│   │   └── page.tsx            # /register
│   ├── forgot-password/
│   │   └── page.tsx            # /forgot-password
│   └── reset-password/
│       └── page.tsx            # /reset-password?token=xxx
│
├── (dashboard)/                 # Protected dashboard layout
│   ├── layout.tsx              # Sidebar + header layout
│   ├── page.tsx                # /dashboard (home)
│   │
│   ├── templates/
│   │   ├── page.tsx            # /dashboard/templates (list)
│   │   ├── new/
│   │   │   └── page.tsx        # /dashboard/templates/new
│   │   └── [id]/
│   │       ├── page.tsx        # /dashboard/templates/[id] (view)
│   │       └── edit/
│   │           └── page.tsx    # /dashboard/templates/[id]/edit
│   │
│   ├── editor/
│   │   └── [templateId]/
│   │       └── page.tsx        # /dashboard/editor/[templateId]
│   │
│   ├── documents/
│   │   ├── page.tsx            # /dashboard/documents (list)
│   │   ├── generate/
│   │   │   └── page.tsx        # /dashboard/documents/generate
│   │   └── [id]/
│   │       └── page.tsx        # /dashboard/documents/[id] (view)
│   │
│   ├── settings/
│   │   ├── page.tsx            # /dashboard/settings (redirect to profile)
│   │   ├── profile/
│   │   │   └── page.tsx        # /dashboard/settings/profile
│   │   ├── team/
│   │   │   └── page.tsx        # /dashboard/settings/team
│   │   ├── billing/
│   │   │   └── page.tsx        # /dashboard/settings/billing
│   │   └── api-keys/
│   │       └── page.tsx        # /dashboard/settings/api-keys
│   │
│   └── analytics/
│       └── page.tsx            # /dashboard/analytics
│
└── api/                        # API routes for frontend
    ├── auth/
    │   ├── login/
    │   │   └── route.ts        # POST /api/auth/login
    │   ├── register/
    │   │   └── route.ts        # POST /api/auth/register
    │   ├── logout/
    │   │   └── route.ts        # POST /api/auth/logout
    │   └── refresh/
    │       └── route.ts        # POST /api/auth/refresh
    └── ...
```

**Multi-tenant routing strategy** (если поддомены):[^9][^8]

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[^0];

  // Skip for localhost and main domain
  if (subdomain === 'localhost' || subdomain === 'app' || !subdomain) {
    return NextResponse.next();
  }

  // Rewrite to tenant-specific route
  const url = request.nextUrl.clone();
  url.pathname = `/tenants/${subdomain}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}
```


### Auth Flow Details

**JWT Authentication Strategy**:[^10][^11]

#### Token Configuration

```typescript
// lib/auth/config.ts
export const authConfig = {
  accessToken: {
    expiresIn: '15m',           // Short-lived[web:66][web:69]
    storage: 'memory',          // Never in localStorage for security
  },
  refreshToken: {
    expiresIn: '7d',            // Long-lived[web:69]
    storage: 'httpOnly cookie', // Secure, httpOnly, sameSite[web:66]
  },
  endpoints: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
} as const;
```


#### Auth Service Implementation

```typescript
// services/auth.service.ts
import { jwtDecode } from 'jwt-decode';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface DecodedToken {
  sub: string; // user_id
  email: string;
  tenant_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  exp: number;
}

class AuthService {
  private accessToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  async login(email: string, password: string): Promise<void> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: TokenResponse = await response.json();
    this.setAccessToken(data.accessToken);
    this.scheduleTokenRefresh(data.expiresIn);
  }

  async register(data: RegistrationFormData): Promise<void> {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const tokenData: TokenResponse = await response.json();
    this.setAccessToken(tokenData.accessToken);
    this.scheduleTokenRefresh(tokenData.expiresIn);
  }

  async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Send refresh token cookie[web:66]
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data: TokenResponse = await response.json();
      this.setAccessToken(data.accessToken);
      this.scheduleTokenRefresh(data.expiresIn);
    } catch (error) {
      // Refresh failed - redirect to login
      this.logout();
      window.location.href = '/login';
    }
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    // Refresh 1 minute before expiry[web:66][web:69]
    const refreshTime = (expiresIn - 60) * 1000;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getDecodedToken(): DecodedToken | null {
    if (!this.accessToken) return null;
    try {
      return jwtDecode<DecodedToken>(this.accessToken);
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    this.accessToken = null;
  }

  isAuthenticated(): boolean {
    const token = this.getDecodedToken();
    if (!token) return false;
    
    // Check if token is expired
    return token.exp * 1000 > Date.now();
  }
}

export const authService = new AuthService();
```


#### Axios Interceptor для автоматического добавления токена

```typescript
// lib/api-client.ts
import axios from 'axios';
import { authService } from '@/services/auth.service';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: true, // Include cookies
});

// Request interceptor - add access token
apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authService.refreshAccessToken();
        
        // Retry original request with new token
        const token = authService.getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**Auth Mechanisms** (на первом этапе):

- ✅ Email/Password (основной)
- ❌ SSO (OAuth2) — для будущих спринтов
- ❌ Magic Link — для будущих спринтов
- ❌ 2FA — для enterprise-тарифа (Phase 7)


### Protected Routes

**Role-Based Access Control (RBAC)**:

```typescript
// types/auth.types.ts
export enum UserRole {
  OWNER = 'owner',       // Full access, billing
  ADMIN = 'admin',       // Manage users, all operations
  EDITOR = 'editor',     // Create/edit templates/documents
  VIEWER = 'viewer',     // Read-only access
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  avatar?: string;
}
```

**Permission Matrix**:


| Feature | Owner | Admin | Editor | Viewer |
| :-- | :-- | :-- | :-- | :-- |
| View templates | ✅ | ✅ | ✅ | ✅ |
| Create templates | ✅ | ✅ | ✅ | ❌ |
| Edit templates | ✅ | ✅ | ✅ | ❌ |
| Delete templates | ✅ | ✅ | ✅ | ❌ |
| Generate documents | ✅ | ✅ | ✅ | ❌ |
| View documents | ✅ | ✅ | ✅ | ✅ |
| Delete documents | ✅ | ✅ | ✅ | ❌ |
| Manage users | ✅ | ✅ | ❌ | ❌ |
| Billing settings | ✅ | ❌ | ❌ | ❌ |
| API keys | ✅ | ✅ | ❌ | ❌ |

**Route Protection Implementation**:

```typescript
// components/auth/protected-route.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return fallback || <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check role permissions
  if (requiredRole && user && !requiredRole.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Доступ запрещен</h2>
          <p className="text-gray-600 mt-2">
            У вас нет прав для просмотра этой страницы
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Usage in layout
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardShell>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
```

**Middleware-based protection** (alternative approach):

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const protectedRoutes = ['/dashboard', '/templates', '/editor', '/documents'];
const adminOnlyRoutes = ['/dashboard/settings/team', '/dashboard/settings/billing'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtected) {
    return NextResponse.next();
  }

  // Get access token from cookie or header
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = jwtDecode<{ role: string }>(token);

    // Check admin routes
    const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));
    if (isAdminRoute && !['owner', 'admin'].includes(decoded.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/templates/:path*', '/editor/:path*', '/documents/:path*'],
};
```


### User Profile Scope

**Profile Data Schema**:

```typescript
// types/profile.types.ts
export interface UserProfile {
  // Basic info
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  phone: string | null;
  
  // Organization
  tenantId: string;
  tenantName: string;
  role: UserRole;
  
  // Preferences
  timezone: string;
  language: 'ru' | 'en';
  
  // Metadata
  createdAt: string;
  lastLoginAt: string;
  emailVerified: boolean;
}

export interface ProfileUpdateData {
  fullName?: string;
  phone?: string;
  avatar?: File;
  timezone?: string;
  language?: 'ru' | 'en';
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

**Profile Screens**:

1. **Profile Settings** (`/dashboard/settings/profile`):
    - Edit name, email (read-only), phone
    - Upload/change avatar (crop functionality)
    - Timezone and language preferences
    - Last login date
2. **Security** (`/dashboard/settings/security`):
    - Change password
    - Email verification status
    - Active sessions list
    - 2FA toggle (Phase 7)
3. **Team Management** (`/dashboard/settings/team`) — Admin/Owner only:
    - List team members
    - Invite new users
    - Change roles
    - Remove users
4. **Billing** (`/dashboard/settings/billing`) — Owner only:
    - Current plan
    - Usage statistics
    - Payment method
    - Invoices history

### Testing Requirements

**Critical Components for Unit Testing** (target: 70%+ coverage):[^12][^13]

#### 1. Authentication utilities

```typescript
// __tests__/lib/auth.test.ts
describe('authService', () => {
  it('should decode JWT token correctly', () => {
    const token = 'valid.jwt.token';
    const decoded = authService.getDecodedToken();
    expect(decoded).toHaveProperty('sub');
    expect(decoded).toHaveProperty('role');
  });

  it('should detect expired tokens', () => {
    // Mock expired token
    const expiredToken = createMockToken({ exp: Date.now() / 1000 - 3600 });
    authService.setAccessToken(expiredToken);
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('should schedule token refresh', async () => {
    jest.useFakeTimers();
    await authService.login('test@example.com', 'password');
    
    jest.advanceTimersByTime(14 * 60 * 1000); // 14 minutes
    expect(mockRefreshToken).toHaveBeenCalled();
  });
});
```


#### 2. Form validation (Zod schemas)[^4][^5]

```typescript
// __tests__/schemas/auth.schema.test.ts
describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'SecurePass123',
    };
    expect(() => loginSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const invalidData = { email: 'invalid', password: 'SecurePass123' };
    expect(() => loginSchema.parse(invalidData)).toThrow();
  });

  it('should enforce password complexity', () => {
    const weakPassword = { email: 'test@example.com', password: 'weak' };
    expect(() => loginSchema.parse(weakPassword)).toThrow(/минимум 8 символов/);
  });
});
```


#### 3. Protected Route component

```typescript
// __tests__/components/protected-route.test.tsx
describe('ProtectedRoute', () => {
  it('should redirect to login if not authenticated', () => {
    const { push } = mockRouter();
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(push).toHaveBeenCalledWith('/login');
  });

  it('should render children for authenticated user', () => {
    mockAuthState({ isAuthenticated: true, user: mockUser });
    const { getByText } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    
    expect(getByText('Protected Content')).toBeInTheDocument();
  });

  it('should enforce role-based access', () => {
    mockAuthState({ 
      isAuthenticated: true, 
      user: { ...mockUser, role: UserRole.VIEWER } 
    });
    
    const { getByText } = render(
      <ProtectedRoute requiredRole={[UserRole.ADMIN]}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );
    
    expect(getByText('Доступ запрещен')).toBeInTheDocument();
  });
});
```


#### 4. API client interceptors

```typescript
// __tests__/lib/api-client.test.ts
describe('apiClient', () => {
  it('should add Authorization header with token', async () => {
    authService.setAccessToken('test-token');
    
    const mockRequest = jest.fn();
    apiClient.interceptors.request.use(mockRequest);
    
    await apiClient.get('/test');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('should refresh token on 401 response', async () => {
    const refreshSpy = jest.spyOn(authService, 'refreshAccessToken');
    
    // Mock 401 response then success
    mockAPI.onGet('/test').replyOnce(401).onGet('/test').reply(200, { data: 'success' });
    
    await apiClient.get('/test');
    expect(refreshSpy).toHaveBeenCalled();
  });
});
```


#### 5. Form components (Login, Registration)[^4]

```typescript
// __tests__/components/login-form.test.tsx
describe('LoginForm', () => {
  it('should display validation errors for empty fields', async () => {
    const { getByRole, getByText } = render(<LoginForm />);
    
    fireEvent.click(getByRole('button', { name: /войти/i }));
    
    await waitFor(() => {
      expect(getByText('Email обязателен')).toBeInTheDocument();
      expect(getByText(/Пароль должен содержать/)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const onSubmit = jest.fn();
    const { getByLabelText, getByRole } = render(<LoginForm onSubmit={onSubmit} />);
    
    fireEvent.change(getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(getByLabelText(/пароль/i), { 
      target: { value: 'SecurePass123' } 
    });
    
    fireEvent.click(getByRole('button', { name: /войти/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123',
      });
    });
  });
});
```

**Coverage Targets**:[^13][^12]

- **Overall**: 70%+ (Sprint 3), 80%+ (Sprint 12)
- **Critical paths** (auth, validation): 90%+
- **UI components**: 60%+
- **Utilities**: 85%+

**Test Commands**:

```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

**CI/CD Integration** (GitHub Actions):[^13]

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
      - name: Check coverage threshold
        run: |
          COVERAGE=$(node -pe "JSON.parse(require('fs').readFileSync('./coverage/coverage-summary.json')).total.lines.pct")
          if (( $(echo "$COVERAGE < 70" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 70% threshold"
            exit 1
          fi
```

Эти детализированные спецификации обеспечивают четкое понимание требований для Sprint 2 и Sprint 3, минимизируя неопределенность и позволяя команде начать разработку с конкретными целями.[^2][^10][^5][^12][^13][^4][^1]
<span style="display:none">[^14][^15][^16][^17][^18][^19][^20][^21]</span>

<div align="center">⁂</div>

[^1]: https://materialui.co/blog/design-tokens-and-theming-scalable-ui-2025

[^2]: https://www.netguru.com/blog/design-token-naming-best-practices

[^3]: https://www.untitledui.com/blog/react-component-libraries

[^4]: https://www.contentful.com/blog/react-hook-form-validation-zod/

[^5]: https://refine.dev/blog/zod-typescript/

[^6]: https://blog.logrocket.com/handling-react-loading-states-react-loading-skeleton/

[^7]: https://www.npmjs.com/package/react-loading-skeleton

[^8]: https://stackoverflow.com/questions/76694723/multitenant-route-api-with-react-component

[^9]: https://dev.to/jdelvx/building-a-multi-tenant-react-app-part-2-dynamic-routes-4f9i

[^10]: https://ssojet.com/ciam-qna/jwt-authentication-refresh-token-implementation-security

[^11]: https://www.loginradius.com/blog/identity/refresh-tokens-jwt-interaction

[^12]: https://testsigma.com/guides/component-testing/

[^13]: https://www.startearly.ai/post/7-methods-to-improve-unit-test-coverage

[^14]: https://www.designsystemscollective.com/the-evolution-of-design-system-tokens-a-2025-deep-dive-into-next-generation-figma-structures-969be68adfbe

[^15]: https://www.door3.com/de/blog/design-token-workbook-update

[^16]: https://www.zeroheight.com/blog/design-systems-report-2025-an-overview/

[^17]: https://atlassian.design/tokens/design-tokens

[^18]: https://zod.dev

[^19]: https://github.com/colinhacks/zod/issues/4936

[^20]: https://www.telerik.com/blogs/zod-typescript-schema-validation-made-easy

[^21]: https://www.youtube.com/watch?v=U9PYyMhDc_k

