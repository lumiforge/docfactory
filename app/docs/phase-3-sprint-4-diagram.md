# Phase 3 Sprint 4 - Architecture Diagram

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (Next.js 15)"
        subgraph "Pages Layer"
            TP[Templates Page]
            TDP[Template Details Page]
            TCP[Template Create Page]
        end
        
        subgraph "Components Layer"
            TL[Templates List]
            TG[Templates Grid]
            TT[Templates Table]
            TC[Template Card]
            TF[Templates Filters]
            TPA[Templates Pagination]
            CTF[Create Template Form]
            ETF[Edit Template Form]
            DTD[Delete Template Dialog]
        end
        
        subgraph "Hooks Layer"
            UT[useTemplates]
            UTM[useTemplate Mutations]
            UP[usePermissions]
            UA[useAuth]
        end
        
        subgraph "Services Layer"
            TAS[Templates API Service]
            TS[Templates Service]
        end
        
        subgraph "State Management"
            TQ[Tanstack Query]
            ZS[Zustand Store]
        end
        
        subgraph "Validation Layer"
            ZS2[Zod Schemas]
            RHF[React Hook Form]
        end
        
        subgraph "UI Layer"
            RC[Radix UI Components]
            TW[Tailwind CSS]
            LR[Lucide React Icons]
        end
    end
    
    subgraph "Backend API"
        API[REST API /api/v1/templates]
        DB[(Database)]
    end
    
    subgraph "External Services"
        S3[(Object Storage)]
    end
    
    %% Connections
    TP --> TL
    TDP --> TC
    TCP --> CTF
    
    TL --> TG
    TL --> TT
    TL --> TF
    TL --> TPA
    
    TG --> TC
    TT --> TC
    
    TC --> DTD
    TC --> ETF
    
    TL --> UT
    TC --> UTM
    TF --> UT
    TPA --> UT
    
    UT --> TQ
    UTM --> TQ
    UP --> UA
    
    TQ --> TAS
    TAS --> API
    API --> DB
    API --> S3
    
    UT --> ZS
    TF --> ZS
    
    CTF --> ZS2
    ETF --> ZS2
    ZS2 --> RHF
    
    TL --> RC
    TF --> RC
    TC --> RC
    CTF --> RC
    ETF --> RC
    
    TL --> TW
    TF --> TW
    TC --> TW
    CTF --> TW
    ETF --> TW
    
    TL --> LR
    TF --> LR
    TC --> LR
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Page as Templates Page
    participant List as Templates List
    participant Hook as useTemplates
    participant TQ as Tanstack Query
    participant API as Templates API
    participant Backend as Backend API
    
    User->>Page: Открывает страницу шаблонов
    Page->>List: Рендерит список
    List->>Hook: useTemplates(filters)
    Hook->>TQ: useQuery()
    
    alt Cache exists and fresh
        TQ-->>Hook: Возвращает кэшированные данные
    else No cache or stale
        TQ->>API: GET /api/v1/templates
        API->>Backend: HTTP запрос
        Backend-->>API: PaginatedResponse<Template>
        API-->>TQ: Response
        TQ-->>Hook: data, isLoading, error
    end
    
    Hook-->>List: { data, isLoading, error }
    List-->>Page: TemplatesGrid/Table
    Page-->>User: Отображает список
    
    User->>List: Изменяет фильтр
    List->>Hook: useTemplates(newFilters)
    Hook->>TQ: useQuery(newFilters)
    TQ->>API: GET /api/v1/templates?filters
    API->>Backend: HTTP запрос с фильтрами
    Backend-->>API: Filtered data
    API-->>TQ: Response
    TQ-->>Hook: Updated data
    Hook-->>List: New templates
    List-->>User: Обновленный список
```

## Component Hierarchy

```mermaid
graph TD
    subgraph "Templates Management"
        TP[app/(dashboard)/templates/page.tsx]
        
        subgraph "Layout Components"
            HF[Header Component]
            SF[Sidebar Component]
            C[Container Component]
        end
        
        subgraph "Template Components"
            TL[components/templates/templates-list.tsx]
            TG[components/templates/templates-grid.tsx]
            TT[components/templates/templates-table.tsx]
            TC[components/templates/template-card.tsx]
            TF[components/templates/templates-filters.tsx]
            TPA[components/templates/templates-pagination.tsx]
        end
        
        subgraph "Form Components"
            CTM[components/templates/create-template-modal.tsx]
            ETM[components/templates/edit-template-modal.tsx]
            DTD[components/templates/delete-template-dialog.tsx]
        end
        
        subgraph "UI Components"
            B[Button]
            I[Input]
            S[Select]
            C2[Card]
            D[Dialog]
            A[Alert]
            SK[Skeleton]
        end
    end
    
    TP --> HF
    TP --> SF
    TP --> C
    TP --> TL
    TP --> CTM
    
    TL --> TG
    TL --> TT
    TL --> TF
    TL --> TPA
    
    TG --> TC
    TT --> TC
    
    TC --> DTD
    TC --> ETM
    
    TC --> B
    TC --> I
    TC --> S
    TC --> C2
    TC --> D
    TC --> A
    TC --> SK
    
    TF --> B
    TF --> I
    TF --> S
    
    TPA --> B
    TPA --> S
    
    CTM --> B
    CTM --> I
    CTM --> S
    CTM --> D
    
    ETM --> B
    ETM --> I
    ETM --> S
    ETM --> D
    
    DTD --> B
    DTD --> D
    DTD --> A
