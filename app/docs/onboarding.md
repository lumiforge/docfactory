# Onboarding Guide

## Prerequisites
- Node.js 20 (LTS) - managed via .nvmrc
- npm 10 or higher
- Git
- A code editor with TypeScript support (VS Code recommended)

## Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd docfactory/app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Node Version
```bash
nvm use
```
This will use the version specified in `.nvmrc` (should be Node 20).

## Development Workflow

### 1. Starting the Development Server
```bash
npm run dev
```
The application will be available at http://localhost:3000

### 2. Running Storybook
```bash
npm run storybook
```
Storybook will be available at http://localhost:6006

### 3. Code Quality Tools
- **Linting**: `npm run lint`
- **Type Checking**: `npm run type-check`
- **Prettier Formatting**: `npm run prettier`
- **Prettier Check**: `npm run prettier:check`

### 4. Testing
```bash
npm run test
```

### 5. Building the Application
```bash
npm run build
```

## Git Workflow

### Pre-commit Hooks
This project uses Husky and lint-staged to run code quality checks before each commit:
- ESLint checks for the staged files
- Type checking for TypeScript files
- Prettier formatting for CSS, SCSS, MD, JSON files

### Commit Messages
Use conventional commits format:
```
type(scope): description

body

footer
```

Examples:
- `feat(auth): add login component`
- `fix(template): resolve API error handling`
- `docs: update onboarding guide`

## Project Structure
See the [Architecture Documentation](architecture.md) for detailed project structure information.

## Key Technologies

### Next.js
- Using App Router (app directory)
- Server Components and Client Components
- Environment variables
- Image optimization

### TypeScript
- Strict mode enabled
- Type checking on all files
- Generated API types from OpenAPI spec

### Tailwind CSS v4
- Utility-first CSS framework
- Custom theme configuration
- Typography and forms plugins
- Responsive design

### shadcn/ui
- Accessible UI components
- Customizable styling
- Well-documented components

## Component Development

### Using Storybook
1. Create your component in `src/components/ui` or appropriate feature directory
2. Create a story file (e.g., `button.stories.tsx`)
3. Run `npm run storybook` to view and test components in isolation

### Adding New UI Components
```bash
npx shadcn-ui@latest add [component-name]
```

## API Integration

### Mock API
- MSW (Mock Service Worker) is used for mocking API calls during development
- Mock handlers are in `src/mocks/handlers/`
- API types are generated from OpenAPI spec in `src/lib/api/openapi.json`

### Adding New API Endpoints
1. Update the OpenAPI specification in `src/lib/api/openapi.json`
2. Regenerate TypeScript types: `npx openapi-typescript src/lib/api/openapi.json --output src/types/api.ts`
3. Add mock handlers in `src/mocks/handlers/`
4. Implement the actual API endpoint

## Feature Development

### Adding New Features
1. Create a new directory in `src/features/[feature-name]/`
2. Add the standard subdirectories: `components/`, `hooks/`, `stores/`, `services/`
3. Follow the feature-sliced design principles
4. Create components in the feature's components directory
5. Add custom hooks to the hooks directory
6. Manage state in the stores directory
7. Handle business logic in the services directory

## Troubleshooting

### Common Issues
- **TypeScript errors after dependency updates**: Run `npm run type-check` to identify specific issues
- **Tailwind classes not working**: Ensure Tailwind is properly configured and the development server is restarted
- **Mock API not working**: Check that MSW is properly initialized in development mode

### Getting Help
- Check the documentation in the `docs/` directory
- Look at existing components for examples
- Contact team members for guidance