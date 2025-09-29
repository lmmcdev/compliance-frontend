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

**`licenseService.ts`** - Consolidated license operations (Single API source)
- All license CRUD operations using `/license-types` endpoints
- Handles nested API response format: `{ success: true, data: [...] }`
- Automatic data extraction from wrapped responses
- Type-safe operations with proper error handling
- Eliminates API call duplication between service and context layers

**`fileUploadService.ts`** - File upload functionality
- Multi-file support
- Progress tracking
- Validation and error handling

## Component Systems

### Consolidated Table System (`src/components/common/DataTable/`)

**`DataTable<T>`** - Universal generic table component
```typescript
<DataTable<T>
  title="Data Table"
  data={items}
  columns={columns}
  loading={loading}
  pagination={pagination}
  selectable={true}
  onSelectionChange={handleSelection}
  rowActions={(item) => <Actions item={item} />}
/>
```

**Specialized Table Implementations:**

**`LicensesTable`** - License management table
- Pre-configured columns for license data (status, document type, upload date)
- Built-in actions (view, edit, delete, process, download)
- License status handling with color coding
- Integration with `useLicenses()` and `useLicenseOperations()`
- Working hours calculation display

**`IncidentsTable`** - Incident management table
- Pre-configured columns for incident data (title, status, priority, agent)
- Built-in actions (view, edit, delete, assign)
- Status and priority color coding
- Integration with `useIncidents()` and `useIncidentOperations()`
- Working hours and cost calculations

**`AccountsTable`** - Account management table
- Pre-configured columns for account data
- Built-in CRUD operations
- Integration with `useAccounts()` and `useAccountOperations()`

**Universal Features:**
- Generic TypeScript support with type safety
- Sorting, filtering, and advanced pagination
- Multi-row selection with bulk operations
- Custom row actions and context menus
- Responsive design with mobile optimization
- Loading states and error handling
- Export capabilities
- Real-time data updates

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

### Dialog System (`src/components/common/Dialogs/`)

**`IncidentViewDialog`** - Professional incident viewing dialog
```typescript
<IncidentViewDialog
  open={viewDialogOpen}
  onClose={handleCloseView}
  incident={selectedIncident}
  onEdit={handleEditFromView}
/>
```

Features:
- **Tabbed interface** with Overview, Comments, Working Hours, Technical Details
- **Comments section** with user avatars, timestamps, internal/external labels
- **Working hours breakdown** with agent-specific totals and session details
- **Professional styling** with Material-UI v7 components
- **Responsive design** that works on all screen sizes
- **Seamless integration** with edit workflows

**`UploadLicenseWizard`** - Comprehensive 4-step license upload wizard
```typescript
<UploadLicenseWizard
  open={uploadWizardOpen}
  onClose={() => setUploadWizardOpen(false)}
  onSuccess={handleUploadSuccess}
/>
```

**4-Step Workflow**:
1. **Account Selection** - Choose account using integrated AccountSelection component
2. **File Upload** - Upload license documents via /files/temp-upload endpoint with drag-and-drop support
3. **Dynamic Form** - Auto-generated form based on temp-upload response for different license types
4. **License Creation** - Final processing and creation with visual confirmation

**Key Features**:
- **Wide dialog design** (1000px max-width, 95vw, 90vh) for optimal viewing
- **Visual stepper navigation** with Material-UI icons and progress indicators
- **Dynamic form generation** based on license type detection from uploaded documents
- **Reuses existing components** (AccountSelection, FileUpload, FormBuilder)
- **Professional error handling** with user-friendly messages and retry options
- **Loading states** throughout the entire workflow
- **Success confirmation** with license summary and auto-close functionality
- **Modern UI styling** with gradients, shadows, and responsive design
- **Centralized service integration** using licenseService and fileUploadService

**Integration**:
- Seamlessly integrated into LicensesPage with dedicated "Upload License" button
- Automatic license list refresh upon successful upload
- Compatible with existing license management workflow

### Working Hours System (`src/utils/workingHoursCalculator.ts`)

**Professional working hours calculation and display system:**

```typescript
const summary = getIncidentWorkingHoursSummary(incident);
// Returns: { totalHours, totalCost, billiableHours, agentBreakdown }

const formattedHours = formatHours(2.5); // "2h 30m"
const formattedCost = formatCurrency(250.50); // "$250.50"
```

