# Azure Functions Integration - Accounts Service

This document explains the new Azure Functions-based accounts service implementation that replaces the previous Cosmos DB direct integration.

## Overview

The accounts service now communicates with Azure Functions endpoints instead of directly accessing Cosmos DB. This provides better security, scalability, and maintainability.

## Architecture

```
Frontend (React) → Azure Functions → Cosmos DB
```

- **Frontend**: Uses `accountsService.ts` to make HTTP requests
- **Azure Functions**: Serverless functions that handle business logic and data access
- **Cosmos DB**: Data storage layer (accessed only by Azure Functions)

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```bash
# Azure Functions Configuration
REACT_APP_AZURE_FUNCTIONS_URL=https://your-function-app.azurewebsites.net/api
REACT_APP_AZURE_FUNCTIONS_KEY=your-function-key-here
```

### Getting Your Azure Functions Configuration

1. **Base URL**: Found in Azure Portal → Your Function App → Overview → URL
2. **Function Key**: Azure Portal → Your Function App → Functions → Function Keys

## Service Features

### Core Operations

- ✅ **GET /accounts** - List accounts with filtering and pagination
- ✅ **GET /accounts/{id}** - Get specific account by ID
- ✅ **POST /accounts** - Create new account
- ✅ **PATCH /accounts/{id}** - Update existing account
- ✅ **DELETE /accounts/{id}** - Delete account

### Advanced Operations

- ✅ **GET /accounts/search** - Search accounts by query
- ✅ **POST /accounts/bulk** - Bulk create accounts
- ✅ **GET /accounts/stats** - Get account statistics

## Usage Examples

### Basic Usage with React Context

```tsx
import { useAccounts } from '../contexts/DataContext';

function MyComponent() {
  const { accounts, loading, error, fetchAccounts } = useAccounts();

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {accounts.map(account => (
        <div key={account.id}>{account.name}</div>
      ))}
    </div>
  );
}
```

### Direct Service Usage

```tsx
import { accountsService } from '../services/accountsService';

// Get all active accounts
const response = await accountsService.getAccounts({
  status: 'active',
  limit: 10
});

// Search accounts
const searchResult = await accountsService.searchAccounts('clinic');

// Create account
const newAccount = await accountsService.createAccount({
  name: 'New Clinic',
  type: 'healthcare',
  status: 'active',
  contactEmail: 'contact@clinic.com'
});
```

## API Endpoints

### List Accounts
```
GET /accounts?status=active&type=clinic&limit=10&page=1
```

Response:
```json
{
  "success": true,
  "data": {
    "accounts": [...],
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

### Search Accounts
```
GET /accounts/search?q=clinic&status=active&limit=20
```

### Get Account by ID
```
GET /accounts/{id}
```

### Create Account
```
POST /accounts
Content-Type: application/json

{
  "name": "New Clinic",
  "type": "healthcare",
  "status": "active",
  "contactEmail": "contact@clinic.com",
  "contactPhone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Miami",
    "state": "FL",
    "zipCode": "33101"
  }
}
```

### Update Account
```
PATCH /accounts/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "contactPhone": "+9876543210"
}
```

### Delete Account
```
DELETE /accounts/{id}
```

## Error Handling

The service includes comprehensive error handling:

- **Network Errors**: Connection failures, timeouts
- **HTTP Errors**: 4xx, 5xx responses
- **Validation Errors**: Invalid data before sending to API
- **Authentication Errors**: Invalid function keys

Example error response:
```json
{
  "success": false,
  "error": "Account validation failed: Name is required",
  "statusCode": 400
}
```

## Features

### Validation
Built-in client-side validation for:
- Required fields (name, type)
- Email format validation
- Phone number format validation

### Caching
- 5-minute cache for account lists
- Automatic refresh when needed
- Manual refresh capability

### Performance
- Request timeouts (30 seconds)
- Abort controller for cancelling requests
- Optimized response handling

### Security
- Function key authentication
- HTTPS-only communication
- No direct database access from frontend

## Migration from Cosmos DB Service

If you're upgrading from the previous `cosmosDbService`, the changes are:

1. **Import change**:
   ```tsx
   // Old
   import { cosmosDbService } from '../services/cosmosDbService';

   // New
   import { accountsService } from '../services/accountsService';
   ```

2. **Response structure**: The new service returns accounts in a structured format:
   ```tsx
   // Old: direct array
   response.data // Account[]

   // New: structured response
   response.data.accounts // Account[]
   ```

3. **All existing functionality is preserved** - same interfaces and methods

## Troubleshooting

### Common Issues

1. **"Configuration issues" warning**
   - Check that environment variables are set correctly
   - Ensure the Azure Functions URL is valid
   - Verify the function key is correct

2. **Network timeout errors**
   - Check Azure Functions are running
   - Verify network connectivity
   - Ensure CORS is configured if needed

3. **Authentication errors**
   - Verify the function key is valid and not expired
   - Check that the function app has proper permissions

### Development Tips

- Use the browser's Network tab to debug API calls
- Check the console for configuration warnings
- Test with a REST client (Postman, curl) first
- Verify Azure Functions logs in the Azure Portal

## Future Enhancements

Planned improvements:
- Retry logic for failed requests
- Offline capability with local storage
- Real-time updates with SignalR
- Enhanced caching strategies
- Pagination improvements