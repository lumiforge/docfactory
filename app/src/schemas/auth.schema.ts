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

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegistrationFormData = z.infer<typeof registrationSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type TemplateFormData = z.infer<typeof templateSchema>;