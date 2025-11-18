// Определение ролей пользователей (временно, до исправления импорта)
export enum UserRole {
  OWNER = 'owner',      // Владелец аккаунта
  ADMIN = 'admin',      // Администратор
  EDITOR = 'editor',    // Редактор
  VIEWER = 'viewer',    // Наблюдатель
}

// Матрица разрешений для шаблонов
const TemplatePermissions = {
  // Создание шаблонов
  create: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR],
  
  // Чтение шаблонов
  read: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER],
  
  // Обновление шаблонов
  update: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR],
  
  // Удаление шаблонов
  delete: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR],
  
  // Восстановление удаленных шаблонов
  restore: [UserRole.OWNER, UserRole.ADMIN],
  
  // Просмотр удаленных шаблонов
  viewDeleted: [UserRole.OWNER, UserRole.ADMIN],
  
  // Дублирование шаблонов
  duplicate: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR],
  
  // Просмотр истории версий
  viewVersions: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR],
  
  // Экспорт шаблонов
  export: [UserRole.OWNER, UserRole.ADMIN, UserRole.EDITOR],
  
  // Импорт шаблонов
  import: [UserRole.OWNER, UserRole.ADMIN],
} as const;

// Типы действий для шаблонов
export type TemplateAction = keyof typeof TemplatePermissions;

// Функция проверки прав
export function canPerformAction(
  action: TemplateAction,
  userRole: UserRole
): boolean {
  return TemplatePermissions[action].includes(userRole as any);
}

// Объект для удобного использования в компонентах
export function createCan(userRole: UserRole) {
  return {
    // CRUD операции
    create: () => canPerformAction('create', userRole),
    read: () => canPerformAction('read', userRole),
    update: () => canPerformAction('update', userRole),
    delete: () => canPerformAction('delete', userRole),
    
    // Дополнительные операции
    restore: () => canPerformAction('restore', userRole),
    duplicate: () => canPerformAction('duplicate', userRole),
    viewDeleted: () => canPerformAction('viewDeleted', userRole),
    viewVersions: () => canPerformAction('viewVersions', userRole),
    export: () => canPerformAction('export', userRole),
    import: () => canPerformAction('import', userRole),
  };
}

// Хук для использования в React компонентах
import { useAuth } from '@/hooks/use-auth';

export function usePermissions() {
  const { user } = useAuth();
  const userRole = user?.role || UserRole.VIEWER;
  
  return createCan(userRole as UserRole);
}

// Утилиты для проверки прав в серверном коде
export const permissions = {
  canCreate: (userRole: UserRole) => canPerformAction('create', userRole),
  canRead: (userRole: UserRole) => canPerformAction('read', userRole),
  canUpdate: (userRole: UserRole) => canPerformAction('update', userRole),
  canDelete: (userRole: UserRole) => canPerformAction('delete', userRole),
  canRestore: (userRole: UserRole) => canPerformAction('restore', userRole),
  canDuplicate: (userRole: UserRole) => canPerformAction('duplicate', userRole),
  canViewDeleted: (userRole: UserRole) => canPerformAction('viewDeleted', userRole),
  canViewVersions: (userRole: UserRole) => canPerformAction('viewVersions', userRole),
  canExport: (userRole: UserRole) => canPerformAction('export', userRole),
  canImport: (userRole: UserRole) => canPerformAction('import', userRole),
};

// Константы для UI
export const ROLE_LABELS = {
  [UserRole.OWNER]: 'Владелец',
  [UserRole.ADMIN]: 'Администратор',
  [UserRole.EDITOR]: 'Редактор',
  [UserRole.VIEWER]: 'Наблюдатель',
} as const;

// Описания ролей
export const ROLE_DESCRIPTIONS = {
  [UserRole.OWNER]: 'Полный доступ ко всем функциям системы',
  [UserRole.ADMIN]: 'Управление пользователями и шаблонами',
  [UserRole.EDITOR]: 'Создание и редактирование шаблонов',
  [UserRole.VIEWER]: 'Только просмотр шаблонов',
} as const;