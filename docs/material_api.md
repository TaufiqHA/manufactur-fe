# Material API Documentation

This document provides comprehensive documentation for the Material API endpoints.

## Base URL
All endpoints are relative to the base API URL: `https://your-domain.com/api/`

## Authentication
All endpoints require authentication using Laravel Sanctum tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-api-token}
```

## Endpoints

### 1. Get All Materials
**GET** `/api/materials`

Retrieve a list of all materials.

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
[
  {
    "id": 1,
    "code": "MAT-001",
    "name": "Steel Plate",
    "unit": "kg",
    "current_stock": 500,
    "safety_stock": 50,
    "price_per_unit": "15.50",
    "category": "RAW",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
]
```

### 2. Get Single Material
**GET** `/api/materials/{id}`

Retrieve a specific material by ID.

#### Parameters
- `id` (integer, required): The ID of the material to retrieve.

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "id": 1,
  "code": "MAT-001",
  "name": "Steel Plate",
  "unit": "kg",
  "current_stock": 500,
  "safety_stock": 50,
  "price_per_unit": "15.50",
  "category": "RAW",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### 3. Create Material
**POST** `/api/materials`

Create a new material.

#### Request Body
- `code` (string, required): Unique code for the material.
- `name` (string, required): Name of the material.
- `unit` (string, required): Unit of measurement (e.g., kg, pcs, meter).
- `current_stock` (integer, required): Current stock quantity (min: 0).
- `safety_stock` (integer, required): Safety stock quantity (min: 0).
- `price_per_unit` (number, required): Price per unit (min: 0).
- `category` (string, required): Category of the material (RAW, FINISHING, HARDWARE).

#### Response
- Status: `201 Created`
- Content-Type: `application/json`

```json
{
  "id": 1,
  "code": "MAT-001",
  "name": "Steel Plate",
  "unit": "kg",
  "current_stock": 500,
  "safety_stock": 50,
  "price_per_unit": "15.50",
  "category": "RAW",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

#### Validation Errors
- Status: `422 Unprocessable Entity`
- Content-Type: `application/json`

```json
{
  "errors": {
    "code": [
      "The code field is required."
    ],
    "name": [
      "The name field is required."
    ]
  }
}
```

### 4. Update Material
**PUT/PATCH** `/api/materials/{id}`

Update an existing material.

#### Parameters
- `id` (integer, required): The ID of the material to update.

#### Request Body
- `code` (string, optional): Unique code for the material.
- `name` (string, optional): Name of the material.
- `unit` (string, optional): Unit of measurement.
- `current_stock` (integer, optional): Current stock quantity.
- `safety_stock` (integer, optional): Safety stock quantity.
- `price_per_unit` (number, optional): Price per unit.
- `category` (string, optional): Category of the material (RAW, FINISHING, HARDWARE).

#### Response
- Status: `200 OK`
- Content-Type: `application/json`

```json
{
  "id": 1,
  "code": "MAT-001",
  "name": "Steel Plate",
  "unit": "kg",
  "current_stock": 500,
  "safety_stock": 50,
  "price_per_unit": "15.50",
  "category": "RAW",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

### 5. Delete Material
**DELETE** `/api/materials/{id}`

Delete a material.

#### Parameters
- `id` (integer, required): The ID of the material to delete.

#### Response
- Status: `204 No Content`

## Data Model

### Material Object
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique identifier for the material |
| code | string | Unique code for the material |
| name | string | Name of the material |
| unit | string | Unit of measurement (e.g., kg, pcs, meter) |
| current_stock | integer | Current stock quantity |
| safety_stock | integer | Safety stock quantity |
| price_per_unit | decimal | Price per unit with 2 decimal places |
| category | string | Category of the material (RAW, FINISHING, HARDWARE) |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

## Error Responses

### 401 Unauthorized
Returned when the request lacks valid authentication credentials.

```json
{
  "message": "Unauthenticated."
}
```

### 404 Not Found
Returned when the requested resource does not exist.

```json
{
  "message": "Resource not found."
}
```

### 422 Validation Error
Returned when the request data fails validation.

```json
{
  "message": "The code field is required.",
  "errors": {
    "code": [
      "The code field is required."
    ]
  }
}
```

## Example Usage

### Creating a Material
```bash
curl -X POST https://your-domain.com/api/materials \
  -H "Authorization: Bearer {your-api-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "MAT-NEW001",
    "name": "New Material",
    "unit": "pcs",
    "current_stock": 100,
    "safety_stock": 10,
    "price_per_unit": 25.99,
    "category": "RAW"
  }'
```

### Updating a Material
```bash
curl -X PUT https://your-domain.com/api/materials/1 \
  -H "Authorization: Bearer {your-api-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Material Name",
    "current_stock": 150
  }'
```