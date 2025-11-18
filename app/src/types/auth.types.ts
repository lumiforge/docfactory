// Роли пользователей в системе
export enum UserRole {
  OWNER = 'owner',      // Владелец аккаунта
  ADMIN = 'admin',      // Администратор
  EDITOR = 'editor',    // Редактор
  VIEWER = 'viewer',    // Наблюдатель
}

// Интерфейс пользователя
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

// Интерфейс для состояния аутентификации
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// DTO для входа
export interface LoginDto {
  email: string;
  password: string;
}

// DTO для регистрации
export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

// Ответ от API при аутентификации
export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}