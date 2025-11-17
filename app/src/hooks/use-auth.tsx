"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService } from "@/services/auth.service";

// Export DecodedToken type
export interface DecodedToken {
  sub: string; // user_id
  email: string;
  tenant_id: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  exp: number;
}

interface AuthContextType {
  user: DecodedToken | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    companyName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const decodedToken = authService.getDecodedToken();
        setUser(decodedToken);
        
        // Schedule token refresh if needed
        const token = authService.getDecodedToken();
        if (token) {
          const timeUntilExpiry = token.exp * 1000 - Date.now();
          if (timeUntilExpiry < 15 * 60 * 1000) { // Less than 15 minutes
            await authService.refreshAccessToken();
            const refreshedToken = authService.getDecodedToken();
            setUser(refreshedToken);
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await authService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login(email, password);
      const decodedToken = authService.getDecodedToken();
      setUser(decodedToken);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    companyName: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
  }) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      const decodedToken = authService.getDecodedToken();
      setUser(decodedToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async () => {
    setIsLoading(true);
    try {
      await authService.refreshAccessToken();
      const decodedToken = authService.getDecodedToken();
      setUser(decodedToken);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}