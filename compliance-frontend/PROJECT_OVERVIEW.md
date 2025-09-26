# Compliance Frontend - Project Overview

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Core Infrastructure](#core-infrastructure)
3. [Component Systems](#component-systems)
4. [Advanced Patterns](#advanced-patterns)
5. [Project Structure](#project-structure)
6. [Usage Examples](#usage-examples)
7. [Development Guidelines](#development-guidelines)

## Project Architecture

The Compliance Frontend is a modern React TypeScript application built with enterprise-grade architectural patterns. The project follows a three-phase recodification approach:

### Phase 1: Core Infrastructure
- Universal hook system for API management
- Domain-specific contexts replacing legacy data patterns
- Azure Functions integration with centralized API client
- Enhanced TypeScript safety and error handling

### Phase 2: Component Modularization
- Reusable table system with advanced features
- Flexible form builder with validation
- Dashboard system for metrics and insights
- Material-UI v7 component integration

### Phase 3: Advanced Patterns
- Multi-item selection system
- Responsive layout management
- Performance optimization hooks
- State management enhancements

## Core Infrastructure

### API Management System

#### Universal Hooks (`src/hooks/api/`)

**`useApi`** - Central API hook with Azure Functions integration
```typescript
const { client, isConnected, error } = useApi();
```

**`useApiQuery`** - Data fetching with caching and error handling
```typescript
const { data, loading, error, refetch } = useApiQuery<User[]>('/users');
```

**`useApiMutation`** - Data mutations with optimistic updates
```typescript
const { mutate, loading, error } = useApiMutation('/users', 'POST', {
  onSuccess: (data) => console.log('Created:', data),
  onError: (error) => console.error('Failed:', error)
});
```

#### Domain Contexts (`src/contexts/`)

**`LicensesContext`** - License management state
```typescript
const { licenses, createLicense, updateLicense, deleteLicense } = useLicenses();
```

**`AccountsContext`** - Account management state
```typescript
const { accounts, loading, error, refresh } = useAccounts();
```

**`FileUploadContext`** - File upload operations
```typescript
const { uploadFile, uploadProgress, uploadError } = useFileUpload();
```

### Service Layer (`src/services/`)

**`apiClient.ts`** - Centralized Azure Functions client
- Automatic authentication handling
- Request/response interceptors
- Error standardization
- Retry logic

**`fileUploadService.ts`** - File upload functionality
- Multi-file support
- Progress tracking
- Validation and error handling

## Component Systems

### Table System (`src/components/common/DataTable/`)

**`DataTable<T>`** - Advanced data table component
```typescript
<DataTable<License>
  title="Licenses"
  data={licenses}
  columns={columns}
  loading={loading}
  pagination={pagination}
  selectable={true}
  onSelectionChange={handleSelection}
  rowActions={(item) => <Actions item={item} />}
/>
```

Features:
- Generic TypeScript support
- Sorting, filtering, pagination
- Row selection (single/multi)
- Custom row actions
- Responsive design
- Loading and error states

**`LicensesTable`** - Specialized license table
- Pre-configured columns for license data
- Built-in actions (view, edit, delete, process, download)
- License status handling
- Integration with license operations

### Form System (`src/components/common/Forms/`)

**`FormBuilder`** - Dynamic form generator
```typescript
<FormBuilder
  title="Create Account"
  fields={formFields}
  onSubmit={handleSubmit}
  endpoint="/accounts"
  method="POST"
/>
```

**`FormField`** - Individual form field component
- Multiple field types (text, select, date, file, etc.)
- Built-in validation
- Error handling
- Responsive layout

Field types supported:
- `text`, `email`, `password`, `number`, `tel`, `url`
- `textarea`, `select`, `multiselect`
- `checkbox`, `radio`, `date`, `file`

### Dashboard System (`src/components/common/Dashboard/`)

**`Dashboard`** - Metrics dashboard container
```typescript
<Dashboard
  title="Compliance Overview"
  subtitle="Real-time compliance metrics"
  sections={dashboardSections}
  loading={loading}
  onRefreshAll={handleRefresh}
/>
```

**`MetricCard`** - Individual metric display
- Multiple display formats (number, percentage, currency)
- Trend indicators
- Status colors
- Loading states

## Advanced Patterns

### Selection System (`src/hooks/patterns/useSelection.ts`)

Advanced multi-item selection with:
- Individual and bulk operations
- Range selection support
- Maximum selection limits
- Performance optimization through memoization

```typescript
const {
  selectedItems,
  selectedIds,
  selectItem,
  selectAll,
  toggleAll,
  isSelected,
  canSelectMore
} = useSelection(items, {
  maxSelections: 10,
  onSelectionChange: handleSelectionChange
});
```

### Layout System (`src/hooks/patterns/useLayout.ts`)

Responsive layout management:
- Breakpoint detection
- Adaptive values
- Container props generation
- Device categorization

```typescript
const {
  layout,
  getGridColumns,
  getSpacing,
  isHidden,
  adaptiveValue
} = useLayout();
```

**`ResponsiveContainer`** - Layout wrapper component
**`ResponsiveGrid`** - Grid system with responsive configuration
**`AdaptiveLayout`** - Device-specific layout switching

### Performance Optimization (`src/hooks/optimization/`)

**`usePerformanceMonitor`** - Component performance tracking
```typescript
const metrics = usePerformanceMonitor(props, {
  componentName: 'MyComponent',
  logToConsole: true,
  threshold: 16
});
```

**`useVirtualization`** - List and grid virtualization
```typescript
const {
  virtualizedItems,
  scrollElementProps,
  containerProps
} = useVirtualization(items, {
  itemHeight: 50,
  containerHeight: 400
});
```

**`useMemoCompare`** - Advanced memoization strategies
- Deep comparison memoization
- Shallow comparison for objects
- Array comparison
- Custom comparison functions

### Advanced Hook Patterns (`src/hooks/patterns/`)

**`useAsync`** - Async operation management
```typescript
const {
  data,
  loading,
  error,
  execute,
  cancel,
  retry
} = useAsync(asyncFunction, {
  immediate: true,
  retryCount: 3,
  timeout: 5000
});
```

**`useDebounce`** - Value and callback debouncing
```typescript
const debouncedValue = useDebounce(value, 300);
const debouncedCallback = useDebouncedCallback(callback, 300);
```

**`usePersistentState`** - Browser storage integration
```typescript
const [state, setState, removeState] = usePersistentState('key', initialValue, {
  storageType: 'localStorage',
  syncAcrossTabs: true
});
```

## Project Structure

```
compliance-frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── DataTable/          # Table system
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── LicensesTable.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Dashboard/          # Dashboard system
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Forms/              # Form system
│   │   │   │   ├── FormBuilder.tsx
│   │   │   │   ├── FormField.tsx
│   │   │   │   └── index.ts
│   │   │   └── Layout/             # Layout system
│   │   │       ├── ResponsiveContainer.tsx
│   │   │       └── index.ts
│   │   └── pages/                  # Page components
│   ├── contexts/                   # Domain contexts
│   │   ├── LicensesContext.tsx
│   │   ├── AccountsContext.tsx
│   │   ├── FileUploadContext.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── api/                    # API hooks
│   │   │   ├── useApi.ts
│   │   │   ├── useApiQuery.ts
│   │   │   ├── useApiMutation.ts
│   │   │   └── index.ts
│   │   ├── data/                   # Data hooks
│   │   │   └── index.ts
│   │   ├── optimization/           # Performance hooks
│   │   │   ├── useMemoCompare.ts
│   │   │   ├── useVirtualization.ts
│   │   │   ├── usePerformanceMonitor.ts
│   │   │   └── index.ts
│   │   └── patterns/               # Advanced patterns
│   │       ├── useSelection.ts
│   │       ├── useLayout.ts
│   │       ├── useAsync.ts
│   │       ├── useDebounce.ts
│   │       ├── usePersistentState.ts
│   │       └── index.ts
│   ├── services/                   # Service layer
│   │   ├── apiClient.ts
│   │   ├── fileUploadService.ts
│   │   └── index.ts
│   └── types/                      # TypeScript definitions
├── package.json
├── tsconfig.json
├── vite.config.ts
└── PROJECT_OVERVIEW.md            # This file
```

## Usage Examples

### Creating a New Data Table

```typescript
import { DataTable } from '@/components/common/DataTable';
import { useApiQuery } from '@/hooks/api';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
}

const columns: DataTableColumn<User>[] = [
  { id: 'name', label: 'Name', minWidth: 150 },
  { id: 'email', label: 'Email', minWidth: 200 },
  {
    id: 'status',
    label: 'Status',
    format: (value) => (
      <Chip
        label={value}
        color={value === 'active' ? 'success' : 'default'}
      />
    )
  }
];

function UsersTable() {
  const { data: users, loading, error } = useApiQuery<User[]>('/users');

  return (
    <DataTable<User>
      title="Users"
      data={users}
      columns={columns}
      loading={loading}
      error={error}
      selectable={true}
      onSelectionChange={(selected) => console.log(selected)}
    />
  );
}
```

### Building a Dynamic Form

```typescript
import { FormBuilder, FormFieldConfig } from '@/components/common/Forms';

const userFormFields: FormFieldConfig[] = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    required: true,
    grid: { xs: 12, md: 6 }
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    grid: { xs: 12, md: 6 }
  },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    options: [
      { label: 'Admin', value: 'admin' },
      { label: 'User', value: 'user' }
    ],
    grid: { xs: 12, md: 4 }
  }
];

function CreateUserForm() {
  return (
    <FormBuilder
      title="Create New User"
      fields={userFormFields}
      endpoint="/users"
      method="POST"
      onSuccess={(user) => console.log('User created:', user)}
      submitLabel="Create User"
      showCancelButton={true}
    />
  );
}
```

### Using Performance Optimization

```typescript
import { useVirtualization, usePerformanceMonitor } from '@/hooks/optimization';

function LargeList({ items }: { items: any[] }) {
  // Monitor component performance
  const metrics = usePerformanceMonitor(items, {
    componentName: 'LargeList',
    logToConsole: true
  });

  // Virtualize large lists
  const {
    virtualizedItems,
    scrollElementProps,
    containerProps
  } = useVirtualization(items, {
    itemHeight: 50,
    containerHeight: 400,
    overscan: 5
  });

  return (
    <div {...scrollElementProps}>
      <div {...containerProps}>
        {virtualizedItems.map(({ data, style, index }) => (
          <div key={index} style={style}>
            {data.name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Development Guidelines

### Adding New Components

1. **Follow the established patterns**: Use TypeScript generics where appropriate
2. **Implement proper error handling**: Use error boundaries and loading states
3. **Add comprehensive prop types**: Document all props with JSDoc comments
4. **Include responsive design**: Use the layout system for responsive behavior
5. **Write performance-conscious code**: Use memoization and virtualization when needed

### API Integration

1. **Use domain contexts**: Don't call API hooks directly in components
2. **Implement proper error handling**: Handle network errors gracefully
3. **Add loading states**: Provide user feedback during operations
4. **Use optimistic updates**: Update UI immediately for better UX

### Performance Best Practices

1. **Use React.memo** for pure components
2. **Implement virtualization** for large lists
3. **Use the performance monitor** to identify bottlenecks
4. **Leverage debouncing** for search and input operations
5. **Implement proper caching** strategies

### Testing Strategy

1. **Unit tests** for individual hooks and utilities
2. **Integration tests** for component interactions
3. **Performance tests** using the monitoring hooks
4. **E2E tests** for critical user flows

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **UI Library**: Material-UI v7
- **Build Tool**: Vite
- **State Management**: React Context + Custom hooks
- **API Integration**: Azure Functions
- **Styling**: Material-UI styled components
- **Development**: ESLint, Prettier, TypeScript strict mode

## Getting Started

1. **Install dependencies**: `npm install`
2. **Start development server**: `npm run dev`
3. **Build for production**: `npm run build`
4. **Run type checking**: `npm run type-check`
5. **Run linting**: `npm run lint`

This project provides a solid foundation for building scalable, maintainable React applications with enterprise-grade patterns and performance optimizations.