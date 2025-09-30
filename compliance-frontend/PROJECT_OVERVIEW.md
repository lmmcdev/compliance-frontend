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

#### Data Hooks (`src/hooks/data/`)

**`useAuthenticatedApi`** - Central API hook with Azure Functions authentication
```typescript
const { client, isConnected, error } = useAuthenticatedApi();
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

**`usePagination`** - Pagination management for data tables
```typescript
const { page, pageSize, handlePageChange, handlePageSizeChange } = usePagination();
```

**`useSearch`** - Search functionality with debouncing
```typescript
const { searchTerm, debouncedSearchTerm, handleSearch } = useSearch();
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

**`licenseService.ts`** - Consolidated license operations (Single API source)
- All license CRUD operations using `/license-types` endpoints
- Handles nested API response format: `{ success: true, data: [...] }`
- Automatic data extraction from wrapped responses
- Type-safe operations with proper error handling
- Eliminates API call duplication between service and context layers

**`accountsService.ts`** - Account management operations
- Account CRUD operations
- Azure Functions integration
- Type-safe account operations

**`complianceService.ts`** - Compliance data operations
- Compliance form submissions
- Data validation and processing

**`cosmosDbService.ts`** - Cosmos DB direct access
- Database operations
- Query management
- Data persistence

**`fileUploadService.ts`** - File upload functionality
- Multi-file support
- Progress tracking
- Validation and error handling
- Temporary file upload to Azure
- Document extraction webhook integration

**`licenseExtractionService.ts`** - License extraction parsing ✨NEW
- Parses nested extraction responses from document analysis
- Handles multiple response format variations
- Validates extracted data integrity
- Provides utility functions (filtering, grouping, field statistics)
- Type-safe field extraction with confidence scores

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

**`ExtractedFieldsForm/`** - Specialized form for extracted license fields
- Dynamic field rendering based on license type
- Integration with license data extraction
- Validation for extracted data

Field types supported:
- `text`, `email`, `password`, `number`, `tel`, `url`
- `textarea`, `select`, `multiselect`
- `checkbox`, `radio`, `date`, `file`

### Input Components (`src/components/common/Inputs/`)

**`AccountSelection/`** - Account selection component
- Searchable account dropdown
- Integration with AccountContext
- Multi-select support

**`FileUpload/`** - File upload component
- Drag-and-drop support
- Multiple file upload
- Progress indicators
- File type validation

### Display Components (`src/components/common/Display/`)

Various display components for presenting data in different formats

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

**`AddLicenseDialog/`** - Modular 4-step license upload wizard ✨REFACTORED

**Architecture - Clean Separation of Concerns:**
```
AddLicenseDialog/
├── AddLicenseDialog.tsx          # Container (230 lines)
├── WizardSteps/
│   ├── AccountSelectionStep.tsx  # Step 1: Account selection
│   ├── FileUploadStep.tsx        # Step 2: Document upload
│   ├── ExtractedFieldsStep.tsx   # Step 3: Field review
│   └── ConfirmationStep.tsx      # Step 4: Final confirmation
└── DocumentPreview/
    └── DocumentPreviewPanel.tsx  # Live document viewer
```

**Usage:**
```typescript
<AddLicenseDialog
  open={addDialogOpen}
  onClose={() => setAddDialogOpen(false)}
  onSave={handleSaveLicense}
/>
```

**4-Step Workflow**:
1. **Account Selection** - Choose account with searchable dropdown
2. **File Upload** - Drag-and-drop document upload with instant preview
3. **Review & Edit** - Review extracted fields with confidence scores and metadata
4. **Confirmation** - Final review and submission

**Key Features**:
- ✅ **Modular architecture** - Each step is a separate component
- ✅ **Business logic extracted** - All logic in `useAddLicenseWizard` hook
- ✅ **Live document preview** - Side-by-side PDF/image viewer with zoom controls
- ✅ **Smart extraction** - Parses `analyzeResult` metadata (modelId, apiVersion, documentsCount)
- ✅ **Expandable field details** - Shows confidence, type, page, category, bounding box, etc.
- ✅ **Professional UI** - 1400px wide split-panel layout (content + preview)
- ✅ **Type-safe** - Full TypeScript coverage with proper interfaces
- ✅ **Testable** - Business logic separated for easy unit testing
- ✅ **Reusable hooks** - `useDocumentPreview` for preview management

**Technical Architecture:**
- **Presentation Layer**: Small focused components (~50-100 lines each)
- **Business Logic**: `useAddLicenseWizard` hook manages all state and operations
- **Service Layer**: `licenseExtractionService` processes extraction responses
- **Utility Hooks**: `useDocumentPreview` manages preview state and zoom

