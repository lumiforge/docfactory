import { describe, it, expect } from 'vitest';
import { 
  loginSchema, 
  registrationSchema, 
  profileSchema, 
  templateSchema 
} from '@/schemas/auth.schema';

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'SecurePass123',
      rememberMe: true,
    };
    expect(() => loginSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const invalidData = { 
      email: 'invalid', 
      password: 'SecurePass123' 
    };
    expect(() => loginSchema.parse(invalidData)).toThrow(/Некорректный email/);
  });

  it('should enforce password complexity', () => {
    const weakPassword = { 
      email: 'test@example.com', 
      password: 'weak' 
    };
    expect(() => loginSchema.parse(weakPassword)).toThrow(/минимум 8 символов/);
  });

  it('should require password to have uppercase letter', () => {
    const noUppercase = { 
      email: 'test@example.com', 
      password: 'securepass123' 
    };
    expect(() => loginSchema.parse(noUppercase)).toThrow(/заглавную букву/);
  });

  it('should require password to have lowercase letter', () => {
    const noLowercase = { 
      email: 'test@example.com', 
      password: 'SECUREPASS123' 
    };
    expect(() => loginSchema.parse(noLowercase)).toThrow(/строчную букву/);
  });

  it('should require password to have digit', () => {
    const noDigit = { 
      email: 'test@example.com', 
      password: 'SecurePass' 
    };
    expect(() => loginSchema.parse(noDigit)).toThrow(/цифру/);
  });
});

describe('registrationSchema', () => {
  it('should validate correct registration data', () => {
    const validData = {
      companyName: 'Test Company',
      email: 'test@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
      acceptTerms: true,
    };
    expect(() => registrationSchema.parse(validData)).not.toThrow();
  });

  it('should reject short company name', () => {
    const invalidData = {
      companyName: 'A',
      email: 'test@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
      acceptTerms: true,
    };
    expect(() => registrationSchema.parse(invalidData)).toThrow(/минимум 2 символа/);
  });

  it('should reject mismatched passwords', () => {
    const mismatchedPasswords = {
      companyName: 'Test Company',
      email: 'test@example.com',
      password: 'SecurePass123',
      confirmPassword: 'DifferentPass123',
      acceptTerms: true,
    };
    expect(() => registrationSchema.parse(mismatchedPasswords)).toThrow(/Пароли не совпадают/);
  });

  it('should require terms acceptance', () => {
    const noTerms = {
      companyName: 'Test Company',
      email: 'test@example.com',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
      acceptTerms: false,
    };
    expect(() => registrationSchema.parse(noTerms)).toThrow(/Необходимо принять условия/);
  });
});

describe('profileSchema', () => {
  it('should validate correct profile data', () => {
    const validData = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      timezone: 'America/New_York',
      language: 'en' as const,
    };
    expect(() => profileSchema.parse(validData)).not.toThrow();
  });

  it('should reject short full name', () => {
    const invalidData = {
      fullName: 'A',
      email: 'test@example.com',
      timezone: 'America/New_York',
      language: 'en' as const,
    };
    expect(() => profileSchema.parse(invalidData)).toThrow(/Минимум 2 символа/);
  });

  it('should reject invalid phone number', () => {
    const invalidPhone = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: 'invalid-phone',
      timezone: 'America/New_York',
      language: 'en' as const,
    };
    expect(() => profileSchema.parse(invalidPhone)).toThrow(/Некорректный номер телефона/);
  });

  it('should accept empty phone', () => {
    const emptyPhone = {
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '',
      timezone: 'America/New_York',
      language: 'en' as const,
    };
    expect(() => profileSchema.parse(emptyPhone)).not.toThrow();
  });
});

describe('templateSchema', () => {
  it('should validate correct template data', () => {
    const validData = {
      name: 'Warranty Template',
      description: 'Template for warranty documents',
      documentType: 'warranty' as const,
      pageSize: 'A4' as const,
      orientation: 'portrait' as const,
    };
    expect(() => templateSchema.parse(validData)).not.toThrow();
  });

  it('should reject short template name', () => {
    const invalidData = {
      name: 'AB',
      documentType: 'warranty' as const,
      pageSize: 'A4' as const,
      orientation: 'portrait' as const,
    };
    expect(() => templateSchema.parse(invalidData)).toThrow(/Минимум 3 символа/);
  });

  it('should reject long template name', () => {
    const invalidData = {
      name: 'A'.repeat(101),
      documentType: 'warranty' as const,
      pageSize: 'A4' as const,
      orientation: 'portrait' as const,
    };
    expect(() => templateSchema.parse(invalidData)).toThrow(/Максимум 100 символов/);
  });

  it('should reject long description', () => {
    const invalidData = {
      name: 'Valid Name',
      description: 'A'.repeat(501),
      documentType: 'warranty' as const,
      pageSize: 'A4' as const,
      orientation: 'portrait' as const,
    };
    expect(() => templateSchema.parse(invalidData)).toThrow(/Максимум 500 символов/);
  });
});