# Unified Azure Functions Architecture

This document describes the unified architecture for Azure Functions integration across all services in the application.

## Overview

The application now uses a standardized approach for all Azure Functions communication, ensuring consistency, maintainability, and reusability across services.

## Architecture Pattern

```
Service → azureFunctionsClient (Axios) → Azure Functions → Backend Resources
```

### Unified Client Structure

All Azure Functions services now follow this pattern:

1. **Import the unified client**
2. **Define interfaces**
3. **Implement service methods**
4. **Export service object**

## Example Service Implementation

```typescript
// src/services/exampleService.ts
import azureFunctionsClient from '../middleware/azureFunctionsClient';

export interface ExampleEntity {
  id: string;
  name: string;
  // ... other properties
}

export const exampleService = {
  async getAll(): Promise<ExampleEntity[]> {
    const response = await azureFunctionsClient.get<ExampleEntity[]>('/example');
    return response.data;
  },

  async getById(id: string): Promise<ExampleEntity> {
    const response = await azureFunctionsClient.get<ExampleEntity>(`/example/${id}`);
    return response.data;
  },

  async create(data: Omit<ExampleEntity, 'id'>): Promise<ExampleEntity> {
    const response = await azureFunctionsClient.post<ExampleEntity>('/example', data);
    return response.data;
  },

  async update(id: string, data: Partial<ExampleEntity>): Promise<ExampleEntity> {
    const response = await azureFunctionsClient.patch<ExampleEntity>(`/example/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await azureFunctionsClient.delete(`/example/${id}`);
  },
};

export default exampleService;
```

## Client Features

### HTTP Methods

The unified client provides all standard HTTP methods:

- `get<T>(url, config?)` - GET requests
- `post<T>(url, data?, config?)` - POST requests
- `put<T>(url, data?, config?)` - PUT requests
- `patch<T>(url, data?, config?)` - PATCH requests
- `delete<T>(url, config?)` - DELETE requests

### File Upload

For file uploads, use the specialized method:

```typescript
const response = await azureFunctionsClient.uploadFile(
  '/upload',
  file,
  { metadata: 'additional data' },
  (progress) => console.log(`Upload progress: ${progress}%`)
);
```

### Error Handling

The client automatically handles:

- **Network timeouts** (30 seconds default)
- **Authentication errors** (401)
- **Authorization errors** (403)
- **Not found errors** (404)
- **Server errors** (5xx)
- **Network connectivity issues**

All errors are logged with `[Azure Functions]` prefix for easy identification.

## Configuration

### Environment Variables

Set these variables in your `.env` file:

```bash
VITE_AZURE_FUNCTIONS_URL=https://your-function-app.azurewebsites.net/api
VITE_AZURE_FUNCTIONS_KEY=your-function-key-here
```

### Client Configuration

The client is configured automatically with:

- **Base URL**: From `VITE_AZURE_FUNCTIONS_URL`
- **Function Key**: From `VITE_AZURE_FUNCTIONS_KEY`
- **Timeout**: 30 seconds
- **Headers**: JSON content-type + function key
- **Authentication**: Automatic Bearer token from localStorage

## Interceptors

### Request Interceptor

Automatically adds:
- Function key header (`x-functions-key`)
- Bearer token if available
- Request logging

### Response Interceptor

Handles:
- Response logging
- Error categorization
- Automatic error logging with context

## Benefits of Unified Architecture

### 1. Consistency
- All services follow the same pattern
- Standardized error handling
- Uniform logging and debugging

### 2. Maintainability
- Single point of configuration
- Centralized authentication logic
- Easy to update or extend

### 3. Developer Experience
- Same API across all services
- TypeScript support throughout
- Clear error messages and logging

### 4. Performance
- Connection pooling via Axios
- Request/response interceptors
- Automatic timeout handling

### 5. Future-Proof
- Easy to add new services
- Simple to modify behavior globally
- Extensible architecture

## Migration from Old Pattern

### Before (Custom Implementation)
```typescript
// Old pattern - custom fetch logic
async makeRequest<T>(endpoint: string): Promise<Response<T>> {
  const response = await fetch(url, {
    headers: { 'x-functions-key': key },
    // ... custom logic
  });

  if (!response.ok) {
    // ... custom error handling
  }

  return { success: true, data: await response.json() };
}
```

### After (Unified Client)
```typescript
// New pattern - unified client
async getItems(): Promise<Item[]> {
  const response = await azureFunctionsClient.get<Item[]>('/items');
  return response.data;
}
```

## Service Examples

### Current Implementations

1. **accountsService** - Full CRUD + search + validation
2. **licenseService** - Document processing + storage
3. **complianceService** - Case management + metrics

### Adding New Services

To add a new Azure Functions service:

1. Create service file: `src/services/newService.ts`
2. Import unified client: `import azureFunctionsClient from '../middleware/azureFunctionsClient'`
3. Define interfaces for your data types
4. Implement methods using client
5. Export service object

Example:
```typescript
import azureFunctionsClient from '../middleware/azureFunctionsClient';

export interface NewEntity {
  id: string;
  name: string;
}

export const newService = {
  async getAll(): Promise<NewEntity[]> {
    const response = await azureFunctionsClient.get<NewEntity[]>('/new-endpoint');
    return response.data;
  },
  // ... other methods
};
```

## Testing

### Unit Testing
Mock the Azure Functions client for unit tests:

```typescript
jest.mock('../middleware/azureFunctionsClient');
const mockClient = azureFunctionsClient as jest.Mocked<typeof azureFunctionsClient>;

// Test implementation
mockClient.get.mockResolvedValue({ data: mockData });
```

### Integration Testing
Test against actual Azure Functions endpoints using test environment configuration.

## Troubleshooting

### Common Issues

1. **Configuration warnings**
   ```
   [Azure Functions] VITE_AZURE_FUNCTIONS_URL not configured properly
   ```
   - Check environment variables in `.env` file

2. **Authentication errors**
   ```
   [Azure Functions] Unauthorized - invalid function key
   ```
   - Verify `VITE_AZURE_FUNCTIONS_KEY` is correct

3. **Network timeouts**
   ```
   [Azure Functions] Request timeout
   ```
   - Check Azure Functions health
   - Verify network connectivity

### Debug Mode

Enable detailed logging by checking browser console for `[Azure Functions]` messages.

## Future Enhancements

Planned improvements:
- Request/response caching
- Retry logic with exponential backoff
- Health checking and circuit breaker
- Metrics collection
- Request batching capabilities

## Best Practices

1. **Always use TypeScript types** for request/response data
2. **Handle errors appropriately** in your service methods
3. **Use meaningful endpoint URLs** that match Azure Functions routes
4. **Validate data before sending** to Azure Functions
5. **Log important operations** for debugging
6. **Test both success and error scenarios**

This unified architecture provides a solid foundation for all Azure Functions communication while maintaining flexibility for future enhancements.