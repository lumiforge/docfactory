import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/hooks/use-auth';

// Mock useAuth hook
vi.mock('@/hooks/use-auth');

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user is authenticated', () => {
    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: {
        sub: 'user123',
        email: 'test@example.com',
        tenant_id: 'tenant123',
        role: 'owner',
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show loading state when authentication is loading', () => {
    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should show access denied when user role is not authorized', () => {
    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: {
        sub: 'user123',
        email: 'test@example.com',
        tenant_id: 'tenant123',
        role: 'viewer', // Not admin
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(
      <ProtectedRoute requiredRole={['admin', 'owner']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Доступ запрещен')).toBeInTheDocument();
    expect(screen.getByText('У вас нет прав для просмотра этой страницы')).toBeInTheDocument();
  });

  it('should render nothing when user is not authenticated', () => {
    const mockUseAuth = vi.mocked(useAuth);

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Should not render content when not authenticated
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const mockUseAuth = vi.mocked(useAuth);
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refresh: vi.fn(),
    });

    render(
      <ProtectedRoute fallback={<div>Custom Loading...</div>}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});