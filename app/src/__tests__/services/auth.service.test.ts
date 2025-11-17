import { jwtDecode } from 'jwt-decode';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '@/services/auth.service';

// Mock fetch
global.fetch = vi.fn();

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset auth service state
    authService.setAccessToken('');
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 900,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await authService.login('test@example.com', 'password123');

      expect(authService.getAccessToken()).toBe('test-access-token');
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });

    it('should throw error with invalid credentials', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      const mockResponse = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 900,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const userData = {
        companyName: 'Test Company',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        acceptTerms: true,
      };

      await authService.register(userData);

      expect(authService.getAccessToken()).toBe('test-access-token');
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token is set', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return false when token is expired', () => {
      const expiredToken = {
        sub: 'user123',
        email: 'test@example.com',
        tenant_id: 'tenant123',
        role: 'owner' as const,
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
      };

      // Mock jwtDecode to return expired token
      const mockJwtDecode = vi.mocked(jwtDecode);
      mockJwtDecode.mockReturnValue(expiredToken);

      authService.setAccessToken('expired-token');
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return true when valid token is set', () => {
      const validToken = {
        sub: 'user123',
        email: 'test@example.com',
        tenant_id: 'tenant123',
        role: 'owner' as const,
        exp: Math.floor(Date.now() / 1000) + 3600, // Expires in 1 hour
      };

      const mockJwtDecode = vi.mocked(jwtDecode);
      mockJwtDecode.mockReturnValue(validToken);

      authService.setAccessToken('valid-token');
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('getUserRole', () => {
    it('should return user role from token', () => {
      const token = {
        sub: 'user123',
        email: 'test@example.com',
        tenant_id: 'tenant123',
        role: 'admin' as const,
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockJwtDecode = vi.mocked(jwtDecode);
      mockJwtDecode.mockReturnValue(token);

      authService.setAccessToken('test-token');
      expect(authService.getUserRole()).toBe('admin');
    });

    it('should return null when no token is set', () => {
      expect(authService.getUserRole()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear token and call logout endpoint', async () => {
      authService.setAccessToken('test-token');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
      });

      await authService.logout();

      expect(authService.getAccessToken()).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    });
  });
});