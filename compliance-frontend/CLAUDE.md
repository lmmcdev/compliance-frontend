# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Compliance Frontend is a React TypeScript application for managing compliance licenses, incidents, and accounts. It uses Azure Functions for backend integration, Azure AD for authentication, and Cosmos DB for data storage.

**Tech Stack:**
- React 19 + TypeScript + Vite
- Material-UI v7 + Tailwind CSS v4
- Azure MSAL for authentication
- Azure Functions for API backend
- Azure Blob Storage for file uploads

## Commands

### Development
```bash
npm run dev          # Start dev server (default: http://localhost:5173)
npm run build        # Build for production (TypeScript check + Vite build)
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Working Directory
All commands should be run from the `compliance-frontend/` subdirectory, not the repository root.

## Architecture

### Three-Layer Pattern

**Service Layer** (`src/services/`)
- Single source of truth for all API calls
- Handles Azure Functions integration and response formatting
- Example: `licenseService.ts` handles all `/api/license-types` endpoints

**Context Layer** (`src/contexts/`)
- Domain-specific state management (Licenses, Accounts, Incidents, etc.)
- Wraps services with React state and provides consumer hooks
- Example: `LicenseContext.tsx` provides `useLicenses()` hook

**Component Layer** (`src/components/`)
- Consumes contexts via hooks, never calls services directly
- Generic reusable components in `common/`, feature-specific in feature folders

### API Response Format

All Azure Functions endpoints return this nested format:
```typescript
{
  success: boolean,
  data: T | T[] | { items: T[], continuationToken?: string }
}
```

Services automatically unwrap this to return the inner `data` directly.

### Key Directories

- `src/hooks/data/` - Universal API hooks (`useApiQuery`, `useApiMutation`, `useAuthenticatedApi`)
- `src/hooks/patterns/` - Reusable patterns (`useSelection`, `useAsync`, `useDebounce`)
- `src/hooks/optimization/` - Performance (`useVirtualization`, `useMemoCompare`)
- `src/components/common/DataTable/` - Generic table system with specialized implementations
- `src/components/common/Dialogs/` - Professional dialog components
- `src/components/common/Forms/` - Dynamic form builder system
- `src/types/` - Shared TypeScript interfaces

## Important Patterns

### API Integration

**Always use services, never direct API calls:**
```typescript
// ✅ Correct
import { licenseService } from '@/services/licenseService';
const licenses = await licenseService.getAllLicenses();

// ❌ Wrong - don't bypass the service layer
const response = await fetch('/api/license-types');
```

**In components, use contexts:**
```typescript
// ✅ Correct
import { useLicenses } from '@/contexts/LicenseContext';
const { licenses, loading, error } = useLicenses();

// ❌ Wrong - don't call services from components
import { licenseService } from '@/services/licenseService';
```

### Generic Table System

The `DataTable<T>` component is universal. Use specialized implementations:
- `LicensesTable` - for licenses (includes status, processing, download actions)
- `IncidentsTable` - for incidents (includes working hours, assignment)
- `AccountsTable` - for accounts
- Create new specialized tables for new entities

### File Upload Workflow

License upload follows a 4-step wizard pattern in `AddLicenseDialog/`:
1. **Account Selection** - Choose associated account
2. **File Upload** - Upload document to Azure Blob Storage
3. **Review Extracted Fields** - Edit AI-extracted data with confidence scores
4. **Confirmation** - Final review and save

Business logic lives in `useAddLicenseWizard` hook, not in components.

### Working Hours System

Use `workingHoursCalculator.ts` utilities for incidents:
- `getIncidentWorkingHoursSummary()` - calculate totals and costs
- `formatHours()` - format duration as "2h 30m"
- `formatCurrency()` - format as "$250.50"

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Required for authentication
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id

# Required for API calls
VITE_API_BASE_URL=http://localhost:3000  # or production URL
VITE_AZURE_FUNCTIONS_URL=https://your-function-app.azurewebsites.net/api
VITE_AZURE_FUNCTIONS_KEY=your-function-key

# Required for document intelligence
VITE_AZURE_INTELLIGENCE_ENDPOINT=https://your-endpoint.cognitiveservices.azure.com
VITE_AZURE_INTELLIGENCE_KEY=your-intelligence-key
```

All environment variables must use `VITE_` prefix to be accessible in the app.

## Routing Structure

Main routes (defined in `App.tsx`):
- `/login` - Authentication
- `/dashboard` - Main dashboard
- `/licenses` - License management (LicensesPage)
- `/incidents` - Incident management (IncidentsPage)
- `/compliance` - Compliance forms

All routes except `/login` and `/auth-error` require authentication.

## TypeScript Configuration

- Strict mode enabled
- Bundler module resolution
- No unused locals/parameters enforced
- Path aliases not configured (use relative imports)

## Component Development Guidelines

### When Creating New Features

1. **Service first:** Create service in `src/services/` with all CRUD operations
2. **Context second:** Create context in `src/contexts/` to wrap service with React state
3. **Component last:** Build UI components that consume the context

### When Creating Tables

1. Use `DataTable<T>` generic component as base
2. Create specialized implementation like `EntitiesTable.tsx`
3. Define column configurations with proper typing
4. Add row actions (view, edit, delete) as needed
5. Integrate with context hooks for data management

### When Creating Forms

1. Use `FormBuilder` with `FormFieldConfig[]` for dynamic forms
2. Or use `FormField` components individually for custom layouts
3. Leverage built-in validation and error handling
4. Support all field types: text, select, date, file, checkbox, etc.

## Testing Data Extraction

For license extraction testing, the service expects:
- `analyzeResult` metadata (modelId, apiVersion, documentsCount)
- Fields with `content`, `confidence`, `boundingRegions`, `spans`
- Use `licenseExtractionService.ts` to parse responses

## Common Pitfalls

### Response Format Errors
**Problem:** `items.filter is not a function`
**Cause:** API returns `{ success: true, data: [...] }` but code expects flat array
**Solution:** Services already handle unwrapping - ensure you're using the service layer

### Duplicate API Calls
**Problem:** Same endpoint called from both service and context
**Solution:** Only call from service, context should use service functions

### Import Path Confusion
**Problem:** No path aliases configured
**Solution:** Use relative imports like `'../services/licenseService'`

### Environment Variables Not Working
**Problem:** Variable undefined in app
**Solution:** Must use `VITE_` prefix and restart dev server

## Authentication Flow

1. App loads → `AuthProvider` wraps app
2. `AuthenticationProvider` middleware handles MSAL
3. Protected routes check `isAuthenticated` from `useAuth()`
4. API calls include auth tokens via `useAuthenticatedApi()`

## Key Files to Reference

- `PROJECT_OVERVIEW.md` - Comprehensive architecture documentation
- `API_MAPPING.md` - Incidents API endpoint specifications
- `src/services/README-AzureFunctions.md` - Azure Functions integration guide
- `src/types/license.ts` - License type definitions
- `src/utils/workingHoursCalculator.ts` - Working hours utilities

## Design System

**Colors:** Use Material-UI theme palette (primary, secondary, success, error, etc.)
**Typography:** Material-UI Typography component
**Spacing:** Material-UI spacing system (8px base unit)
**Breakpoints:** xs, sm, md, lg, xl (Material-UI standard)
**Icons:** `@mui/icons-material`

## Performance Considerations

- Use `useVirtualization` for lists with 100+ items
- Use `useDebounce` for search inputs (300ms recommended)
- Use `useMemoCompare` for deep comparison memoization
- Use `React.memo()` for pure presentational components
- Monitor performance with `usePerformanceMonitor` hook
