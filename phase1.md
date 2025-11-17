# Phase 1 — Подготовка и инфраструктура

Документ фиксирует прогресс и решения первой фазы roadmap из `tasks.md`. Цель — описать, как команда будет выполнять Sprint 1 и какие артефакты должны появиться.

## 1. Инициализация Next.js + TypeScript
- Используем `create-next-app@latest` с флагами `--ts --eslint --app --tailwind --use-npm --src-dir --import-alias "@/*"`.
- После генерации сразу включаем `"strict": true` и `"noUncheckedIndexedAccess": true` в `tsconfig.json`.
- Node.js 20 LTS + npm 10 — обязательная версия окружения (фиксируем в `.nvmrc`).

## 2. Качество кода
- ESLint: конфиг на базе `next/core-web-vitals` + плагины `@typescript-eslint`, `eslint-plugin-tailwindcss`, `eslint-plugin-import`.
- Prettier: хранить единый конфиг `.prettierrc` (printWidth 100, semi true, singleQuote false, trailingComma "all").
- Husky + lint-staged: pre-commit запускает `pnpm lint` и `pnpm type-check`. Пример `package.json`:
  ```json
  {
    "lint-staged": {
      "*.{ts,tsx,js,jsx}": ["next lint --max-warnings=0"],
      "*.{ts,tsx}": ["tsc --noEmit"],
      "*.{css,scss,md,mdx,json}": ["prettier --write"]
    }
  }
  ```

## 3. UI стек
- Tailwind CSS v4.1: включаем `@tailwindcss/typography`, `@tailwindcss/forms`. Создаём файл `src/styles/globals.css` и подключаем в `app/layout.tsx`.
- shadcn/ui: установка `pnpm dlx shadcn-ui@latest init`. Компоненты храним в `src/components/ui` с автогенерируемым `@/lib/utils`.
- Базовый layout: структура `app/(dashboard)/layout.tsx` с `<Header />`, `<Sidebar />`, `<Main />`. Добавляем placeholder-контент и shared tokens (цвета, spacing) через Tailwind theme.

## 4. Storybook
- Устанавливаем `@storybook/nextjs` (v8). Конфиг `storybook/` хранит `main.ts`, `preview.ts`. Tailwind подключаем через `import '../src/styles/globals.css'`.
- Для компонентов шапки/сайдбара создаём базовые stories с controls.
- Настраиваем скрипты `"storybook": "storybook dev -p 6006"`, `"build-storybook": "storybook build"`.

## 5. CI/CD pipeline
- GitHub Actions workflow `.github/workflows/ci.yml`:
  1. `setup-node` (Node 20) + кеш npm.
  2. `npm ci`.
  3. `npm run lint`, `npm run type-check`, `npm run test`, `npm run build`.
- Deployment: подключение к Vercel через `vercel pull --yes --environment=preview` и `vercel deploy --prebuilt` (опционально из workflow).

## 6. API интеграция
- Создаём `src/lib/api/openapi.json` (заглушка) и используем `openapi-typescript` для генерации типов `src/types/api.ts`.
- Для моков — MSW (`src/mocks/handlers/templates.ts`) + автоматическое включение в Storybook и dev server.

## 7. Архитектура и структура папок
```
src/
  app/
    (dashboard)/
      layout.tsx
      page.tsx
  components/
    layout/
    ui/
  features/
    auth/
    templates/
  lib/
    api/
    store/
  styles/
  mocks/
  types/
```
- Подход feature-sliced: каждая фича имеет `components`, `hooks`, `stores`, `services`.
- Zustand хранится в `src/lib/store`, глобальные хелперы — в `src/lib/utils.ts`.

## 8. Документация
- `docs/architecture.md`: описывает архитектуру, зависимости, принципы именования.
- `docs/coding-standards.md`: lint правила, соглашения по imports, структуре компонентов, доступности.
- `docs/onboarding.md`: шаги для установки окружения + команды npm.

## 9. Definition of Done для Sprint 1
- ✅ Репозиторий с рабочим Next.js проектом, проходящим `npm run lint`, `npm run test`, `npm run build`.
- ✅ Tailwind + shadcn/ui настроены, доступен базовый layout с тестовыми компонентами в Storybook.
- ✅ Husky/CI гарантируют отсутствие lint/type ошибок.
- ✅ Документация лежит в `docs/` и обновляется при каждом изменении архитектуры.

## 10. Следующие шаги
1. Запустить `create-next-app` и закоммитить базовую структуру.
2. Добавить Tailwind конфигурацию и первые UI-компоненты (Header, Sidebar).
3. Настроить Storybook и Husky.
4. Создать GitHub Actions workflow и описанную документацию.
5. Провести ревью и обновить roadmap в `tasks.md` (отметить выполненные пункты Phase 1).