**Integration**:
- Integrated into LicensesPage with "Add License" button
- Automatic license list refresh upon successful creation
- Uses existing `AccountSelection` and `ExtractedFieldsForm` components
- Leverages `fileUploadService` and `licenseExtractionService`

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

### License Management Hooks (`src/hooks/`)

**`useLicenseFields`** - License field management
```typescript
const { fields, updateField, validateFields } = useLicenseFields(licenseType);
```

**`useLicenseUpload`** - License upload workflow management
```typescript
const { uploadLicense, uploadProgress, uploadError } = useLicenseUpload();
```

**`useWizardFlow`** - Multi-step wizard flow management
```typescript
const { currentStep, nextStep, prevStep, goToStep, isLastStep } = useWizardFlow(totalSteps);
```

### Middleware Layer (`src/middleware/`)

Middleware components for request/response processing, authentication guards, and route protection.

### Theme Configuration (`src/theme/`)

Material-UI theme customization and styling configurations:
- Color palettes
- Typography settings
- Component overrides
- Responsive breakpoints

### Additional Page Components

**`Auth/`** - Authentication components
- Login/logout forms
- Protected route wrappers
- Authentication status displays

**`ComplianceForm/`** - Compliance-specific form components
- Pre-configured compliance data entry forms
- Compliance validation rules

**`Dashboard/`** - Dashboard page components
- Main dashboard layout
- Dashboard-specific widgets

**`Layout/`** - Application layout components
- Navigation bars
- Sidebars
- Page containers
- Responsive layouts

**`LicenseManagement/`** - License management pages
- LicensesPage with integrated table and dialogs
- License workflow management

**`Incident/`** - Incident management pages
- IncidentsPage with integrated table and dialogs
- Incident workflow management

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
│   │   │   ├── Display/            # Display components
│   │   │   ├── Forms/              # Form system
│   │   │   │   ├── FormBuilder.tsx
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── ExtractedFieldsForm/
│   │   │   │   └── index.ts
│   │   │   ├── Inputs/             # Input components
│   │   │   │   ├── AccountSelection/
│   │   │   │   ├── FileUpload/
│   │   │   │   └── index.ts
│   │   │   ├── Layout/             # Layout system
│   │   │   │   ├── ResponsiveContainer.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── Auth/                   # Authentication components
│   │   ├── ComplianceForm/         # Compliance form components
│   │   ├── Dashboard/              # Dashboard page components
│   │   ├── Incident/               # Incident management
│   │   │   └── IncidentsPage.tsx
│   │   ├── Layout/                 # Layout components
│   │   └── LicenseManagement/      # License management
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
│   │   ├── data/                   # Data hooks
│   │   │   ├── useApiMutation.ts
│   │   │   ├── useApiQuery.ts
│   │   │   ├── useAuthenticatedApi.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useSearch.ts
│   │   │   └── index.ts
│   │   ├── optimization/           # Performance hooks
│   │   │   ├── useMemoCompare.ts
│   │   │   ├── useVirtualization.ts
│   │   │   ├── usePerformanceMonitor.ts
│   │   │   └── index.ts
│   │   ├── patterns/               # Advanced patterns
│   │   │   ├── useSelection.ts
│   │   │   ├── useLayout.ts
│   │   │   ├── useAsync.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── usePersistentState.ts
│   │   │   └── index.ts
│   │   ├── useLicenseFields.ts     # License fields hook
│   │   ├── useLicenseUpload.ts     # License upload hook
│   │   └── useWizardFlow.ts        # Wizard flow hook
│   ├── middleware/                 # Middleware layer
│   ├── services/                   # Service layer
│   │   ├── accountsService.ts
│   │   ├── complianceService.ts
│   │   ├── cosmosDbService.ts
│   │   ├── fileUploadService.ts
│   │   ├── licenseService.ts
│   │   ├── README-AzureFunctions.md
│   │   └── index.ts
│   ├── theme/                      # Theme configuration
│   ├── types/                      # TypeScript definitions
│   ├── utils/                      # Utility functions
│   │   ├── workingHoursCalculator.ts
│   │   └── index.ts
│   ├── assets/                     # Static assets
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── public/                         # Public assets
├── dist/                           # Build output
├── node_modules/                   # Dependencies
├── package.json
├── tsconfig.json
├── vite.config.ts
└── PROJECT_OVERVIEW.md            # This file
```

## Usage Examples

### Creating a New Data Table

```typescript
import { DataTable } from '@/components/common/DataTable';
import { useApiQuery } from '@/hooks/data';

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