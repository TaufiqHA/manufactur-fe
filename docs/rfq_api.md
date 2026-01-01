# RFQ API Documentation

This document provides comprehensive information about the RFQ (Request for Quotation) API endpoints available in the system.

## Base URL

All API endpoints are relative to:
```
https://your-domain.com/api
```

## Authentication

All RFQ endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-token}
```

## Available Endpoints

### 1. Get All RFQs

**GET** `/api/rfqs`

Retrieves a list of all RFQs in the system.

#### Headers
- `Authorization: Bearer {token}`

#### Response
- **200 OK**: Returns an array of RFQ objects

#### Example Request
```bash
curl -X GET \
  "https://your-domain.com/api/rfqs" \
  -H "Authorization: Bearer {token}"
```

#### Example Response
```json
[
  {
    "id": 1,
    "code": "RFQ-2024-001",
    "date": "2024-12-31T00:00:00.000000Z",
    "description": "Sample RFQ description",
    "status": "DRAFT",
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z"
  }
]
```

### 2. Get Single RFQ

**GET** `/api/rfqs/{id}`

Retrieves a specific RFQ by its ID.

#### Path Parameters
- `id` (integer): The ID of the RFQ to retrieve

#### Headers
- `Authorization: Bearer {token}`

#### Response
- **200 OK**: Returns the requested RFQ object
- **404 Not Found**: If the RFQ doesn't exist

#### Example Request
```bash
curl -X GET \
  "https://your-domain.com/api/rfqs/1" \
  -H "Authorization: Bearer {token}"
```

#### Example Response
```json
{
  "id": 1,
  "code": "RFQ-2024-001",
  "date": "2024-12-31T00:00:00.000000Z",
  "description": "Sample RFQ description",
  "status": "DRAFT",
  "created_at": "2024-01-01T10:00:00.000000Z",
  "updated_at": "2024-01-01T10:00:00.000000Z"
}
```

### 3. Create RFQ

**POST** `/api/rfqs`

Creates a new RFQ in the system.

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
- `code` (string, required): Unique code for the RFQ (max 255 characters)
- `date` (date, required): Date of the RFQ
- `description` (string, optional): Description of the RFQ
- `status` (string, required): Status of the RFQ (must be "DRAFT" or "PO_CREATED")

#### Response
- **201 Created**: Returns the created RFQ object
- **422 Unprocessable Entity**: If validation fails

#### Example Request
```bash
curl -X POST \
  "https://your-domain.com/api/rfqs" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "RFQ-2024-002",
    "date": "2024-12-31",
    "description": "New RFQ for project materials",
    "status": "DRAFT"
  }'
```

#### Example Response
```json
{
  "id": 2,
  "code": "RFQ-2024-002",
  "date": "2024-12-31T00:00:00.000000Z",
  "description": "New RFQ for project materials",
  "status": "DRAFT",
  "created_at": "2024-01-01T11:00:00.000000Z",
  "updated_at": "2024-01-01T11:00:00.000000Z"
}
```

### 4. Update RFQ

**PUT** `/api/rfqs/{id}` or **PATCH** `/api/rfqs/{id}`

Updates an existing RFQ.

#### Path Parameters
- `id` (integer): The ID of the RFQ to update

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
- `code` (string, optional): Updated code for the RFQ (max 255 characters)
- `date` (date, optional): Updated date of the RFQ
- `description` (string, optional): Updated description of the RFQ
- `status` (string, optional): Updated status of the RFQ (must be "DRAFT" or "PO_CREATED")

#### Response
- **200 OK**: Returns the updated RFQ object
- **404 Not Found**: If the RFQ doesn't exist
- **422 Unprocessable Entity**: If validation fails

#### Example Request
```bash
curl -X PUT \
  "https://your-domain.com/api/rfqs/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "RFQ-2024-001-UPDATED",
    "status": "PO_CREATED"
  }'
```

#### Example Response
```json
{
  "id": 1,
  "code": "RFQ-2024-001-UPDATED",
  "date": "2024-12-31T00:00:00.000000Z",
  "description": "Sample RFQ description",
  "status": "PO_CREATED",
  "created_at": "2024-01-01T10:00:00.000000Z",
  "updated_at": "2024-01-01T12:00:00.000000Z"
}
```

### 5. Delete RFQ

**DELETE** `/api/rfqs/{id}`

Deletes an existing RFQ.

#### Path Parameters
- `id` (integer): The ID of the RFQ to delete

#### Headers
- `Authorization: Bearer {token}`

#### Response
- **204 No Content**: Successfully deleted the RFQ
- **404 Not Found**: If the RFQ doesn't exist

#### Example Request
```bash
curl -X DELETE \
  "https://your-domain.com/api/rfqs/1" \
  -H "Authorization: Bearer {token}"
```

## Status Values

The RFQ status field can have the following values:

- `DRAFT`: The RFQ is in draft state and not yet finalized
- `PO_CREATED`: A purchase order has been created from this RFQ

## Error Responses

When an error occurs, the API returns a JSON response with error details:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Error message for the field"
    ]
  }
}
```

## Rate Limiting

All API endpoints are subject to rate limiting. By default, users can make 60 requests per minute.