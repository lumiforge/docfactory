# Coding Standards

## TypeScript
- Use strict TypeScript (`"strict": true` in tsconfig.json)
- Enable `noUncheckedIndexedAccess` for safer array/object access
- Use type inference where possible, but add explicit types for public APIs
- Use PascalCase for React components and interfaces
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants

## Imports
- Use absolute imports with `@/*` alias (e.g., `@/components/ui/button`)
- Group imports in the following order:
  1. External packages (react, next, etc.)
  2. Internal packages (@/something)
  3. Relative imports (./something)
- Sort imports alphabetically within each group
- Use explicit relative imports (e.g., `./utils` instead of `utils`)

## React Components
- Use functional components with TypeScript interfaces for props
- Add JSDoc comments for complex components and functions
- Use the `cn` utility from `@/lib/utils` for conditional class names
- Prefer composition over inheritance
- Keep components focused on a single responsibility
- Use React hooks appropriately (useState, useEffect, etc.)

## Naming Conventions
- File names should match component names (Button.tsx for Button component)
- Hook files should be prefixed with `use-` (use-templates.ts)
- Service files should be suffixed with `-service` (auth-service.ts)
- Type definition files should be suffixed with `-types` or be in types/ directory

## Tailwind CSS
- Use Tailwind utility classes extensively
- Leverage shared tokens from Tailwind theme
- Use responsive prefixes consistently (sm:, md:, lg:, xl:, 2xl:)
- Use the `@theme` directive in globals.css for custom properties
- Create custom components for frequently used combinations of utilities

## Component Structure
- Place shared UI components in `src/components/ui`
- Place layout components in `src/components/layout`
- Organize feature-specific components in `src/features/[feature]/components`
- Use descriptive names for components and avoid abbreviations
- Use shadcn/ui components as base components when possible

## Accessibility
- Use semantic HTML elements where appropriate
- Include proper ARIA attributes when needed
- Ensure proper contrast ratios for text
- Test keyboard navigation
- Use proper heading hierarchy (h1, h2, h3, etc.)

## Error Handling
- Implement proper error boundaries for critical sections
- Handle API errors gracefully
- Show loading states for async operations
- Provide user-friendly error messages

## Performance
- Use React.memo for components that render frequently with the same props
- Use useCallback to prevent unnecessary re-renders
- Implement proper lazy loading for non-critical components
- Optimize images and static assets