```

## State Management Flow

```mermaid
graph LR
    subgraph "UI State (Zustand)"
        UI[templates-ui.store.ts]
        VM[viewMode]
        FI[filters]
        SI[selectedIds]
    end
    
    subgraph "Server State (Tanstack Query)"
        SQ[Query Cache]
        UT[useTemplates]
        UTM[useTemplate Mutations]
        UC[useCreateTemplate]
        UU[useUpdateTemplate]
        UD[useDeleteTemplate]
    end
    
    subgraph "API Layer"
        TAS[templates.api.ts]
        GET[GET /templates]
        POST[POST /templates]
        PUT[PUT /templates/:id]
        DEL[DELETE /templates/:id]
    end
    
    subgraph "Backend"
        API[REST API]
        DB[(Database)]
    end
    
    %% UI State Flow
    UI --> VM
    UI --> FI
    UI --> SI
    
    %% Server State Flow
    UT --> SQ
    UTM --> SQ
    UC --> SQ
    UU --> SQ
    UD --> SQ
    
    %% API Flow
    UT --> TAS
    UC --> TAS
    UU --> TAS
    UD --> TAS
    
    TAS --> GET
    TAS --> POST
    TAS --> PUT
    TAS --> DEL
    
    GET --> API
    POST --> API
    PUT --> API
    DEL --> API
    
    API --> DB
```

## Error Handling Flow

```mermaid
graph TD
    subgraph "Error Sources"
        NET[Network Error]
        VAL[Validation Error]
        PERM[Permission Error]
        NOTF[404 Not Found]
        SERV[500 Server Error]
    end
    
    subgraph "Error Handling"
        EH[Error Handler]
        APIE[API Error Class]
        TQ[Tanstack Query]
        RB[Retry Logic]
        TO[Toast Notifications]
    end
    
    subgraph "UI Components"
        NE[Network Error Component]
        GE[Generic Error Component]
        PE[Permission Denied Component]
        NF[Not Found Component]
        SE[Server Error Component]
    end
    
    NET --> EH
    VAL --> EH
    PERM --> EH
    NOTF --> EH
    SERV --> EH
    
    EH --> APIE
    EH --> TQ
    EH --> RB
    EH --> TO
    
    TQ --> NE
    TQ --> GE
    TQ --> PE
    TQ --> NF
    TQ --> SE
```

## Performance Optimization Strategy

```mermaid
graph TB
    subgraph "Frontend Optimizations"
        subgraph "Rendering"
            RM[React.memo]
            UM[useMemo]
            UC[useCallback]
            VS[Virtual Scrolling]
        end
        
        subgraph "Data Fetching"
            PC[Prefetching]
            CD[Cache Duration]
            PO[Placeholder Data]
            OU[Optimistic Updates]
        end
        
        subgraph "Bundle Optimization"
            CS[Code Splitting]
            LL[Lazy Loading]
            TD[Tree Shaking]
            IM[Image Optimization]
        end
    end
    
    subgraph "Monitoring"
        LH[Lighthouse CI]
        PT[Performance Metrics]
        BT[Bundle Analyzer]
        RT[Render Time Tracking]
    end
    
    RM --> VS
    UM --> PC
    UC --> OU
    
    PC --> CD
    PO --> CD
    OU --> CD
    
    CS --> LL
    LL --> TD
    TD --> IM
    
    LH --> PT
    PT --> BT
    BT --> RT
```

## Testing Architecture

```mermaid
graph TD
    subgraph "Testing Pyramid"
        subgraph "Unit Tests (Vitest)"
            UTC[Component Tests]
            UTH[Hook Tests]
            UTS[Service Tests]
            UTU[Utility Tests]
        end
        
        subgraph "Integration Tests"
            IT[API Integration]
            ITF[Form Integration]
            ITQ[Query Integration]
        end
        
        subgraph "E2E Tests (Playwright)"
            E2EC[CRUD Flow]
            E2EF[Filter Flow]
            E2EP[Pagination Flow]
            E2EM[Mobile Flow]
        end
    end
    
    subgraph "Test Infrastructure"
        MSW[MSW Mocks]
        TF[Test Fixtures]
        TH[Test Helpers]
        TC[Test Coverage]
    end
    
    UTC --> MSW
    UTH --> TF
    UTS --> TH
    UTU --> TC
    
    IT --> MSW
    ITF --> TF
    ITQ --> TH
    
    E2EC --> MSW
    E2EF --> TF
    E2EP --> TH
    E2EM --> TC
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV[Local Development]
        MSW2[MSW Server]
        HMR[Hot Module Reload]
        TD[Tanstack DevTools]
    end
    
    subgraph "CI/CD Pipeline"
        GH[GitHub Actions]
        LT[Lint & Type Check]
        UT2[Unit Tests]
        E2E[E2E Tests]
        LH[Lighthouse CI]
        BD[Build & Deploy]
    end
    
    subgraph "Production"
        VER[Vercel/Netlify]
        CDN[Edge CDN]
        API2[Production API]
        DB2[(Production DB)]
    end
    
    DEV --> MSW2
    MSW2 --> HMR
    HMR --> TD
    
    GH --> LT
    LT --> UT2
    UT2 --> E2E
    E2E --> LH
    LH --> BD
    
    BD --> VER
    VER --> CDN
    CDN --> API2
    API2 --> DB2
```

Эта архитектура обеспечивает:
- **Масштабируемость**: четкое разделение ответственности
- **Поддерживаемость**: понятная структура кода
- **Производительность**: оптимизации на всех уровнях
- **Тестируемость**: полный coverage тестами
- **Надежность**: обработка ошибок и retry логика
- **UX**: оптимистические обновления и loading states