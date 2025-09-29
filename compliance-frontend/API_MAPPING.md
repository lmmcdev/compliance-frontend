# Incidents API Endpoint Mapping

This document outlines the API endpoints needed for the Incidents feature to connect to CosmosDB.

## Required Endpoints

### Base URL Pattern
All incident endpoints should follow the pattern: `/api/incidents`

### Core CRUD Operations

#### 1. Get Incidents (with filtering and continuation token pagination)
```
GET /api/incidents
Query Parameters:
- pageSize: number (default: 25)
- continuationToken: string (optional) - for next page
- search: string (optional) - searches Ticket_title, End_User_full_name, Site_name
- status: string (optional) - filters by Activity_status
- priority: string (optional) - filters by Ticket_priority

Response:
{
  "success": boolean,
  "data": {
    "items": Incident[],
    "continuationToken": string | null
  }
}
```

#### 2. Get Single Incident
```
GET /api/incidents/{id}

Response:
{
  "success": boolean,
  "data": Incident | null
}
```

#### 3. Create Incident
```
POST /api/incidents
Body: CreateIncidentData

Response:
{
  "success": boolean,
  "data": Incident | null
}
```

#### 4. Update Incident
```
PUT /api/incidents/{id}
Body: UpdateIncidentData

Response:
{
  "success": boolean,
  "data": Incident | null
}
```

#### 5. Delete Incident
```
DELETE /api/incidents/{id}

Response:
{
  "success": boolean,
  "data": null
}
```

### Bulk Operations

#### 6. Bulk Status Update
```
PUT /api/incidents/bulk/status
Body: {
  "ids": string[],
  "status": string
}

Response:
{
  "success": boolean,
  "data": null
}
```

#### 7. Bulk Assignment
```
PUT /api/incidents/bulk/assign
Body: {
  "ids": string[],
  "assignedTo": string
}

Response:
{
  "success": boolean,
  "data": null
}
```

## Data Model

### Incident Interface (Based on actual CosmosDB structure)
```typescript
interface Incident {
  id: string;
  doc_type: string;
  row_number: string;
  Ticket_ID: string;
  Ticket_impact: string;
  Ticket_number: string;
  Activity_status: string;
  Ticket_priority: string;
  Ticket_resolved_Date: string;
  Ticket_resolved_Time: string;
  Ticket_source: string;
  Ticket_title: string;
  Ticket_type: string;
  Agent_name: string;
  Public_IP_address: string;
  Machine_name: string;
  Machine_ID: string;
  Comment_contact_ID: string;
  Comment_end_user_ID: string;
  Comment_ID: string;
  Comment_is_internal: string;
  Comment_source: string;
  End_User_email: string;
  End_User_full_name: string;
  End_User_phone: string;
  End_User_status: string;
  Department_ID: string;
  Site_ID: string;
  Site_name: string;
  Site_phone: string;
  Work_hour_start_Time: string;
  Work_hour_end_Time: string;
  Count: string;
  Count2: string;
  _rid: string;
  _self: string;
  _etag: string;
  _attachments: string;
  _ts: number;
}
```

### Create/Update Data Types
```typescript
interface CreateIncidentData {
  Ticket_title: string;
  Ticket_type: string;
  Ticket_priority: string;
  Ticket_impact: string;
  Ticket_source: string;
  Agent_name?: string;
  End_User_email?: string;
  End_User_full_name?: string;
  Site_name?: string;
}

interface UpdateIncidentData extends Partial<CreateIncidentData> {
  Activity_status?: string;
  Ticket_resolved_Date?: string;
  Ticket_resolved_Time?: string;
}
```

## CosmosDB Container Configuration

### Container Name
`incidents`

### Partition Key
`/category` - This allows efficient querying by incident category

### Indexing Policy
```json
{
  "indexingMode": "consistent",
  "automatic": true,
  "includedPaths": [
    {
      "path": "/*"
    }
  ],
  "excludedPaths": [
    {
      "path": "/\"_etag\"/?"
    }
  ],
  "compositeIndexes": [
    [
      {
        "path": "/status",
        "order": "ascending"
      },
      {
        "path": "/reportedAt",
        "order": "descending"
      }
    ],
    [
      {
        "path": "/severity",
        "order": "ascending"
      },
      {
        "path": "/reportedAt",
        "order": "descending"
      }
    ],
    [
      {
        "path": "/assignedTo",
        "order": "ascending"
      },
      {
        "path": "/reportedAt",
        "order": "descending"
      }
    ]
  ]
}
```

## Implementation Notes

### 1. Authentication & Authorization
- All endpoints should require authentication
- Consider role-based access (read vs write permissions)
- Audit logging for incident modifications

### 2. Validation Rules
- Title: 5-200 characters, required
- Description: 10-2000 characters, required
- Category: required, consider predefined categories
- Tags: optional, maximum 20 tags per incident
- AssignedTo: validate against user directory

### 3. Business Logic
- Auto-set `reportedAt` timestamp on creation
- Update `updatedAt` timestamp on all modifications
- Set `resolvedAt` when status changes to 'resolved'
- Send notifications on assignment changes
- Track incident history/audit trail

### 4. Search Implementation
The search parameter should query across:
- title (full-text search)
- description (full-text search)
- category (exact match)
- tags (array contains)

### 5. Performance Considerations
- Use continuation tokens for large result sets
- Implement caching for frequently accessed incidents
- Consider implementing soft deletes instead of hard deletes
- Index optimization for common query patterns

## Example Azure Function Implementation

```typescript
// Example structure for GET /api/incidents
export default async function getIncidents(context: Context, req: HttpRequest) {
  const { page = 0, pageSize = 25, search, status, severity } = req.query;

  let query = "SELECT * FROM c WHERE 1=1";
  const parameters: any[] = [];

  if (search) {
    query += " AND (CONTAINS(c.title, @search) OR CONTAINS(c.description, @search) OR CONTAINS(c.category, @search))";
    parameters.push({ name: "@search", value: search });
  }

  if (status && status !== 'all') {
    query += " AND c.status = @status";
    parameters.push({ name: "@status", value: status });
  }

  if (severity && severity !== 'all') {
    query += " AND c.severity = @severity";
    parameters.push({ name: "@severity", value: severity });
  }

  query += " ORDER BY c.reportedAt DESC";

  // Execute query with pagination
  // Return formatted response
}
```

This mapping provides everything needed to implement the incidents management feature with CosmosDB integration following your project's established patterns.