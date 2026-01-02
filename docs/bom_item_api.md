# BOM Item API Documentation

This document provides comprehensive information about the BOM (Bill of Materials) Item API endpoints.

## Base URL
```
https://your-domain.com/api
```

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

## Endpoints

### 1. List All BOM Items
**GET** `/api/bom-items`

Retrieve a paginated list of all BOM items.

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Number of items per page (default: 15)

#### Response
- **200 OK**: Successfully retrieved the list of BOM items

#### Response Body
```json
{
    "data": [
        {
            "id": 1,
            "item_id": 1,
            "material_id": 1,
            "quantity_per_unit": 5,
            "total_required": 100,
            "allocated": 50,
            "realized": 30,
            "created_at": "2024-01-01T10:00:00.000000Z",
            "updated_at": "2024-01-01T10:00:00.000000Z",
            "item": {
                "id": 1,
                "project_id": 1,
                "name": "Product A",
                "dimensions": "10x20x30",
                "thickness": "5mm",
                "qty_set": 1,
                "quantity": 100,
                "unit": "pcs",
                "is_bom_locked": false,
                "is_workflow_locked": false,
                "flow_type": "IN_PROGRESS",
                "warehouse_qty": 0,
                "shipped_qty": 0,
                "created_at": "2024-01-01T10:00:00.000000Z",
                "updated_at": "2024-01-01T10:00:00.000000Z"
            },
            "material": {
                "id": 1,
                "code": "MAT-001",
                "name": "Steel Plate",
                "unit": "kg",
                "current_stock": 500,
                "safety_stock": 50,
                "price_per_unit": "10.00",
                "category": "Raw Material",
                "created_at": "2024-01-01T10:00:00.000000Z",
                "updated_at": "2024-01-01T10:00:00.000000Z"
            }
        }
    ],
    "links": {
        "first": "http://your-domain.com/api/bom-items?page=1",
        "last": "http://your-domain.com/api/bom-items?page=3",
        "prev": null,
        "next": "http://your-domain.com/api/bom-items?page=2"
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 3,
        "links": [
            {
                "url": null,
                "label": "&laquo; Previous",
                "active": false
            },
            {
                "url": "http://your-domain.com/api/bom-items?page=1",
                "label": "1",
                "active": true
            },
            {
                "url": "http://your-domain.com/api/bom-items?page=2",
                "label": "2",
                "active": false
            },
            {
                "url": "http://your-domain.com/api/bom-items?page=3",
                "label": "3",
                "active": false
            },
            {
                "url": "http://your-domain.com/api/bom-items?page=2",
                "label": "Next &raquo;",
                "active": false
            }
        ],
        "path": "http://your-domain.com/api/bom-items",
        "per_page": 15,
        "to": 15,
        "total": 45
    }
}
```

### 2. Create a New BOM Item
**POST** `/api/bom-items`

Create a new BOM item.

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

#### Request Body
```json
{
    "item_id": 1,
    "material_id": 1,
    "quantity_per_unit": 5,
    "total_required": 100,
    "allocated": 50,
    "realized": 30
}
```

#### Request Body Parameters
- `item_id` (required): ID of the project item (integer, must exist in project_items table)
- `material_id` (required): ID of the material (integer, must exist in materials table)
- `quantity_per_unit` (required): Quantity of material required per unit (integer, minimum: 1)
- `total_required` (required): Total quantity of material required (integer, minimum: 1)
- `allocated` (optional): Quantity allocated (integer, minimum: 0, default: 0)
- `realized` (optional): Quantity realized (integer, minimum: 0, default: 0)

#### Response
- **201 Created**: Successfully created the BOM item
- **422 Unprocessable Entity**: Validation error

#### Success Response Body
```json
{
    "id": 1,
    "item_id": 1,
    "material_id": 1,
    "quantity_per_unit": 5,
    "total_required": 100,
    "allocated": 50,
    "realized": 30,
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z",
    "item": {
        "id": 1,
        "project_id": 1,
        "name": "Product A",
        "dimensions": "10x20x30",
        "thickness": "5mm",
        "qty_set": 1,
        "quantity": 100,
        "unit": "pcs",
        "is_bom_locked": false,
        "is_workflow_locked": false,
        "flow_type": "IN_PROGRESS",
        "warehouse_qty": 0,
        "shipped_qty": 0,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z"
    },
    "material": {
        "id": 1,
        "code": "MAT-001",
        "name": "Steel Plate",
        "unit": "kg",
        "current_stock": 500,
        "safety_stock": 50,
        "price_per_unit": "10.00",
        "category": "Raw Material",
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z"
    }
}
```

### 3. Get a Specific BOM Item
**GET** `/api/bom-items/{id}`

Retrieve a specific BOM item by ID.

