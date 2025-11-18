export const LABELS = {
  templates: {
    title: 'Шаблоны',
    create: 'Создать шаблон',
    edit: 'Редактировать',
    delete: 'Удалить',
    duplicate: 'Дублировать',
    restore: 'Восстановить',
    search: 'Поиск по названию или описанию...',
    empty: 'Шаблоны не найдены',
    emptyDescription: 'Создайте первый шаблон для начала работы',
    filters: {
      documentType: 'Тип документа',
      status: 'Статус',
      sort: 'Сортировка',
      clear: 'Сбросить',
    },
    pagination: {
      page: 'Страница',
      of: 'из',
      itemsPerPage: 'элементов на странице',
      previous: 'Назад',
      next: 'Вперед',
    },
    actions: {
      confirmDelete: 'Удалить шаблон?',
      confirmDeleteDescription: 'Это действие можно отменить в течение 30 дней',
      cancel: 'Отмена',
      confirm: 'Подтвердить',
    },
    viewMode: {
      grid: 'Сетка',
      table: 'Таблица',
    },
  },
} as const;