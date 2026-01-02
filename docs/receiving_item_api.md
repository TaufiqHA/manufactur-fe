# Receiving Item API Documentation

This document provides comprehensive documentation for the Receiving Item API endpoints in the manufacturing system.

## Base URL

All API endpoints are relative to:
```
https://your-domain.com/api
```

## Authentication

All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-token}
```

## Endpoints

### Get All Receiving Items

**GET** `/receiving-items`

Retrieve a paginated list of all receiving items.

#### Headers
```
Authorization: Bearer {your-token}
Content-Type: application/json
```

#### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Number of items per page (default: 10)

#### Response
- **200 OK**: Successfully retrieved the list of receiving items

```json
{
    "data": [
        {
            "id": 1,
            "receiving_id": 1,
            "material_id": 1,
            "name": "Steel Plate",
            "qty": 100,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z",
            "receiving": {
                "id": 1,
                "code": "RG-001",
                "date": "2024-01-01",
                "po_id": 1,
                "created_at": "2024-01-01T10:00:00.000000Z",
                "updated_at": "2024-01-01T10:00:00.000000Z"
            },
            "material": {
                "id": 1,
                "code": "MAT-001",
                "name": "Steel Plate",
                "unit": "kg",
                "current_stock": 500,
                "safety_stock": 100,
                "price_per_unit": "5.50",
                "category": "Raw Material",
                "created_at": "2024-01-01T10:00:00.000000Z",
                "updated_at": "2024-01-01T10:00:00.000000Z"
            }
        }
    ],
    "links": {
        "first": "https://your-domain.com/api/receiving-items?page=1",
        "last": "https://your-domain.com/api/receiving-items?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "active": false
            },
            {
                "url": "https://your-domain.com/api/receiving-items?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": null,
                "label": "Next &raquo;",
                "active": false
            }
        ],
        "path": "https://your-domain.com/api/receiving-items",
        "per_page": 10,
        "to": 1,
        "total": 1
    }
}
```

### Get Single Receiving Item

**GET** `/receiving-items/{id}`

Retrieve a specific receiving item by its ID.

#### Path Parameters
- `id` (required): The ID of the receiving item to retrieve

#### Headers
```
Authorization: Bearer {your-token}
Content-Type: application/json
```

#### Response
- **200 OK**: Successfully retrieved the receiving item
- **404 Not Found**: Receiving item not found

```json
{
    "id": 1,
    "receiving_id": 1,
    "material_id": 1,
    "name": "Steel Plate",
    "qty": 100,
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z",
    "receiving": {
        "id": 1,
        "code": "RG-001",
        "date": "2024-01-01",
        "po_id": 1,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z"
    },
    "material": {
        "id": 1,
        "code": "MAT-001",
        "name": "Steel Plate",
        "unit": "kg",
        "current_stock": 500,
        "safety_stock": 100,
        "price_per_unit": "5.50",
        "category": "Raw Material",
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z"
    }
}
```

### Create Receiving Item

**POST** `/receiving-items`

Create a new receiving item.

#### Headers
```
Authorization: Bearer {your-token}
Content-Type: application/json
```

#### Request Body
```json
{
    "receiving_id": 1,
    "material_id": 1,
    "name": "Steel Plate",
    "qty": 100
}
```

#### Request Body Parameters
- `receiving_id` (required): The ID of the receiving good this item belongs to (must exist in `receiving_goods` table)
- `material_id` (required): The ID of the material (must exist in `materials` table)
- `name` (required): The name of the receiving item (string, max 255 characters)
- `qty` (required): The quantity of the item (integer, minimum 1)

#### Response
- **201 Created**: Successfully created the receiving item
- **422 Unprocessable Entity**: Validation failed

```json
{
    "message": "Receiving item created successfully.",
    "data": {
        "id": 1,
        "receiving_id": 1,
        "material_id": 1,
        "name": "Steel Plate",
        "qty": 100,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z",
        "receiving": {
            "id": 1,
            "code": "RG-001",
            "date": "2024-01-01",
            "po_id": 1,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z"
        },
        "material": {
            "id": 1,
            "code": "MAT-001",
            "name": "Steel Plate",
            "unit": "kg",
            "current_stock": 500,
            "safety_stock": 100,
            "price_per_unit": "5.50",
            "category": "Raw Material",
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z"
        }
    }
}
```

### Update Receiving Item

**PUT** `/receiving-items/{id}`

Update an existing receiving item.

#### Path Parameters
- `id` (required): The ID of the receiving item to update

#### Headers
```
Authorization: Bearer {your-token}
Content-Type: application/json
```

#### Request Body
```json
{
    "receiving_id": 1,
    "material_id": 1,
    "name": "Updated Steel Plate",
    "qty": 150
}
```

#### Request Body Parameters
- `receiving_id` (required): The ID of the receiving good this item belongs to (must exist in `receiving_goods` table)
- `material_id` (required): The ID of the material (must exist in `materials` table)
- `name` (required): The name of the receiving item (string, max 255 characters)
- `qty` (required): The quantity of the item (integer, minimum 1)

#### Response
- **200 OK**: Successfully updated the receiving item
- **404 Not Found**: Receiving item not found
- **422 Unprocessable Entity**: Validation failed

```json
{
    "message": "Receiving item updated successfully.",
    "data": {
        "id": 1,
        "receiving_id": 1,
        "material_id": 1,
        "name": "Updated Steel Plate",
        "qty": 150,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T11:00:00.000000Z",
        "receiving": {
            "id": 1,
            "code": "RG-001",
            "date": "2024-01-01",
            "po_id": 1,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z"
        },
        "material": {
            "id": 1,
            "code": "MAT-001",
            "name": "Steel Plate",
            "unit": "kg",
            "current_stock": 500,
            "safety_stock": 100,
            "price_per_unit": "5.50",
            "category": "Raw Material",
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z"
        }
    }
}
```

### Delete Receiving Item

**DELETE** `/receiving-items/{id}`

Delete a receiving item.

#### Path Parameters
- `id` (required): The ID of the receiving item to delete

#### Headers
```
Authorization: Bearer {your-token}
Content-Type: application/json
```

#### Response
- **200 OK**: Successfully deleted the receiving item
- **404 Not Found**: Receiving item not found

```json
{
    "message": "Receiving item deleted successfully."
}
```

## Error Responses

### Validation Error Response (422)
```json
{
    "message": "Validation failed",
    "errors": {
        "field_name": [
            "The field_name field is required.",
            "The selected field_name is invalid."
        ]
    }
}
```

### Server Error Response (500)
```json
{
    "message": "Failed to {operation}.",
    "error": "Detailed error message"
}
```

## Relationships

- **Receiving Item** belongs to **Receiving Good** (via `receiving_id`)
- **Receiving Item** belongs to **Material** (via `material_id`)

## Notes

- All timestamps are in ISO 8601 format (YYYY-MM-DDTHH:MM:SS.ssssssZ)
- The API uses Laravel's built-in pagination for list endpoints
- All foreign key constraints are enforced at the database level
- The `qty` field represents the quantity of the material received