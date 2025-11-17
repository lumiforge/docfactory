# Architecture Documentation

## Overview
DocFactory is a Next.js 16 application built with TypeScript, following feature-sliced design principles. The application uses Tailwind CSS v4 for styling and shadcn/ui for UI components.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with typography and forms plugins
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **API Mocking**: MSW (Mock Service Worker)
- **Testing**: Jest/React Testing Library (to be implemented)
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **Documentation**: Storybook

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/        # Dashboard layout and pages
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Shared components
│   ├── layout/             # Layout components (Header, Sidebar, etc.)
│   └── ui/                 # shadcn/ui components
├── features/               # Feature-based modules
│   ├── auth/               # Authentication feature
│   │   ├── components/     # Auth-specific components
│   │   ├── hooks/          # Auth-specific hooks
│   │   ├── stores/         # Auth-specific stores
│   │   └── services/       # Auth-specific services
│   └── templates/          # Templates feature
│       ├── components/
│       ├── hooks/
│       ├── stores/
│       └── services/
├── lib/                    # Shared libraries
│   ├── api/                # API integration
│   └── utils.ts            # Utility functions
├── mocks/                  # MSW mocks
│   ├── handlers/           # API route handlers
│   ├── browser.ts          # Browser MSW setup
│   └── server.ts           # Server MSW setup
├── styles/                 # Global styles
│   └── globals.css         # Tailwind and global styles
├── types/                  # Type definitions
│   └── api.ts              # API types generated from OpenAPI spec
└── public/                 # Static assets
```

## Feature-Sliced Design
Each feature is organized with:
- `components` - React components specific to the feature
- `hooks` - Custom React hooks for the feature
- `stores` - State management logic for the feature
- `services` - Business logic and API interactions for the feature

## API Integration
API interactions are handled through:
- OpenAPI specification in `src/lib/api/openapi.json`
- Generated TypeScript types in `src/types/api.ts`
- Mock implementations using MSW in development
- Proper error handling and loading states

## Styling
The application uses Tailwind CSS v4 with:
- Shared color palette, typography, and spacing system
- Custom layout components (Container, Stack, Grid, etc.)
- shadcn/ui components for common UI elements
- Responsive design principles