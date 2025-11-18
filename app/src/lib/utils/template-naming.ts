/**
 * Генерирует уникальное имя для дубликата шаблона
 * @param originalName - оригинальное название шаблона
 * @param existingNames - список существующих названий
 * @returns уникальное название для копии
 */
export function generateDuplicateName(
  originalName: string,
  existingNames: string[]
): string {
  // Паттерн: "Название (копия N)"
  const basePattern = /^(.*?)(?:\s*\(копия(?:\s+(\d+))?\))?$/;
  const match = originalName.match(basePattern);
  
  if (!match) return `${originalName} (копия)`;
  
  const baseName = match[1]?.trim() || '';
  const currentNumber = match[2] ? parseInt(match[2]) : 0;
  
  // Найти следующий доступный номер
  let nextNumber = currentNumber + 1;
  let candidateName = `${baseName} (копия ${nextNumber})`;
  
  while (existingNames.includes(candidateName)) {
    nextNumber++;
    candidateName = `${baseName} (копия ${nextNumber})`;
  }
  
  return candidateName;
}

/**
 * Генерирует имя для импортированного шаблона при конфликте
 * @param originalName - оригинальное название
 * @param existingNames - список существующих названий
 * @returns уникальное название для импортированного шаблона
 */
export function generateImportName(
  originalName: string,
  existingNames: string[]
): string {
  // Паттерн: "Название (импорт N)"
  const basePattern = /^(.*?)(?:\s*\(импорт(?:\s+(\d+))?\))?$/;
  const match = originalName.match(basePattern);
  
  if (!match) return `${originalName} (импорт)`;
  
  const baseName = match[1]?.trim() || '';
  const currentNumber = match[2] ? parseInt(match[2]) : 0;
  
  // Найти следующий доступный номер
  let nextNumber = currentNumber + 1;
  let candidateName = `${baseName} (импорт ${nextNumber})`;
  
  while (existingNames.includes(candidateName)) {
    nextNumber++;
    candidateName = `${baseName} (импорт ${nextNumber})`;
  }
  
  return candidateName;
}

/**
 * Проверяет, является ли имя шаблона копией
 * @param name - название для проверки
 * @returns true если это копия
 */
export function isDuplicateName(name: string): boolean {
  return /\(копия(?:\s+\d+)?\)$/.test(name);
}

/**
 * Проверяет, является ли имя шаблона импортированным
 * @param name - название для проверки
 * @returns true если это импортированный шаблон
 */
export function isImportedName(name: string): boolean {
  return /\(импорт(?:\s+\d+)?\)$/.test(name);
}

/**
 * Извлекает базовое имя без суффиксов копии или импорта
 * @param name - полное название
 * @returns базовое имя
 */
export function getBaseName(name: string): string {
  // Удаляем суффиксы копии и импорта
  return name.replace(/\s*\(копия(?:\s+\d+)?\)|\(импорт(?:\s+\d+)?\)$/, '');
}

/**
 * Форматирует размер файла в человекочитаемый формат
 * @param bytes - размер в байтах
 * @returns отформатированный размер
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Валидирует имя файла для загрузки
 * @param filename - имя файла
 * @returns результат валидации
 */
export function validateFileName(filename: string): {
  isValid: boolean;
  error?: string;
} {
  // Проверка длины
  if (filename.length === 0) {
    return { isValid: false, error: 'Имя файла не может быть пустым' };
  }
  
  if (filename.length > 255) {
    return { isValid: false, error: 'Имя файла слишком длинное (максимум 255 символов)' };
  }
  
  // Проверка запрещенных символов
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(filename)) {
    return { 
      isValid: false, 
      error: 'Имя файла содержит недопустимые символы: < > : " / \\ | ? *' 
    };
  }
  
  // Проверка зарезервированных имен
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  
  const nameWithoutExt = filename.split('.')[0]?.toUpperCase() || '';
  if (reservedNames.includes(nameWithoutExt)) {
    return { 
      isValid: false, 
      error: 'Имя файла является зарезервированным системным именем' 
    };
  }
  
  return { isValid: true };
}

/**
 * Генерирует безопасное имя файла из строки
 * @param input - входная строка
 * @param extension - расширение файла
 * @returns безопасное имя файла
 */
export function generateSafeFileName(input: string, extension: string): string {
  // Удаляем недопустимые символы
  let safeName = input
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .trim();
  
  // Ограничиваем длину
  if (safeName.length > 200) {
    safeName = safeName.substring(0, 200);
  }
  
  // Добавляем расширение
  return `${safeName}.${extension.replace(/^\./, '')}`;
}