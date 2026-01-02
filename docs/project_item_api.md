# Project Item API Documentation

## Overview
The Project Item API provides endpoints to manage project items within the manufacturing system. Project items represent specific components or materials associated with a project.

## Base URL
```
/api/project-items
```

## Authentication
All endpoints require authentication using Sanctum tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-api-token}
```

## Endpoints

### 1. Get All Project Items
**GET** `/api/project-items`

Retrieve a paginated list of all project items.

#### Headers
- `Authorization: Bearer {token}`

#### Query Parameters
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Number of items per page (default: 10)

#### Response
- **200 OK**: Successfully retrieved project items
```json
{
    "data": [
        {
            "id": 1,
            "project_id": 1,
            "name": "Sample Project Item",
            "dimensions": "10x20 cm",
            "thickness": "5 mm",
            "qty_set": 2,
            "quantity": 10,
            "unit": "pcs",
            "is_bom_locked": false,
            "is_workflow_locked": false,
            "flow_type": "NEW",
            "warehouse_qty": 5,
            "shipped_qty": 0,
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z",
            "project": {
                "id": 1,
                "code": "PROJ-001",
                "name": "Sample Project",
                // ... other project fields
            }
        }
    ],
    "links": {
        "first": "/api/project-items?page=1",
        "last": "/api/project-items?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "links": [...],
        "path": "/api/project-items",
        "per_page": 10,
        "to": 1,
        "total": 1
    }
}
```

### 2. Get Single Project Item
**GET** `/api/project-items/{id}`

Retrieve a specific project item by ID.

#### Path Parameters
- `id` (required): The ID of the project item

#### Headers
- `Authorization: Bearer {token}`

#### Response
- **200 OK**: Successfully retrieved project item
```json
{
    "id": 1,
    "project_id": 1,
    "name": "Sample Project Item",
    "dimensions": "10x20 cm",
    "thickness": "5 mm",
    "qty_set": 2,
    "quantity": 10,
    "unit": "pcs",
    "is_bom_locked": false,
    "is_workflow_locked": false,
    "flow_type": "NEW",
    "warehouse_qty": 5,
    "shipped_qty": 0,
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z",
    "project": {
        "id": 1,
        "code": "PROJ-001",
        "name": "Sample Project",
        // ... other project fields
    }
}
```
- **404 Not Found**: Project item not found

### 3. Create Project Item
**POST** `/api/project-items`

Create a new project item.

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
    "project_id": 1,
    "name": "New Project Item",
    "dimensions": "15x25 cm",
    "thickness": "10 mm",
    "qty_set": 3,
    "quantity": 15,
    "unit": "set",
    "is_bom_locked": false,
    "is_workflow_locked": false,
    "flow_type": "NEW",
    "warehouse_qty": 8,
    "shipped_qty": 0
}
```

#### Request Fields
- `project_id` (required): ID of the associated project
- `name` (required): Name of the project item
- `dimensions` (optional): Dimensions of the project item
- `thickness` (optional): Thickness of the project item
- `qty_set` (required): Quantity per set (integer, minimum: 0)
- `quantity` (required): Total quantity (integer, minimum: 0)
- `unit` (required): Unit of measurement
- `is_bom_locked` (required): Whether BOM is locked (boolean)
- `is_workflow_locked` (required): Whether workflow is locked (boolean)
- `flow_type` (required): Flow type, either "OLD" or "NEW"
- `warehouse_qty` (required): Quantity in warehouse (integer, minimum: 0)
- `shipped_qty` (required): Quantity shipped (integer, minimum: 0)

#### Response
- **201 Created**: Successfully created project item
```json
{
    "message": "Project item created successfully.",
    "data": {
        "id": 2,
        "project_id": 1,
        "name": "New Project Item",
        "dimensions": "15x25 cm",
        "thickness": "10 mm",
        "qty_set": 3,
        "quantity": 15,
        "unit": "set",
        "is_bom_locked": false,
        "is_workflow_locked": false,
        "flow_type": "NEW",
        "warehouse_qty": 8,
        "shipped_qty": 0,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```
- **422 Unprocessable Entity**: Validation failed
```json
{
    "message": "Validation failed",
    "errors": {
        "name": [
            "The name field is required."
        ],
        "qty_set": [
            "The qty_set must be at least 0."
        ]
    }
}
```

### 4. Update Project Item
**PUT/PATCH** `/api/project-items/{id}`

Update an existing project item.

#### Path Parameters
- `id` (required): The ID of the project item

#### Headers
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

#### Request Body
```json
{
    "project_id": 1,
    "name": "Updated Project Item",
    "dimensions": "20x30 cm",
    "thickness": "15 mm",
    "qty_set": 4,
    "quantity": 20,
    "unit": "unit",
    "is_bom_locked": true,
    "is_workflow_locked": true,
    "flow_type": "OLD",
    "warehouse_qty": 10,
    "shipped_qty": 2
}
```

#### Response
- **200 OK**: Successfully updated project item
```json
{
    "message": "Project item updated successfully.",
    "data": {
        "id": 1,
        "project_id": 1,
        "name": "Updated Project Item",
        "dimensions": "20x30 cm",
        "thickness": "15 mm",
        "qty_set": 4,
        "quantity": 20,
        "unit": "unit",
        "is_bom_locked": true,
        "is_workflow_locked": true,
        "flow_type": "OLD",
        "warehouse_qty": 10,
        "shipped_qty": 2,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
    }
}
```
- **404 Not Found**: Project item not found
- **422 Unprocessable Entity**: Validation failed

### 5. Delete Project Item
**DELETE** `/api/project-items/{id}`

Delete a project item.

#### Path Parameters
- `id` (required): The ID of the project item

#### Headers
- `Authorization: Bearer {token}`

#### Response
- **200 OK**: Successfully deleted project item
```json
{
    "message": "Project item deleted successfully."
}
```
- **404 Not Found**: Project item not found
- **500 Internal Server Error**: Failed to delete project item

## Error Responses

### 401 Unauthorized
```json
{
    "message": "Unauthenticated."
}
```

### 404 Not Found
```json
{
    "message": "The requested resource was not found."
}
```

### 422 Validation Error
```json
{
    "message": "Validation failed",
    "errors": {
        "field_name": [
            "Error message for the field"
        ]
    }
}
```

## Field Definitions

- `project_id`: Foreign key referencing the project
- `name`: Name of the project item (string, max 255 characters)
- `dimensions`: Physical dimensions of the item (string, max 255 characters, nullable)
- `thickness`: Thickness of the item (string, max 255 characters, nullable)
- `qty_set`: Quantity per set (integer, minimum 0)
- `quantity`: Total quantity (integer, minimum 0)
- `unit`: Unit of measurement (string, max 50 characters)
- `is_bom_locked`: Whether the Bill of Materials is locked (boolean)
- `is_workflow_locked`: Whether the workflow is locked (boolean)
- `flow_type`: Flow type, either "OLD" or "NEW" (enum)
- `warehouse_qty`: Quantity in warehouse (integer, minimum 0, default 0)
- `shipped_qty`: Quantity shipped (integer, minimum 0, default 0)