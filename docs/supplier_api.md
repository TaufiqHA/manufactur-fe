# Supplier API Documentation

This document provides comprehensive information about the Supplier API endpoints in the application.

## Base URL
All endpoints are prefixed with `/api` and require authentication.

## Authentication
All endpoints require a valid Sanctum authentication token to be included in the request header:
```
Authorization: Bearer {token}
```

## Endpoints

### 1. Get All Suppliers
**GET** `/api/suppliers`

Retrieves a list of all suppliers.

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
[
  {
    "id": 1,
    "name": "ABC Supplier",
    "address": "Jl. Merdeka No. 123, Jakarta",
    "contact": "081234567890",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  },
  {
    "id": 2,
    "name": "XYZ Materials",
    "address": "Jl. Sudirman Kav. 50, Surabaya",
    "contact": "082345678901",
    "created_at": "2024-01-02T00:00:00.000000Z",
    "updated_at": "2024-01-02T00:00:00.000000Z"
  }
]
```

### 2. Create Supplier
**POST** `/api/suppliers`

Creates a new supplier.

#### Request Body
```json
{
  "name": "New Supplier Name",
  "address": "Supplier Address",
  "contact": "Supplier Contact Number"
}
```

#### Validation Rules
- `name`: required, string, max:255
- `address`: required, string
- `contact`: required, string, max:255

#### Response
- Success: Status `201 Created`
```json
{
  "id": 3,
  "name": "New Supplier Name",
  "address": "Supplier Address",
  "contact": "Supplier Contact Number",
  "created_at": "2024-01-03T00:00:00.000000Z",
  "updated_at": "2024-01-03T00:00:00.000000Z"
}
```

- Validation Error: Status `422 Unprocessable Entity`
```json
{
  "errors": {
    "name": [
      "The name field is required."
    ],
    "address": [
      "The address field is required."
    ],
    "contact": [
      "The contact field is required."
    ]
  }
}
```

### 3. Get Supplier
**GET** `/api/suppliers/{id}`

Retrieves a specific supplier by ID.

#### Path Parameters
- `id`: Supplier ID (integer)

#### Response
- Success: Status `200 OK`
```json
{
  "id": 1,
  "name": "ABC Supplier",
  "address": "Jl. Merdeka No. 123, Jakarta",
  "contact": "081234567890",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

- Error: Status `404 Not Found` if supplier doesn't exist

### 4. Update Supplier
**PUT** `/api/suppliers/{id}` or **PATCH** `/api/suppliers/{id}`

Updates an existing supplier.

#### Path Parameters
- `id`: Supplier ID (integer)

#### Request Body
```json
{
  "name": "Updated Supplier Name",
  "address": "Updated Supplier Address",
  "contact": "Updated Supplier Contact Number"
}
```

#### Validation Rules
- `name`: optional (if provided), required, string, max:255
- `address`: optional (if provided), required, string
- `contact`: optional (if provided), required, string, max:255

#### Response
- Success: Status `200 OK`
```json
{
  "id": 1,
  "name": "Updated Supplier Name",
  "address": "Updated Supplier Address",
  "contact": "Updated Supplier Contact Number",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-03T00:00:00.000000Z"
}
```

- Validation Error: Status `422 Unprocessable Entity`
```json
{
  "errors": {
    "name": [
      "The name field is required."
    ],
    "address": [
      "The address field is required."
    ],
    "contact": [
      "The contact field is required."
    ]
  }
}
```

- Error: Status `404 Not Found` if supplier doesn't exist

### 5. Delete Supplier
**DELETE** `/api/suppliers/{id}`

Deletes a supplier.

#### Path Parameters
- `id`: Supplier ID (integer)

#### Response
- Success: Status `204 No Content`

- Error: Status `404 Not Found` if supplier doesn't exist

## Error Responses

Common error responses across all endpoints:

- `401 Unauthorized`: Missing or invalid authentication token
- `404 Not Found`: Requested resource doesn't exist
- `422 Unprocessable Entity`: Validation errors in request data
- `500 Internal Server Error`: Unexpected server error

## Example Requests

### cURL Example - Get All Suppliers
```bash
curl -X GET \
  "http://localhost:8000/api/suppliers" \
  -H "Authorization: Bearer {your-token-here}" \
  -H "Accept: application/json"
```

### cURL Example - Create Supplier
```bash
curl -X POST \
  "http://localhost:8000/api/suppliers" \
  -H "Authorization: Bearer {your-token-here}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "New Supplier",
    "address": "Jl. Example Street No. 123",
    "contact": "081234567890"
  }'
```

### JavaScript Example - Fetch API
```javascript
// Get all suppliers
fetch('/api/suppliers', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  }
})
.then(response => response.json())
.then(data => console.log(data));

// Create new supplier
fetch('/api/suppliers', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'New Supplier',
    address: 'Jl. Example Street No. 123',
    contact: '081234567890'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```