**Key Features:**
- **Total hours calculation** across all agents and sessions
- **Cost calculation** based on hourly rates and duration
- **Billable vs non-billable** hours breakdown
- **Agent-specific summaries** with individual totals
- **Session-level details** including rates, duration, billing status
- **Professional formatting** for time and currency display
- **Integration with tables** showing quick totals in incident lists

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
│   │   │   ├── DataTable/          # Universal table system
│   │   │   │   ├── DataTable.tsx       # Generic table component
│   │   │   │   ├── LicensesTable.tsx   # Licenses implementation
│   │   │   │   ├── IncidentsTable.tsx  # Incidents implementation
│   │   │   │   ├── AccountsTable.tsx   # Accounts implementation
│   │   │   │   └── index.ts
│   │   │   ├── Dialogs/            # Professional dialog components
│   │   │   │   ├── IncidentViewDialog.tsx
│   │   │   │   ├── UploadLicenseWizard.tsx
│   │   │   │   ├── AddLicenseDialog.tsx
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
│   │   ├── Incident/               # Incident management
│   │   │   └── IncidentsPage.tsx
│   │   └── License/                # License management
│   │       └── LicensesPage.tsx
│   ├── contexts/                   # Domain contexts
│   │   ├── LicenseContext.tsx      # License management state
│   │   ├── AccountContext.tsx      # Account management state
│   │   ├── IncidentsContext.tsx    # Incidents management state
│   │   ├── ComplianceContext.tsx   # Compliance management state
│   │   ├── AuthContext.tsx         # Authentication state
│   │   ├── DataContext.tsx         # Legacy data context
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
│   │   ├── accountsService.ts
│   │   ├── licenseService.ts
│   │   └── index.ts
│   ├── utils/                      # Utility functions
│   │   ├── workingHoursCalculator.ts
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

## Recent Improvements (Latest Changes)

### API Consolidation and Error Fixes

**Problem Solved**: Eliminated duplicate API calls and fixed runtime errors
- **Fixed**: `Uncaught TypeError: items.filter is not a function` in useSelection hook
- **Root Cause**: API returned nested format `{ success: true, data: [...] }` but code expected flat array
- **Solution**: Updated `licenseService.ts` to handle both nested and flat response formats

**API Consolidation**:
- ✅ **Single source of truth**: All license API calls now go through `licenseService.ts`
- ✅ **Consistent endpoints**: All operations use `/license-types` path
- ✅ **Eliminated duplication**: Removed ~50 lines of duplicate API logic from LicenseContext
- ✅ **Improved maintainability**: Future API changes only need updates in one location

**Technical Changes**:
```typescript
// Before: Mixed API patterns in LicenseContext
const response = await fetch(`${baseUrl}/licenses/${id}`, { method: 'PUT' });

// After: Consolidated service approach
const result = await licenseService.updateLicense(id, data);
```

**Response Format Handling**:
```typescript
// Handles both response formats automatically
if (response.data?.success && Array.isArray(response.data.data)) {
  return response.data.data; // Nested format
}
return Array.isArray(response.data) ? response.data : []; // Flat format
```

**Component Cleanup**:
- ✅ **Removed unused components**: License wizard system, examples, unused dialogs
- ✅ **Build optimization**: Reduced bundle size and improved build time
- ✅ **Type safety**: Unified License interface across the application

### API Endpoints Documentation

**License Management** (`/api/license-types/`):
- `GET /api/license-types` - Get all licenses
- `GET /api/license-types/{id}` - Get license by ID
- `POST /api/license-types` - Create license
- `PUT /api/license-types/{id}` - Update license
- `DELETE /api/license-types/{id}` - Delete license
- `POST /api/license-types/{id}/process` - Process license
- `POST /api/license-types/upload` - Upload document
- `POST /api/license-types/extract` - Extract data

All endpoints handle the nested response format automatically.

## Getting Started

1. **Install dependencies**: `npm install`
2. **Start development server**: `npm run dev`
3. **Build for production**: `npm run build`
4. **Run type checking**: `npm run type-check`
5. **Run linting**: `npm run lint`

This project provides a solid foundation for building scalable, maintainable React applications with enterprise-grade patterns and performance optimizations.