#### Path Parameters
- `id` (required): The ID of the BOM item

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **200 OK**: Successfully retrieved the BOM item
- **404 Not Found**: BOM item not found

#### Response Body
```json
{
    "id": 1,
    "item_id": 1,
    "material_id": 1,
    "quantity_per_unit": 5,
    "total_required": 100,
    "allocated": 50,
    "realized": 30,
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-01T10:00:00.000000Z",
    "item": {
        "id": 1,
        "project_id": 1,
        "name": "Product A",
        "dimensions": "10x20x30",
        "thickness": "5mm",
        "qty_set": 1,
        "quantity": 100,
        "unit": "pcs",
        "is_bom_locked": false,
        "is_workflow_locked": false,
        "flow_type": "IN_PROGRESS",
        "warehouse_qty": 0,
        "shipped_qty": 0,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z"
    },
    "material": {
        "id": 1,
        "code": "MAT-001",
        "name": "Steel Plate",
        "unit": "kg",
        "current_stock": 500,
        "safety_stock": 50,
        "price_per_unit": "10.00",
        "category": "Raw Material",
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-01T10:00:00.000000Z"
    }
}
```

### 4. Update a BOM Item
**PUT** `/api/bom-items/{id}`

Update an existing BOM item.

#### Path Parameters
- `id` (required): The ID of the BOM item

#### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

#### Request Body
```json
{
    "item_id": 2,
    "material_id": 2,
    "quantity_per_unit": 10,
    "total_required": 200,
    "allocated": 100,
    "realized": 60
}
```

#### Request Body Parameters
- `item_id` (optional): ID of the project item (integer, must exist in project_items table)
- `material_id` (optional): ID of the material (integer, must exist in materials table)
- `quantity_per_unit` (optional): Quantity of material required per unit (integer, minimum: 1)
- `total_required` (optional): Total quantity of material required (integer, minimum: 1)
- `allocated` (optional): Quantity allocated (integer, minimum: 0)
- `realized` (optional): Quantity realized (integer, minimum: 0)

#### Response
- **200 OK**: Successfully updated the BOM item
- **404 Not Found**: BOM item not found
- **422 Unprocessable Entity**: Validation error

#### Response Body
```json
{
    "id": 1,
    "item_id": 2,
    "material_id": 2,
    "quantity_per_unit": 10,
    "total_required": 200,
    "allocated": 100,
    "realized": 60,
    "created_at": "2024-01-01T10:00:00.000000Z",
    "updated_at": "2024-01-02T15:30:00.000000Z",
    "item": {
        "id": 2,
        "project_id": 1,
        "name": "Product B",
        "dimensions": "15x25x35",
        "thickness": "8mm",
        "qty_set": 1,
        "quantity": 200,
        "unit": "pcs",
        "is_bom_locked": false,
        "is_workflow_locked": false,
        "flow_type": "IN_PROGRESS",
        "warehouse_qty": 0,
        "shipped_qty": 0,
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-02T15:30:00.000000Z"
    },
    "material": {
        "id": 2,
        "code": "MAT-002",
        "name": "Aluminum Sheet",
        "unit": "kg",
        "current_stock": 300,
        "safety_stock": 30,
        "price_per_unit": "15.00",
        "category": "Raw Material",
        "created_at": "2024-01-01T10:00:00.000000Z",
        "updated_at": "2024-01-02T15:30:00.000000Z"
    }
}
```

### 5. Delete a BOM Item
**DELETE** `/api/bom-items/{id}`

Delete a specific BOM item.

#### Path Parameters
- `id` (required): The ID of the BOM item

#### Headers
```
Authorization: Bearer {token}
Accept: application/json
```

#### Response
- **204 No Content**: Successfully deleted the BOM item
- **404 Not Found**: BOM item not found

## Validation Rules

### Required Fields
- `item_id`: Must be an existing ID in the project_items table
- `material_id`: Must be an existing ID in the materials table
- `quantity_per_unit`: Must be an integer greater than or equal to 1
- `total_required`: Must be an integer greater than or equal to 1

### Optional Fields
- `allocated`: Integer greater than or equal to 0, defaults to 0
- `realized`: Integer greater than or equal to 0, defaults to 0

## Error Responses

### Validation Error
**Status Code**: 422 Unprocessable Entity

```json
{
    "error": "Validation failed",
    "messages": {
        "item_id": [
            "The item id field is required.",
            "The selected item id is invalid."
        ],
        "material_id": [
            "The material id field is required.",
            "The selected material id is invalid."
        ],
        "quantity_per_unit": [
            "The quantity per unit must be an integer.",
            "The quantity per unit must be at least 1."
        ]
    }
}
```

### Unauthorized Access
**Status Code**: 401 Unauthorized

```json
{
    "message": "Unauthenticated."
}
```

### Resource Not Found
**Status Code**: 404 Not Found

```json
{
    "message": "The requested resource was not found."
}
```