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

  async register(data: {
    companyName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }): Promise<void> {
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
        credentials: 'include', // Send refresh token cookie
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
    // Refresh 1 minute before expiry
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

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    this.accessToken = null;
  }

  isAuthenticated(): boolean {
    const token = this.getDecodedToken();
    if (!token) return false;
    
    // Check if token is expired
    return token.exp * 1000 > Date.now();
  }

  getUserRole(): DecodedToken['role'] | null {
    const token = this.getDecodedToken();
    return token?.role || null;
  }

  getUserId(): string | null {
    const token = this.getDecodedToken();
    return token?.sub || null;
  }

  getTenantId(): string | null {
    const token = this.getDecodedToken();
    return token?.tenant_id || null;
  }
}

export const authService = new AuthService();